import express from "express";
import { router } from "./routes/v1";
import { config } from "./config/config";
import { userRoute } from "./routes/v1/user";
import { spaceRoute } from "./routes/v1/space";
import { adminRoute } from "./routes/v1/admin";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
const PORT = config.port || 3002;

app.get("/healthy", (req, res) => {
  res.status(200).json({
    message: "Healthy",
  });
});

app.use("/api/v1", router);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/space", spaceRoute);
app.use("/api/v1/admin", adminRoute);

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
