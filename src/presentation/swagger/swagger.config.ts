import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi-tenant Platform API',
      version: '1.0.0',
      description: 'API documentation for the multi-tenant platform',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth_token',
        },
      },
    },
  },
  apis: ['./src/presentation/routes/*.ts', './src/presentation/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

