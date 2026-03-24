import React, { useEffect, useState } from 'react';
import Card from '../Components/Common/Card';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import { getAuditLogs } from '../Services/AdminService';
import { formatDate } from '../Utils/format';
import '../Styles/InfoPages.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const result = await getAuditLogs({ page: 1, limit: 25 });
        setLogs(result.logs || []);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <div className="info-page">
      <div className="info-page-shell">
        <div className="info-page-hero">
          <h1 className="info-page-title">Audit Logs</h1>
          <p className="info-page-subtitle">Recent administrative activity captured by the platform.</p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading audit logs..." />
        ) : (
          <div className="info-page-grid">
            {logs.length > 0 ? logs.map((log) => (
              <Card className="info-page-card" key={log.id}>
                <h3>{log.action || 'Activity'}</h3>
                <ul className="info-page-list">
                  <li>Entity: {log.entityType || 'N/A'}</li>
                  <li>Status: {log.status || 'N/A'}</li>
                  <li>Severity: {log.severity || 'N/A'}</li>
                  <li>Date: {formatDate(log.createdAt || log.created_at)}</li>
                </ul>
              </Card>
            )) : (
              <Card className="info-page-card">
                <p>No audit logs are available yet.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
