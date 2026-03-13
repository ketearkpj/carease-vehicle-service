import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../Components/Layout/AdminLayout';
import Card from '../Components/Common/Card';
import Button from '../Components/Common/Button';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import { getAdminNotifications } from '../Services/AdminService';
import { useApp } from '../Context/AppContext';
import '../Styles/AdminNotifications.css';

const NotificationItem = ({ item }) => {
  const tagClass = `notif-tag notif-${item.type || 'system'}`;
  return (
    <div className="notif-item">
      <div className="notif-main">
        <div className="notif-head">
          <span className={tagClass}>{(item.type || 'system').toUpperCase()}</span>
          <span className="notif-time">
            {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
          </span>
        </div>
        <h3>{item.title || 'Notification'}</h3>
        <p>{item.message || 'No details available.'}</p>
      </div>
    </div>
  );
};

const AdminNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const { addNotification } = useApp();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getAdminNotifications(50);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      addNotification(error.message || 'Failed to load notifications', 'error');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((item) => item.type === filter);
  }, [notifications, filter]);

  return (
    <AdminLayout title="Notifications">
      <div className="admin-notifications-page">
        <div className="notif-toolbar">
          <div className="notif-filters">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
            <button className={filter === 'booking' ? 'active' : ''} onClick={() => setFilter('booking')}>Bookings</button>
            <button className={filter === 'payment' ? 'active' : ''} onClick={() => setFilter('payment')}>Payments</button>
            <button className={filter === 'subscription' ? 'active' : ''} onClick={() => setFilter('subscription')}>Subscriptions</button>
            <button className={filter === 'inquiry' ? 'active' : ''} onClick={() => setFilter('inquiry')}>Inquiries</button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchNotifications}>Refresh</Button>
        </div>

        <Card className="notif-list-card">
          {loading ? (
            <LoadingSpinner size="md" text="Loading notifications..." />
          ) : filtered.length === 0 ? (
            <div className="notif-empty">No notifications found for this filter.</div>
          ) : (
            <div className="notif-list">
              {filtered.map((item) => (
                <NotificationItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
