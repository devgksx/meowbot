
import express from "express";
import { registerCommandRoute } from "./command";

export const api = express();
const PORT = 3000;

api.use(express.json());

export const runAPI = () => {
  api.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  registerCommandRoute();
};

