// ===== src/Context/PaymentContext.jsx =====
import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { useApp } from './AppContext';
import { processPayment, getPaymentStatus, processRefund } from '../Services/PaymentService';

// Create context
const PaymentContext = createContext(null);

/**
 * PaymentProvider Component - GOD MODE
 * Manages payment state across the application
 */
export const PaymentProvider = ({ children }) => {
  const [currentPayment, setCurrentPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [filters, setFilters] = useState({
    status: 'all',
    method: 'all',
    dateRange: null,
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { addNotification } = useApp();

  /**
   * Process a new payment
   * @param {Object} paymentData - Payment data
   * @param {string} gateway - Payment gateway
   */
  const processNewPayment = useCallback(async (paymentData, gateway = 'stripe') => {
    setProcessing(true);
    setError(null);

    try {
      const result = await processPayment(paymentData, gateway);

      if (result.success) {
        setCurrentPayment(result);
        
        // Add to payments list
        const newPayment = {
          id: result.transactionId,
          amount: result.amount,
          status: 'completed',
          method: gateway,
          date: new Date().toISOString(),
          ...result
        };
        
        setPayments(prev => [newPayment, ...prev]);
        
        addNotification('Payment processed successfully!', 'success');
        return result;
      }
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [addNotification]);

  /**
   * Verify payment status
   * @param {string} transactionId - Transaction ID
   */
  const verifyPaymentStatus = useCallback(async (transactionId) => {
    setLoading(true);
    setError(null);

    try {
      const status = await getPaymentStatus(transactionId);
      
      // Update payment in list
      setPayments(prev => prev.map(p => 
        p.id === transactionId ? { ...p, status: status.status } : p
      ));

      // Update current payment if it's the one being verified
      if (currentPayment?.transactionId === transactionId) {
        setCurrentPayment(prev => ({ ...prev, ...status }));
      }

      return status;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPayment]);

  /**
   * Process a refund
   * @param {string} transactionId - Transaction ID
   * @param {number} amount - Refund amount
   * @param {string} reason - Refund reason
   */
  const processPaymentRefund = useCallback(async (transactionId, amount, reason = '') => {
    setLoading(true);
    setError(null);

    try {
      const result = await processRefund({ transactionId, amount, reason });

      if (result.success) {
        // Update payment in list
        setPayments(prev => prev.map(p => 
          p.id === transactionId ? { ...p, status: 'refunded', refundId: result.refundId } : p
        ));

        // Update current payment if it's the one being refunded
        if (currentPayment?.transactionId === transactionId) {
          setCurrentPayment(prev => ({ ...prev, status: 'refunded' }));
        }

        addNotification('Refund processed successfully', 'success');
        return result;
      }
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPayment, addNotification]);

  /**
   * Set payments list
   * @param {Array} paymentsList - Payments list
   */
  const setPaymentsList = useCallback((paymentsList) => {
    setPayments(paymentsList);
    setPagination(prev => ({ ...prev, total: paymentsList.length }));
  }, []);

  /**
   * Update filters
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      method: 'all',
      dateRange: null,
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Clear current payment
   */
  const clearCurrentPayment = useCallback(() => {
    setCurrentPayment(null);
  }, []);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    if (!payments.length) return [];

    return payments.filter(payment => {
      // Filter by status
      if (filters.status !== 'all' && payment.status !== filters.status) {
        return false;
      }

      // Filter by method
      if (filters.method !== 'all' && payment.method !== filters.method) {
        return false;
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          payment.id?.toLowerCase().includes(searchLower) ||
          payment.transactionId?.toLowerCase().includes(searchLower) ||
          payment.method?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by date range
      if (filters.dateRange) {
        const paymentDate = new Date(payment.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);

        if (paymentDate < startDate || paymentDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [payments, filters]);

  // Payment statistics
  const stats = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const refunded = payments.filter(p => p.status === 'refunded').length;

    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalRefunded = payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Group by method
    const byMethod = payments.reduce((acc, p) => {
      const method = p.method || 'unknown';
      if (!acc[method]) acc[method] = 0;
      acc[method] += p.amount || 0;
      return acc;
    }, {});

    return {
      total,
      completed,
      pending,
      failed,
      refunded,
      totalAmount,
      totalRefunded,
      byMethod
    };
  }, [payments]);

  const value = useMemo(() => ({
    // State
    currentPayment,
    payments,
    filteredPayments,
    loading,
    processing,
    error,
    selectedMethod,
    filters,
    pagination,
    stats,

    // Methods
    processNewPayment,
    verifyPaymentStatus,
    processPaymentRefund,
    setSelectedMethod,
    setPaymentsList,
    updateFilters,
    clearFilters,
    clearCurrentPayment,
    setPayments,
    setPagination
  }), [
    currentPayment, payments, filteredPayments, loading, processing,
    error, selectedMethod, filters, pagination, stats,
    processNewPayment, verifyPaymentStatus, processPaymentRefund,
    setSelectedMethod, setPaymentsList, updateFilters, clearFilters,
    clearCurrentPayment, setPayments, setPagination
  ]);

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

/**
 * usePaymentContext Hook - Custom hook to use PaymentContext
 * @returns {Object} - Payment context value
 * @throws {Error} - If used outside of PaymentProvider
 */
export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  
  if (!context) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  
  return context;
};

export default PaymentContext;