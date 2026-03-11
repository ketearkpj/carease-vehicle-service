// ===== src/Config/Routes.js =====
/**
 * ROUTES CONFIGURATION - GOD MODE
 * Centralized route management for the entire application
 */

// ===== PUBLIC ROUTES =====
export const ROUTES = {
  // Public Routes
  HOME: '/',
  SERVICES: '/services',
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // Service Routes
  RENTALS: '/rentals',
  CAR_WASH: '/car-wash',
  REPAIRS: '/repairs',
  SALES: '/sales',
  
  // Booking Routes
  BOOKING: '/booking',
  BOOKING_CONFIRMATION: '/booking-confirmation',
  CHECKOUT: '/checkout',
  
  // User Routes (Future)
  PROFILE: '/profile',
  MY_BOOKINGS: '/my-bookings',
  WISHLIST: '/wishlist',
  
  // Admin Auth
  ADMIN_LOGIN: '/admin-login',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_VEHICLES: '/admin/vehicles',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_AUDIT: '/admin/audit-logs',
  
  // Legal Routes
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIES: '/cookies',
  FAQ: '/faq',
  CAREERS: '/careers',
  PRESS: '/press',
  SITEMAP: '/sitemap',
  
  // 404
  NOT_FOUND: '*'
};

// ===== ROUTE GROUPS =====
export const ROUTE_GROUPS = {
  // Public routes - accessible to everyone
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.SERVICES,
    ROUTES.ABOUT,
    ROUTES.CONTACT,
    ROUTES.PRIVACY,
    ROUTES.TERMS,
    ROUTES.COOKIES,
    ROUTES.FAQ,
    ROUTES.CAREERS,
    ROUTES.PRESS,
    ROUTES.SITEMAP
  ],
  
  // Service routes
  SERVICES: [
    ROUTES.SERVICES,
    ROUTES.RENTALS,
    ROUTES.CAR_WASH,
    ROUTES.REPAIRS,
    ROUTES.SALES
  ],
  
  // Booking flow routes
  BOOKING_FLOW: [
    ROUTES.BOOKING,
    ROUTES.BOOKING_CONFIRMATION,
    ROUTES.CHECKOUT
  ],
  
  // User routes (require authentication)
  USER: [
    ROUTES.PROFILE,
    ROUTES.MY_BOOKINGS,
    ROUTES.WISHLIST
  ],
  
  // Admin auth routes
  ADMIN_AUTH: [
    ROUTES.ADMIN_LOGIN
  ],
  
  // Admin routes (require admin authentication)
  ADMIN: [
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.ADMIN_BOOKINGS,
    ROUTES.ADMIN_PAYMENTS,
    ROUTES.ADMIN_VEHICLES,
    ROUTES.ADMIN_REPORTS,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_SETTINGS,
    ROUTES.ADMIN_AUDIT
  ],
  
  // Legal routes
  LEGAL: [
    ROUTES.PRIVACY,
    ROUTES.TERMS,
    ROUTES.COOKIES
  ]
};

// ===== ROUTE METADATA =====
export const ROUTE_META = {
  [ROUTES.HOME]: {
    title: 'CAR EASE - Luxury Automotive Services',
    description: 'Experience luxury on wheels with premium car rentals, professional car wash, expert repairs, and exclusive vehicle sales.',
    keywords: 'luxury cars, car rental, car wash, car repair, exotic cars, automotive services',
    image: '/og-image.jpg'
  },
  [ROUTES.SERVICES]: {
    title: 'Our Services - CAR EASE',
    description: 'Discover our comprehensive range of luxury automotive services including rentals, car wash, repairs, and vehicle sales.',
    keywords: 'car services, luxury car rental, car detailing, car maintenance, vehicle sales'
  },
  [ROUTES.RENTALS]: {
    title: 'Luxury Car Rentals - CAR EASE',
    description: 'Rent the finest luxury and exotic vehicles. Choose from our curated collection of supercars, luxury sedans, and SUVs.',
    keywords: 'luxury car rental, exotic car rental, supercar rental, sports car rental'
  },
  [ROUTES.CAR_WASH]: {
    title: 'Professional Car Wash & Detailing - CAR EASE',
    description: 'Premium car wash and detailing services. From express wash to complete ceramic coating protection.',
    keywords: 'car wash, car detailing, ceramic coating, professional car cleaning'
  },
  [ROUTES.REPAIRS]: {
    title: 'Expert Car Repairs & Maintenance - CAR EASE',
    description: 'Professional repair and maintenance services for all luxury vehicles. Diagnostics, performance tuning, and factory repairs.',
    keywords: 'car repair, car maintenance, auto repair, performance tuning, diagnostics'
  },
  [ROUTES.SALES]: {
    title: 'Luxury Vehicle Sales - CAR EASE',
    description: 'Browse our collection of premium pre-owned luxury vehicles. Each vehicle comes with full history and warranty.',
    keywords: 'luxury car sales, exotic car sales, pre-owned luxury vehicles, car financing'
  },
  [ROUTES.ABOUT]: {
    title: 'About CAR EASE - Luxury Automotive Platform',
    description: 'Learn about CAR EASE, our mission, values, and commitment to providing exceptional luxury automotive experiences.',
    keywords: 'about us, company information, automotive services'
  },
  [ROUTES.CONTACT]: {
    title: 'Contact CAR EASE - Get in Touch',
    description: 'Contact CAR EASE for bookings, inquiries, or support. Visit our showrooms or reach out online.',
    keywords: 'contact us, customer support, showroom locations'
  },
  [ROUTES.BOOKING]: {
    title: 'Book Your Service - CAR EASE',
    description: 'Book luxury car rentals, car wash, repairs, or test drives online. Quick and easy booking process.',
    keywords: 'book service, car rental booking, schedule car wash, book repair'
  },
  [ROUTES.BOOKING_CONFIRMATION]: {
    title: 'Booking Confirmed - CAR EASE',
    description: 'Your booking has been confirmed. Check your email for details and next steps.',
    noindex: true
  },
  [ROUTES.CHECKOUT]: {
    title: 'Checkout - CAR EASE',
    description: 'Complete your booking with secure payment.',
    noindex: true
  },
  [ROUTES.ADMIN_LOGIN]: {
    title: 'Admin Login - CAR EASE',
    description: 'Secure admin access portal.',
    noindex: true
  },
  [ROUTES.ADMIN_DASHBOARD]: {
    title: 'Admin Dashboard - CAR EASE',
    description: 'Administrative control panel.',
    noindex: true
  },
  [ROUTES.PRIVACY]: {
    title: 'Privacy Policy - CAR EASE',
    description: 'Our privacy policy and data protection practices.'
  },
  [ROUTES.TERMS]: {
    title: 'Terms of Service - CAR EASE',
    description: 'Terms and conditions for using CAR EASE services.'
  },
  [ROUTES.FAQ]: {
    title: 'Frequently Asked Questions - CAR EASE',
    description: 'Find answers to common questions about our services.'
  }
};

