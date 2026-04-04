// KHỞI TẠO DỮ LIỆU MẶC ĐỊNH
function initDatabase() {
    if (!localStorage.getItem('lib_users')) {
        const defaultUsers = [
            { email: 'admin', password: '123', role: 'ADMIN', name: 'Quản trị viên Hệ thống' },
            { email: 'thuvien_A', password: '123', role: 'LIBRARIAN', name: 'Thủ thư A' },
            { email: 'docgia_B', password: '123', role: 'READER', name: 'Độc giả B' }
        ];
        localStorage.setItem('lib_users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('lib_books')) {
        const defaultBooks = [
            { id: 'S001', name: 'Đắc Nhân Tâm', author: 'Dale Carnegie', quantity: 5, status: 'Đang có' },
            { id: 'S002', name: 'Nhà Giả Kim', author: 'Paulo Coelho', quantity: 0, status: 'Sắp có' }
        ];
        localStorage.setItem('lib_books', JSON.stringify(defaultBooks));
    }
    
    // Khởi tạo bảng lưu trữ lịch mượn sách
    if (!localStorage.getItem('lib_reservations')) {
        localStorage.setItem('lib_reservations', JSON.stringify([]));
    }
}
initDatabase();

// XỬ LÝ XÁC THỰC
const authController = {
    toggleForm(formType) {
        document.getElementById('login-form').classList.toggle('hidden', formType !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', formType !== 'register');
        document.getElementById('forgot-form').classList.toggle('hidden', formType !== 'forgot');
    },

    // UC004: Lấy lại mật khẩu
    recoverPassword() {
        const email = document.getElementById('forgot-email').value;
        const users = JSON.parse(localStorage.getItem('lib_users'));
        const user = users.find(u => u.email === email);
        
        if (user) {
            alert(`Mật khẩu của bạn là: ${user.password}\n(Trong thực tế, hệ thống sẽ gửi email cho bạn)`);
            this.toggleForm('login');
        } else {
            alert("Email không tồn tại trong hệ thống!");
        }
    },

    register() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const passConfirm = document.getElementById('reg-pass-confirm').value;

    // 1. Kiểm tra nhập liệu
    if (!name || !email || !pass || !passConfirm) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // 2. Kiểm tra khớp mật khẩu
    if (pass !== passConfirm) {
        alert("Mật khẩu nhập lại không khớp!");
        return;
    }

    const users = JSON.parse(localStorage.getItem('lib_users')) || [];

    // 3. Kiểm tra trùng email
    if (users.find(u => u.email === email)) {
        alert("Tên đăng nhập/Email này đã tồn tại!");
        return;
    }

    // 4. LOGIC QUAN TRỌNG: Tự động phân vai trò dựa trên mã thuvien_
    let userRole = 'READER'; // Mặc định là Độc giả
    if (email.startsWith('thuvien_')) {
        userRole = 'LIBRARIAN'; // Nếu có tiền tố thuvien_ thì là Thủ thư
    }

    // 5. Lưu vào danh sách
    users.push({ 
        email: email, 
        password: pass, 
        role: userRole, 
        name: name 
    });

    localStorage.setItem('lib_users', JSON.stringify(users));
    
    alert(`Đăng ký thành công tài khoản ${userRole === 'LIBRARIAN' ? 'Thủ thư' : 'Độc giả'}!`);
    this.toggleForm('login');
},

    login() {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        const users = JSON.parse(localStorage.getItem('lib_users'));
        const user = users.find(u => u.email === email && u.password === pass);

        if (user) {
            sessionStorage.setItem('current_user', JSON.stringify(user));
            appController.renderApp();
        } else {
            alert("Sai thông tin đăng nhập!");
        }
    },

    logout() {
        sessionStorage.removeItem('current_user');
        location.reload();
    }
};
const appController = {
    // 1. Khởi tạo giao diện chính
    renderApp() {
        const user = JSON.parse(sessionStorage.getItem('current_user'));
        if (!user) return;

        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('app-view').classList.remove('hidden');
        document.getElementById('user-display').innerText = user.name;
        document.getElementById('role-display').innerText = user.role;
        this.renderMenu(user.role);
    },

    // 2. Phân quyền Menu
    renderMenu(role) {
    const menu = document.getElementById('menu-list');
    let items = [];

    if (role === 'READER') {
        items = [
            ['📚 Danh mục sách', 'viewBooks'], 
            ['👤 Thông tin cá nhân', 'viewProfile'],
            ['📖 Lịch sử trả sách', 'viewHistory'], // Mới
            ['⭐ Sách yêu thích', 'viewFavorites']   // Mới
        ];
        this.viewBooks();
    } else if (role === 'LIBRARIAN') {
        items = [
            ['⚙️ Quản lý kho sách', 'manageBooks'], 
            ['👥 Duyệt mượn/trả', 'manageReaders'],
            ['⚠️ Sách quá hạn', 'viewOverdueReport'] // Mới
        ];
        this.manageBooks();
    } else if (role === 'ADMIN') {
        items = [
            ['🛡️ Quản lý tài khoản', 'manageUsers'], 
            ['📊 Thống kê doanh thu', 'viewStats'],
            ['📜 Nhật ký hệ thống', 'viewSystemLogs'] // Mới
        ];
        this.manageUsers();
    }

    menu.innerHTML = items.map(item => `<li onclick="appController['${item[1]}']()">${item[0]}</li>`).join('');
},
 //Sửa tên
showEditName() {
    const user = JSON.parse(sessionStorage.getItem('current_user'));
    document.getElementById('page-title').innerText = "";
    
    let html = `
        <div class="edit-name-card">
            <h2>Sửa tên</h2>
            
            <div class="edit-input-group">
                <span>Nhập tên bạn muốn sửa:</span>
                <input type="text" id="new-name-input" value="${user.name}">
            </div>

            <div class="edit-btn-group">
                <button class="btn-wireframe" onclick="appController.viewProfile()">Thoát</button>
                <button class="btn-wireframe" onclick="appController.confirmEditName()">Sửa</button>
            </div>
        </div>
    `;
    document.getElementById('page-content').innerHTML = html;
},

confirmEditName() {
    const newName = document.getElementById('new-name-input').value;
    if (!newName) return alert("Vui lòng nhập tên!");

    let users = JSON.parse(localStorage.getItem('lib_users'));
    let currentUser = JSON.parse(sessionStorage.getItem('current_user'));

    // 1. Cập nhật trong danh sách người dùng của hệ thống
    const userIdx = users.findIndex(u => u.email === currentUser.email);
    if (userIdx !== -1) {
        users[userIdx].name = newName;
        localStorage.setItem('lib_users', JSON.stringify(users));

        // 2. Cập nhật trong session hiện tại
        currentUser.name = newName;
        sessionStorage.setItem('current_user', JSON.stringify(currentUser));

        // 3. Cập nhật lại tên hiển thị trên thanh Navbar
        document.getElementById('user-display').innerText = newName;

        alert("Cập nhật tên thành công!");
        this.viewProfile(); // Quay lại trang thông tin cá nhân
    }
},
//sửa gmail
showEditEmail() {
    const user = JSON.parse(sessionStorage.getItem('current_user'));
    document.getElementById('page-title').innerText = "Chỉnh Sửa Email";
    
    let html = `
        <div class="edit-name-card">
            <h2>Sửa Email</h2>
            <div style="text-align: left; max-width: 300px; margin: 0 auto;">
                <label>Email hiện tại:</label>
                <div class="edit-input-group">
                    <input type="text" id="current-email-display" value="${user.email}" disabled style="background: #eee;">
                </div>
                <label>Nhập Email mới:</label>
                <div class="edit-input-group">
                    <input type="email" id="new-email-input" placeholder="example@gmail.com">
                </div>
            </div>
            <div class="edit-btn-group">
                <button class="btn-wireframe" onclick="appController.viewProfile()">Thoát</button>
                <button class="btn-wireframe" onclick="appController.saveEmail()">Sửa</button>
            </div>
        </div>
    `;
    document.getElementById('page-content').innerHTML = html;
},

// Lưu Email mới vào CSDL (LocalStorage)
saveEmail() {
    const newEmail = document.getElementById('new-email-input').value.trim();
    const user = JSON.parse(sessionStorage.getItem('current_user'));
    let users = JSON.parse(localStorage.getItem('lib_users'));

    // 1. Kiểm tra hợp lệ
    if (!newEmail) return alert("Vui lòng nhập email mới!");
    if (newEmail === user.email) return alert("Email mới phải khác email hiện tại!");
    
    // Kiểm tra xem email mới đã có ai dùng chưa
    if (users.some(u => u.email === newEmail)) {
        return alert("Email này đã tồn tại trong hệ thống!");
    }

    // 2. Cập nhật trong danh sách users
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex].email = newEmail;
        localStorage.setItem('lib_users', JSON.stringify(users));

        // 3. Cập nhật cả session hiện tại để giao diện không bị lỗi
        user.email = newEmail;
        sessionStorage.setItem('current_user', JSON.stringify(user));

        alert("Cập nhật Email thành công!");
        this.viewProfile(); // Quay lại trang cá nhân
    }
},
showChangePassword() {
    document.getElementById('page-title').innerText = "Đổi Mật Khẩu";
    
    let html = `
        <div class="edit-name-card">
            <h2>Đổi mật khẩu</h2>
            
            <div style="text-align: left; max-width: 350px; margin: 0 auto;">
                <div class="edit-input-group">
                    <span style="width: 150px;">Mật khẩu cũ:</span>
                    <input type="password" id="old-pass" placeholder="******">
                </div>

                <div class="edit-input-group">
                    <span style="width: 150px;">Mật khẩu mới:</span>
                    <input type="password" id="new-pass" placeholder="******">
                </div>

                <div class="edit-input-group">
                    <span style="width: 150px;">Nhập lại MK mới:</span>
                    <input type="password" id="confirm-new-pass" placeholder="******">
                </div>
            </div>

            <div class="edit-btn-group" style="margin-top: 30px;">
                <button class="btn-wireframe" onclick="appController.viewProfile()">Thoát</button>
                <button class="btn-wireframe" onclick="appController.savePassword()">Sửa</button>
            </div>
        </div>
    `;
    document.getElementById('page-content').innerHTML = html;
},

