const STORAGE_KEY = 'carease_admin_notification_reads';
const READ_EVENT = 'carease-admin-notification-read-change';

export const getReadAdminNotificationIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch (error) {
    return [];
  }
};

const persistReadIds = (ids) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(READ_EVENT, { detail: ids }));
};

export const markAdminNotificationsRead = (notificationIds = []) => {
  const existing = new Set(getReadAdminNotificationIds());
  notificationIds.filter(Boolean).forEach((id) => existing.add(String(id)));
  persistReadIds(Array.from(existing));
};

export const getUnreadAdminNotificationCount = (notifications = []) => {
  const readIds = new Set(getReadAdminNotificationIds().map(String));
  return notifications.filter((item) => item?.id && !readIds.has(String(item.id))).length;
};

export const subscribeToAdminNotificationReads = (callback) => {
  const handler = () => callback(getReadAdminNotificationIds());
  window.addEventListener(READ_EVENT, handler);
  return () => window.removeEventListener(READ_EVENT, handler);
};
