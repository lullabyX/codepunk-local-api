import express from "express";
import fs from "fs/promises";
import path from "path";

interface Cell {
  id: string;
  content: string;
  type: "text" | "javascript";
}

interface LocalApiError {
  code: string;
}

export const createCellRouter = (filename: string, dir: string) => {
  const router = express.Router();

  router.use(express.json())

  const fullPath = path.join(dir, filename);
  const isLocalApiError = (error: any): error is LocalApiError => {
    return typeof error.code === "string";
  };

  router.get("/cells", async (req, res) => {
    try {
      const file = await fs.readFile(fullPath, { encoding: "utf8" });
      const cells = JSON.parse(file);

      res.send({ response: "ok", data: cells });
    } catch (error) {
      if (isLocalApiError(error)) {
        if (error.code === "ENOENT") {
          await fs.writeFile(fullPath, '[]', "utf8");
          res.send({ response: "ok", data: [] });
        } else if (error instanceof Error) {
          res.send({ response: "error", message: error.message });
        }
      }
    }
  });

  router.post("/cells", async (req: { body: { cells: Cell[] } }, res) => {
    const { cells } = req.body;

    try {
      await fs.writeFile(fullPath, JSON.stringify(cells), "utf8");
      res.send({ response: "ok" });
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  });

  return router;
};