// Xử lý lưu mật khẩu mới
savePassword() {
    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-new-pass').value;
    
    const currentUser = JSON.parse(sessionStorage.getItem('current_user'));
    let users = JSON.parse(localStorage.getItem('lib_users'));

    // 1. Kiểm tra dữ liệu đầu vào
    if (!oldPass || !newPass || !confirmPass) {
        return alert("Vui lòng nhập đầy đủ các trường!");
    }

    // 2. Kiểm tra mật khẩu cũ có đúng không
    if (oldPass !== currentUser.password) {
        return alert("Mật khẩu cũ không chính xác!");
    }

    // 3. Kiểm tra mật khẩu mới và xác nhận có khớp không
    if (newPass !== confirmPass) {
        return alert("Mật khẩu mới và nhập lại không khớp!");
    }

    // 4. Cập nhật vào LocalStorage
    const userIdx = users.findIndex(u => u.email === currentUser.email);
    if (userIdx !== -1) {
        users[userIdx].password = newPass;
        localStorage.setItem('lib_users', JSON.stringify(users));

        // Cập nhật lại session hiện tại
        currentUser.password = newPass;
        sessionStorage.setItem('current_user', JSON.stringify(currentUser));

        alert("Đổi mật khẩu thành công!");
        this.viewProfile();
    }
},
viewOverdueReport() {
    document.getElementById('page-title').innerText = "Danh Sách Sách Quá Hạn";
    const reservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
    const today = new Date();
    
    // Lọc ra các yêu cầu đã duyệt nhưng quá hạn trả
    const overdue = reservations.filter(r => {
        if (!r.dueDate || r.status !== 'Đã duyệt') return false;
        const parts = r.dueDate.split('/');
        const due = new Date(parts[2], parts[1] - 1, parts[0]);
        return today > due;
    });

    let html = overdue.length > 0 ? `
        <table style="border: 2px solid #e74c3c">
            <thead style="background:#fdeaea"><tr><th>Độc giả</th><th>Sách</th><th>Hạn trả</th><th>Liên hệ</th></tr></thead>
            <tbody>
                ${overdue.map(r => `
                    <tr><td>${r.userEmail}</td><td>${r.bookName}</td><td style="color:red"><b>${r.dueDate}</b></td>
                    <td><button class="btn-add" onclick="alert('Đã gửi thông báo nhắc nhở đến ${r.userEmail}')">🔔 Nhắc nhở</button></td></tr>
                `).join('')}
            </tbody>
        </table>` : "<p style='color:green'>Tuyệt vời! Hiện không có sách nào bị quá hạn.</p>";
    document.getElementById('page-content').innerHTML = html;
},
viewSystemLogs() {
    document.getElementById('page-title').innerText = "Nhật Ký Hệ Thống (System Logs)";
    document.getElementById('page-content').innerHTML = `
        <ul style="list-style: none; padding: 0;">
            <li style="padding:10px; border-bottom:1px solid #ddd">✅ [${new Date().toLocaleString()}] Admin đã đăng nhập hệ thống.</li>
            <li style="padding:10px; border-bottom:1px solid #ddd">ℹ️ [${new Date().toLocaleString()}] Cơ sở dữ liệu đã được đồng bộ với LocalStorage.</li>
            <li style="padding:10px; border-bottom:1px solid #ddd">⚠️ [Hệ thống] Tự động kiểm tra 0 sách quá hạn.</li>
        </ul>`;
},

