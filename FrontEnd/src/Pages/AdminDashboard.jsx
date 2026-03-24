// ===== src/Pages/AdminDashboard.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import AnalyticsChart from '../Components/Admin/AnalyticsChart';
import AdminTable from '../Components/Admin/AdminTable';

// Services
import { getDashboardStats, getRecentBookings, getAdminNotifications } from '../Services/AdminService';
import { formatCurrency } from '../Utils/format';

// Hooks
import { useAdminAuth } from '../Hooks/useAdminAuth';
import { useApp } from '../Context/AppContext';

// Styles
import '../Styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [chartData, setChartData] = useState(null);
  const [adminNotifications, setAdminNotifications] = useState([]);

  const { admin } = useAdminAuth();
  const { addNotification } = useApp();

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, bookingsData] = await Promise.all([
        getDashboardStats({ period: timeframe }),
        getRecentBookings(10)
      ]);

      setStats(statsData);
      setRecentBookings(bookingsData);
      
      // Prepare chart data
      setChartData({
        labels: statsData?.trends?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Revenue',
            data: statsData?.trends?.revenue || [12000, 19000, 15000, 25000, 22000, 30000, 28000],
            borderColor: '#d4af37',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
          },
          {
            label: 'Bookings',
            data: statsData?.trends?.bookings || [45, 52, 48, 70, 65, 85, 78],
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
          }
        ]
      });
      await fetchAdminNotifications();
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      addNotification('Failed to load dashboard data', 'error');
      
      // Fallback data
      setStats({
        revenue: { total: 158900, change: 12.5 },
        bookings: { total: 1245, change: 8.3 },
        users: { total: 3456, change: 15.2 },
        vehicles: { total: 89, change: 5.1 }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const items = await getAdminNotifications(12);
      setAdminNotifications(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
      setAdminNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.revenue?.total || 158900),
      change: stats?.revenue?.change || 12.5,
      icon: '💰',
      color: 'gold'
    },
    {
      title: 'Total Bookings',
      value: stats?.bookings?.total?.toLocaleString() || '1,245',
      change: stats?.bookings?.change || 8.3,
      icon: '📅',
      color: 'success'
    },
    {
      title: 'Service Requests',
      value: stats?.bookings?.total?.toLocaleString() || '1,245',
      change: stats?.bookings?.change || 8.3,
      icon: '🛠️',
      color: 'info'
    },
    {
      title: 'Vehicles in Fleet',
      value: stats?.vehicles?.total?.toLocaleString() || '89',
      change: stats?.vehicles?.change || 5.1,
      icon: '🚗',
      color: 'warning'
    }
  ];

  const recentBookingsColumns = [
    { key: 'id', label: 'Booking ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'service', label: 'Service' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (status) => (
      <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
    )},
    { key: 'amount', label: 'Amount', render: (amount) => formatCurrency(amount || 0) }
  ];

  const quickActions = [
    { label: 'New Booking', icon: '📅', path: ROUTES.ADMIN_BOOKINGS, color: 'gold' },
    { label: 'Add Vehicle', icon: '🚗', path: ROUTES.ADMIN_VEHICLES, color: 'success' },
    { label: 'Process Payment', icon: '💰', path: ROUTES.ADMIN_PAYMENTS, color: 'info' },
    { label: 'View Reports', icon: '📊', path: ROUTES.ADMIN_REPORTS, color: 'warning' }
  ];

  const openBookingWorkflow = (row, mode = 'view') => {
    navigate(ROUTES.ADMIN_BOOKINGS, {
      state: {
        selectedBookingId: row.id,
        action: mode
      }
    });
  };

  if (loading && !stats) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="lg" color="gold" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard-header">
        <div>
          <p className="dashboard-kicker">Operations Overview</p>
          <h1 className="page-title">
            Welcome back, <span className="gold-text">{admin?.name || 'Admin'}</span>
          </h1>
          <p className="page-subtitle">Track bookings, revenue, fleet activity, and next actions from one refined control surface.</p>
        </div>
        
        <div className="header-actions">
          <select 
            className="timeframe-select"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="primary" size="md">Download Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <Card key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className={`stat-change ${stat.change >= 0 ? 'positive' : 'negative'}`}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </span>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <Card className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Revenue & Bookings Overview</h2>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot revenue"></span>
                Revenue
              </span>
              <span className="legend-item">
                <span className="legend-dot bookings"></span>
                Bookings
              </span>
            </div>
          </div>
          <div className="chart-container">
            {chartData && (
              <AnalyticsChart
                type="line"
                data={chartData}
                height={300}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <Link to={action.path} key={index} className="quick-action-card">
              <div className={`quick-action-icon action-${action.color}`}>
                {action.icon}
              </div>
              <span className="quick-action-label">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-bookings-section">
        <div className="section-header">
          <h2 className="section-title">Recent Bookings</h2>
          <Link to={ROUTES.ADMIN_BOOKINGS} className="view-all-link">
            View All →
          </Link>
        </div>
        
        <AdminTable
          columns={recentBookingsColumns}
          data={recentBookings}
          loading={loading}
          actions={[
            {
              icon: '👁️',
              label: 'View',
              onClick: (row) => openBookingWorkflow(row, 'view'),
              variant: 'view'
            },
            {
              icon: '✏️',
              label: 'Edit',
              onClick: (row) => openBookingWorkflow(row, 'edit'),
              variant: 'edit'
            }
          ]}
        />
      </div>

      {/* Activity Summary */}
      <div className="activity-summary">
        <Card className="activity-card">
          <h3 className="activity-title">Today's Activity</h3>
          <div className="activity-stats">
            <div className="activity-item">
              <span className="activity-label">New Bookings</span>
              <span className="activity-value">24</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Completed</span>
              <span className="activity-value">18</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Pending</span>
              <span className="activity-value">6</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Revenue Today</span>
              <span className="activity-value">{formatCurrency(12450)}</span>
            </div>
          </div>
        </Card>

        <Card className="activity-card">
          <h3 className="activity-title">System Status</h3>
          <div className="system-status">
            <div className="status-item">
              <span className="status-label">Database</span>
              <span className="status-value healthy">● Healthy</span>
            </div>
            <div className="status-item">
              <span className="status-label">API</span>
              <span className="status-value healthy">● Operational</span>
            </div>
            <div className="status-item">
              <span className="status-label">Storage</span>
              <span className="status-value warning">● 78% Used</span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Backup</span>
              <span className="status-value">2 hours ago</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="activity-summary">
        <Card className="activity-card">
          <div className="activity-header">
            <h3 className="activity-title">Operations Notifications</h3>
            <Button variant="outline" size="sm" onClick={fetchAdminNotifications}>
              Refresh
            </Button>
          </div>
          <div className="activity-list">
            {notificationsLoading && <p className="activity-item">Loading notifications...</p>}
            {!notificationsLoading && adminNotifications.length === 0 && (
              <p className="activity-item">No notifications yet.</p>
            )}
            {!notificationsLoading &&
              adminNotifications.map((item) => (
                <div key={item.id} className="activity-item">
                  <span className="activity-dot"></span>
                  <span className="activity-text">
                    <strong>{item.title || 'Update'}:</strong> {item.message}
                  </span>
                  <span className="activity-time">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
