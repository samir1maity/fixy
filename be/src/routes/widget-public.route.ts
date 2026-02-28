import { Router } from "express";
import { serveWidgetScript } from "../controllers/widget.controller.js";

const widgetPublicRouter = Router();

widgetPublicRouter.get("/", serveWidgetScript);

export default widgetPublicRouter;
