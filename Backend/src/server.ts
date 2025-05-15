import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";

import authRoutes from "./routes/authRoutes";
import contactRoutes from "./routes/contactRoutes";
import foodRoutes from "./routes/foodRoutes";
import donorRoutes from "./routes/donorRoutes";
import cookieParser from "cookie-parser";
import ngoRoutes from "./routes/ngoRoutes";
import VolunteerRoutes from "./routes/volunteerRoutes";
import notificationRoutes from "./routes/notificationRoutes";

import adminRoutes from "./routes/adminRoutes";

dotenv.config();
connectDB();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // This is important for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use('/api/contact', contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/volunteer", VolunteerRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