// ===== BREADCRUMB NAMES =====
export const ROUTE_NAMES = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.SERVICES]: 'Services',
  [ROUTES.RENTALS]: 'Rentals',
  [ROUTES.CAR_WASH]: 'Car Wash',
  [ROUTES.REPAIRS]: 'Repairs',
  [ROUTES.SALES]: 'Sales',
  [ROUTES.ABOUT]: 'About Us',
  [ROUTES.CONTACT]: 'Contact',
  [ROUTES.BOOKING]: 'Booking',
  [ROUTES.BOOKING_CONFIRMATION]: 'Booking Confirmation',
  [ROUTES.CHECKOUT]: 'Checkout',
  [ROUTES.PROFILE]: 'My Profile',
  [ROUTES.MY_BOOKINGS]: 'My Bookings',
  [ROUTES.WISHLIST]: 'Wishlist',
  [ROUTES.ADMIN_LOGIN]: 'Admin Login',
  [ROUTES.ADMIN_DASHBOARD]: 'Dashboard',
  [ROUTES.ADMIN_BOOKINGS]: 'Manage Bookings',
  [ROUTES.ADMIN_PAYMENTS]: 'Manage Payments',
  [ROUTES.ADMIN_VEHICLES]: 'Manage Vehicles',
  [ROUTES.ADMIN_REPORTS]: 'Reports',
  [ROUTES.ADMIN_USERS]: 'Manage Users',
  [ROUTES.ADMIN_SETTINGS]: 'Settings',
  [ROUTES.PRIVACY]: 'Privacy Policy',
  [ROUTES.TERMS]: 'Terms of Service',
  [ROUTES.COOKIES]: 'Cookie Policy',
  [ROUTES.FAQ]: 'FAQ',
  [ROUTES.CAREERS]: 'Careers',
  [ROUTES.PRESS]: 'Press',
  [ROUTES.SITEMAP]: 'Sitemap'
};

// ===== ROUTE ICONS =====
export const ROUTE_ICONS = {
  [ROUTES.HOME]: '🏠',
  [ROUTES.SERVICES]: '🔧',
  [ROUTES.RENTALS]: '🚗',
  [ROUTES.CAR_WASH]: '🧼',
  [ROUTES.REPAIRS]: '🔨',
  [ROUTES.SALES]: '💰',
  [ROUTES.ABOUT]: '📋',
  [ROUTES.CONTACT]: '📞',
  [ROUTES.BOOKING]: '📅',
  [ROUTES.PROFILE]: '👤',
  [ROUTES.MY_BOOKINGS]: '📋',
  [ROUTES.WISHLIST]: '❤️',
  [ROUTES.ADMIN_DASHBOARD]: '📊',
  [ROUTES.ADMIN_BOOKINGS]: '📅',
  [ROUTES.ADMIN_PAYMENTS]: '💰',
  [ROUTES.ADMIN_VEHICLES]: '🚗',
  [ROUTES.ADMIN_REPORTS]: '📈',
  [ROUTES.ADMIN_USERS]: '👥',
  [ROUTES.ADMIN_SETTINGS]: '⚙️',
  [ROUTES.PRIVACY]: '🔒',
  [ROUTES.TERMS]: '📜',
  [ROUTES.FAQ]: '❓'
};

