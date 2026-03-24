module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'CarEase API',
    version: '1.0.0',
    description: 'Core API documentation for the CarEase automotive services platform.'
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local development server'
    }
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate a customer user'
      }
    },
    '/bookings': {
      get: {
        summary: 'List bookings'
      },
      post: {
        summary: 'Create a booking'
      }
    },
    '/payments': {
      get: {
        summary: 'List payments'
      }
    },
    '/admin/dashboard': {
      get: {
        summary: 'Get admin dashboard summary'
      }
    },
    '/reports/revenue': {
      get: {
        summary: 'Get revenue reporting data'
      }
    },
    '/deliveries': {
      get: {
        summary: 'List deliveries'
      }
    }
  }
};
