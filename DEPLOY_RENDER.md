# Deploy CarEase On Render

This repo is now prepared for a single Blueprint deploy with:

- `carease-frontend` as a static site
- `carease-api` as a Node web service
- `carease-db` as a free Render Postgres database

The deployment manifest is [render.yaml](/Users/bijakonwarcharkuoth/Desktop/CarEase /render.yaml).

## One-Go Deploy

1. Push the latest repo state to GitHub.
2. In Render, choose `New` -> `Blueprint`.
3. Connect `ketearkpj/carease-vehicle-service`.
4. Select the branch that contains `render.yaml`.
5. Review the three resources Render detects:
   - `carease-frontend`
   - `carease-api`
   - `carease-db`
6. Fill any `sync: false` variables you actually use.
7. Click `Apply`.

## Required After Import

These values are optional for the app to boot, but required for the corresponding integrations to work fully:

- `GOOGLE_MAPS_API_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`
- `STRIPE_SECRET_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `PAYPAL_CLIENT_ID`
- `VITE_PAYPAL_CLIENT_ID`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `FLUTTERWAVE_SECRET_KEY`
- `VITE_FLUTTERWAVE_PUBLIC_KEY`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `CLOUDINARY_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Important Notes

- The frontend now expects `VITE_API_URL` to be the backend origin only, such as `https://carease-api.onrender.com`. It appends `/api/v1` internally where needed.
- The backend uses the Render Postgres connection string automatically through `DATABASE_URL`.
- `DB_AUTO_SYNC=true` is enabled in the Blueprint so the Sequelize schema can initialize on first deploy.
- Render free Postgres is suitable for demos and class presentation work, but according to Render's docs it expires after 30 days unless upgraded.

## Render References

- Render free instances: https://render.com/docs/free
- Blueprint spec: https://render.com/docs/blueprint-spec
- Static sites: https://render.com/docs/static-sites
- Web services: https://render.com/docs/web-services
