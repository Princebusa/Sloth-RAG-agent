import express from "express";
import cors from "cors";
import driveRouter from "./routes/drive-sync";
import authRouter from "./routes/auth";

const app = express();
const port = process.env.PORT ?? 3001;


app.use(cors()),
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/drive", driveRouter);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
