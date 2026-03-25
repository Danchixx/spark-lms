import React from 'react';
import './DashboardCard.css';
import type { LucideIcon } from 'lucide-react';

type DashboardCardProps = {
  label: string;
  value?: number;
  icon: LucideIcon;
  sub: string;
  subColor: string;
};

const DashboardCard = ({ label, value, icon: Icon, sub, subColor }: DashboardCardProps) => {
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
