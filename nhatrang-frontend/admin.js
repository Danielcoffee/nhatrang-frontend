// Admin Dashboard Logic - Nha Trang Rewards
let adminData = {
    totalUsers: 0,
    totalPartners: 3,
    totalPoints: 0,
    totalTransactions: 0
};

// Danh sách đối tác mẫu
const samplePartners = [
    {
        id: 1,
        name: "Quán Cafe Ocean View",
        address: "12 Trần Phú, Nha Trang", 
        contact: "0901 234 567",
        totalScans: 15,
        totalPoints: 150,
        status: "active"
    },
    {
        id: 2, 
        name: "Tour Lặn Biển Sơn Trà",
        address: "45 Nguyễn Thiện Thuật, Nha Trang",
        contact: "0902 345 678",
        totalScans: 8,
        totalPoints: 80,
        status: "active"
    },
    {
        id: 3,
        name: "Spa Luxury Nha Trang",
        address: "78 Lê Thánh Tôn, Nha Trang",
        contact: "0903 456 789", 
        totalScans: 5,
        totalPoints: 50,
        status: "active"
    }
];

function loadAdminData() {
    // Load từ localStorage hoặc dùng data mẫu
    const savedData = localStorage.getItem('adminData');
    if (savedData) {
        adminData = JSON.parse(savedData);
    }
    
    // Load customers data
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    adminData.totalUsers = customers.length;
    
    // Tính tổng điểm
    adminData.totalPoints = customers.reduce((sum, customer) => sum + customer.points, 0);
    
    // Load transactions
    const transactions = JSON.parse(localStorage.getItem('hederaTransactions') || '[]');
    adminData.totalTransactions = transactions.length;
    
    updateAdminUI();
    loadPartnersList();
}

function updateAdminUI() {
    document.getElementById('totalUsers').textContent = adminData.totalUsers;
    document.getElementById('totalPartners').textContent = adminData.totalPartners;
    document.getElementById('totalPoints').textContent = adminData.totalPoints;
    document.getElementById('totalTransactions').textContent = adminData.totalTransactions;
}

function loadPartnersList() {
    const partners = JSON.parse(localStorage.getItem('partners') || JSON.stringify(samplePartners));
    const container = document.getElementById('partnersList');
    
    const partnersArray = typeof partners === 'string' ? JSON.parse(partners) : partners;
    
    if (partnersArray.length === 0) {
        container.innerHTML = '<p class="text-muted">Chưa có đối tác nào</p>';
        return;
    }
    
    container.innerHTML = partnersArray.map(partner => `
        <div class="partner-card card mb-2 p-3">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${partner.name}</h6>
                    <small class="text-muted">${partner.address}</small>
                    <br>
                    <small>📞 ${partner.contact}</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-success">${partner.status}</span>
                    <div class="mt-1">
                        <small>👥 ${partner.totalScans} scans</small>
                        <br>
                        <small>💰 ${partner.totalPoints} điểm</small>
                    </div>
                </div>
            </div>
            <div class="mt-2">
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editPartner(${partner.id})">✏️</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletePartner(${partner.id})">🗑️</button>
                <button class="btn btn-sm btn-outline-info" onclick="viewPartnerStats(${partner.id})">📊</button>
            </div>
        </div>
    `).join('');
}

function addNewPartner() {
    const name = prompt('Tên đối tác:');
    if (!name) return;
    
    const address = prompt('Địa chỉ:');
    const contact = prompt('Số điện thoại:');
    
    const newPartner = {
        id: Date.now(), // Simple ID
        name: name,
        address: address || 'Chưa cập nhật',
        contact: contact || 'Chưa cập nhật',
        totalScans: 0,
        totalPoints: 0,
        status: 'active',
        joinDate: new Date().toLocaleDateString('vi-VN')
    };
    
    const partners = JSON.parse(localStorage.getItem('partners') || JSON.stringify(samplePartners));
    const partnersArray = typeof partners === 'string' ? JSON.parse(partners) : partners;
    
    partnersArray.push(newPartner);
    localStorage.setItem('partners', JSON.stringify(partnersArray));
    
    adminData.totalPartners = partnersArray.length;
    updateAdminUI();
    loadPartnersList();
    
    alert(`✅ Đã thêm đối tác: ${name}`);
}

function editPartner(partnerId) {
    const partners = JSON.parse(localStorage.getItem('partners') || JSON.stringify(samplePartners));
    const partnersArray = typeof partners === 'string' ? JSON.parse(partners) : partners;
    const partner = partnersArray.find(p => p.id === partnerId);
    
    if (!partner) {
        alert('Không tìm thấy đối tác');
        return;
    }
    
    const newName = prompt('Tên mới:', partner.name);
    if (newName) partner.name = newName;
    
    const newAddress = prompt('Địa chỉ mới:', partner.address);
    if (newAddress) partner.address = newAddress;
    
    const newContact = prompt('SĐT mới:', partner.contact);
    if (newContact) partner.contact = newContact;
    
    localStorage.setItem('partners', JSON.stringify(partnersArray));
    loadPartnersList();
    
    alert('✅ Đã cập nhật thông tin đối tác');
}

function deletePartner(partnerId) {
    if (!confirm('Bạn có chắc muốn xóa đối tác này?')) return;
    
    const partners = JSON.parse(localStorage.getItem('partners') || JSON.stringify(samplePartners));
    const partnersArray = typeof partners === 'string' ? JSON.parse(partners) : partners;
    const filteredPartners = partnersArray.filter(p => p.id !== partnerId);
    
    localStorage.setItem('partners', JSON.stringify(filteredPartners));
    
    adminData.totalPartners = filteredPartners.length;
    updateAdminUI();
    loadPartnersList();
    
    alert('✅ Đã xóa đối tác');
}

