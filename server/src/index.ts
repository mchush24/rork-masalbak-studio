import "dotenv/config";
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./trpc";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("MasalBak tRPC backend up ✅");
});

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`🚀 tRPC server listening on http://localhost:${port}`);
});
