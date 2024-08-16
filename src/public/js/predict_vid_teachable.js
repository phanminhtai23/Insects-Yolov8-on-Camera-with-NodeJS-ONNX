
const URL_model = "./my_model/";

let model1, webcam, labelContainer, maxPredictions, count, table_vid, infor_vid;
// Load the image model and setup the webcam
async function init() {
    count = 0;
    const modelURL = URL_model + "model.json";
    const metadataURL = URL_model + "metadata.json";

    model1 = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model1.getTotalClasses();
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

    // nếu bảng in4 đang có thông tin => remove bảng
    var infor1 = document.getElementById("infor");
    var table1 = infor1.querySelector("table");
    if (table1) {
        table1.remove();
    }

    // xóa thẻ canvas nếu có
    var container = document.getElementById("webcam-container");
    var canvas = container.querySelector("canvas");
    if (canvas) {
        canvas.remove();
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

    // chèn thẻ nhãn vào
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    labelContainer.appendChild(document.createElement("div"));
    labelContainer.appendChild(document.createElement("div"));

}

function webcamStop() {
    webcam.stop();
    count++;
}
// asyn
async function loop() {
    if (count > 0) return;

    var startTime = new Date();

    webcam.update(); // update the webcam frame
    await predict(); // await

    // tính và hiện thị FPS
    var endTime = new Date();
    var executionTime = endTime - startTime;
    let FPS = (1000 / executionTime).toFixed(0);
    console.log("FPS = ", FPS);
    labelContainer.childNodes[1].innerHTML = "FPS: " + FPS;
    
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    const prediction = await model1.predict(webcam.canvas);
    var prob_max = 0, index_prob_max = -1;
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > prob_max) {
            prob_max = prediction[i].probability;
            index_prob_max = i;
        }
    }
    if (prob_max > 0.5) {
        table_vid.setAttribute("class", "table");

        labelContainer.childNodes[0].innerHTML = prediction[index_prob_max].className + ": " + prediction[index_prob_max].probability.toFixed(2);

        var id1;
        var nameClass = prediction[index_prob_max].className;
        if (nameClass == 'Sâu đục thân') {
            id1 = 0;
        } else if (nameClass == 'Bọ xít đen') {
            id1 = 1;
        } else if (nameClass == 'Bù lạch') {
            id1 = 2;
        } else if (nameClass == 'Dế nhũi') {
            id1 = 3;
        } else if (nameClass == 'Rầy lưng xanh') {
            id1 = 4;
        } else if (nameClass == 'Rầy nâu') {
            id1 = 5;
        } else if (nameClass == 'Sâu cuốn lá') {
            id1 = 6;
        }

        var inforClass = await callAPI(id1);

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
        labelContainer.childNodes[0].innerHTML = "Unknow";

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