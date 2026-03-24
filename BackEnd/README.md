# CarEase Backend

The backend is an Express API with Sequelize models for bookings, payments, vehicles, users, locations, admin workflows, deliveries, notifications, and reporting.

## Commands

```bash
npm install
npm run dev
npm test
npm run docs
```

## API Areas

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/vehicles`
- `/api/v1/bookings`
- `/api/v1/payments`
- `/api/v1/services`
- `/api/v1/reviews`
- `/api/v1/locations`
- `/api/v1/deliveries`
- `/api/v1/admin`
- `/api/v1/reports`
- `/api/v1/email`

## API Documentation

- Development Swagger UI: `/api-docs`
- OpenAPI source: `BackEnd/docs/swagger.js`

## Testing

The backend includes:

- integration workflow coverage in `tests/booking-workflow.test.js`
- utility coverage in `tests/price-calculator.test.js`

Some integration tests rely on local infrastructure and real environment configuration.