function viewPartnerStats(partnerId) {
    const partners = JSON.parse(localStorage.getItem('partners') || JSON.stringify(samplePartners));
    const partnersArray = typeof partners === 'string' ? JSON.parse(partners) : partners;
    const partner = partnersArray.find(p => p.id === partnerId);
    
    if (partner) {
        alert(`📊 Thống kê ${partner.name}:
• Tổng scans: ${partner.totalScans}
• Tổng điểm đã tặng: ${partner.totalPoints}
• Trạng thái: ${partner.status}
• Ngày tham gia: ${partner.joinDate || 'Chưa cập nhật'}`);
    }
}

function addDemoData() {
    // Thêm khách hàng demo
    const demoCustomers = [
        {
            phone: '0901111222',
            password: '123456',
            points: 45,
            hederaAccountId: '0.0.123456',
            joinDate: '15/12/2024'
        },
        {
            phone: '0903333444', 
            password: '123456',
            points: 80,
            hederaAccountId: '0.0.234567',
            joinDate: '16/12/2024'
        },
        {
            phone: '0905555666',
            password: '123456', 
            points: 25,
            hederaAccountId: '0.0.345678',
            joinDate: '17/12/2024'
        }
    ];
    
    localStorage.setItem('customers', JSON.stringify(demoCustomers));
    
    // Thêm giao dịch demo
    const demoTransactions = [
        {
            id: '0.0.1000001',
            type: 'ADD_POINTS',
            description: 'Nhận 10 điểm từ Quán Cafe Ocean View',
            points: 10,
            timestamp: '18/12/2024 09:30',
            status: 'SUCCESS'
        },
        {
            id: '0.0.1000002', 
            type: 'ADD_POINTS',
            description: 'Nhận 10 điểm từ Tour Lặn Biển',
            points: 10,
            timestamp: '18/12/2024 14:20',
            status: 'SUCCESS'
        },
        {
            id: '0.0.1000003',
            type: 'REDEEM_POINTS',
            description: 'Đổi 50 điểm lấy voucher spa',
            points: -50,
            timestamp: '19/12/2024 11:15', 
            status: 'SUCCESS'
        }
    ];
    
    localStorage.setItem('hederaTransactions', JSON.stringify(demoTransactions));
    
    // Cập nhật partner scans demo
    const partners = JSON.parse(localStorage.getItem('partners') || JSON.stringify(samplePartners));
    const partnersArray = typeof partners === 'string' ? JSON.parse(partners) : partners;
    
    partnersArray[0].totalScans = 15;
    partnersArray[0].totalPoints = 150;
    partnersArray[1].totalScans = 8; 
    partnersArray[1].totalPoints = 80;
    partnersArray[2].totalScans = 5;
    partnersArray[2].totalPoints = 50;
    
    localStorage.setItem('partners', JSON.stringify(partnersArray));
    
    // Reload data
    loadAdminData();
    
    alert('🎲 Đã thêm dữ liệu demo thành công!\n\n• 3 khách hàng mẫu\n• 3 giao dịch Hedera\n• Dữ liệu đối tác');
}

function resetSystem() {
    if (!confirm('⚠️ CẢNH BÁO: Bạn có chắc muốn RESET toàn bộ hệ thống?\n\nTất cả dữ liệu sẽ bị xóa và không thể khôi phục!')) return;
    
    if (!confirm('🔄 XÁC NHẬN LẦN CUỐI: Reset toàn bộ hệ thống?')) return;
    
    // Xóa tất cả dữ liệu
    localStorage.removeItem('customers');
    localStorage.removeItem('hederaTransactions');
    localStorage.removeItem('partnerData');
    localStorage.removeItem('partnerScans');
    localStorage.removeItem('adminData');
    
    // Giữ lại partners nhưng reset stats
    const partners = JSON.parse(localStorage.getItem('partners') || JSON.stringify(samplePartners));
    const partnersArray = typeof partners === 'string' ? JSON.parse(partners) : partners;
    
    partnersArray.forEach(partner => {
        partner.totalScans = 0;
        partner.totalPoints = 0;
    });
    
    localStorage.setItem('partners', JSON.stringify(partnersArray));
    
    // Reset admin data
    adminData = {
        totalUsers: 0,
        totalPartners: partnersArray.length,
        totalPoints: 0,
        totalTransactions: 0
    };
    
    localStorage.setItem('adminData', JSON.stringify(adminData));
    
    updateAdminUI();
    loadPartnersList();
    
    alert('♻️ Đã reset toàn bộ hệ thống về trạng thái ban đầu!');
}

function exportData() {
    // Thu thập tất cả dữ liệu
    const exportData = {
        timestamp: new Date().toLocaleString('vi-VN'),
        customers: JSON.parse(localStorage.getItem('customers') || '[]'),
        partners: JSON.parse(localStorage.getItem('partners') || JSON.stringify(samplePartners)),
        transactions: JSON.parse(localStorage.getItem('hederaTransactions') || '[]'),
        adminStats: adminData
    };
    
    // Tạo file download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `nhatrang-rewards-export-${new Date().getTime()}.json`;
    link.click();
    
    alert('📤 Đã export dữ liệu thành công! File JSON đã được tải về.');
}

// Khởi tạo admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    
    // Auto-save admin data
    setInterval(() => {
        localStorage.setItem('adminData', JSON.stringify(adminData));
    }, 30000); // Save every 30 seconds
});