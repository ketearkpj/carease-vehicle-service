import { useAdminAuth as useAdminAuthContext } from '../Context/AdminAuthContext';

/**
 * Single source of truth for admin auth.
 * Keeps legacy import path working while delegating to context implementation.
 */
export const useAdminAuth = () => useAdminAuthContext();

export default useAdminAuth;
