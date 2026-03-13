// ===== src/Pages/ManagePayments.jsx =====
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import Modal from '../Components/Common/Modal';
import AdminTable from '../Components/Admin/AdminTable';
import LoadingSpinner from '../Components/Common/LoadingSpinner';

// Services
import { getAllPayments, processRefund, getPaymentDetails } from '../Services/AdminService';

// Hooks
import { useAdminAuth } from '../Hooks/useAdminAuth';
import { useApp } from '../Context/AppContext';

// Utils
import { formatDate, formatCurrency, formatDateTime } from '../Utils/format';

// Styles
import '../Styles/ManagePayments.css';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({
    amount: '',
    reason: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    method: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    refundedAmount: 0
  });

  const { admin } = useAdminAuth();
  const { addNotification } = useApp();

  useEffect(() => {
    fetchPayments();
  }, [filters, pagination.page, pagination.limit]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getAllPayments({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      setPayments(data.payments);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages
      }));

      // Calculate summary
      const total = data.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const completed = data.payments.filter(p => p.status === 'completed').length;
      const pending = data.payments.filter(p => p.status === 'pending').length;
      const refunded = data.payments.filter(p => p.status === 'refunded')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setSummary({
        totalRevenue: total,
        completedPayments: completed,
        pendingPayments: pending,
        refundedAmount: refunded
      });
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      addNotification('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (payment) => {
    try {
      const details = await getPaymentDetails(payment.id);
      setSelectedPayment(details);
      setShowDetailsModal(true);
    } catch (error) {
      addNotification('Failed to load payment details', 'error');
    }
  };

  const handleRefund = (payment) => {
    setSelectedPayment(payment);
    setRefundData({
      amount: payment.amount,
      reason: ''
    });
    setShowRefundModal(true);
  };

  const handleProcessRefund = async () => {
    if (!selectedPayment || !refundData.amount || !refundData.reason) {
      addNotification('Please fill in all fields', 'warning');
      return;
    }

    try {
      await processRefund(selectedPayment.id, {
        amount: parseFloat(refundData.amount),
        reason: refundData.reason
      });
      addNotification('Refund processed successfully', 'success');
      setShowRefundModal(false);
      fetchPayments();
    } catch (error) {
      addNotification('Failed to process refund', 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      method: 'all',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns = [
    { key: 'id', label: 'Payment ID', sortable: true },
    { key: 'transactionId', label: 'Transaction ID', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true,
      render: (_, row) => row.customerName || 'N/A'
    },
    { key: 'amount', label: 'Amount', sortable: true,
      render: (amount) => formatCurrency(amount)
    },
    { key: 'method', label: 'Method', sortable: true,
      render: (method) => PAYMENT_METHOD_LABELS[method] || method
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (status) => (
        <span className={`status-badge status-${status}`}>
          {PAYMENT_STATUS_LABELS[status] || status}
        </span>
      )
    },
    { key: 'date', label: 'Date', sortable: true,
      render: (date) => formatDateTime(date)
    }
  ];

  const actions = [
    {
      icon: '👁️',
      label: 'View Details',
      onClick: handleViewDetails,
      variant: 'view'
    },
    {
      icon: '💰',
      label: 'Process Refund',
      onClick: handleRefund,
      variant: 'refund',
      condition: (row) => row.status === 'completed'
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...Object.entries(PAYMENT_STATUS).map(([key, value]) => ({
      value,
      label: PAYMENT_STATUS_LABELS[value]
    }))
  ];

  const methodOptions = [
    { value: 'all', label: 'All Methods' },
    ...Object.entries(PAYMENT_METHODS).map(([key, value]) => ({
      value,
      label: PAYMENT_METHOD_LABELS[value]
    }))
  ];

  return (
    <div className="manage-payments-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage <span className="gold-text">Payments</span></h1>
          <p className="page-subtitle">View and manage all payment transactions</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" onClick={fetchPayments}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <Card className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <span className="summary-label">Total Revenue</span>
            <span className="summary-value">{formatCurrency(summary.totalRevenue)}</span>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon success">✅</div>
          <div className="summary-content">
            <span className="summary-label">Completed</span>
            <span className="summary-value">{summary.completedPayments}</span>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon warning">⏳</div>
          <div className="summary-content">
            <span className="summary-label">Pending</span>
            <span className="summary-value">{summary.pendingPayments}</span>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon error">↩️</div>
          <div className="summary-content">
            <span className="summary-label">Refunded</span>
            <span className="summary-value">{formatCurrency(summary.refundedAmount)}</span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <form className="filters-form" onSubmit={(e) => e.preventDefault()}>
          <div className="filters-grid">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
            />
            
            <Select
              label="Payment Method"
              value={filters.method}
              onChange={(e) => handleFilterChange('method', e.target.value)}
              options={methodOptions}
            />

            <Input
              label="Date From"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            <Input
              label="Date To"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />

            <div className="search-field">
              <Input
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Payment ID, Transaction ID, Customer..."
              />
            </div>
          </div>

          <div className="filters-actions">
            <Button type="button" variant="primary" size="sm" onClick={fetchPayments}>
              Apply Filters
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Payments Table */}
      <AdminTable
        columns={columns}
        data={payments}
        loading={loading}
        actions={actions}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        selectable={true}
        className="payments-table"
      />

      {/* Payment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Payment Details"
        size="lg"
      >
        {selectedPayment && (
          <div className="payment-details">
            <div className="details-section">
              <h3 className="details-section-title">Payment Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Payment ID:</span>
                  <span className="detail-value">{selectedPayment.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{selectedPayment.transactionId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge status-${selectedPayment.status}`}>
                    {PAYMENT_STATUS_LABELS[selectedPayment.status]}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value total">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Method:</span>
                  <span className="detail-value">
                    {PAYMENT_METHOD_LABELS[selectedPayment.method]}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {formatDateTime(selectedPayment.date)}
                  </span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3 className="details-section-title">Customer Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedPayment.customerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedPayment.customerEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedPayment.customerPhone}</span>
                </div>
              </div>
            </div>

            {selectedPayment.bookingId && (
              <div className="details-section">
                <h3 className="details-section-title">Related Booking</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Booking ID:</span>
                    <span className="detail-value">
                      <Link to={`${ROUTES.ADMIN_BOOKINGS}?id=${selectedPayment.bookingId}`}>
                        {selectedPayment.bookingId}
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedPayment.refundInfo && (
              <div className="details-section">
                <h3 className="details-section-title">Refund Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Refund ID:</span>
                    <span className="detail-value">{selectedPayment.refundInfo.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Refund Amount:</span>
                    <span className="detail-value">
                      {formatCurrency(selectedPayment.refundInfo.amount)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Refund Date:</span>
                    <span className="detail-value">
                      {formatDateTime(selectedPayment.refundInfo.date)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Reason:</span>
                    <span className="detail-value">{selectedPayment.refundInfo.reason}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="details-actions">
              {selectedPayment.status === 'completed' && (
                <Button variant="primary" onClick={() => {
                  setShowDetailsModal(false);
                  handleRefund(selectedPayment);
                }}>
                  Process Refund
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Process Refund"
        size="md"
      >
        {selectedPayment && (
          <div className="refund-form">
            <div className="form-group">
              <label className="form-label">Payment Amount</label>
              <div className="payment-amount">
                {formatCurrency(selectedPayment.amount)}
              </div>
            </div>

            <div className="form-group">
              <Input
                label="Refund Amount"
                type="number"
                value={refundData.amount}
                onChange={(e) => setRefundData(prev => ({ ...prev, amount: e.target.value }))}
                min="0.01"
                max={selectedPayment.amount}
                step="0.01"
                required
                icon="💰"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Refund Reason</label>
              <textarea
                className="refund-reason"
                value={refundData.reason}
                onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide a reason for this refund..."
                rows="4"
                required
              />
            </div>

            <div className="warning-message">
              <span className="warning-icon">⚠️</span>
              <span>This action cannot be undone. The customer will be notified.</span>
            </div>

            <div className="modal-actions">
              <Button variant="primary" onClick={handleProcessRefund}>
                Process Refund
              </Button>
              <Button variant="outline" onClick={() => setShowRefundModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagePayments;