// qr-scanner.js - Mobile QR Scanner cho Đối tác
const API_BASE = window.API_BASE || 
                 (window.location.hostname === 'localhost' 
                   ? 'http://localhost:3001' 
                   : 'https://nhatrang-backend-production.up.railway.app');

class QRScanner {
    constructor() {
        this.isScanning = false;
        this.videoElement = null;
    }

    // Khởi động scanner
    async startScan() {
        try {
            console.log('🚀 Starting QR Scanner...');
            
            // Kiểm tra hỗ trợ camera
            if (!this.hasCameraSupport()) {
                this.showError('Trình duyệt không hỗ trợ camera');
                return;
            }

            // Tạo UI scanner
            this.createScannerUI();
            
            // Khởi động camera
            await this.startCamera();
            
            this.isScanning = true;
            console.log('✅ QR Scanner ready');
            
        } catch (error) {
            console.error('❌ Scanner error:', error);
            this.fallbackToManualInput();
        }
    }

    // Kiểm tra hỗ trợ camera
    hasCameraSupport() {
        return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    }

    // Tạo UI scanner
    createScannerUI() {
        const scannerHTML = `
        <div id="qrScannerOverlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        ">
            <!-- Camera View -->
            <div style="position: relative; width: 100%; max-width: 400px;">
                <video id="qrVideo" autoplay playsinline style="
                    width: 100%;
                    height: 400px;
                    object-fit: cover;
                    border-radius: 10px;
                "></video>
                
                <!-- Scanner Frame -->
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 250px;
                    height: 250px;
                    border: 3px solid #00ff00;
                    border-radius: 15px;
                    box-shadow: 0 0 0 1000px rgba(0,0,0,0.7);
                "></div>
            </div>

            <!-- Instructions -->
            <div style="color: white; text-align: center; margin-top: 20px; padding: 0 20px;">
                <h4>📱 Quét QR Code</h4>
                <p>Đưa mã QR của khách hàng vào khung hình</p>
            </div>

            <!-- Action Buttons -->
            <div style="margin-top: 30px; display: flex; gap: 15px;">
                <button onclick="qrScanner.stopScan()" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-size: 16px;
                ">❌ Hủy</button>
                
                <button onclick="qrScanner.fallbackToManualInput()" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-size: 16px;
                ">📝 Nhập tay</button>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', scannerHTML);
        this.videoElement = document.getElementById('qrVideo');
    }

    // Khởi động camera
    async startCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // Ưu tiên camera sau
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        this.videoElement.srcObject = stream;
        await this.videoElement.play();
        
        // Bắt đầu scan (demo - sẽ tích hợp thư viện QR thật sau)
        this.startMockQRDetection();
    }

    // Mock QR detection (tạm thời)
    startMockQRDetection() {
        console.log('🔍 Starting QR detection...');
        
        // TODO: Tích hợp thư viện QR scanner thật (jsQR, html5-qrcode)
        // Tạm thời dùng timeout để demo
        setTimeout(() => {
            if (this.isScanning) {
                this.mockQRFound();
            }
        }, 3000);
    }

    // Mock QR found - DEMO
    mockQRFound() {
        const mockQRData = JSON.stringify({
            phone: '090' + Math.floor(1000000 + Math.random() * 9000000),
            type: 'customer_qr',
            timestamp: Date.now()
        });
        
        this.processScannedData(mockQRData);
    }

    // Xử lý dữ liệu QR scan
    processScannedData(qrData) {
        try {
            console.log('📨 QR Data received:', qrData);
            
            // Parse QR data
            const data = JSON.parse(qrData);
            const customerPhone = data.phone;
            
            // Hiển thị confirm
            this.showConfirmation(customerPhone);
            
        } catch (error) {
            console.error('❌ QR data parse error:', error);
            this.showError('Mã QR không hợp lệ');
        }
    }

    // Hiển thị xác nhận
    showConfirmation(phone) {
        this.stopScan();
        
        if (confirm(`Xác nhận thêm điểm cho: ${phone}?`)) {
            this.addPointsToCustomer(phone);
        }
    }

    // Thêm điểm cho khách hàng
    async addPointsToCustomer(phone) {
        try {
            // Gọi API backend
            const response = await fetch(`${API_BASE}/api/add-points`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    userAccountId: `0.0.${Math.floor(1000000 + Math.random() * 9000000)}`, // Tạm thời
                    points: 10,
                    partnerId: 'qr_scanner'
                })
            });

            const result = await response.json();
            
            if (result.success) {
                alert(`✅ Đã thêm 10 điểm cho ${phone}!`);
                // Reload partner dashboard
                if (typeof loadPartnerData === 'function') {
                    loadPartnerData();
                }
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            console.error('❌ Add points error:', error);
            this.showError('Lỗi thêm điểm: ' + error.message);
        }
    }

    // Fallback: Nhập tay
    fallbackToManualInput() {
        this.stopScan();
        
        const phone = prompt('🔢 Nhập SĐT khách hàng:');
        if (phone && phone.length >= 10) {
            this.addPointsToCustomer(phone);
        } else if (phone) {
            this.showError('SĐT không hợp lệ');
        }
    }

    // Dừng scanner
    stopScan() {
        this.isScanning = false;
        
        // Tắt camera
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        
        // Xóa UI
        const overlay = document.getElementById('qrScannerOverlay');
        if (overlay) {
            overlay.remove();
        }
        
        console.log('🛑 QR Scanner stopped');
    }

    // Hiển thị lỗi
    showError(message) {
        alert('❌ ' + message);
        this.stopScan();
    }
}

// Khởi tạo global instance
const qrScanner = new QRScanner();