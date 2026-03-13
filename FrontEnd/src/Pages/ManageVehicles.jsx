// ===== src/Pages/ManageVehicles.jsx =====
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { VEHICLE_CATEGORIES } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import Modal from '../Components/Common/Modal';
import AdminTable from '../Components/Admin/AdminTable';
import LoadingSpinner from '../Components/Common/LoadingSpinner';

// Services
import { getAllVehicles, addVehicle, updateVehicle, deleteVehicle } from '../Services/AdminService';

// Hooks
import { useAdminAuth } from '../Hooks/useAdminAuth';
import { useApp } from '../Context/AppContext';

// Utils
import { formatCurrency } from '../Utils/format';

// Styles
import '../Styles/ManageVehicles.css';

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    category: '',
    price: '',
    image: '',
    images: [],
    specs: {
      engine: '',
      power: '',
      acceleration: '',
      topSpeed: '',
      transmission: '',
      drivetrain: ''
    },
    features: [],
    description: '',
    available: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const { admin } = useAdminAuth();
  const { addNotification } = useApp();

  useEffect(() => {
    fetchVehicles();
  }, [filters, pagination.page, pagination.limit]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await getAllVehicles({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      setVehicles(data.vehicles);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages
      }));
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      addNotification('Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setFormData({
      name: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      category: '',
      price: '',
      image: '',
      images: [],
      specs: {
        engine: '',
        power: '',
        acceleration: '',
        topSpeed: '',
        transmission: '',
        drivetrain: ''
      },
      features: [],
      description: '',
      available: true
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      name: vehicle.name || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      category: vehicle.category || '',
      price: vehicle.price || '',
      image: vehicle.image || '',
      images: vehicle.images || [],
      specs: vehicle.specs || {
        engine: '',
        power: '',
        acceleration: '',
        topSpeed: '',
        transmission: '',
        drivetrain: ''
      },
      features: vehicle.features || [],
      description: vehicle.description || '',
      available: vehicle.available !== false
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (selectedVehicle) {
        await updateVehicle(selectedVehicle.id, formData);
        addNotification('Vehicle updated successfully', 'success');
      } else {
        await addVehicle(formData);
        addNotification('Vehicle added successfully', 'success');
      }
      setShowFormModal(false);
      fetchVehicles();
    } catch (error) {
      addNotification('Failed to save vehicle', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteVehicle(selectedVehicle.id);
      addNotification('Vehicle deleted successfully', 'success');
      setShowDeleteModal(false);
      fetchVehicles();
    } catch (error) {
      addNotification('Failed to delete vehicle', 'error');
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name) errors.name = 'Name is required';
    if (!formData.make) errors.make = 'Make is required';
    if (!formData.model) errors.model = 'Model is required';
    if (!formData.year) errors.year = 'Year is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.image) errors.image = 'Main image is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSpecChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [field]: value }
    }));
  };

  const handleFeatureAdd = (feature) => {
    if (feature && !formData.features.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const handleFeatureRemove = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns = [
    { key: 'image', label: 'Image', render: (img) => (
      <img src={img} alt="Vehicle" className="vehicle-thumbnail" />
    )},
    { key: 'name', label: 'Name', sortable: true },
    { key: 'make', label: 'Make', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'price', label: 'Daily Rate', sortable: true,
      render: (price) => formatCurrency(price)
    },
    { key: 'available', label: 'Status', sortable: true,
      render: (available) => (
        <span className={`status-badge ${available ? 'available' : 'unavailable'}`}>
          {available ? 'Available' : 'Unavailable'}
        </span>
      )
    }
  ];

  const actions = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: handleEditVehicle,
      variant: 'edit'
    },
    {
      icon: '🗑️',
      label: 'Delete',
      onClick: handleDeleteVehicle,
      variant: 'delete'
    }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...VEHICLE_CATEGORIES.map(cat => ({
      value: cat.id,
      label: cat.label
    }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  return (
    <div className="manage-vehicles-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage <span className="gold-text">Vehicles</span></h1>
          <p className="page-subtitle">Add, edit, and manage your vehicle inventory</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" onClick={handleAddVehicle}>
            + Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-grid">
          <Select
            label="Category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            options={categoryOptions}
          />
          
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={statusOptions}
          />

          <div className="search-field">
            <Input
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name, make, model..."
            />
          </div>
        </div>
      </Card>

      {/* Vehicles Table */}
      <AdminTable
        columns={columns}
        data={vehicles}
        loading={loading}
        actions={actions}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        selectable={true}
        className="vehicles-table"
      />

      {/* Vehicle Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        size="lg"
      >
        <div className="vehicle-form">
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            <div className="form-grid">
              <Input
                label="Vehicle Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={formErrors.name}
                required
              />
              <Input
                label="Make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                error={formErrors.make}
                required
              />
              <Input
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                error={formErrors.model}
                required
              />
              <Input
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                error={formErrors.year}
                required
              />
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={VEHICLE_CATEGORIES.map(cat => ({
                  value: cat.id,
                  label: cat.label
                }))}
                error={formErrors.category}
                required
              />
              <Input
                label="Daily Rate (KSh)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                error={formErrors.price}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Images</h3>
            <div className="form-grid">
              <Input
                label="Main Image URL"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                error={formErrors.image}
                required
              />
              <div className="image-preview">
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="preview-img" />
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Specifications</h3>
            <div className="form-grid">
              <Input
                label="Engine"
                value={formData.specs.engine}
                onChange={(e) => handleSpecChange('engine', e.target.value)}
              />
              <Input
                label="Power"
                value={formData.specs.power}
                onChange={(e) => handleSpecChange('power', e.target.value)}
              />
              <Input
                label="Acceleration (0-60)"
                value={formData.specs.acceleration}
                onChange={(e) => handleSpecChange('acceleration', e.target.value)}
              />
              <Input
                label="Top Speed"
                value={formData.specs.topSpeed}
                onChange={(e) => handleSpecChange('topSpeed', e.target.value)}
              />
              <Input
                label="Transmission"
                value={formData.specs.transmission}
                onChange={(e) => handleSpecChange('transmission', e.target.value)}
              />
              <Input
                label="Drivetrain"
                value={formData.specs.drivetrain}
                onChange={(e) => handleSpecChange('drivetrain', e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Features</h3>
            <div className="features-input">
              <div className="feature-add">
                <Input
                  placeholder="Add a feature..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleFeatureAdd(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <div className="features-list">
                {formData.features.map((feature, index) => (
                  <div key={index} className="feature-tag">
                    <span>{feature}</span>
                    <button onClick={() => handleFeatureRemove(feature)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Description</h3>
            <textarea
              className="description-input"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="4"
              placeholder="Enter vehicle description..."
            />
          </div>

          <div className="form-section">
            <label className="availability-checkbox">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
              />
              <span>Available for rental</span>
            </label>
          </div>

          <div className="modal-actions">
            <Button variant="primary" onClick={handleFormSubmit}>
              {selectedVehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
            <Button variant="outline" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Vehicle"
        size="sm"
      >
        <div className="delete-confirmation">
          <p className="delete-message">
            Are you sure you want to delete <strong>{selectedVehicle?.name}</strong>?
          </p>
          <p className="delete-warning">This action cannot be undone.</p>
          <div className="modal-actions">
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageVehicles;
