import React, { useEffect, useState } from 'react';
import Card from '../Components/Common/Card';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import { getCurrentUser } from '../Services/AuthService';
import { getFavoriteVehicles } from '../Services/VehicleService';
import { formatCurrency } from '../Utils/format';
import '../Styles/InfoPages.css';

const Wishlist = () => {
  const user = getCurrentUser();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(Boolean(user?.email));

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.email) return;
      try {
        const rows = await getFavoriteVehicles(user.email);
        setVehicles(Array.isArray(rows) ? rows : []);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user?.email]);

  return (
    <div className="info-page">
      <div className="info-page-shell">
        <div className="info-page-hero">
          <h1 className="info-page-title">Wishlist</h1>
          <p className="info-page-subtitle">Saved favorite vehicles for the current signed-in customer.</p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading wishlist..." />
        ) : (
          <div className="info-page-grid">
            {vehicles.length > 0 ? vehicles.map((vehicle) => (
              <Card className="info-page-card" key={vehicle.id}>
                <h3>{vehicle.name || `${vehicle.make || ''} ${vehicle.model || ''}`.trim()}</h3>
                <ul className="info-page-list">
                  <li>Category: {vehicle.category || 'N/A'}</li>
                  <li>Location: {vehicle.location || 'N/A'}</li>
                  <li>Daily rate: {formatCurrency(vehicle?.price?.daily || vehicle?.dailyRate || 0)}</li>
                </ul>
              </Card>
            )) : (
              <Card className="info-page-card">
                <p>No saved vehicles were found for this session.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
