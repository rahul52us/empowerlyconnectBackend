import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createBookCategoryService, getAllBookCategoryService, updateBookCategoryService } from "../../services/liberary/BookCategory.service";
import { createBookService, getAllBookService, updateBookService } from "../../services/liberary/Book.service";

const router = express();
router.post('/',authenticate, createBookService)
router.put('/:id',authenticate,updateBookService)
router.get('/',authenticate,getAllBookService)
// book
// category
router.get('/category',authenticate, getAllBookCategoryService)
router.post('/category',authenticate,createBookCategoryService)
router.put('/category/:id',authenticate,updateBookCategoryService)

export default router;