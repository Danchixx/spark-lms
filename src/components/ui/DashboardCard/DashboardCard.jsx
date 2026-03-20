import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ label, value, icon: Icon, sub, subColor }) => {
  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-card-label">{label}</div>
      <div className="dashboard-stat-card-content">
        <div className="dashboard-stat-card-value">{value}</div>
        <Icon size={28} className="dashboard-stat-card-icon" />
      </div>
      <div className="dashboard-stat-card-sub" style={{ color: subColor }}>{sub}</div>
    </div>
  );
};

export default DashboardCard;