// ===== HELPER FUNCTIONS =====

/**
 * Get page title for route
 * @param {string} path - Route path
 * @returns {string} - Page title
 */
export const getRouteTitle = (path) => {
  const routeMeta = ROUTE_META[path];
  return routeMeta?.title || 'CAR EASE - Luxury Automotive Services';
};

/**
 * Get page description for route
 * @param {string} path - Route path
 * @returns {string} - Page description
 */
export const getRouteDescription = (path) => {
  const routeMeta = ROUTE_META[path];
  return routeMeta?.description || 'Experience luxury on wheels with premium automotive services.';
};

/**
 * Check if route is public
 * @param {string} path - Route path
 * @returns {boolean} - True if public
 */
export const isPublicRoute = (path) => {
  return ROUTE_GROUPS.PUBLIC.includes(path) || 
         ROUTE_GROUPS.SERVICES.includes(path) ||
         ROUTE_GROUPS.BOOKING_FLOW.includes(path);
};

/**
 * Check if route requires authentication
 * @param {string} path - Route path
 * @returns {boolean} - True if requires auth
 */
export const requiresAuth = (path) => {
  return ROUTE_GROUPS.USER.includes(path);
};

/**
 * Check if route is admin route
 * @param {string} path - Route path
 * @returns {boolean} - True if admin route
 */
export const isAdminRoute = (path) => {
  return ROUTE_GROUPS.ADMIN.includes(path) || path === ROUTES.ADMIN_DASHBOARD;
};

/**
 * Check if route is admin auth route (login)
 * @param {string} path - Route path
 * @returns {boolean} - True if admin login route
 */
export const isAdminAuthRoute = (path) => {
  return ROUTE_GROUPS.ADMIN_AUTH.includes(path);
};

/**
 * Get breadcrumbs for route
 * @param {string} path - Current route path
 * @returns {Array} - Breadcrumb items
 */
export const getBreadcrumbs = (path) => {
  const breadcrumbs = [];
  const paths = path.split('/').filter(p => p);
  
  let currentPath = '';
  paths.forEach(segment => {
    currentPath += `/${segment}`;
    if (ROUTE_NAMES[currentPath]) {
      breadcrumbs.push({
        path: currentPath,
        label: ROUTE_NAMES[currentPath]
      });
    }
  });
  
  return breadcrumbs;
};

/**
 * Get navigation structure for sitemap
 * @returns {Array} - Navigation structure
 */
export const getNavigationStructure = () => {
  return [
    {
      title: 'Main',
      items: [
        { path: ROUTES.HOME, label: ROUTE_NAMES[ROUTES.HOME], icon: ROUTE_ICONS[ROUTES.HOME] },
        { path: ROUTES.SERVICES, label: ROUTE_NAMES[ROUTES.SERVICES], icon: ROUTE_ICONS[ROUTES.SERVICES] },
        { path: ROUTES.ABOUT, label: ROUTE_NAMES[ROUTES.ABOUT], icon: ROUTE_ICONS[ROUTES.ABOUT] },
        { path: ROUTES.CONTACT, label: ROUTE_NAMES[ROUTES.CONTACT], icon: ROUTE_ICONS[ROUTES.CONTACT] }
      ]
    },
    {
      title: 'Services',
      items: [
        { path: ROUTES.RENTALS, label: ROUTE_NAMES[ROUTES.RENTALS], icon: ROUTE_ICONS[ROUTES.RENTALS] },
        { path: ROUTES.CAR_WASH, label: ROUTE_NAMES[ROUTES.CAR_WASH], icon: ROUTE_ICONS[ROUTES.CAR_WASH] },
        { path: ROUTES.REPAIRS, label: ROUTE_NAMES[ROUTES.REPAIRS], icon: ROUTE_ICONS[ROUTES.REPAIRS] },
        { path: ROUTES.SALES, label: ROUTE_NAMES[ROUTES.SALES], icon: ROUTE_ICONS[ROUTES.SALES] }
      ]
    },
    {
      title: 'Booking',
      items: [
        { path: ROUTES.BOOKING, label: ROUTE_NAMES[ROUTES.BOOKING], icon: ROUTE_ICONS[ROUTES.BOOKING] }
      ]
    },
    {
      title: 'Information',
      items: [
        { path: ROUTES.PRIVACY, label: ROUTE_NAMES[ROUTES.PRIVACY], icon: ROUTE_ICONS[ROUTES.PRIVACY] },
        { path: ROUTES.TERMS, label: ROUTE_NAMES[ROUTES.TERMS], icon: ROUTE_ICONS[ROUTES.TERMS] },
        { path: ROUTES.FAQ, label: ROUTE_NAMES[ROUTES.FAQ], icon: ROUTE_ICONS[ROUTES.FAQ] }
      ]
    }
  ];
};

// ===== EXPORT ALL =====
export default ROUTES;