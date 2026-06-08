require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Import Route Files
const authRoutes = require("./router/auth.router");
const patientRoutes = require("./router/patient.router");
const providerRoutes = require("./router/provider.router");
const adminRoutes = require("./router/admin.router");
const profileRoutes = require("./router/profile.router");
const doctorRoutes = require("./router/doctor.router");

// NEW: Import the Error Middleware
const errorHandler = require("./middleware/error.middleware");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patient", patientRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/provider", providerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/profile", profileRoutes)

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Catch undefined routes (404)
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// 🔴 MOUNT ERROR HANDLER LAST
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});
