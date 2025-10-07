// Partner Dashboard Logic
let partnerData = {
    name: "Quán Cafe A",
    address: "25 Nguyễn Thiện Thuật, Nha Trang",
    totalScans: 0,
    totalPointsGiven: 0
};

function loadPartnerData() {
    const saved = localStorage.getItem('partnerData');
    if (saved) {
        partnerData = JSON.parse(saved);
    }
    
    document.getElementById('partnerName').textContent = `${partnerData.name} • ${partnerData.address}`;
    document.getElementById('totalCustomers').textContent = partnerData.totalScans;
    document.getElementById('totalPoints').textContent = partnerData.totalPointsGiven;
    
    loadRecentScans();
}

function scanCustomerQR() {
    const qrInput = document.getElementById('customerQR').value.trim();
    
    if (!qrInput) {
        alert('Vui lòng nhập mã QR hoặc SĐT khách hàng');
        return;
    }

    // Giả lập xử lý QR
    processCustomerScan(qrInput);
}

function useManualInput() {
    const phone = prompt('Nhập SĐT khách hàng:');
    if (phone) {
        processCustomerScan(phone);
    }
}

function processCustomerScan(identifier) {
    // Tìm khách hàng trong database
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    let customer = customers.find(c => c.phone === identifier || c.hederaAccountId === identifier);
    
    if (!customer) {
        alert('Không tìm thấy khách hàng. Vui lòng kiểm tra lại mã QR/SĐT');
        return;
    }

    // Thêm điểm cho khách hàng
    const pointsToAdd = 10;
    customer.points += pointsToAdd;
    customer.lastVisit = new Date().toLocaleString('vi-VN');
    
    // Cập nhật partner data
    partnerData.totalScans++;
    partnerData.totalPointsGiven += pointsToAdd;
    
    // Lưu dữ liệu
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('partnerData', JSON.stringify(partnerData));
    
    // Thêm vào lịch sử
    addToRecentScans(customer.phone, pointsToAdd);
    
    // Update UI
    loadPartnerData();
    
    alert(`✅ Đã thêm ${pointsToAdd} điểm cho ${customer.phone}\nTổng điểm: ${customer.points}`);
}

function addToRecentScans(phone, points) {
    const scans = JSON.parse(localStorage.getItem('partnerScans') || '[]');
    
    scans.unshift({
        phone: phone,
        points: points,
        timestamp: new Date().toLocaleString('vi-VN'),
        partner: partnerData.name
    });
    
    // Giới hạn 10 bản ghi gần nhất
    if (scans.length > 10) scans.pop();
    
    localStorage.setItem('partnerScans', JSON.stringify(scans));
}

function loadRecentScans() {
    const scans = JSON.parse(localStorage.getItem('partnerScans') || '[]');
    const container = document.getElementById('recentScans');
    
    if (scans.length === 0) {
        container.innerHTML = '<p class="text-muted">Chưa có giao dịch nào</p>';
        return;
    }
    
    container.innerHTML = scans.map(scan => `
        <div class="scan-item mb-2 p-2 border-start border-success border-3">
            <div class="d-flex justify-content-between">
                <strong>${scan.phone}</strong>
                <span class="text-success">+${scan.points}đ</span>
            </div>
            <small class="text-muted">${scan.timestamp}</small>
        </div>
    `).join('');
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    loadPartnerData();
});