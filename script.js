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
        // ... (Giữ nguyên code phần register cũ của bạn) ...
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-pass').value;
        const role = document.getElementById('reg-role').value;

        if (!name || !email || !pass) return alert("Vui lòng điền đầy đủ!");
        if (role === 'LIBRARIAN' && !/thuvien/i.test(email)) return alert("Tài khoản Thủ thư phải chứa 'thuvien'!");

        const users = JSON.parse(localStorage.getItem('lib_users'));
        if (users.some(u => u.email === email)) return alert("Tài khoản đã tồn tại!");

        users.push({ email, password: pass, role, name });
        localStorage.setItem('lib_users', JSON.stringify(users));
        alert("Đăng ký thành công!");
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
        const user = JSON.parse(sessionStorage.getItem('current_user'));
        const reservations = JSON.parse(localStorage.getItem('lib_reservations'));
        
        reservations.push({
            userEmail: user.email,
            bookId: bookId,
            bookName: bookName,
            date: new Date().toLocaleDateString(),
            status: 'Đang chờ duyệt'
        });
        
        localStorage.setItem('lib_reservations', JSON.stringify(reservations));
        alert(`Bạn đã đặt lịch mượn cuốn "${bookName}" thành công! Vui lòng chờ thủ thư duyệt.`);
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
        const reservations = JSON.parse(localStorage.getItem('lib_reservations')).filter(r => r.userEmail === user.email);

        let html = `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p><b>Họ và tên:</b> ${user.name}</p>
                <p><b>Email:</b> ${user.email}</p>
                <p><b>Trạng thái:</b> Đang hoạt động</p>
            </div>
            <h3>Sách đang đặt mượn / Đã mượn</h3>
            <table>
                <thead>
                    <tr>
                        <th>Tên sách</th>
                        <th>Ngày đặt</th>
                        <th>Hạn trả</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${reservations.map(r => `
                        <tr>
                            <td>${r.bookName}</td>
                            <td>${r.date}</td>
                            <td><b style="color: #2c3e50">${r.dueDate || '---'}</b></td>
                            <td>
                                <b style="color: ${r.status === 'Đã duyệt' ? '#27ae60' : '#e74c3c'}">
                                    ${r.status}
                                </b>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('page-content').innerHTML = html;
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
        document.getElementById('page-title').innerText = "Quản Lý Tài Khoản";
        const users = JSON.parse(localStorage.getItem('lib_users'));
        let html = `<table>
            <thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Thao tác</th></tr></thead>
            <tbody>
                ${users.map((u, idx) => `
                    <tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td>
                    <td><button class="btn-delete" onclick="alert('Xóa user index: ${idx}')">Xóa</button></td></tr>
                `).join('')}
            </tbody>
        </table>`;
        document.getElementById('page-content').innerHTML = html;
    },

    // UC8: Thống kê
    viewStats() {
        document.getElementById('page-title').innerText = "Thống Kê Doanh Thu";
        document.getElementById('page-content').innerHTML = `
            <table style="width: 50%;">
                <thead><tr><th>Tháng</th><th>Số sách mượn</th><th>Tiền phạt/Doanh thu</th></tr></thead>
                <tbody>
                    <tr><td>Tháng 1</td><td>120 cuốn</td><td>200,000 đ</td></tr>
                    <tr><td>Tháng 2</td><td>140 cuốn</td><td>300,000 đ</td></tr>
                    <tr><td>Tháng 3</td><td>130 cuốn</td><td>150,000 đ</td></tr>
                </tbody>
            </table>`;
    }
};

window.onload = () => {
    if(sessionStorage.getItem('current_user')) appController.renderApp();
};