// ĐIỀU KHIỂN NGHIỆP VỤ

    // ================= CHỨC NĂNG ĐỘC GIẢ =================

    // UC1: Xem danh mục sách
    viewBooks() {
        document.getElementById('page-title').innerText = "Danh Mục Sách";
        const books = JSON.parse(localStorage.getItem('lib_books')) || [];
        
        let html = `<table>
            <thead>
                <tr>
                    <th>Mã</th><th>Tên sách</th><th>Tác giả</th><th>Trạng thái</th><th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${books.map(b => `
                    <tr>
                        <td>${b.id}</td>
                        <td><b>${b.name}</b></td>
                        <td>${b.author}</td>
                        <td>${b.status}</td>
                        <td>
                            <button class="btn-add" onclick="appController.reserveBook('${b.id}', '${b.name}')">Mượn</button>
                            <button style="background: #f1c40f; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;" 
                                    onclick="appController.toggleFavorite('${b.id}', '${b.name}')">⭐</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
        document.getElementById('page-content').innerHTML = html;
    },

// Thêm hàm phụ để lọc dữ liệu khi gõ phím
filterBooks() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const books = JSON.parse(localStorage.getItem('lib_books'));
    const filtered = books.filter(b => 
        b.name.toLowerCase().includes(keyword) || b.author.toLowerCase().includes(keyword)
    );
    document.getElementById('book-table-render').innerHTML = this.renderBookTable(filtered);
},

