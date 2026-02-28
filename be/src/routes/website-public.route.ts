import { Router } from "express";
import { getWidgetConfig } from "../controllers/website.controller.js";

const websitePublicRouter = Router();

websitePublicRouter.get("/:id/widget-config", getWidgetConfig);

export default websitePublicRouter;
