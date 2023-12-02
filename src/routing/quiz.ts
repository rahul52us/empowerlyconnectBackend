import express from "express";
import { createQuestion, createQuiz, createQuizCategory, getQuestionsByCategory } from "../modules/Quiz/Quiz";
import authenticate from "../modules/config/authenticate";
import { getAllCategoryQuizCountService, getAllQuizService } from "../services/quiz/quiz.service";

const router = express();

router.post("/create", authenticate, createQuiz);
router.post("/category/create", authenticate, createQuizCategory);
router.post('/question/create',authenticate,createQuestion)
router.get("/questions/:category", getQuestionsByCategory);
router.get('/categoryQuizcounts',authenticate, getAllCategoryQuizCountService)
router.get('/',authenticate, getAllQuizService)

export default router;