// Hàm vẽ bảng (để tái sử dụng cho việc tìm kiếm)
renderBookTable(books) {
    return `<table>
        <thead><tr><th>Mã</th><th>Tên sách</th><th>Tác giả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
            ${books.map(b => `
                <tr>
                    <td>${b.id}</td><td><b>${b.name}</b></td><td>${b.author}</td>
                    <td>${b.status} (${b.quantity} cuốn)</td>
                    <td><button class="btn-add" onclick="appController.reserveBook('${b.id}', '${b.name}')">Đặt mượn</button></td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;
},

    // UC2: Đặt lịch mượn sách
    reserveBook(bookId, bookName) {
        document.getElementById('page-title').innerText = "Xác Nhận Mượn Sách";
        
        const today = new Date();
        const requestDate = today.toLocaleDateString('vi-VN');
        
        // Tính ngày đến mượn (mặc định là ngày mai)
        const pickupDate = new Date(today);
        pickupDate.setDate(today.getDate() + 1);
        const pickupDateStr = pickupDate.toLocaleDateString('vi-VN');

        let html = `
            <div class="borrow-card">
                <h2>Yêu cầu mượn sách</h2>
                
                <div class="borrow-info-row">
                    <span class="borrow-info-label">Ngày yêu cầu:</span>
                    <span class="borrow-info-value">${requestDate}</span>
                </div>
                
                <div class="borrow-info-row">
                    <span class="borrow-info-label">Hạn mượn (kể từ ngày nhận):</span>
                    <span class="borrow-info-value">90 ngày</span>
                </div>
                
                <div class="borrow-info-row">
                    <span class="borrow-info-label">Sách muốn mượn:</span>
                    <span class="borrow-info-value">${bookName}</span>
                </div>
                
                <div class="borrow-info-row">
                    <span class="borrow-info-label">Ngày đến mượn sách:</span>
                    <span class="borrow-info-value">${pickupDateStr}</span>
                </div>

                <p class="borrow-note">Lưu ý: Nếu không có mặt vào ngày mượn sách, yêu cầu sẽ tự động bị hủy.</p>

                <button class="btn-confirm-borrow" onclick="appController.confirmReservation('${bookId}', '${bookName}', '${pickupDateStr}')">
                    Xác nhận gửi yêu cầu
                </button>
            </div>
        `;
        document.getElementById('page-content').innerHTML = html;
    },
    confirmReservation(bookId, bookName, pickupDate) {
        const user = JSON.parse(sessionStorage.getItem('current_user'));
        let reservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
        
        const newReservation = {
            userEmail: user.email,
            bookId: bookId,
            bookName: bookName,
            date: new Date().toLocaleDateString('vi-VN'),
            pickupDate: pickupDate,
            status: 'Đang chờ duyệt'
        };
        
        reservations.push(newReservation);
        localStorage.setItem('lib_reservations', JSON.stringify(reservations));
        
        alert(`Bạn đã đặt lịch mượn cuốn "${bookName}" thành công! Vui lòng chờ thủ thư duyệt.`);
        this.viewBooks(); // Quay lại trang danh sách sách
    },
    toggleFavorite(bookId, bookName) {
        const user = JSON.parse(sessionStorage.getItem('current_user'));
        if (!user) return;

        // Lấy danh sách yêu thích hiện tại của user này (hoặc tạo mới nếu chưa có)
        let favs = JSON.parse(localStorage.getItem(`fav_${user.email}`)) || [];

        const index = favs.indexOf(bookId);
        if (index === -1) {
            // Nếu chưa có thì thêm vào
            favs.push(bookId);
            alert(`Đã thêm "${bookName}" vào danh sách yêu thích!`);
        } else {
            // Nếu có rồi thì xóa ra (bỏ thích)
            favs.splice(index, 1);
            alert(`Đã xóa "${bookName}" khỏi danh sách yêu thích.`);
        }

        // Lưu lại vào LocalStorage
        localStorage.setItem(`fav_${user.email}`, JSON.stringify(favs));
    },

    // UC3: Xem thông tin cá nhân
    // UC3: Xem thông tin cá nhân (Đã cập nhật hiển thị Hạn trả)
    viewProfile() {
    document.getElementById('page-title').innerText = "Thông Tin Cá Nhân";
    const user = JSON.parse(sessionStorage.getItem('current_user'));
    
    // Lấy danh sách sách đã mượn (Đã duyệt) từ LocalStorage
    const allReservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
    const myBooks = allReservations
        .filter(r => r.userEmail === user.email && r.status === 'Đã duyệt')
        .map(r => r.bookName);

    let html = `
        <div class="content-body">
            <div style="margin-bottom: 25px;">
                <p><b>Họ và tên:</b> ${user.name} 
                    <button class="btn-warning" style="margin-left:10px; padding: 4px 10px; font-size: 12px;" 
                        onclick="appController.showEditName()">
                        <i class="fas fa-edit"></i> Sửa tên
                    </button>
                </p>
                
                <p><b>Email:</b> ${user.email} 
                    <button class="btn-warning" style="margin-left:10px; padding: 4px 10px; font-size: 12px;" 
                        onclick="appController.showEditEmail()">
                    <i class="fas fa-edit"></i> Sửa email
                </button>
            </p>
            <p><b>Mật khẩu:</b> ******** <button class="btn-warning" style="margin-left:10px; padding: 4px 10px; font-size: 12px;" 
                        onclick="appController.showChangePassword()">
                        <i class="fas fa-key"></i> Đổi MK
                    </button>
                </p>
                
                <p><b>Số sách đang mượn:</b> <span class="role-badge">${myBooks.length}</span></p>
            </div>

            <hr border="1" style="border-color: #eee; margin: 20px 0;">
            
            <h4>DANH SÁCH SÁCH ĐÃ MƯỢN</h4>
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #f9f9f9; min-height: 100px;">
                ${myBooks.length > 0 
                    ? myBooks.map(name => `<p style="margin: 5px 0;"><i class="fas fa-check-circle" style="color:green"></i> ${name}</p>`).join('') 
                    : '<p style="color:gray">Bạn chưa có sách nào được duyệt mượn.</p>'}
            </div>

            <button class="btn-delete" style="margin-top: 25px; width: 100%;" onclick="authController.logout()">
                <i class="fas fa-sign-out-alt"></i> Đăng xuất tài khoản
            </button>
        </div>
    `;
    document.getElementById('page-content').innerHTML = html;
},

