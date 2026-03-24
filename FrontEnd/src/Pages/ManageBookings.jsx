// ===== src/Pages/ManageBookings.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { BOOKING_STATUS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import Modal from '../Components/Common/Modal';
import AdminTable from '../Components/Admin/AdminTable';
import LoadingSpinner from '../Components/Common/LoadingSpinner';

// Services
import { getAllBookings, updateBookingStatus, getBookingDetails } from '../Services/AdminService';

// Hooks
import { useAdminAuth } from '../Hooks/useAdminAuth';
import { useApp } from '../Context/AppContext';

// Utils
import { formatDate, formatCurrency } from '../Utils/format';

// Styles
import '../Styles/ManageBookings.css';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    note: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    serviceType: 'all',
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
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { admin } = useAdminAuth();
  const { addNotification } = useApp();

  useEffect(() => {
    fetchBookings();
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    const selection = location.state?.selectedBookingId;
    const action = location.state?.action;
    if (!selection || bookings.length === 0) return;

    const booking = bookings.find((item) => item.id === selection || item.bookingNumber === selection);
    if (!booking) return;

    if (action === 'edit') {
      handleUpdateStatus(booking);
    } else {
      handleViewDetails(booking);
    }
    window.history.replaceState({}, document.title);
  }, [location.state, bookings]);

  useEffect(() => {
    const bookingId = searchParams.get('id');
    if (!bookingId || bookings.length === 0) return;

    const booking = bookings.find((item) => item.id === bookingId || item.bookingNumber === bookingId);
    if (booking) {
      handleViewDetails(booking);
    }
  }, [searchParams, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getAllBookings({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      setBookings(data.bookings);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages
      }));
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      addNotification('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (booking) => {
    try {
      const details = await getBookingDetails(booking.id);
      setSelectedBooking(details || booking);
    } catch {
      setSelectedBooking(booking);
    }
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (booking) => {
    setSelectedBooking(booking);
    setStatusUpdate({ status: booking.status, note: '' });
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedBooking || !statusUpdate.status) return;

    try {
      await updateBookingStatus(selectedBooking.id, statusUpdate.status, statusUpdate.note);
      addNotification(`Booking status updated to ${statusUpdate.status}`, 'success');
      setShowStatusModal(false);
      fetchBookings();
    } catch (error) {
      addNotification('Failed to update booking status', 'error');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      serviceType: 'all',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns = [
    { key: 'id', label: 'Booking ID', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true,
      render: (_, row) => `${row.customerName || 'N/A'}` 
    },
    { key: 'serviceType', label: 'Service', sortable: true,
      render: (type) => type?.replace('_', ' ').toUpperCase()
    },
    { key: 'date', label: 'Date', sortable: true,
      render: (date) => formatDate(date, { format: 'medium' })
    },
    { key: 'time', label: 'Time', sortable: true },
    { key: 'status', label: 'Status', sortable: true,
      render: (status) => (
        <span className={`status-badge status-${status}`}>
          {BOOKING_STATUS_LABELS[status] || status}
        </span>
      )
    },
    { key: 'totalPrice', label: 'Amount', sortable: true,
      render: (amount) => formatCurrency(amount)
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
      icon: '✏️',
      label: 'Update Status',
      onClick: handleUpdateStatus,
      variant: 'edit'
    }
  ];

  const serviceTypes = [
    { value: 'all', label: 'All Services' },
    { value: 'rental', label: 'Rentals' },
    { value: 'car_wash', label: 'Car Wash' },
    { value: 'repair', label: 'Repairs' },
    { value: 'sales', label: 'Sales' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...Object.entries(BOOKING_STATUS).map(([key, value]) => ({
      value,
      label: BOOKING_STATUS_LABELS[value]
    }))
  ];

  return (
    <div className="manage-bookings-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage <span className="gold-text">Bookings</span></h1>
          <p className="page-subtitle">View and manage all customer bookings</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" onClick={fetchBookings}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <form onSubmit={handleSearch} className="filters-form">
          <div className="filters-grid">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={statusOptions}
            />
            
            <Select
              label="Service Type"
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              options={serviceTypes}
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
                placeholder="Booking ID, Customer, Email..."
              />
            </div>
          </div>

          <div className="filters-actions">
            <Button type="submit" variant="primary" size="sm">
              Apply Filters
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Bookings Table */}
      <AdminTable
        columns={columns}
        data={bookings}
        loading={loading}
        actions={actions}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        selectable={true}
        className="bookings-table"
      />

      {/* Booking Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="booking-details">
            <div className="details-section">
              <h3 className="details-section-title">Booking Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Booking ID:</span>
                  <span className="detail-value">{selectedBooking.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge status-${selectedBooking.status}`}>
                    {BOOKING_STATUS_LABELS[selectedBooking.status]}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Service Type:</span>
                  <span className="detail-value">{selectedBooking.serviceType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {formatDate(selectedBooking.date, { format: 'full' })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{selectedBooking.time}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{selectedBooking.duration || 1} days</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{selectedBooking.location || 'Roysambu (next to TRM)'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value total">
                    {formatCurrency(selectedBooking.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3 className="details-section-title">Customer Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedBooking.customerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedBooking.customerEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedBooking.customerPhone}</span>
                </div>
              </div>
            </div>

            {selectedBooking.vehicle && (
              <div className="details-section">
                <h3 className="details-section-title">Vehicle Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Vehicle:</span>
                    <span className="detail-value">{selectedBooking.vehicle.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Make/Model:</span>
                    <span className="detail-value">
                      {selectedBooking.vehicle.make} {selectedBooking.vehicle.model}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Year:</span>
                    <span className="detail-value">{selectedBooking.vehicle.year}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedBooking.extras && selectedBooking.extras.length > 0 && (
              <div className="details-section">
                <h3 className="details-section-title">Extras</h3>
                <ul className="extras-list">
                  {selectedBooking.extras.map((extra, index) => (
                    <li key={index}>
                      <span className="extra-name">{extra.name}</span>
                      <span className="extra-price">{formatCurrency(extra.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedBooking.specialRequests && (
              <div className="details-section">
                <h3 className="details-section-title">Special Requests</h3>
                <p className="special-requests">{selectedBooking.specialRequests}</p>
              </div>
            )}

            <div className="details-actions">
              <Button variant="primary" onClick={() => handleUpdateStatus(selectedBooking)}>
                Update Status
              </Button>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Booking Status"
        size="md"
      >
        {selectedBooking && (
          <div className="status-update-form">
            <div className="form-group">
              <label className="form-label">Current Status</label>
              <div className="current-status">
                <span className={`status-badge status-${selectedBooking.status}`}>
                  {BOOKING_STATUS_LABELS[selectedBooking.status]}
                </span>
              </div>
            </div>

            <div className="form-group">
              <Select
                label="New Status"
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                options={Object.entries(BOOKING_STATUS).map(([key, value]) => ({
                  value,
                  label: BOOKING_STATUS_LABELS[value]
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Update Note (Optional)</label>
              <textarea
                className="status-note"
                value={statusUpdate.note}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Add a note about this status update..."
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <Button variant="primary" onClick={handleStatusChange}>
                Update Status
              </Button>
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageBookings;
