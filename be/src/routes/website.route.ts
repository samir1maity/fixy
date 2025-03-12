import { Router } from "express";
import { getWebsites, registerWebsite } from "../controllers/website.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const websiteRouter = Router();

websiteRouter.post("/", authenticate, registerWebsite);
websiteRouter.get("/", authenticate, getWebsites);

export default websiteRouter;