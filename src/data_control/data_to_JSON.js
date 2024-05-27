const fs = require('fs');
// public/data/data.json
const infor = [
    {
        id: 0,
        ten: 'Sâu đục thân',
        dac_diem: '- Con sâu đục thân trưởng thành giống cái dài khoảng 13-15mm, sải cánh rộng khoảng 30mm, cánh trước màu vàng nhạt. Con đực nhỏ hơn, mầu nâu vàng. Chúng hoạt động về đêm, ban ngày thường ẩn nấp trong bẹ lá hay trong nõn lá non.',
        tac_hai: '- Khi còn nhỏ sâu cắn nõn lá non hay cuống hoa đực.\n- Khi lớn, sâu đục vào cắn phá phần mô mềm bên trong thân cây (quan sát sẽ thấy trên thân cây có nhiều lỗ thủng, xung quanh bám nhiều cục phân sâu).',
        cach_dieu_tri: '- Phòng trừ bằng thuốc có các  hoạt chất: Chlorantraniliprole, Thiamethoxam, Abamectin,...(ví dụ: thuốc trừ sâu Prevathon 5SC; Voliam targo 063SC, Virtako 40WG, Kuraba WP,..).',
        BP_phong_ngua: '- Gieo trồng bắp tập trung thành những vùng sản xuất lớn, đúng thời vụ thích hợp.\n- Trồng những giống bắp chống chịu sâu đục thân.\n- Tạo điều kiện cho loài thiên địch với sâu đục thân. Bảo vệ và lợi dụng ong ký sinh.'
    },
    {
        id: 1,
        ten: 'Bọ xít đen',
        dac_diem: '...',
        tac_hai: '',
        cach_dieu_tri: '',
        BP_phong_ngua: ''
    },
    {
        id: 2,
        ten: '',
        dac_diem: 'Sâu đục thân',
        tac_hai: '',
        cach_dieu_tri: '',
        BP_phong_ngua: ''
    },
    {
        id: 3,
        ten: '',
        dac_diem: 'Sâu đục thân',
        tac_hai: '',
        cach_dieu_tri: '',
        BP_phong_ngua: ''
    },
    {
        id: 4,
        ten: '',
        dac_diem: 'Sâu đục thân',
        tac_hai: '',
        cach_dieu_tri: '',
        BP_phong_ngua: ''
    },
    {
        id: 5,
        ten: '',
        dac_diem: 'Sâu đục thân',
        tac_hai: '',
        cach_dieu_tri: '',
        BP_phong_ngua: ''
    },
    {
        id: 6,
        ten: '',
        dac_diem: 'Sâu đục thân',
        tac_hai: '',
        cach_dieu_tri: '',
        BP_phong_ngua: ''
    },
];

// Chuyển đổi danh sách người dùng thành chuỗi JSON
const inforJSON = JSON.stringify(infor, null, 2);

// Lưu trữ chuỗi JSON vào tệp users.json
fs.writeFile('../public/data/data.json', inforJSON, err => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('Users data has been saved to data.json');
    }
});
