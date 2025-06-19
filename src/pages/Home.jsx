import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="homepage text-center py-12 px-4 bg-blue-50 min-h-screen font-sans">
            <h1 className="text-4xl font-bold text-blue-700 mb-4">👋 Chào mừng bạn đến với <span className="text-blue-600">Smart Pillbox</span></h1>
            <p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto">
                Hệ thống giúp bạn và gia đình quản lý lịch uống thuốc một cách hiệu quả, chính xác và tiện lợi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
                <div className="feature-card bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">📅 Lên lịch uống thuốc</h3>
                    <p className="text-gray-600">Tạo kế hoạch uống thuốc rõ ràng cho từng loại thuốc.</p>
                </div>
                <div className="feature-card bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">🔔 Nhắc nhở tự động</h3>
                    <p className="text-gray-600">Hệ thống sẽ tự động nhắc đúng giờ bạn đã đặt.</p>
                </div>
                <div className="feature-card bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">🧓 Quản lý người thân</h3>
                    <p className="text-gray-600">Hỗ trợ theo dõi lịch thuốc cho người thân lớn tuổi.</p>
                </div>
                <div className="feature-card bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">📲 Kết nối email</h3>
                    <p className="text-gray-600">Nhận thông báo uống thuốc qua email tiện lợi.</p>
                </div>
            </div>

            <Link to="/register" className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Bắt đầu ngay</Link>
        </div>
    );
}

export default Home;
