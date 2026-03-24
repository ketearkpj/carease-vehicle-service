# CarEase Frontend

The frontend is a React + Vite application that powers both the public customer experience and the admin interface.

## Main Areas

- Public pages for services, legal pages, FAQ, careers, and contact
- Booking and checkout flows for rentals, wash, repairs, and sales inquiries
- Admin pages for dashboard, bookings, payments, vehicles, reports, notifications, settings, and audit logs
- Customer utility pages for profile, bookings, and wishlist

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

## QA Notes

- `npm run build` validates the production bundle
- `npm run lint` checks code quality rules
- `npm test` runs the current frontend build verification command

## Environment

Create `.env` values for:

- `REACT_APP_API_URL`
- `REACT_APP_GOOGLE_MAPS_API_KEY`

## Routing

Routes are centralized in `src/Config/Routes.js`, and the application router is defined in `src/App.jsx`.
