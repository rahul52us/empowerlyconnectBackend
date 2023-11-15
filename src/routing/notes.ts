import express from "express";
import {
  createCategory,
  createNote,
  getCategories,
  uploadNotes,
} from "../modules/Notes/Notes";
import authenticate from "../modules/config/authenticate";
import { upload } from "../modules/config/fileuploadService";
import { getCategoryCoursesCountService } from "../services/courses/courses";

const router = express.Router();

router.post("/category", authenticate, createCategory);
router.post("/categories", authenticate, getCategories);
router.post("/create", authenticate, createNote);
router.post("/upload", authenticate, upload("/notes"), uploadNotes);
router.get('/categoryCoursescounts',authenticate, getCategoryCoursesCountService)

export default router;