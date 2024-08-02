import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createBookCategoryService, getAllBookCategoryService, updateBookCategoryService } from "../../services/liberary/BookCategory.service";
import { createBookService, getAllBookService, getBookCountService, updateBookService } from "../../services/liberary/Book.service";

const router = express();
router.post('/create',authenticate, createBookService)
router.put('/:id',authenticate,updateBookService)
router.post('/',authenticate,getAllBookService)
router.post('/total/counts',authenticate,getBookCountService)
// book
// category
router.post('/category/get',authenticate, getAllBookCategoryService)
router.post('/category',authenticate,createBookCategoryService)
router.put('/category/:id',authenticate,updateBookCategoryService)

export default router;