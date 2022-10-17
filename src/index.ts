import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { createCellRouter } from "./routes/cell";

export const serve = (
  filename: string,
  port: number,
  dir: string,
  useProxy: boolean
) => {
  const app = express();

  app.use(createCellRouter(filename, dir));

  if (useProxy) {
    app.use(
      createProxyMiddleware({
        target: `http://localhost:3000`,
        logLevel: "silent",
      })
    );
  } else {
    const clientPath = require.resolve("codepunk-client/build/index.html");
    app.use(express.static(path.dirname(clientPath)));
  }

  return new Promise<void>((resolve, reject) => {
    app.listen(port, resolve).on("error", reject);
  });
};
