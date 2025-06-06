import React from 'react';
import './Home.css';

function FeatureItem({ icon, children }) {
  return <li className="feature-item">{icon} {children}</li>;
}

function Home() {
  return (
    <div className="home-container">
      <h1>👋 Chào mừng bạn đến với Smart Pillbox</h1>
      <p>Hệ thống giúp bạn và gia đình quản lý lịch uống thuốc một cách hiệu quả.</p>
      <ul>
        <FeatureItem icon="📅">Lên lịch uống thuốc</FeatureItem>
        <FeatureItem icon="🔔">Nhắc nhở tự động</FeatureItem>
        <FeatureItem icon="🧓">Quản lý nhiều người thân</FeatureItem>
        <FeatureItem icon="📲">Kết nối với Zalo OA để gửi thông báo</FeatureItem>
      </ul>
    </div>
  );
}

export default Home;
