// ===== src/Utils/bookingFlow.js =====
const BOOKING_DRAFT_KEY = 'carease_booking_draft';

export const saveBookingDraft = (draft) => {
  if (!draft || typeof draft !== 'object') return;
  sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
};

export const getBookingDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(BOOKING_DRAFT_KEY) || 'null');
  } catch {
    return null;
  }
};

export const clearBookingDraft = () => {
  sessionStorage.removeItem(BOOKING_DRAFT_KEY);
};

export default {
  saveBookingDraft,
  getBookingDraft,
  clearBookingDraft
};
