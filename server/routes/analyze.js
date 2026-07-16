import express from "express";
import { getRepoInfo } from "../controller/repoInfoController.js";
import { getSummary } from "../controller/summaryController.js";
import { getFeatures } from "../controller/featuresController.js";
import { getArchitecture } from "../controller/architectureController.js";
import { getQuestions } from "../controller/questionsController.js";
import { getFollowUp } from "../controller/followupController.js";
import { getExplainFile } from "../controller/explainFileController.js";
import { getAnswer } from "../controller/answerController.js";

const router = express.Router();

// GitHub-fetching endpoint (no AI)
router.post("/repo-info", getRepoInfo);

// AI-powered tab endpoints (one per tab)
router.post("/summary", getSummary);
router.post("/features", getFeatures);
router.post("/architecture", getArchitecture);
router.post("/questions", getQuestions);

// Additional AI endpoints
router.post("/followup", getFollowUp);
router.post("/explain-file", getExplainFile);
router.post("/answer", getAnswer);

export default router;
