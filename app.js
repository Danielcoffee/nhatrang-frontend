// Frontend JavaScript với Hedera Integration
let currentUser = null;
let hederaAccount = null;

function showRegister() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
}

// Đăng ký tài khoản mới với Hedera
// Cấu hình API endpoint
// ✅ MỚI (thay bằng)
// Dynamic API Base URL for Production
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'
    : 'nhatrang-backend-production.up.railway.app';  // URL backend production

    
async function register() {
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    
    if (!phone || !password) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    try {
        // Gọi backend API thật
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                phone: phone,
                name: `Khách hàng ${phone}`
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Lưu thông tin user với Hedera account THẬT
            currentUser = {
                phone: phone,
                password: password,
                points: result.user.points,
                hederaAccountId: result.user.hederaAccountId,
                transactionId: result.transactionId
            };

            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            alert(`🎉 Đăng ký thành công!\nTài khoản Hedera: ${result.user.hederaAccountId}\nNhận ngay ${result.user.points} điểm thưởng!`);
            showDashboard();
            
        } else {
            alert('Lỗi đăng ký: ' + result.message);
        }
        
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        alert('Lỗi kết nối server. Vui lòng thử lại.');
    }
}

// Tạo account Hedera (DEMO - frontend only)
async function createHederaAccount(phone) {
    // Trong demo, chúng ta giả lập
    // THỰC TẾ: Gọi backend API để tạo account an toàn
    
    const demoAccountId = `0.0.${Math.floor(100000 + Math.random() * 900000)}`;
    const demoPrivateKey = `302e...${Math.random().toString(36).substr(2, 10)}`;
    
    return {
        accountId: demoAccountId,
        privateKey: demoPrivateKey
    };
}

function login() {
    const phone = document.getElementById('phoneNumber').value;
    const password = document.getElementById('password').value;

    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.phone === phone && user.password === password) {
            currentUser = user;
            showDashboard();
            return;
        }
    }
    
    alert('Sai SĐT hoặc mật khẩu. Đăng ký tài khoản mới!');
}

// FUNCTION LOGOUT MỚI - QUAN TRỌNG!
function logout() {
    if (confirm('Bạn có chắc muốn thoát?')) {
        // Xóa currentUser khỏi memory
        currentUser = null;
        
        // XÓA HOÀN TOÀN: Xóa cả localStorage nếu muốn reset hoàn toàn
        // localStorage.removeItem('currentUser');
        // localStorage.removeItem('hederaTransactions');
        
        // Reset giao diện về ban đầu
        resetToInitialState();
        
        alert('👋 Đã thoát thành công!');
    }
}

// Reset giao diện về trạng thái ban đầu
function resetToInitialState() {
    // Ẩn tất cả sections
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('logoutSection').style.display = 'none';
    document.getElementById('hederaInfo').style.display = 'none';
    
    // Hiển thị login section
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
    
    // Reset form values
    document.getElementById('phoneNumber').value = '';
    document.getElementById('password').value = '';
    document.getElementById('regPhone').value = '';
    document.getElementById('regPassword').value = '';
    
    // Clear QR code
    document.getElementById('qrcode').innerHTML = '<span class="text-muted">QR code sẽ xuất hiện ở đây</span>';
    
    // Reset transactions list
    document.getElementById('transactionsList').innerHTML = '<p class="text-muted">Chưa có giao dịch nào</p>';
}

function showDashboard() {
    // Ẩn login/register sections
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    
    // Hiển thị dashboard và logout button
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('logoutSection').style.display = 'block';
    document.getElementById('hederaInfo').style.display = 'block';
    
    // Cập nhật thông tin user
    document.getElementById('pointsDisplay').textContent = currentUser.points;
    document.getElementById('accountId').textContent = `Account: ${currentUser.hederaAccountId}`;
    
    // Load lịch sử giao dịch
    loadTransactionHistory();
}

