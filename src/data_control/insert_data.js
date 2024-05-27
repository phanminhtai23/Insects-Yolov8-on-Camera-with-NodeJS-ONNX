const newUser = {
    id: 0,
    ten: 'Sâu đục thân',
    dac_diem: '- Con sâu đục thân trưởng thành giống cái dài khoảng 13-15mm, sải cánh rộng khoảng 30mm, cánh trước màu vàng nhạt. Con đực nhỏ hơn, mầu nâu vàng. Chúng hoạt động về đêm, ban ngày thường ẩn nấp trong bẹ lá hay trong nõn lá non.',
    tac_hai: '- Khi còn nhỏ sâu cắn nõn lá non hay cuống hoa đực.\n- Khi lớn, sâu đục vào cắn phá phần mô mềm bên trong thân cây (quan sát sẽ thấy trên thân cây có nhiều lỗ thủng, xung quanh bám nhiều cục phân sâu).',
    cach_dieu_tri: '- Phòng trừ bằng thuốc có các  hoạt chất: Chlorantraniliprole, Thiamethoxam, Abamectin,...(ví dụ: thuốc trừ sâu Prevathon 5SC; Voliam targo 063SC, Virtako 40WG, Kuraba WP,..).',
    BP_phong_ngua: '- Gieo trồng bắp tập trung thành những vùng sản xuất lớn, đúng thời vụ thích hợp.\n- Trồng những giống bắp chống chịu sâu đục thân.\n- Tạo điều kiện cho loài thiên địch với sâu đục thân. Bảo vệ và lợi dụng ong ký sinh.'
} ;

// Đọc dữ liệu từ tệp users.json
fs.readFile('../public/data/data.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    const users = JSON.parse(data);

    // Thêm người dùng mới vào mảng
    users.push(newUser);

    // Ghi lại dữ liệu đã được cập nhật vào tệp users.json
    fs.writeFile('users.json', JSON.stringify(users, null, 2), err => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('New user has been added successfully');
    });
});
