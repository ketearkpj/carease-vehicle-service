// src/pages/Admin/ManageBookings.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import AdminTable from '../Components/Admin/AdminTable';
import '../Styles/Admin.css';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setBookings([
        { 
          id: '#CE1001', 
          customer: 'John Smith', 
          vehicle: 'Lamborghini Huracán',
          startDate: '2024-03-01',
          endDate: '2024-03-05',
          amount: 3600,
          status: 'confirmed',
          payment: 'paid',
          created: '2024-02-24'
        },
        { 
          id: '#CE1002', 
          customer: 'Emma Watson', 
          vehicle: 'Rolls Royce Ghost',
          startDate: '2024-03-10',
          endDate: '2024-03-15',
          amount: 5400,
          status: 'pending',
          payment: 'pending',
          created: '2024-02-23'
        },
        { 
          id: '#CE1003', 
          customer: 'Michael Brown', 
          vehicle: 'Porsche 911',
          startDate: '2024-02-28',
          endDate: '2024-03-02',
          amount: 2700,
          status: 'confirmed',
          payment: 'paid',
          created: '2024-02-23'
        },
        { 
          id: '#CE1004', 
          customer: 'Sarah Johnson', 
          vehicle: 'Range Rover',
          startDate: '2024-03-05',
          endDate: '2024-03-08',
          amount: 2100,
          status: 'cancelled',
          payment: 'refunded',
          created: '2024-02-22'
        },
        { 
          id: '#CE1005', 
          customer: 'David Lee', 
          vehicle: 'Ferrari F8',
          startDate: '2024-03-15',
          endDate: '2024-03-20',
          amount: 4500,
          status: 'confirmed',
          payment: 'paid',
          created: '2024-02-22'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    { key: 'id', label: 'Booking ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value) => `$${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`admin-status-badge ${value}`}>{value}</span>
      )
    },
    { 
      key: 'payment', 
      label: 'Payment',
      render: (value) => (
        <span className={`admin-status-badge ${value === 'paid' ? 'confirmed' : 'pending'}`}>
          {value}
        </span>
      )
    }
  ];

  const handleView = (booking) => {
    console.log('View booking:', booking);
  };

  const handleEdit = (booking) => {
    console.log('Edit booking:', booking);
  };

  const handleDelete = (booking) => {
    if (window.confirm(`Are you sure you want to delete booking ${booking.id}?`)) {
      setBookings(prev => prev.filter(b => b.id !== booking.id));
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="admin-header">
        <div className="admin-header-title">
          <h1>Manage Bookings</h1>
          <p>View and manage all customer bookings</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-gold btn-sm">+ New Booking</button>
          <button className="btn btn-outline btn-sm">Export</button>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={bookings}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default ManageBookings;