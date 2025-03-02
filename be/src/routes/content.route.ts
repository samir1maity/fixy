import { Router } from "express";
import { createWebsite } from "../controllers/content.controller.js";

const contentRouter = Router();

contentRouter.post("/api/websites", createWebsite);

export default contentRouter;
