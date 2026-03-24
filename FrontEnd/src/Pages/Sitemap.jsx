import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Components/Common/Card';
import { ROUTES } from '../Config/Routes';
import '../Styles/InfoPages.css';

const groups = [
  ['Home', ROUTES.HOME],
  ['Services', ROUTES.SERVICES],
  ['Rentals', ROUTES.RENTALS],
  ['Car Wash', ROUTES.CAR_WASH],
  ['Repairs', ROUTES.REPAIRS],
  ['Sales', ROUTES.SALES],
  ['Booking', ROUTES.BOOKING],
  ['Profile', ROUTES.PROFILE],
  ['My Bookings', ROUTES.MY_BOOKINGS],
  ['Wishlist', ROUTES.WISHLIST],
  ['Admin Dashboard', ROUTES.ADMIN_DASHBOARD],
  ['Admin Reports', ROUTES.ADMIN_REPORTS],
  ['Audit Logs', ROUTES.ADMIN_AUDIT],
  ['Privacy', ROUTES.PRIVACY],
  ['Terms', ROUTES.TERMS],
  ['Cookies', ROUTES.COOKIES],
  ['FAQ', ROUTES.FAQ],
  ['Careers', ROUTES.CAREERS],
  ['Press', ROUTES.PRESS]
];

const Sitemap = () => (
  <div className="info-page">
    <div className="info-page-shell">
      <div className="info-page-hero">
        <h1 className="info-page-title">Sitemap</h1>
        <p className="info-page-subtitle">A quick index of the core CarEase pages available in the application.</p>
      </div>

      <Card className="info-page-card">
        <ul className="info-page-list">
          {groups.map(([label, path]) => (
            <li key={path}>
              <Link to={path}>{label}</Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  </div>
);

export default Sitemap;