// Hàm hỗ trợ sửa thông tin ngay tại trang profile
editProfile(field) {
    const user = JSON.parse(sessionStorage.getItem('current_user'));
    const newValue = prompt(`Nhập ${field === 'name' ? 'họ tên' : 'email'} mới:`, field === 'name' ? user.name : user.email);
    
    if (newValue) {
        let users = JSON.parse(localStorage.getItem('lib_users'));
        const userIdx = users.findIndex(u => u.email === user.email);
        
        if (userIdx !== -1) {
            users[userIdx][field === 'name' ? 'name' : 'email'] = newValue;
            localStorage.setItem('lib_users', JSON.stringify(users));
            
            // Cập nhật lại session hiện tại
            user[field === 'name' ? 'name' : 'email'] = newValue;
            sessionStorage.setItem('current_user', JSON.stringify(user));
            
            alert("Cập nhật thành công!");
            this.viewProfile(); // Tải lại giao diện
        }
    }
},
    viewHistory() {
    document.getElementById('page-title').innerText = "Lịch Sử Trả Sách";
    const user = JSON.parse(sessionStorage.getItem('current_user'));
    const history = JSON.parse(localStorage.getItem('lib_reservations'))
                    .filter(r => r.userEmail === user.email && r.status === 'Đã trả');

    let html = history.length > 0 ? `
        <table>
            <thead><tr><th>Tên sách</th><th>Ngày mượn</th><th>Trạng thái</th></tr></thead>
            <tbody>
                ${history.map(h => `<tr><td>${h.bookName}</td><td>${h.date}</td><td><b style="color:blue">Đã trả xong</b></td></tr>`).join('')}
            </tbody>
        </table>` : "<p>Bạn chưa có lịch sử trả sách nào.</p>";
    document.getElementById('page-content').innerHTML = html;
},

