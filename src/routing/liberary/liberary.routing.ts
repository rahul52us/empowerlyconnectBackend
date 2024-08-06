import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createBookCategoryService, getAllBookCategoryService, getBookCategoryCountService, getBookCategoryTitleCountService, updateBookCategoryService } from "../../services/liberary/BookCategory.service";
import { createBookService, getAllBookService, getBookCountService, getBookTitleCountService, updateBookService } from "../../services/liberary/Book.service";

const router = express();

// book
router.post('/create',authenticate, createBookService)
router.put('/:id',authenticate,updateBookService)
router.post('/',authenticate,getAllBookService)
router.post('/total/counts',authenticate,getBookCountService)
router.post('/total/title/counts',authenticate,getBookTitleCountService)

// category
router.post('/category/get',authenticate, getAllBookCategoryService)
router.post('/category',authenticate,createBookCategoryService)
router.put('/category/:id',authenticate,updateBookCategoryService)
router.post('/category/total/counts',authenticate,getBookCategoryCountService)
router.post('/category/total/title/counts',authenticate,getBookCategoryTitleCountService)

export default router;