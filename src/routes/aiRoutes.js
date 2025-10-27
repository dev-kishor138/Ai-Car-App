import express from "express";
import {
  aiSuggest,
  analyzeCars,
  compareCarsAI,
} from "../controllers/aiController.js";

const aiRoutes = express.Router();

aiRoutes.post("/analyze", analyzeCars);
aiRoutes.post("/compare", compareCarsAI);
aiRoutes.post("/suggest", aiSuggest);

export default aiRoutes;
