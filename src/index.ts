import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import emailRoutes from "./routes/email";
import gameStatsRoutes from "./routes/gameStats";
import leaderboardRoutes from "./routes/leaderboard";
import profileRoutes from "./routes/profile";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "System Drift Backend API" });
});

app.use("/api/profile", profileRoutes);
app.use("/api/stats", gameStatsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/email", emailRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
