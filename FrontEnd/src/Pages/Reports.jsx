// ===== src/Pages/Reports.jsx =====
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import AnalyticsChart, { ChartTemplates } from '../Components/Admin/AnalyticsChart';

// Services
import { getRevenueReports, getBookingReports, getAnalytics, exportData } from '../Services/AdminService';

// Hooks
import { useAdminAuth } from '../Hooks/useAdminAuth';
import { useApp } from '../Context/AppContext';

// Utils
import { formatCurrency, formatDate, formatCompactNumber } from '../Utils/format';

// Styles
import '../Styles/Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const { admin } = useAdminAuth();
  const { addNotification } = useApp();

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [revenue, bookings, analyticsData] = await Promise.all([
        getRevenueReports({ startDate: dateRange.start, endDate: dateRange.end }),
        getBookingReports({ startDate: dateRange.start, endDate: dateRange.end }),
        getAnalytics({ period: 'month' })
      ]);

      setRevenueData(revenue);
      setBookingData(bookings);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      addNotification('Failed to load reports', 'error');
      
      // Fallback data
      setRevenueData({
        total: 158900,
        byPeriod: [12500, 18900, 15200, 24800, 22300, 30100, 27900],
        byService: {
          rental: 85000,
          car_wash: 23900,
          repair: 35000,
          sales: 15000
        },
        byMethod: {
          card: 120000,
          paypal: 25000,
          cash: 13900
        }
      });

      setBookingData({
        total: 1245,
        byStatus: {
          pending: 123,
          confirmed: 456,
          completed: 567,
          cancelled: 99
        },
        byService: {
          rental: 500,
          car_wash: 300,
          repair: 350,
          sales: 95
        },
        cancellationRate: 7.9,
        occupancyRate: 78.5
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const data = await exportData(activeTab, format, dateRange);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      addNotification(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      addNotification('Failed to export report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
    { id: 'customers', label: 'Customers', icon: '👥' }
  ];

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & <span className="gold-text">Reports</span></h1>
          <p className="page-subtitle">View business performance and generate reports</p>
        </div>
        <div className="header-actions">
          <Select
            value={`${dateRange.start} to ${dateRange.end}`}
            onChange={(e) => {
              // Handle preset ranges
            }}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'This Quarter' },
              { value: 'year', label: 'This Year' },
              { value: 'custom', label: 'Custom Range' }
            ]}
            className="date-range-select"
          />
        </div>
      </div>

      {/* Date Range Picker */}
      <Card className="date-range-card">
        <div className="date-range-picker">
          <Input
            type="date"
            label="Start Date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <Input
            type="date"
            label="End Date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
          <Button variant="primary" onClick={fetchReports} loading={loading}>
            Apply
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="reports-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Export Actions */}
      <div className="export-actions">
        <span className="export-label">Export as:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('pdf')}
          loading={exporting}
          disabled={exporting}
        >
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('csv')}
          loading={exporting}
          disabled={exporting}
        >
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('excel')}
          loading={exporting}
          disabled={exporting}
        >
          Excel
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          {/* KPI Cards */}
          <div className="kpi-grid">
            <Card className="kpi-card">
              <div className="kpi-icon revenue">💰</div>
              <div className="kpi-content">
                <span className="kpi-label">Total Revenue</span>
                <span className="kpi-value">{formatCurrency(revenueData?.total || 0)}</span>
                <span className="kpi-trend positive">+12.5% vs last period</span>
              </div>
            </Card>

            <Card className="kpi-card">
              <div className="kpi-icon bookings">📅</div>
              <div className="kpi-content">
                <span className="kpi-label">Total Bookings</span>
                <span className="kpi-value">{bookingData?.total || 0}</span>
                <span className="kpi-trend positive">+8.3% vs last period</span>
              </div>
            </Card>

            <Card className="kpi-card">
              <div className="kpi-icon occupancy">🚗</div>
              <div className="kpi-content">
                <span className="kpi-label">Occupancy Rate</span>
                <span className="kpi-value">{bookingData?.occupancyRate || 0}%</span>
                <span className="kpi-trend positive">+5.2% vs last period</span>
              </div>
            </Card>

            <Card className="kpi-card">
              <div className="kpi-icon cancellation">⚠️</div>
              <div className="kpi-content">
                <span className="kpi-label">Cancellation Rate</span>
                <span className="kpi-value">{bookingData?.cancellationRate || 0}%</span>
                <span className="kpi-trend negative">-2.1% vs last period</span>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <Card className="chart-card">
              <h3 className="chart-title">Revenue Trend</h3>
              <AnalyticsChart
                {...ChartTemplates.revenueChart({
                  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                  values: revenueData?.byPeriod || [12000, 19000, 15000, 25000]
                })}
                height={300}
              />
            </Card>

            <Card className="chart-card">
              <h3 className="chart-title">Booking Distribution</h3>
              <AnalyticsChart
                {...ChartTemplates.bookingsByTypeChart({
                  labels: ['Rentals', 'Car Wash', 'Repairs', 'Sales'],
                  values: [
                    bookingData?.byService?.rental || 500,
                    bookingData?.byService?.car_wash || 300,
                    bookingData?.byService?.repair || 350,
                    bookingData?.byService?.sales || 95
                  ]
                })}
                height={300}
              />
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="activity-card">
            <h3 className="card-title">Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-time">2 min ago</span>
                <span className="activity-desc">New booking #B1234 - Lamborghini Huracán</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">15 min ago</span>
                <span className="activity-desc">Payment received $1,299 from booking #B1230</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">1 hour ago</span>
                <span className="activity-desc">New user registered: john.doe@email.com</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">2 hours ago</span>
                <span className="activity-desc">Booking #B1228 marked as completed</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="revenue-tab">
          <div className="revenue-summary">
            <Card className="summary-card">
              <h3 className="summary-title">Revenue Breakdown</h3>
              <div className="summary-stats">
                <div className="stat-row">
                  <span>Total Revenue:</span>
                  <span className="stat-value">{formatCurrency(revenueData?.total || 0)}</span>
                </div>
                <div className="stat-row">
                  <span>By Service:</span>
                </div>
                {revenueData?.byService && Object.entries(revenueData.byService).map(([service, amount]) => (
                  <div key={service} className="stat-row indent">
                    <span>{service.replace('_', ' ').toUpperCase()}:</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="summary-card">
              <h3 className="summary-title">Payment Methods</h3>
              <div className="summary-stats">
                {revenueData?.byMethod && Object.entries(revenueData.byMethod).map(([method, amount]) => (
                  <div key={method} className="stat-row">
                    <span>{method.toUpperCase()}:</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="chart-card">
            <h3 className="chart-title">Daily Revenue</h3>
            <AnalyticsChart
              type="line"
              data={{
                labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
                datasets: [{
                  label: 'Revenue',
                  data: revenueData?.byPeriod || Array(30).fill(0).map(() => Math.random() * 5000 + 1000),
                  borderColor: '#d4af37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)'
                }]
              }}
              height={400}
            />
          </Card>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bookings-tab">
          <div className="bookings-summary">
            <Card className="summary-card">
              <h3 className="summary-title">Booking Status</h3>
              <div className="summary-stats">
                {bookingData?.byStatus && Object.entries(bookingData.byStatus).map(([status, count]) => (
                  <div key={status} className="stat-row">
                    <span className={`status-text status-${status}`}>
                      {status.toUpperCase()}:
                    </span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="summary-card">
              <h3 className="summary-title">Performance Metrics</h3>
              <div className="summary-stats">
                <div className="stat-row">
                  <span>Cancellation Rate:</span>
                  <span className={bookingData?.cancellationRate > 10 ? 'negative' : 'positive'}>
                    {bookingData?.cancellationRate || 0}%
                  </span>
                </div>
                <div className="stat-row">
                  <span>Occupancy Rate:</span>
                  <span className="positive">{bookingData?.occupancyRate || 0}%</span>
                </div>
                <div className="stat-row">
                  <span>Average Booking Value:</span>
                  <span>{formatCurrency((revenueData?.total || 0) / (bookingData?.total || 1))}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="chart-card">
            <h3 className="chart-title">Bookings by Service</h3>
            <AnalyticsChart
              type="bar"
              data={{
                labels: ['Rentals', 'Car Wash', 'Repairs', 'Sales'],
                datasets: [{
                  label: 'Number of Bookings',
                  data: [
                    bookingData?.byService?.rental || 500,
                    bookingData?.byService?.car_wash || 300,
                    bookingData?.byService?.repair || 350,
                    bookingData?.byService?.sales || 95
                  ],
                  backgroundColor: [
                    'rgba(212, 175, 55, 0.8)',
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(51, 181, 229, 0.8)',
                    'rgba(255, 187, 51, 0.8)'
                  ]
                }]
              }}
              height={400}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;