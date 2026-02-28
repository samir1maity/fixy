import { Request, Response } from "express";
import { getWidgetScriptPath } from "../services/widget.service.js";

export function serveWidgetScript(req: Request, res: Response): void {
  res.sendFile(getWidgetScriptPath());
}
