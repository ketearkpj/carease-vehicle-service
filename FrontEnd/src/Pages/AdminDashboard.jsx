// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import AdminTable from '../Components/Admin/AdminTable';
import AnalyticsChart from '../Components/Admin/AnalyticsChart';
import '../Styles/Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeVehicles: 0,
    totalUsers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API calls
    setTimeout(() => {
      setStats({
        totalBookings: 1248,
        totalRevenue: 452890,
        activeVehicles: 86,
        totalUsers: 3421
      });

      setRecentBookings([
        { id: '#CE1001', customer: 'John Smith', vehicle: 'Lamborghini Huracán', amount: 3600, status: 'confirmed', date: '2024-02-24' },
        { id: '#CE1002', customer: 'Emma Watson', vehicle: 'Rolls Royce Ghost', amount: 5400, status: 'pending', date: '2024-02-23' },
        { id: '#CE1003', customer: 'Michael Brown', vehicle: 'Porsche 911', amount: 2700, status: 'confirmed', date: '2024-02-23' },
        { id: '#CE1004', customer: 'Sarah Johnson', vehicle: 'Range Rover', amount: 2100, status: 'cancelled', date: '2024-02-22' },
        { id: '#CE1005', customer: 'David Lee', vehicle: 'Ferrari F8', amount: 4500, status: 'confirmed', date: '2024-02-22' }
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const chartData = [
    { label: 'Jan', value: 45000 },
    { label: 'Feb', value: 52000 },
    { label: 'Mar', value: 48000 },
    { label: 'Apr', value: 61000 },
    { label: 'May', value: 58000 },
    { label: 'Jun', value: 67000 }
  ];

  const bookingColumns = [
    { key: 'id', label: 'Booking ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'amount', label: 'Amount', render: (value) => `$${value}` },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`admin-status-badge ${value}`}>{value}</span>
      )
    },
    { key: 'date', label: 'Date' }
  ];

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📅</div>
          <span className="admin-stat-value">{stats.totalBookings}</span>
          <span className="admin-stat-label">Total Bookings</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">💰</div>
          <span className="admin-stat-value">${stats.totalRevenue.toLocaleString()}</span>
          <span className="admin-stat-label">Total Revenue</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">🚗</div>
          <span className="admin-stat-value">{stats.activeVehicles}</span>
          <span className="admin-stat-label">Active Vehicles</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <span className="admin-stat-value">{stats.totalUsers}</span>
          <span className="admin-stat-label">Total Users</span>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsChart 
        type="line" 
        data={chartData} 
        title="Revenue Overview 2024"
      />

      {/* Recent Bookings */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Recent Bookings</h2>
          <button className="btn btn-outline btn-sm">View All</button>
        </div>

        <AdminTable
          columns={bookingColumns}
          data={recentBookings}
          onView={(row) => console.log('View', row)}
          onEdit={(row) => console.log('Edit', row)}
          pagination={false}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;