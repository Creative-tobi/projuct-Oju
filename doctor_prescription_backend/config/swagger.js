const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path"); // Add this at the top

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Oju API Documentation",
      version: "1.0.0",
      description: "Interactive API documentation for the Project Oju backend.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Use path.join to ensure it always finds the routes folder
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