viewFavorites() {
        document.getElementById('page-title').innerText = "Sách Yêu Thích";
        const user = JSON.parse(sessionStorage.getItem('current_user'));
        const favIds = JSON.parse(localStorage.getItem(`fav_${user.email}`)) || [];
        const allBooks = JSON.parse(localStorage.getItem('lib_books')) || [];

        // Lọc ra những cuốn sách nằm trong danh sách ID đã thích
        const myFavs = allBooks.filter(b => favIds.includes(b.id));

        let html = myFavs.length > 0 ? `
            <table>
                <thead><tr><th>Mã</th><th>Tên sách</th><th>Tác giả</th><th>Thao tác</th></tr></thead>
                <tbody>
                    ${myFavs.map(b => `
                        <tr>
                            <td>${b.id}</td><td><b>${b.name}</b></td><td>${b.author}</td>
                            <td><button class="btn-delete" onclick="appController.toggleFavorite('${b.id}', '${b.name}'); appController.viewFavorites();">💔 Bỏ thích</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>` : "<p>Danh sách yêu thích trống. Hãy bấm ⭐ ở mục Danh mục sách nhé!</p>";
        
        document.getElementById('page-content').innerHTML = html;
    },

// Hàm hỗ trợ để xóa sách khỏi danh sách yêu thích
removeFavorite(bookId) {
    const user = JSON.parse(sessionStorage.getItem('current_user'));
    let favIds = JSON.parse(localStorage.getItem(`fav_${user.email}`)) || [];
    favIds = favIds.filter(id => id !== bookId);
    localStorage.setItem(`fav_${user.email}`, JSON.stringify(favIds));
    this.viewFavorites(); // Tải lại trang để cập nhật giao diện
},

    // ================= CHỨC NĂNG THỦ THƯ =================

    // UC5: Quản lý sách
// ================= CHỨC NĂNG THỦ THƯ (CẬP NHẬT MỚI) =================
    
    // 1. Giao diện Quản lý (Read)
    manageBooks() {
        document.getElementById('page-title').innerText = "Quản Lý Kho Sách";
        const books = JSON.parse(localStorage.getItem('lib_books'));
        
        let html = `
            <div class="form-panel">
                <h3 id="form-title">Thêm sách mới</h3>
                
                <input type="hidden" id="edit-book-id" value="">
                
                <div class="input-group">
                    <input type="text" id="book-name" placeholder="Tên sách (*)">
                    <input type="text" id="book-author" placeholder="Tác giả (*)">
                    <input type="number" id="book-qty" placeholder="Số lượng (*)" min="0">
                </div>
                <button class="btn-add" id="btn-save" onclick="appController.saveBook()">Lưu Sách</button>
                <button class="btn-secondary hidden" id="btn-cancel" onclick="appController.manageBooks()">Hủy bỏ</button>
            </div>

            <table>
                <thead><tr><th>Mã</th><th>Tên sách</th><th>Tác giả</th><th>Số lượng</th><th>Thao tác</th></tr></thead>
                <tbody>
                    ${books.map(b => `
                        <tr>
                            <td>${b.id}</td><td><b>${b.name}</b></td><td>${b.author}</td><td>${b.quantity}</td>
                            <td>
                                <button class="btn-warning" onclick="appController.editBook('${b.id}')">Sửa</button>
                                <button class="btn-delete" onclick="appController.deleteBook('${b.id}')">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('page-content').innerHTML = html;
    },

    // 2. Hàm Lưu dữ liệu (Create & Update)
    saveBook() {
        // Lấy dữ liệu từ Form
        const idInput = document.getElementById('edit-book-id').value;
        const name = document.getElementById('book-name').value;
        const author = document.getElementById('book-author').value;
        const quantity = parseInt(document.getElementById('book-qty').value);

        // Kiểm tra dữ liệu hợp lệ
        if (!name || !author || isNaN(quantity)) return alert("Vui lòng điền đầy đủ thông tin!");

        let books = JSON.parse(localStorage.getItem('lib_books'));

        if (idInput) {
            // CÓ ID -> CHẾ ĐỘ SỬA (Update)
            const index = books.findIndex(b => b.id === idInput);
            if (index !== -1) {
                books[index].name = name;
                books[index].author = author;
                books[index].quantity = quantity;
                books[index].status = quantity > 0 ? 'Đang có' : 'Sắp có'; // Cập nhật trạng thái
            }
            alert("Cập nhật sách thành công!");
        } else {
            // KHÔNG CÓ ID -> CHẾ ĐỘ THÊM MỚI (Create)
            // Tạo mã sách ngẫu nhiên (VD: S4592)
            const newId = 'S' + String(Date.now()).slice(-4); 
            books.push({ 
                id: newId, 
                name, 
                author, 
                quantity,
                status: quantity > 0 ? 'Đang có' : 'Sắp có'
            });
            alert("Thêm sách mới thành công!");
        }

        // Lưu lại vào LocalStorage và tải lại bảng
        localStorage.setItem('lib_books', JSON.stringify(books));
        this.manageBooks(); 
    },

    // 3. Hàm kích hoạt chế độ Sửa (Chuẩn bị Update)
    editBook(bookId) {
        const books = JSON.parse(localStorage.getItem('lib_books'));
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        // Đổ dữ liệu của cuốn sách lên Form
        document.getElementById('edit-book-id').value = book.id;
        document.getElementById('book-name').value = book.name;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-qty').value = book.quantity;

        // Thay đổi Giao diện Form để báo hiệu đang Sửa
        document.getElementById('form-title').innerText = `Chỉnh sửa sách: ${book.name} (Mã: ${book.id})`;
        document.getElementById('btn-save').innerText = "Cập nhật";
        document.getElementById('btn-save').style.backgroundColor = "#f39c12"; // Đổi màu nút thành màu cam
        document.getElementById('btn-cancel').classList.remove('hidden'); // Hiện nút Hủy
        
        // Cuộn màn hình lên trên cùng để Thủ thư thấy Form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // 4. Hàm Xóa (Delete)
    deleteBook(bookId) {
        if (!confirm("Bạn có chắc chắn muốn xóa sách này? Hành động này không thể hoàn tác.")) return;
        
        let books = JSON.parse(localStorage.getItem('lib_books'));
        // Dùng filter để giữ lại các cuốn sách KHÔNG trùng ID với sách cần xóa
        books = books.filter(b => b.id !== bookId); 
        
        localStorage.setItem('lib_books', JSON.stringify(books));
        this.manageBooks();
    },

    // UC6: Quản lý độc giả (Xem yêu cầu mượn)
    manageReaders() {
    document.getElementById('page-title').innerText = "Quản Lý Mượn/Trả Sách";
    const reservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
    const today = new Date();

    let html = `<table>
        <thead>
            <tr>
                <th>Độc giả</th><th>Sách</th><th>Hạn trả</th><th>Trạng thái</th><th>Thao tác</th>
            </tr>
        </thead>
        <tbody>
            ${reservations.map((r, idx) => {
                let statusText = r.status;
                let statusColor = (r.status === 'Đã duyệt') ? '#27ae60' : '#f39c12';

                // Kiểm tra quá hạn: Nếu đã duyệt và ngày hiện tại > hạn trả
                if (r.dueDate && r.status === 'Đã duyệt') {
                    const parts = r.dueDate.split('/');
                    const due = new Date(parts[2], parts[1] - 1, parts[0]);
                    if (today > due) {
                        statusText = "QUÁ HẠN";
                        statusColor = "#e74c3c";
                    }
                }

                return `
                <tr>
                    <td>${r.userEmail}</td>
                    <td>${r.bookName}</td>
                    <td>${r.dueDate || '---'}</td>
                    <td><b style="color: ${statusColor}">${statusText}</b></td>
                    <td>
                        ${r.status === 'Đang chờ duyệt' 
                            ? `<button class="btn-add" onclick="appController.approveReservation(${idx})">Duyệt mượn</button>` 
                            : r.status === 'Đã duyệt'
                                ? `<button class="btn-warning" onclick="appController.returnBook(${idx})">Thu hồi</button>`
                                : '<span style="color:gray">Đã trả sách</span>'}
                    </td>
                </tr>`;
            }).join('')}
        </tbody>
    </table>`;
    document.getElementById('page-content').innerHTML = html;
},
// Hàm Duyệt: Trừ kho + Tính hạn trả 14 ngày
approveReservation(index) {
    let reservations = JSON.parse(localStorage.getItem('lib_reservations'));
    let books = JSON.parse(localStorage.getItem('lib_books'));
    
    const res = reservations[index];
    const bookIndex = books.findIndex(b => b.id === res.bookId);

    if (bookIndex !== -1 && books[bookIndex].quantity > 0) {
        // 1. Trừ số lượng sách trong kho
        books[bookIndex].quantity -= 1;
        if (books[bookIndex].quantity === 0) books[bookIndex].status = 'Hết sách';

        // 2. Tính hạn trả (14 ngày kể từ hôm nay)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        
        // 3. Cập nhật yêu cầu
        res.status = 'Đã duyệt';
        res.dueDate = dueDate.toLocaleDateString('vi-VN'); // Định dạng dd/mm/yyyy

        localStorage.setItem('lib_reservations', JSON.stringify(reservations));
        localStorage.setItem('lib_books', JSON.stringify(books));
        
        alert(`Duyệt thành công! Hạn trả: ${res.dueDate}`);
        this.manageReaders();
    } else {
        alert("Sách này đã hết, không thể cho mượn!");
    }
},

// Hàm Trả: Cộng lại kho + Đổi trạng thái
returnBook(index) {
    let reservations = JSON.parse(localStorage.getItem('lib_reservations'));
    let books = JSON.parse(localStorage.getItem('lib_books'));
    
    const res = reservations[index];
    const bookIndex = books.findIndex(b => b.id === res.bookId);

    if (bookIndex !== -1) {
        books[bookIndex].quantity += 1;
        books[bookIndex].status = 'Đang có';
        res.status = 'Đã trả';

        localStorage.setItem('lib_reservations', JSON.stringify(reservations));
        localStorage.setItem('lib_books', JSON.stringify(books));
        
        alert("Xác nhận trả sách thành công!");
        this.manageReaders();
    }
},
    // ================= CHỨC NĂNG ADMIN =================

    // UC7: Quản lý Độc giả và Thủ thư
    manageUsers() {
    document.getElementById('page-title').innerText = "Quản Lý Người Dùng";
    const users = JSON.parse(localStorage.getItem('lib_users')) || [];

    let html = `
        <div class="content-body">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Họ và tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map((u, index) => `
                        <tr>
                            <td>
                                ${u.name} 
                                <button class="btn-admin-action" onclick="appController.adminEditUser(${index}, 'name')">Sửa tên</button>
                            </td>
                            <td>
                                ${u.email} 
                                <button class="btn-admin-action" onclick="appController.adminEditUser(${index}, 'email')">Sửa email</button>
                            </td>
                            <td>
                                <span class="role-badge">${u.role}</span>
                            </td>
                            <td>
                                <button class="btn-delete" style="padding: 5px 15px;" onclick="appController.adminDeleteUser(${index})">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('page-content').innerHTML = html;
},

// Hàm hỗ trợ Admin sửa thông tin bất kỳ ai
adminEditUser(index, field) {
    let users = JSON.parse(localStorage.getItem('lib_users'));
    const oldValue = users[index][field];
    const newValue = prompt(`Nhập ${field === 'name' ? 'Họ tên' : 'Email'} mới cho ${oldValue}:`, oldValue);

    if (newValue && newValue !== oldValue) {
        users[index][field] = newValue;
        localStorage.setItem('lib_users', JSON.stringify(users));
        alert("Cập nhật thành công!");
        this.manageUsers(); // Tải lại bảng
    }
},

// Hàm hỗ trợ Admin xóa người dùng
adminDeleteUser(index) {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
        let users = JSON.parse(localStorage.getItem('lib_users'));
        users.splice(index, 1);
        localStorage.setItem('lib_users', JSON.stringify(users));
        this.manageUsers(); // Tải lại bảng
    }
},

viewStats() {
    document.getElementById('page-title').innerText = "Thống Kê Hệ Thống Thực Tế";
    
    // 1. Lấy dữ liệu thực từ LocalStorage
    const allReservations = JSON.parse(localStorage.getItem('lib_reservations')) || [];
    const allBooks = JSON.parse(localStorage.getItem('lib_books')) || [];
    
    // 2. Khởi tạo đối tượng lưu trữ thống kê theo tháng
    // Chúng ta sẽ thống kê dựa trên các yêu cầu đã duyệt
    const monthlyStats = {};

    allReservations.forEach(res => {
        // Lấy tháng từ ngày mượn (định dạng yyyy-mm-dd)
        const month = res.borrowDate ? "Tháng " + (new Date(res.borrowDate).getMonth() + 1) : "Chưa xác định";
        
        if (!monthlyStats[month]) {
            monthlyStats[month] = { borrowed: 0, returned: 0, damaged: 0, penalty: 0 };
        }

        // Đếm số lượng mượn
        monthlyStats[month].borrowed++;

        // Nếu đã trả thì đếm trả
        if (res.status === 'Đã trả') {
            monthlyStats[month].returned++;
        }

        // TÍNH TIỀN PHẠT THỰC TẾ
        // Giả sử: Quá hạn mỗi ngày phạt 5.000đ, Sách hỏng phạt 50.000đ
        let currentPenalty = 0;
        
        // Check quá hạn (nếu có ngày trả thực tế > ngày hẹn trả)
        if (res.returnDate && res.dueDate) {
            const actual = new Date(res.returnDate);
            const due = new Date(res.dueDate);
            if (actual > due) {
                const diffDays = Math.ceil((actual - due) / (1000 * 60 * 60 * 24));
                currentPenalty += diffDays * 5000; 
            }
        }

        // Check hư hỏng (nếu bạn có trường note hoặc condition trong reservation)
        if (res.condition === 'Hư hỏng') {
            currentPenalty += 50000;
            monthlyStats[month].damaged++;
        }

        monthlyStats[month].penalty += currentPenalty;
    });

    // 3. Tạo HTML bảng
    let tableRows = Object.keys(monthlyStats).map(month => {
        const s = monthlyStats[month];
        return `
            <tr>
                <td>${month}</td>
                <td>${s.borrowed}</td>
                <td>${s.returned}</td>
                <td style="color: red;">${s.damaged}</td>
                <td>${s.penalty.toLocaleString()} đ</td>
                <td>--</td> <td>--</td>
            </tr>
        `;
    }).join('');

    let html = `
        <div class="content-body">
            <p style="font-style: italic; color: #666;">* Tiền phạt được tính tự động dựa trên ngày trả thực tế và tình trạng sách.</p>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Tháng</th>
                        <th>Đã mượn</th>
                        <th>Đã trả</th>
                        <th>Hư hỏng</th>
                        <th>Tiền phạt</th>
                        <th>Mua mới</th>
                        <th>Tiền nhập sách</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows || '<tr><td colspan="7">Chưa có dữ liệu giao dịch</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('page-content').innerHTML = html;
},
};

window.onload = () => {
    if(sessionStorage.getItem('current_user')) appController.renderApp();
};
