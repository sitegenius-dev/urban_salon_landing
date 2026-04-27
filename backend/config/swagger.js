 const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Root & Rise Salon API',
      version: '1.0.0',
      description: 'Complete backend API for Root & Rise Salon booking system',
    },
    servers: [
  { url: 'http://localhost:3000/api', description: 'Local server' },

    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;