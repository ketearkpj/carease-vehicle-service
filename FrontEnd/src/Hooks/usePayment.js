// ===== src/Hooks/usePayment.js =====
import { useState, useCallback, useMemo } from 'react';
import { processPayment, getPaymentStatus, processRefund } from '../Services/PaymentService';
import { useApp } from '../Context/AppContext';

/**
 * usePayment Hook - GOD MODE
 * Comprehensive payment management hook
 * 
 * @param {Object} initialConfig - Initial payment configuration
 * @returns {Object} - Payment state and methods
 */
export const usePayment = (initialConfig = {}) => {
  const [payment, setPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [refundStatus, setRefundStatus] = useState(null);
  
  const { addNotification } = useApp();

  // Process new payment
  const processNewPayment = useCallback(async (paymentData, gateway = 'stripe') => {
    setProcessing(true);
    setError(null);
    setTransactionStatus('processing');
    
    try {
      const result = await processPayment(paymentData, gateway);
      
      if (result.success) {
        setPayment(result);
        setTransactionStatus('success');
        addNotification('Payment processed successfully!', 'success');
        
        // Add to payments list
        setPayments(prev => [{
          id: result.transactionId,
          amount: result.amount,
          status: 'completed',
          date: new Date().toISOString(),
          method: gateway,
          ...result
        }, ...prev]);
        
        return result;
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      setError(err.message);
      setTransactionStatus('failed');
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [addNotification]);

  // Verify payment status
  const verifyPayment = useCallback(async (transactionId) => {
    setLoading(true);
    setError(null);
    
    try {
      const status = await getPaymentStatus(transactionId);
      setTransactionStatus(status);
      
      // Update payment in list
      setPayments(prev => prev.map(p => 
        p.id === transactionId ? { ...p, status: status.status } : p
      ));
      
      return status;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Process refund
  const processPaymentRefund = useCallback(async (transactionId, amount, reason = '') => {
    setLoading(true);
    setError(null);
    setRefundStatus('processing');
    
    try {
      const result = await processRefund({
        transactionId,
        amount,
        reason
      });
      
      if (result.success) {
        setRefundStatus('completed');
        addNotification('Refund processed successfully', 'success');
        
        // Update payment status
        setPayments(prev => prev.map(p => 
          p.id === transactionId ? { ...p, status: 'refunded', refundId: result.refundId } : p
        ));
        
        return result;
      }
    } catch (err) {
      setError(err.message);
      setRefundStatus('failed');
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Calculate payment summary
  const summary = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const refunded = payments.filter(p => p.status === 'refunded').length;
    
    const totalCompleted = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalRefunded = payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return {
      total,
      completed,
      pending,
      failed,
      refunded,
      totalCompleted,
      totalRefunded,
      count: payments.length
    };
  }, [payments]);

  // Get payments by method
  const getPaymentsByMethod = useCallback((method) => {
    return payments.filter(p => p.method === method);
  }, [payments]);

  // Get recent payments
  const getRecentPayments = useCallback((limit = 5) => {
    return payments.slice(0, limit);
  }, [payments]);

  // Clear payment state
  const clearPayment = useCallback(() => {
    setPayment(null);
    setError(null);
    setTransactionStatus(null);
    setRefundStatus(null);
  }, []);

  // Clear all payments
  const clearAllPayments = useCallback(() => {
    setPayments([]);
    clearPayment();
  }, [clearPayment]);

  return {
    // State
    payment,
    payments,
    loading,
    processing,
    error,
    selectedMethod,
    transactionStatus,
    refundStatus,
    summary,
    
    // Methods
    processNewPayment,
    verifyPayment,
    processPaymentRefund,
    getPaymentsByMethod,
    getRecentPayments,
    clearPayment,
    clearAllPayments,
    setSelectedMethod,
    setPayments
  };
};

export default usePayment;
