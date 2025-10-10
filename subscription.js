// subscription.js - Partner Subscription System
let selectedPlan = '';

function selectPlan(planType) {
    selectedPlan = planType;
    
    // Update UI
    document.getElementById('selectedPlan').textContent = planType === 'basic' ? 'Basic' : 'Premium';
    document.getElementById('planType').value = planType;
    document.getElementById('formTitle').textContent = `Đăng Ký Gói ${planType === 'basic' ? 'Basic' : 'Premium'}`;
    
    // Show form
    document.getElementById('subscriptionForm').style.display = 'block';
    
    // Scroll to form
    document.getElementById('subscriptionForm').scrollIntoView({ behavior: 'smooth' });
}

// Form submission
document.getElementById('partnerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const businessName = document.getElementById('businessName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const planType = document.getElementById('planType').value;

    try {
        const response = await fetch(`${API_BASE}/api/partners/subscribe`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                businessName: businessName,
                phone: phone,
                email: email,
                planType: planType
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Show success message
            document.getElementById('subscriptionForm').style.display = 'none';
            document.getElementById('successDetails').innerHTML = `
                <strong>${businessName}</strong><br>
                Gói: ${result.partner.plan}<br>
                Phí: ${result.partner.monthlyFee.toLocaleString()}VND/tháng<br>
                Trạng thái: ${result.partner.status}<br>
                Dùng thử đến: ${new Date(result.partner.trialEnds).toLocaleDateString('vi-VN')}
            `;
            document.getElementById('successMessage').style.display = 'block';
            
            console.log('✅ Partner registered:', result.partner);
        } else {
            alert('Lỗi đăng ký: ' + result.message);
        }
        
    } catch (error) {
        console.error('Subscription error:', error);
        alert('Lỗi kết nối: ' + error.message);
    }
});

// API_BASE configuration
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'
    : 'https://nhatrang-backend-production.up.railway.app';