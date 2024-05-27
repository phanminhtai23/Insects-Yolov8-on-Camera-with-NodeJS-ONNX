const userIdToDelete = 2;

// Đọc dữ liệu từ tệp users.json
fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    let users = JSON.parse(data);

    // Lọc ra những người dùng có id khác với userIdToDelete
    users = users.filter(user => user.id !== userIdToDelete);

    // Ghi lại dữ liệu đã được cập nhật vào tệp users.json
    fs.writeFile('users.json', JSON.stringify(users, null, 2), err => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('User has been deleted successfully');
    });
});
