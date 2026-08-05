import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  generateWebsite,
  changes,
  getUserWebsites,
  getWebsiteById,
  renameWebsite,
  deleteWebsite,
  duplicateWebsite,
  deployWebsite,
  downloadWebsiteZip,
  updateSingleFile,
} from "../controllers/website.controller.js";

const websiteRoute = express.Router();

websiteRoute.post("/generate", authenticateUser, generateWebsite);
websiteRoute.post("/:id/edit", authenticateUser, changes);
websiteRoute.post("/changes", authenticateUser, changes);
websiteRoute.get("/user", authenticateUser, getUserWebsites);
websiteRoute.get("/get-my-id/:id", authenticateUser, getWebsiteById);
websiteRoute.get("/:id", authenticateUser, getWebsiteById);
websiteRoute.put("/:id/rename", authenticateUser, renameWebsite);
websiteRoute.delete("/:id", authenticateUser, deleteWebsite);
websiteRoute.post("/:id/duplicate", authenticateUser, duplicateWebsite);
websiteRoute.post("/:id/deploy", authenticateUser, deployWebsite);
websiteRoute.get("/:id/download", authenticateUser, downloadWebsiteZip);
websiteRoute.put("/:id/file", authenticateUser, updateSingleFile);

export default websiteRoute;