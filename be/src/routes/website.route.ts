import { Router } from "express";
import multer from "multer";
import { getWebsiteInfo, getWebsites, getWidgetConfig, regenerateSecret, registerWebsite, updateKnowledge, updateWidgetConfig } from "../controllers/website.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const websiteRouter = Router();

// Accept a single file field named "file", stored in memory (max 10 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and plain text files are allowed'));
    }
  }
});

websiteRouter.post("/", authenticate, upload.single('file'), registerWebsite);
websiteRouter.get("/", authenticate, getWebsites);
websiteRouter.get("/:id/secret", authenticate, regenerateSecret);
websiteRouter.patch("/:id/widget-config", authenticate, updateWidgetConfig);
websiteRouter.patch("/:id/knowledge", authenticate, upload.single('file'), updateKnowledge);
websiteRouter.get("/:id", authenticate, getWebsiteInfo);

export default websiteRouter;