// src/pages/Admin/ManageVehicles.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Components/Layout/DashboardLayout';
import AdminTable from '../Components/Admin/AdminTable';
import '../Styles/Admin.css';

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setVehicles([
        { 
          id: 1,
          name: 'Lamborghini Huracán',
          category: 'Supercar',
          price: 1200,
          status: 'available',
          bookings: 45,
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537'
        },
        { 
          id: 2,
          name: 'Rolls Royce Ghost',
          category: 'Luxury Sedan',
          price: 1800,
          status: 'available',
          bookings: 32,
          image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4'
        },
        { 
          id: 3,
          name: 'Porsche 911 Turbo S',
          category: 'Sports Car',
          price: 900,
          status: 'maintenance',
          bookings: 28,
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70'
        },
        { 
          id: 4,
          name: 'Range Rover Autobiography',
          category: 'SUV',
          price: 700,
          status: 'available',
          bookings: 56,
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6'
        },
        { 
          id: 5,
          name: 'Ferrari F8 Tributo',
          category: 'Supercar',
          price: 1500,
          status: 'booked',
          bookings: 38,
          image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888'
        },
        { 
          id: 6,
          name: 'Bentley Continental GT',
          category: 'Grand Tourer',
          price: 1100,
          status: 'available',
          bookings: 24,
          image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    { 
      key: 'image', 
      label: 'Image',
      render: (value) => (
        <img src={value} alt="Vehicle" className="vehicle-thumbnail" />
      )
    },
    { key: 'name', label: 'Vehicle Name' },
    { key: 'category', label: 'Category' },
    { 
      key: 'price', 
      label: 'Price/Day',
      render: (value) => `$${value}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`admin-status-badge ${
          value === 'available' ? 'confirmed' : 
          value === 'maintenance' ? 'pending' : 'cancelled'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'bookings', label: 'Total Bookings' }
  ];

  const handleView = (vehicle) => {
    console.log('View vehicle:', vehicle);
  };

  const handleEdit = (vehicle) => {
    console.log('Edit vehicle:', vehicle);
  };

  const handleDelete = (vehicle) => {
    if (window.confirm(`Are you sure you want to remove ${vehicle.name}?`)) {
      setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vehicles...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="admin-header">
        <div className="admin-header-title">
          <h1>Manage Vehicles</h1>
          <p>Add, edit, and manage your fleet</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-gold btn-sm">+ Add Vehicle</button>
          <button className="btn btn-outline btn-sm">Import</button>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={vehicles}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default ManageVehicles;