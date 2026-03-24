# CarEase Vehicle Service

CarEase is a full-stack automotive service platform that combines vehicle rentals, car wash, repairs, vehicle sales, booking management, payments, customer communication, and an admin dashboard.

## Project Structure

- `FrontEnd/`: React + Vite customer and admin interfaces
- `BackEnd/`: Express + Sequelize API, business logic, reporting, and integrations
- `run-local.sh`: convenience script to start both applications locally

## Run Locally

```bash
./run-local.sh
```

This starts:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Key Flows

- Browse services and vehicles
- Create bookings and complete checkout
- Manage payments and booking confirmations
- Use admin dashboards for bookings, payments, reports, notifications, settings, and audit logs

## Documentation

- Application overview: `CarEase_Application_Overview.md`
- Booking and checkout polish notes: `BOOKING_CHECKOUT_POLISH_GUIDE.md`
- Backend API and setup details: `BackEnd/README.md`
- Frontend app structure and routes: `FrontEnd/README.md`
