const min_prob = 0.5

function downloadImage(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop(); // Tên tệp khi tải về
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const input = document.getElementById("uploadInput");
input.addEventListener("change", async (event) => {
    const dataurl = URL.createObjectURL(event.target.files[0])

    console.time('Thời gian nhận diện hình ảnh: ');
    const boxes = await detect_objects_on_image(dataurl);
    console.timeEnd('Thời gian nhận diện hình ảnh: ');

    draw_image_and_boxes(event.target.files[0], boxes);
})


// hiển thị xác suất
function draw_image_and_boxes(file, boxes) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    // nếu bảng in4 đang có thông tin => remove bảng
    var infor = document.getElementById("infor");
    var table1 = infor.querySelector("table");
    if (table1) {
        table1.remove();
    }
    // Nếu tồn tại phần tử canvas của ô camera, thì xóa nó
    var container = document.getElementById("webcam-container");
    var canvas1 = container.querySelector("canvas");
    if (canvas1) {
        canvas1.remove();
    }
    // nếu có ô label của camera thì xóa nó
    labelContainer1 = document.getElementById("label-container");
    if (labelContainer1) {
        labelContainer1.remove();
    }
    // tạo thẻ canvas để hiển thị ảnh
    var container = document.getElementById("webcam-container");
    var square = document.createElement("canvas");
    container.appendChild(square);
    img.onload = () => {
        const canvas = document.querySelector("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 3;
        ctx.font = "18px serif";
        boxes.forEach(([x1, y1, x2, y2, label, prob]) => {
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            ctx.fillStyle = "#00ff00";
            const width = ctx.measureText(label).width;
            ctx.fillRect(x1, y1, width + 38, 25);
            ctx.fillStyle = "#000000";
            ctx.fillText(label + ' ' + prob.toFixed(2), x1, y1 + 18);
        });
    }
    // tạo bảng hiển thị in4
    var infor = document.getElementById("infor");
    var table = document.createElement("table");
    table.style.width = "100%";
    table.style.height = "100%";

    // nếu có phát hiện
    if (boxes.length > 0) {
        table.setAttribute("class", "table");
        // Tạo hàng và cột cho bảng
        for (var i = 0; i < 5; i++) {
            var row = table.insertRow();
            for (var j = 0; j < 2; j++) {
                var cell = row.insertCell();
            }
        }
        // lấy id
        var id1;
        if (boxes[0][4] == 'Sâu đục thân') {
            id1 = 0;
        } else if (boxes[0][4] == 'Bọ xít đen') {
            id1 = 1;
        } else if (boxes[0][4] == 'Bù lạch') {
            id1 = 2;
        } else if (boxes[0][4] == 'Dế nhũi') {
            id1 = 3;
        } else if (boxes[0][4] == 'Rầy lưng xanh') {
            id1 = 4;
        } else if (boxes[0][4] == 'Rầy nâu') {
            id1 = 5;
        } else if (boxes[0][4] == 'Sâu cuốn lá') {
            id1 = 6;
        }

        // call API lấy dữ liệu
        fetch(`/api/information/${id1}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // console.table('front-end nhận data:', data);
                table.rows[0].cells[0].textContent = "Tên côn trùng:";//
                table.rows[0].cells[1].textContent = data.ten;
                table.rows[1].cells[0].textContent = "Đặc điểm:";//
                table.rows[1].cells[1].textContent = data.dac_diem;
                table.rows[2].cells[0].textContent = "Tác hại:";//
                table.rows[2].cells[1].textContent = data.tac_hai;
                table.rows[3].cells[0].textContent = "Cách điều trị:";//
                table.rows[3].cells[1].textContent = data.cach_dieu_tri;
                table.rows[4].cells[0].textContent = "Cách phòng ngừa:";//
                table.rows[4].cells[1].textContent = data.BP_phong_ngua;

                // xuống dòng
                table.rows[0].cells[1].style.whiteSpace = 'pre-line';
                table.rows[1].cells[1].style.whiteSpace = 'pre-line';
                table.rows[2].cells[1].style.whiteSpace = 'pre-line';
                table.rows[3].cells[1].style.whiteSpace = 'pre-line';
                table.rows[4].cells[1].style.whiteSpace = 'pre-line';
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
        // console.log("ok");

    } else {  // không phát hiện côn trùng nào có prob >= 0.5
        table.setAttribute("class", "table1");
        var row = table.insertRow();
        row.textContent = "Hệ thống không phát hiện côn trùng nào trong bộ dữ liệu được huấn luyện!";
    }
    infor.appendChild(table);

}


/**
 * Function receives an image, passes it through YOLOv8 neural network
 * and returns an array of detected objects and their bounding boxes
 * @param buf Input image body
 * @returns Array of bounding boxes in format [[x1,y1,x2,y2,object_type,probability],..]
 */
async function detect_objects_on_image(buf) {
    const [input, img_width, img_height] = await prepare_input(buf);
    const output = await run_model(input);
    return process_output(output, img_width, img_height);
}


// xử lý xử ảnh thành vector 3 chiều chứa 3 màu của ảnh
async function prepare_input(buf) {

    return new Promise(resolve => {
        // console.time('time prepare input');
        const img = new Image();
        img.src = buf;
        img.onload = () => {
            const [img_width, img_height] = [img.width, img.height]
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 640;
            const context = canvas.getContext("2d");
            context.drawImage(img, 0, 0, 640, 640);
            const imgData = context.getImageData(0, 0, 640, 640);
            const pixels = imgData.data;

            const red = [], green = [], blue = [];
            for (let index = 0; index < pixels.length; index += 4) {
                red.push(pixels[index] / 255.0);
                green.push(pixels[index + 1] / 255.0);
                blue.push(pixels[index + 2] / 255.0);
            }
            const input = [...red, ...green, ...blue];
            resolve([input, img_width, img_height])
            // console.timeEnd('time prepare input');
        }
    })
}

// hàm nhận diện
async function run_model(input) {

    // console.time('time run model:');
    const model = await ort.InferenceSession.create("last.onnx");
    input = new ort.Tensor(Float32Array.from(input), [1, 3, 640, 640]);
    // console.log("input", input);
    const outputs = await model.run({ images: input });
    // console.timeEnd('time run model:');

    return outputs["output0"].data;
}

/**
 * Function used to convert RAW output from YOLOv8 to an array of detected objects.
 * Each object contain the bounding box of this object, the type of object and the probability
 * @param output Raw output of YOLOv8 network
 * @param img_width Width of original image
 * @param img_height Height of original image
 * @returns Array of detected objects in a format [[x1,y1,x2,y2,object_type,probability],..]
 */
function process_output(output, img_width, img_height) {
    // console.time('time process output:');
    let boxes = [];
    for (let index = 0; index < 8400; index++) {
        const [class_id, prob] = [...Array(7).keys()]
            .map(col => [col, output[8400 * (col + 4) + index]])
            .reduce((accum, item) => item[1] > accum[1] ? item : accum, [0, 0]);
        if (prob < min_prob) {
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
    // console.timeEnd('time process output:');
    return result;
}

/**
 * Function calculates "Intersection-over-union" coefficient for specified two boxes
 * https://pyimagesearch.com/2016/11/07/intersection-over-union-iou-for-object-detection/.
 * @param box1 First box in format: [x1,y1,x2,y2,object_class,probability]
 * @param box2 Second box in format: [x1,y1,x2,y2,object_class,probability]
 * @returns Intersection over union ratio as a float number
 */
// Hàm tính IoU
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

/**
 * Function calculates intersection area of two boxes
 * @param box1 First box in format [x1,y1,x2,y2,object_class,probability]
 * @param box2 Second box in format [x1,y1,x2,y2,object_class,probability]
 * @returns Area of intersection of the boxes as a float number
 */
function intersection(box1, box2) {
    const [box1_x1, box1_y1, box1_x2, box1_y2] = box1;
    const [box2_x1, box2_y1, box2_x2, box2_y2] = box2;
    const x1 = Math.max(box1_x1, box2_x1);
    const y1 = Math.max(box1_y1, box2_y1);
    const x2 = Math.min(box1_x2, box2_x2);
    const y2 = Math.min(box1_y2, box2_y2);
    return (x2 - x1) * (y2 - y1)
}

/**
 * Array of YOLOv8 class labels
 */
const yolo_classes = ['Sâu đục thân', 'Bọ xít đen', 'Bù lạch', 'Dế nhũi', 'Rầy lưng xanh', 'Rầy nâu', 'Sâu cuốn lá'];