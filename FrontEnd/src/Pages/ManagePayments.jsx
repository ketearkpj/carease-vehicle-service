// src/pages/Admin/ManagePayments.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import AdminTable from '../Components/Admin/AdminTable';
import '../Styles/Admin.css';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setPayments([
        { 
          id: '#PAY001', 
          bookingId: '#CE1001',
          customer: 'John Smith',
          amount: 3600,
          method: 'Credit Card',
          status: 'completed',
          date: '2024-02-24',
          transactionId: 'TXN123456'
        },
        { 
          id: '#PAY002', 
          bookingId: '#CE1002',
          customer: 'Emma Watson',
          amount: 5400,
          method: 'PayPal',
          status: 'pending',
          date: '2024-02-23',
          transactionId: 'TXN123457'
        },
        { 
          id: '#PAY003', 
          bookingId: '#CE1003',
          customer: 'Michael Brown',
          amount: 2700,
          method: 'Mobile Money',
          status: 'completed',
          date: '2024-02-23',
          transactionId: 'TXN123458'
        },
        { 
          id: '#PAY004', 
          bookingId: '#CE1004',
          customer: 'Sarah Johnson',
          amount: 2100,
          method: 'Credit Card',
          status: 'refunded',
          date: '2024-02-22',
          transactionId: 'TXN123459'
        },
        { 
          id: '#PAY005', 
          bookingId: '#CE1005',
          customer: 'David Lee',
          amount: 4500,
          method: 'PayPal',
          status: 'completed',
          date: '2024-02-22',
          transactionId: 'TXN123460'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    { key: 'id', label: 'Payment ID' },
    { key: 'bookingId', label: 'Booking ID' },
    { key: 'customer', label: 'Customer' },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value) => `$${value.toLocaleString()}`
    },
    { key: 'method', label: 'Method' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`admin-status-badge ${value === 'completed' ? 'confirmed' : value === 'refunded' ? 'cancelled' : 'pending'}`}>
          {value}
        </span>
      )
    },
    { key: 'date', label: 'Date' },
    { key: 'transactionId', label: 'Transaction ID' }
  ];

  const handleView = (payment) => {
    console.log('View payment:', payment);
  };

  const handleRefund = (payment) => {
    if (window.confirm(`Process refund for payment ${payment.id}?`)) {
      setPayments(prev => prev.map(p => 
        p.id === payment.id ? { ...p, status: 'refunded' } : p
      ));
    }
  };

  const handleDelete = (payment) => {
    if (window.confirm(`Are you sure you want to delete payment record ${payment.id}?`)) {
      setPayments(prev => prev.filter(p => p.id !== payment.id));
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payments...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="admin-header">
        <div className="admin-header-title">
          <h1>Manage Payments</h1>
          <p>Track and manage all financial transactions</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-outline btn-sm">Export Report</button>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={payments}
        onView={handleView}
        onEdit={handleRefund}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default ManagePayments;