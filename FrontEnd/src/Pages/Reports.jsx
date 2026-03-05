// src/pages/Admin/Reports.jsx
import React, { useState } from 'react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import AnalyticsChart from '../Components/Admin/AnalyticsChart';
import '../Styles/Admin.css';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');

  const revenueData = [
    { label: 'Jan', value: 45000 },
    { label: 'Feb', value: 52000 },
    { label: 'Mar', value: 48000 },
    { label: 'Apr', value: 61000 },
    { label: 'May', value: 58000 },
    { label: 'Jun', value: 67000 },
    { label: 'Jul', value: 72000 },
    { label: 'Aug', value: 69000 },
    { label: 'Sep', value: 74000 },
    { label: 'Oct', value: 81000 },
    { label: 'Nov', value: 79000 },
    { label: 'Dec', value: 95000 }
  ];

  const categoryData = [
    { label: 'Supercar', value: 35 },
    { label: 'Luxury', value: 25 },
    { label: 'SUV', value: 20 },
    { label: 'Sports', value: 15 },
    { label: 'Other', value: 5 }
  ];

  const stats = [
    { label: 'Total Revenue', value: '$845,000', change: '+15.3%', icon: '💰' },
    { label: 'Total Bookings', value: '2,847', change: '+12.5%', icon: '📅' },
    { label: 'Avg. Daily Rate', value: '$1,250', change: '+5.2%', icon: '📊' },
    { label: 'Occupancy Rate', value: '78%', change: '+8.1%', icon: '📈' }
  ];

  return (
    <DashboardLayout role="admin">
      <div className="admin-header">
        <div className="admin-header-title">
          <h1>Reports & Analytics</h1>
          <p>Comprehensive insights into your business performance</p>
        </div>
        <div className="admin-header-actions">
          <select 
            className="filter-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-gold btn-sm">Export Report</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="admin-stat-card">
            <div className="admin-stat-icon">{stat.icon}</div>
            <span className="admin-stat-value">{stat.value}</span>
            <span className="admin-stat-label">{stat.label}</span>
            <span className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="reports-section">
        <h2>Revenue Overview</h2>
        <AnalyticsChart type="line" data={revenueData} />
      </div>

      {/* Category Distribution */}
      <div className="reports-grid">
        <div className="reports-card">
          <h3>Bookings by Category</h3>
          <AnalyticsChart type="pie" data={categoryData} />
        </div>

        <div className="reports-card">
          <h3>Top Performing Vehicles</h3>
          <div className="top-vehicles-list">
            <div className="top-vehicle-item">
              <span className="vehicle-rank">1</span>
              <span className="vehicle-name">Lamborghini Huracán</span>
              <span className="vehicle-bookings">128 bookings</span>
              <span className="vehicle-revenue">$153,600</span>
            </div>
            <div className="top-vehicle-item">
              <span className="vehicle-rank">2</span>
              <span className="vehicle-name">Rolls Royce Ghost</span>
              <span className="vehicle-bookings">96 bookings</span>
              <span className="vehicle-revenue">$172,800</span>
            </div>
            <div className="top-vehicle-item">
              <span className="vehicle-rank">3</span>
              <span className="vehicle-name">Ferrari F8</span>
              <span className="vehicle-bookings">84 bookings</span>
              <span className="vehicle-revenue">$126,000</span>
            </div>
            <div className="top-vehicle-item">
              <span className="vehicle-rank">4</span>
              <span className="vehicle-name">Porsche 911</span>
              <span className="vehicle-bookings">72 bookings</span>
              <span className="vehicle-revenue">$64,800</span>
            </div>
            <div className="top-vehicle-item">
              <span className="vehicle-rank">5</span>
              <span className="vehicle-name">Range Rover</span>
              <span className="vehicle-bookings">68 bookings</span>
              <span className="vehicle-revenue">$47,600</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="reports-section">
        <h3>Monthly Summary</h3>
        <div className="summary-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Avg. Daily Rate</th>
                <th>Occupancy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>January</td>
                <td>210</td>
                <td>$45,000</td>
                <td>$1,150</td>
                <td>72%</td>
              </tr>
              <tr>
                <td>February</td>
                <td>235</td>
                <td>$52,000</td>
                <td>$1,180</td>
                <td>75%</td>
              </tr>
              <tr>
                <td>March</td>
                <td>228</td>
                <td>$48,000</td>
                <td>$1,120</td>
                <td>73%</td>
              </tr>
              <tr>
                <td>April</td>
                <td>275</td>
                <td>$61,000</td>
                <td>$1,250</td>
                <td>78%</td>
              </tr>
              <tr>
                <td>May</td>
                <td>268</td>
                <td>$58,000</td>
                <td>$1,220</td>
                <td>77%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;