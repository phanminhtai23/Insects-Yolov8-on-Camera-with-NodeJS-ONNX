
let webcam, labelContainer, model1, count;
// Load the image model and setup the webcam
async function init() {
    count = 0; // biến điếm dừng camera

    model1 = await ort.InferenceSession.create("../last.onnx");

    // Convenience function to setup a webcam
    const flip = false; // whether to flip the webcam
    webcam = new tmImage.Webcam(640, 640, flip); // width, height, flip
    await webcam.setup({ facingMode: "environment" }); // request access to the webcam

    await webcam.play();
    window.requestAnimationFrame(loop);

    // Nếu chưa tạo thì tạo ô hiển thị nhãn
    labelContainer1 = document.getElementById("label-container");
    if (!labelContainer1) {
        var container = document.getElementById("webcam-container");
        var square = document.createElement("div");
        square.setAttribute("id", "label-container");
        container.appendChild(square);

        var element = document.getElementById("label-container");
        // Thiết lập kích thước chữ và màu chữ
        element.style.fontSize = "20px";
        element.style.color = "red";
        element.style.fontWeight = "600";
    }

    // xóa thẻ table nếu có
    var infor1 = document.getElementById("infor");
    var table1 = infor1.querySelector("table");
    if (table1) {
        table1.remove();
    }
    // set bảng hiện thị thông tin
    infor_vid = document.getElementById("infor");
    table_vid = document.createElement("table");
    table_vid.style.width = "100%";
    table_vid.style.height = "100%";

    table_vid.setAttribute("class", "table");
    for (var i = 0; i < 5; i++) {
        var row = table_vid.insertRow();
        for (var j = 0; j < 2; j++) {
            var cell = row.insertCell();
        }
    }

    var container = document.getElementById("webcam-container");
    var canvas = container.querySelector("canvas");
    if (canvas) { // xóa thẻ canvas hiển thị ảnh
        canvas.remove();
    }
    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    labelContainer.appendChild(document.createElement("div")); // hiển thị class name
    labelContainer.appendChild(document.createElement("div")); // thẻ hiện thị FPS
}

async function webcamStop() {
    webcam.stop();
    count++;
}

async function loop() {
    if (count > 0) return;

    var startTime = new Date();

    webcam.update(); // update the webcam frame
    await predict();

    var endTime = new Date();
    var executionTime = endTime - startTime;
    let FPS = (1000 / executionTime).toFixed(2);
    labelContainer.childNodes[1].innerHTML = "FPS: " + FPS;
    console.log("FPS: ", FPS);

    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {

    // lấy fram ảnh để predict
    const canvas1 = document.createElement('canvas');
    const ctx = canvas1.getContext('2d');
    // Vẽ frame ảnh từ webcam lên canvas1
    ctx.drawImage(webcam.canvas, 0, 0, canvas1.width, canvas1.height);
    // Chuyển đổi nội dung của canvas thành một URL dữ liệu
    const dataURL = canvas1.toDataURL();
    // console.time('thời gian/ khung ảnh');
    const boxes = await detect_objects_on_image(dataURL);
    await render_prob(boxes);
}
// * @param boxes Array of bounding boxes in format [[x1,y1,x2,y2,object_type,probability],...]
async function render_prob(boxes) {
    if (boxes.length > 0) {
        table_vid.setAttribute("class", "table");

        const classPrediction = boxes[0][4] + ": " + boxes[0][5].toFixed(2);
        labelContainer.childNodes[0].innerHTML = classPrediction;
        // console.timeEnd('thời gian/ khung ảnh');

        var idClassName;
        if (boxes[0][4] == 'Sâu đục thân') {
            idClassName = 0;
        } else if (boxes[0][4] == 'Bọ xít đen') {
            idClassName = 1;
        } else if (boxes[0][4] == 'Bù lạch') {
            idClassName = 2;
        } else if (boxes[0][4] == 'Dế nhũi') {
            idClassName = 3;
        } else if (boxes[0][4] == 'Rầy lưng xanh') {
            idClassName = 4;
        } else if (boxes[0][4] == 'Rầy nâu') {
            idClassName = 5;
        } else if (boxes[0][4] == 'Sâu cuốn lá') {
            idClassName = 6;
        }

        var inforClass = await callAPI(idClassName)

        table_vid.rows[0].cells[0].textContent = "Tên côn trùng:";//
        table_vid.rows[0].cells[1].textContent = inforClass.ten;
        table_vid.rows[1].cells[0].textContent = "Đặc Điểm:";//
        table_vid.rows[1].cells[1].textContent = inforClass.dac_diem;
        table_vid.rows[2].cells[0].textContent = "Tác Hại:";//
        table_vid.rows[2].cells[1].textContent = inforClass.tac_hai;
        table_vid.rows[3].cells[0].textContent = "Cách Điều Trị:";//
        table_vid.rows[3].cells[1].textContent = inforClass.cach_dieu_tri;
        table_vid.rows[4].cells[0].textContent = "Cách phòng Ngừa:";//
        table_vid.rows[4].cells[1].textContent = inforClass.BP_phong_ngua;

        // xuống dòng
        table_vid.rows[0].cells[1].style.whiteSpace = 'pre-line';
        table_vid.rows[1].cells[1].style.whiteSpace = 'pre-line';
        table_vid.rows[2].cells[1].style.whiteSpace = 'pre-line';
        table_vid.rows[3].cells[1].style.whiteSpace = 'pre-line';
        table_vid.rows[4].cells[1].style.whiteSpace = 'pre-line';

        infor_vid.appendChild(table_vid);

    } else {
        labelContainer.childNodes[0].innerHTML = "Unknow"
        // console.timeEnd('thời gian/ khung ảnh');
        table_vid.setAttribute("class", "table2");
    }
}

async function callAPI(id) {
    // call api
    return fetch(`/api/information/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // console.table('front-end nhận data:', data);
            return data

        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}