import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../Components/Layout/AdminLayout';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Button from '../Components/Common/Button';
import { getSystemSettings, updateSystemSetting } from '../Services/AdminService';
import { useApp } from '../Context/AppContext';
import '../Styles/AdminSettings.css';

const DEFAULT_SETTINGS = {
  'operations.businessHours': '08:00 - 20:00',
  'operations.supportEmail': 'support@carease.co.ke',
  'operations.supportPhone': '+254758458358',
  'notifications.bookingAlerts': true,
  'notifications.paymentAlerts': true,
  'notifications.subscriptionAlerts': true,
  'notifications.inquiryAlerts': true
};

const AdminSettings = () => {
  const [values, setValues] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useApp();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const rows = await getSystemSettings();
        const normalized = (rows || []).reduce((acc, row) => {
          if (row?.key) acc[row.key] = row.value;
          return acc;
        }, {});
        setValues((prev) => ({ ...prev, ...normalized }));
      } catch (error) {
        addNotification(error.message || 'Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [addNotification]);

  const sections = useMemo(
    () => [
      {
        title: 'Operations',
        keys: ['operations.businessHours', 'operations.supportEmail', 'operations.supportPhone']
      },
      {
        title: 'Notifications',
        keys: [
          'notifications.bookingAlerts',
          'notifications.paymentAlerts',
          'notifications.subscriptionAlerts',
          'notifications.inquiryAlerts'
        ]
      }
    ],
    []
  );

  const toLabel = (key) => key.split('.').slice(1).join(' ').replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  const handleChange = (key, nextValue) => {
    setValues((prev) => ({ ...prev, [key]: nextValue }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(values).map(([key, value]) =>
        updateSystemSetting(key, value, key.split('.')[0])
      );
      await Promise.all(updates);
      addNotification('Settings saved successfully', 'success');
    } catch (error) {
      addNotification(error.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="System Settings">
      <div className="admin-settings-page">
        <div className="settings-header">
          <h1>Admin Settings</h1>
          <p>Configure operations and notification preferences for CarEase admin workflows.</p>
        </div>

        {sections.map((section) => (
          <Card className="settings-card" key={section.title}>
            <h2>{section.title}</h2>
            <div className="settings-grid">
              {section.keys.map((key) => {
                const value = values[key];
                const isBoolean = typeof DEFAULT_SETTINGS[key] === 'boolean';
                return (
                  <div key={key} className="settings-item">
                    <label className="settings-label">{toLabel(key)}</label>
                    {isBoolean ? (
                      <label className="settings-toggle">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => handleChange(key, e.target.checked)}
                          disabled={loading}
                        />
                        <span>{Boolean(value) ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    ) : (
                      <Input
                        value={value || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={loading}
                        placeholder={toLabel(key)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        <div className="settings-actions">
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving || loading}>
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
