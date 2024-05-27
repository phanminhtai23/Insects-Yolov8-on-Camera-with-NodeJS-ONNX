const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const hostname = process.env.HOST_NAME;
const fs = require('fs');
const bodyParser = require('body-parser');
const onnx = require('onnxruntime-node');

app.use(cors());
app.use(express.static(path.join(__dirname, '../src/public')))

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.send("index.html");
});

// Route để lấy thông tin côn trùng ID
app.get('/api/information/:id', (req, res) => {
    fs.readFile('./src/public/data/data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const informations = JSON.parse(data); // total infor
        const idClassName = parseInt(req.params.id); // id class name
        const inforClass = informations.find(inforClass => inforClass.id === idClassName);
        if (inforClass) {
            res.json(inforClass);
            // console.log("sever tra data", inforClass);
        } else {
            res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
        }
    });
});


// predic img
app.post('/api/name', async (req, res) => {
    // console.log("Sever đang predicting!");
    // console.time("time sever");
    const { input, img_width, img_height } = req.body;

    const boxes = await detect_objects_on_image(input, img_width, img_height);

    // Trả về kết quả phân tích hình ảnh dưới dạng JSON
    if (boxes.length > 0) {
        // console.timeEnd("time sever");

        fs.readFile('./src/public/data/data.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Lỗi đọc file!!!', err);
                return;
            }
            const informations = JSON.parse(data); // total in4 // id class name
            const inforClass = informations.find(inforClass => inforClass.ten === boxes[0][4]);
            res.json({
                name: boxes[0][4],
                prob: boxes[0][5].toFixed(2),
                infor: inforClass
            });
        });

    } else {
        // console.timeEnd("time sever");
        res.json({
            name: "unknow",
            prob: "",
            infor: ""
        });
    }

});

app.listen(port, hostname, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
});



function draw_image_and_boxes(file, boxes) {
    const img = new Image()
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        const canvas = document.querySelector("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 3;
        ctx.font = "18px serif";
        boxes.forEach(([x1, y1, x2, y2, label]) => {
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            ctx.fillStyle = "#00ff00";
            const width = ctx.measureText(label).width;
            ctx.fillRect(x1, y1, width + 10, 25);
            ctx.fillStyle = "#000000";
            ctx.fillText(label, x1, y1 + 18);
        });
    }
}



async function detect_objects_on_image(input, img_width, img_height) {
    const output = await run_model(input);
    return process_output(output, img_width, img_height);
}


async function run_model(input) {

    const model = await onnx.InferenceSession.create("./src/public/last.onnx");
    input = new onnx.Tensor(Float32Array.from(input), [1, 3, 640, 640]);
    const outputs = await model.run({ images: input });
    return outputs["output0"].data;
}

function process_output(output, img_width, img_height) {
    let boxes = [];
    for (let index = 0; index < 8400; index++) {
        const [class_id, prob] = [...Array(7).keys()]
            .map(col => [col, output[8400 * (col + 4) + index]])
            .reduce((accum, item) => item[1] > accum[1] ? item : accum, [0, 0]);
        if (prob < 0.3) {
            continue;
        }
        const label = yolo_classes[class_id];
        const xc = output[index];
        const yc = output[8400 + index];
        const w = output[2 * 8400 + index];
        const h = output[3 * 8400 + index];
        const x1 = (xc - w / 2) / 640 * img_width;
        const y1 = (yc - h / 2) / 640 * img_height;
        const x2 = (xc + w / 2) / 640 * img_width;
        const y2 = (yc + h / 2) / 640 * img_height;
        boxes.push([x1, y1, x2, y2, label, prob]);
    }

    boxes = boxes.sort((box1, box2) => box2[5] - box1[5])
    const result = [];
    while (boxes.length > 0) {
        result.push(boxes[0]);
        boxes = boxes.filter(box => iou(boxes[0], box) < 0.7);
    }
    return result;
}


function iou(box1, box2) {
    return intersection(box1, box2) / union(box1, box2);
}

function union(box1, box2) {
    const [box1_x1, box1_y1, box1_x2, box1_y2] = box1;
    const [box2_x1, box2_y1, box2_x2, box2_y2] = box2;
    const box1_area = (box1_x2 - box1_x1) * (box1_y2 - box1_y1)
    const box2_area = (box2_x2 - box2_x1) * (box2_y2 - box2_y1)
    return box1_area + box2_area - intersection(box1, box2)
}

function intersection(box1, box2) {
    const [box1_x1, box1_y1, box1_x2, box1_y2] = box1;
    const [box2_x1, box2_y1, box2_x2, box2_y2] = box2;
    const x1 = Math.max(box1_x1, box2_x1);
    const y1 = Math.max(box1_y1, box2_y1);
    const x2 = Math.min(box1_x2, box2_x2);
    const y2 = Math.min(box1_y2, box2_y2);
    return (x2 - x1) * (y2 - y1)
}

const yolo_classes =
    ['Sâu đục thân', 'Bọ xít đen', 'Bù lạch',
        'Dế nhũi', 'Rầy lưng xanh', 'Rầy nâu', 'Sâu cuốn lá'];




