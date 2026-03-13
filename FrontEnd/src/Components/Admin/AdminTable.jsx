// ===== src/Components/Admin/AdminTable.jsx =====
import React, { useState, useMemo } from 'react';
import Button from '../Common/Button';
import Input from '../Common/Input';
import LoadingSpinner from '../Common/LoadingSpinner';
import '../../Styles/AdminTable.css';

/**
 * AdminTable Component - GOD MODE
 * Feature-rich data table with sorting, filtering, pagination
 * 
 * @param {Object} props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Table data
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onSort - Sort handler
 * @param {Function} props.onFilter - Filter handler
 * @param {Function} props.onPageChange - Page change handler
 * @param {Object} props.pagination - Pagination state
 * @param {Array} props.actions - Row actions
 * @param {boolean} props.selectable - Enable row selection
 * @param {Function} props.onSelect - Selection handler
 * @param {string} props.className - Additional CSS classes
 */
const AdminTable = ({
  columns = [],
  data = [],
  loading = false,
  onSort,
  onFilter,
  onPageChange,
  pagination = { page: 1, limit: 10, total: 0 },
  actions = [],
  selectable = false,
  onSelect,
  className = '',
  ...props
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    if (onSort) onSort(key, direction);
  };

  // Handle filter
  const handleFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilter) onFilter(newFilters);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
      if (onSelect) onSelect([]);
    } else {
      const allIds = data.map(row => row.id);
      setSelectedRows(allIds);
      if (onSelect) onSelect(allIds);
    }
  };

  // Handle select row
  const handleSelectRow = (id) => {
    let newSelected;
    if (selectedRows.includes(id)) {
      newSelected = selectedRows.filter(rowId => rowId !== id);
    } else {
      newSelected = [...selectedRows, id];
    }
    setSelectedRows(newSelected);
    if (onSelect) onSelect(newSelected);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (onPageChange) onPageChange(newPage);
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Calculate pagination
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const startItem = ((pagination.page - 1) * pagination.limit) + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className={`admin-table-container ${className}`} {...props}>
      {/* Table Controls */}
      <div className="table-controls">
        <div className="table-search">
          <Input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {actions.length > 0 && (
          <div className="table-actions">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'secondary'}
                size="sm"
                icon={action.icon}
                onClick={() => action.onClick(selectedRows)}
                disabled={action.requireSelection && selectedRows.length === 0}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              {selectable && (
                <th className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="th-content">
                    {column.label}
                    {column.sortable && (
                      <span className="sort-icon">{getSortIcon(column.key)}</span>
                    )}
                  </div>
                  {column.filterable && (
                    <div className="filter-input">
                      <input
                        type="text"
                        placeholder={`Filter ${column.label}`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilter(column.key, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </th>
              ))}
              {actions.length > 0 && <th className="actions-cell">Actions</th>}
            </tr>
          </thead>
          
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                  <div className="table-loading">
                    <LoadingSpinner size="md" color="gold" text="Loading data..." />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                  <div className="table-empty">
                    <span className="empty-icon">📭</span>
                    <p>No data available</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className={selectedRows.includes(row.id) ? 'selected' : ''}>
                  {selectable && (
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={`${row.id}-${column.key}`}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="actions-cell">
                      <div className="row-actions">
                        {actions.map((action, index) => (
                          <button
                            key={index}
                            className={`action-btn ${action.variant || 'default'}`}
                            onClick={() => action.onClick(row)}
                            title={action.label}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <div className="table-pagination">
          <div className="pagination-info">
            Showing {startItem} to {endItem} of {pagination.total} entries
          </div>
          
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              ←
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
            >
              →
            </button>
          </div>

          <select
            className="pagination-limit"
            value={pagination.limit}
            onChange={(e) => onPageChange && onPageChange(1, parseInt(e.target.value))}
          >
            {[10, 25, 50, 100].map(limit => (
              <option key={limit} value={limit}>{limit} per page</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
