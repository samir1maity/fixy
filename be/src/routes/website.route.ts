import { Router } from "express";
import { getWebsiteInfo, getWebsites, regenerateSecret, registerWebsite } from "../controllers/website.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const websiteRouter = Router();

websiteRouter.post("/", authenticate, registerWebsite);
websiteRouter.get("/", authenticate, getWebsites);
websiteRouter.get("/:id/secret", authenticate, regenerateSecret);
websiteRouter.get("/:id", authenticate, getWebsiteInfo);

export default websiteRouter;