// Tạo QR Code - FIXED
function generateQR() {
    if (!currentUser) {
        alert('Vui lòng đăng nhập trước');
        return;
    }

    const qrData = JSON.stringify({
        type: 'nhatrang_reward',
        phone: currentUser.phone,
        accountId: currentUser.hederaAccountId,
        timestamp: Date.now(),
        points: 10 // Điểm thưởng khi quét
    });

    // Xóa QR cũ
    const qrcodeElement = document.getElementById('qrcode');
    qrcodeElement.innerHTML = '';
    
    // Tạo QR mới
    try {
        new QRCode(qrcodeElement, {
            text: qrData,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        alert('✅ QR code đã được tạo!\nQuét QR này để nhận 10 điểm thưởng.');
        addTransaction('QR_CREATED', 'Tạo QR code nhận điểm');
        
    } catch (error) {
        console.error('Lỗi tạo QR:', error);
        alert('Lỗi tạo QR code. Vui lòng thử lại.');
    }
}

// Thêm điểm demo (Hedera integration)
async function addDemoPoints() {
    if (!currentUser) {
        alert('Vui lòng đăng nhập trước');
        return;
    }

    try {
        // Gọi backend API thật để thêm điểm
        const response = await fetch(`${API_BASE}/api/add-points`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                userAccountId: currentUser.hederaAccountId,
                points: 10,
                partnerId: 'demo_partner'
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Cập nhật điểm
            currentUser.points += 10;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Hiển thị điểm mới
            document.getElementById('pointsDisplay').textContent = currentUser.points;
            
            // Thêm vào lịch sử
            addTransaction('ADD_POINTS', `Nhận 10 điểm từ demo`, result.transactionId);
            
            alert(`🎉 +10 điểm!\nTransaction ID: ${result.transactionId}\nSố dư mới: ${result.newBalance} điểm`);
            
        } else {
            alert('Lỗi thêm điểm: ' + result.message);
        }
        
    } catch (error) {
        alert('Lỗi kết nối: ' + error.message);
    }
}

// Thêm giao dịch vào lịch sử
function addTransaction(type, description, transactionId = null) {
    if (!transactionId) {
        transactionId = `0.0.${Math.floor(1000000 + Math.random() * 9000000)}`;
    }
    
    const transactions = JSON.parse(localStorage.getItem('hederaTransactions') || '[]');
    
    const newTransaction = {
        id: transactionId,
        type: type,
        description: description,
        points: type === 'ADD_POINTS' ? 10 : 0,
        timestamp: new Date().toLocaleString('vi-VN'),
        status: 'SUCCESS'
    };
    
    transactions.unshift(newTransaction);
    localStorage.setItem('hederaTransactions', JSON.stringify(transactions));
    
    loadTransactionHistory();
}

// Tải lịch sử giao dịch
function loadTransactionHistory() {
    const transactions = JSON.parse(localStorage.getItem('hederaTransactions') || '[]');
    const container = document.getElementById('transactionsList');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-muted">Chưa có giao dịch nào</p>';
        return;
    }
    
    container.innerHTML = transactions.map(tx => `
        <div class="transaction-item mb-2 p-2 border rounded">
            <div class="d-flex justify-content-between">
                <strong>${tx.description}</strong>
                <span class="badge bg-success">${tx.status}</span>
            </div>
            <div class="text-muted small">
                TX: ${tx.id} • ${tx.timestamp}
                ${tx.points ? ` • +${tx.points} điểm` : ''}
            </div>
        </div>
    `).join('');
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('phoneNumber').value = currentUser.phone;
        // TỰ ĐỘNG ĐĂNG NHẬP NẾU ĐÃ CÓ USER
        showDashboard();
    } else {
        // HIỂN THỊ LOGIN NẾU CHƯA ĐĂNG NHẬP
        resetToInitialState();
    }
    
    loadTransactionHistory();
});