
let webcam, labelContainer, model1;


// Tải model và setup webcam
async function init() {
    count = 0;
    model1 = await ort.InferenceSession.create("../last.onnx");

    // Không lật webcam
    const flip = false;
    webcam = new tmImage.Webcam(640, 640, flip); 
    await webcam.setup({ facingMode: "environment" }); // Dùng cam mặc định

    await webcam.play(); // mở camera
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

    // xóa thẻ canvas nếu có
    var container = document.getElementById("webcam-container");
    var canvas = container.querySelector("canvas");

    if (canvas) {
        // Nếu tồn tại phần tử canvas, thì xóa nó
        canvas.remove();
        console.log("xóa canvas ok");
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

    // chèn vào DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    labelContainer.appendChild(document.createElement("div")); // hiển thị class name
    labelContainer.appendChild(document.createElement("div")); // thẻ hiện thị FPS
}

function webcamStop() {
    webcam.stop();
    count++;
}

async function loop() {
    if (count > 0) return;

    var startTime = new Date();

    console.time("time render frame");

    webcam.update(); // update the webcam frame
    await predict(); // await

    var endTime = new Date();
    var executionTime = endTime - startTime;
    let FPS = (1000 / executionTime).toFixed(2);
    labelContainer.childNodes[1].innerHTML = "FPS: " + FPS;

    console.timeEnd("time render frame");

    window.requestAnimationFrame(loop);
}

// Hàm nhận diện
async function predict() {

    // lấy fram ảnh để predict
    const canvas1 = document.createElement('canvas');
    const ctx = canvas1.getContext('2d');
    // Vẽ frame ảnh từ webcam lên canvas
    ctx.drawImage(webcam.canvas, 0, 0, canvas1.width, canvas1.height);
    // Chuyển đổi nội dung của canvas thành một URL dữ liệu
    const dataURL = canvas1.toDataURL();
    // console.log(dataURL);

    const [input, img_width, img_height] = await prepare_input(dataURL);

    const data1 = JSON.stringify({
        input: input,
        img_width: img_width,
        img_height: img_height
    });

    // Lấy tên lớp
    const infor = await getNameClass(data1);
    labelContainer.childNodes[0].innerHTML = infor.name + ': ' + infor.prob;

    // Nếu nhận dạng được thì hiển thị thông tin côn trùng ra
    if (infor.name != "unknow") {
        table_vid.setAttribute("class", "table");

        table_vid.rows[0].cells[0].textContent = "Tên côn trùng:";//
        table_vid.rows[0].cells[1].textContent = infor.infor.ten;
        table_vid.rows[1].cells[0].textContent = "Đặc Điểm:";//
        table_vid.rows[1].cells[1].textContent = infor.infor.dac_diem;
        table_vid.rows[2].cells[0].textContent = "Tác Hại:";//
        table_vid.rows[2].cells[1].textContent = infor.infor.tac_hai;
        table_vid.rows[3].cells[0].textContent = "Cách Điều Trị:";//
        table_vid.rows[3].cells[1].textContent = infor.infor.cach_dieu_tri;
        table_vid.rows[4].cells[0].textContent = "Cách phòng Ngừa:";//
        table_vid.rows[4].cells[1].textContent = infor.infor.BP_phong_ngua;

        // xuống dòng
        table_vid.rows[0].cells[1].style.whiteSpace = 'pre-line';
        table_vid.rows[1].cells[1].style.whiteSpace = 'pre-line';
        table_vid.rows[2].cells[1].style.whiteSpace = 'pre-line';
        table_vid.rows[3].cells[1].style.whiteSpace = 'pre-line';
        table_vid.rows[4].cells[1].style.whiteSpace = 'pre-line';

        infor_vid.appendChild(table_vid); // chèn bảng lên giao diện
    } else {
        table_vid.setAttribute("class", "table2");
    }

}

async function getNameClass(data1) {
    // console.log("data gửi", data1);
    return fetch('/api/name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data1,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Trả về chuỗi kết quả từ server
        })
        .then(data => { // Xử lý dữ liệu trả về từ server
            return data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
