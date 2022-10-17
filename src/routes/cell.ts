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

const defaultCells: Cell[] = [
  {
    id: "tbq0ak",
    type: "text",
    content:
      "### 'import' directly from npm\n\n### Use variables from previous cells",
  },
  {
    id: "f3a8ci",
    type: "javascript",
    content:
      'import axios from "axios";\n\n\nconst fetchCatFact = async (cb) => {\n  const { data } = await axios.get("https://catfact.ninja/fact");\n  console.log(data)\n};\n\nfetchCatFact();\n',
  },
  {
    id: "al0d33",
    type: "text",
    content:
      "### special **display** function\n\nThis function can display primitives, json, array and jsx directly to the preview window",
  },
  {
    id: "465bef",
    type: "javascript",
    content:
      'display({\n  Catygory: "Car",\n  available: true,\n  model: ["Sedan", "SUV", "Sports"],\n});\n',
  },
  {
    id: "oqn7sp",
    type: "javascript",
    content:
      "const HelloWorld = () => {\n  return (\n    <div>\n      <h1>Hello World</h1>\n    </div>\n  );\n};\n\ndisplay(<HelloWorld />);\n",
  },
  { id: "cn3um9", type: "text", content: "### Build react app" },
  {
    id: "l1l76c",
    type: "javascript",
    content:
      'import React from "react";\nimport ReactDOM from "react-dom";\n\nconst App = () => {\n  \n  return (\n    <div>\n      <img\n        width="225"\n        height="300"\n        src="https://static.wikia.nocookie.net/cyberpunk/images/2/23/CP2077_Samurai_Logo.jpeg/revision/latest?cb=20210425144838"\n      />\n    </div>\n  );\n};\n\nconst root = ReactDOM.createRoot(document.getElementById("root"));\n\nroot.render(<App />);\n',
  },
];

export const createCellRouter = (filename: string, dir: string) => {
  const router = express.Router();

  router.use(express.json());

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
          await fs.writeFile(fullPath, JSON.stringify(defaultCells), "utf8");
          res.send({ response: "ok", data: defaultCells });
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
