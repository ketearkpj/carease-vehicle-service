# Final Manual QA Checklist

Use this checklist when running CarEase against a live PostgreSQL database and real environment credentials.

## Before Testing

- Confirm PostgreSQL is running and `BackEnd/.env` points to the correct database.
- Confirm frontend and backend are both running locally.
- Confirm payment, email, and maps keys are valid for the target environment.
- Confirm seed data exists for vehicles, locations, admin users, and at least one customer user.

## Public Site

- Open `/` and verify hero, service sections, featured vehicles, footer links, and navbar links.
- Open `/services`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/cancellation`, `/cookies`, `/careers`, `/press`, and `/sitemap`.
- Verify no route shows the 404 page unless intentionally invalid.
- Verify all footer and sitemap links navigate to valid pages.

## Customer Flows

- Rentals:
  - Browse listings, filter, open quick view, and start checkout.
- Car wash:
  - Choose a package and continue into checkout.
- Repairs:
  - Select a service, fill issue details, and continue into checkout.
- Sales:
  - Open vehicle details, submit inquiry/test-drive intent, and continue into sales checkout.

## Booking and Checkout

- Complete a booking from `/booking`.
- Complete a service checkout from each service-specific checkout route.
- Verify totals, taxes, and delivery/pickup options update correctly.
- Verify booking confirmation page actions work:
  - invoice download
  - print
  - resend email
  - add to calendar
  - share booking

## Customer Utility Pages

- Open `/profile` and confirm current session info renders.
- Open `/my-bookings` and confirm user bookings load from API or local fallback.
- Open `/wishlist` and confirm favorite vehicles render correctly.

## Admin Authentication

- Log in with a real admin account.
- Also verify demo admin login still works for presentation mode.
- Confirm protected routes redirect unauthenticated users to `/admin-login`.

## Admin Operations

- Dashboard:
  - verify stats, recent bookings table, quick actions, and notifications refresh.
- Bookings:
  - open booking details
  - update booking status
  - verify note persistence and customer-facing result
- Payments:
  - open payment details
  - process refund
  - follow related booking link
- Vehicles:
  - add vehicle
  - edit vehicle
  - delete vehicle
- Reports:
  - switch tabs
  - change date presets and custom date range
  - export PDF, CSV, and Excel where configured
- Notifications:
  - filter items and refresh feed
- Settings:
  - edit text values
  - toggle notification settings
- Audit Logs:
  - verify records render and reflect recent admin actions

## Backend/API Checks

- Confirm `/health` responds successfully.
- Confirm `/api-docs` opens in development.
- Confirm `/api/v1/deliveries` routes respond after authentication.
- Confirm `/api/v1/reports/*` routes respond with real data.

## Integrations

- Email:
  - booking confirmation
  - password reset
  - contact form
  - career application intake
- Payments:
  - Stripe
  - PayPal
  - M-PESA
  - refund path
- Location and maps:
  - geocoding
  - reverse geocoding
  - distance matrix
  - location picker

## Cross-Cutting Checks

- Test on desktop and mobile viewport sizes.
- Verify no browser console errors during key flows.
- Verify loading, empty, and fallback states render cleanly.
- Capture screenshots or short recordings of:
  - public homepage
  - booking flow
  - booking confirmation
  - admin dashboard
  - reports and audit logs

## Sign-off

- Record pass/fail for each section.
- Note exact failing route, action, and timestamp for any issue.
- Retest after fixes before final demo and presentation.
