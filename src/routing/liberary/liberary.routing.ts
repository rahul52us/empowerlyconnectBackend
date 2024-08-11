import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createBookCategoryService, findBookCategoryByIdService, getAllBookCategoryService, getBookCategoryCountService, getBookCategoryTitleCountService, updateBookCategoryService } from "../../services/liberary/BookCategory.service";
import { createBookService, getAllBookService, getBookCountService, getBookTitleCountService, getSingleBookByIdService, updateBookService } from "../../services/liberary/Book.service";
import { createBookUserService, getBookUsersService } from "../../services/liberary/BookUsers.service";

const router = express();

// book
router.post('/create',authenticate, createBookService)
router.put('/:id',authenticate,updateBookService)
router.get('/single/:id',authenticate,getSingleBookByIdService)
router.post('/',authenticate,getAllBookService)
router.post('/total/counts',authenticate,getBookCountService)
router.post('/total/title/counts',authenticate,getBookTitleCountService)

// category
router.get('/category/single/:id',authenticate,findBookCategoryByIdService)
router.post('/category/get',authenticate, getAllBookCategoryService)
router.post('/category/create',authenticate,createBookCategoryService)
router.put('/category/:id',authenticate,updateBookCategoryService)
router.post('/category/total/counts',authenticate,getBookCategoryCountService)
router.post('/category/total/title/counts',authenticate,getBookCategoryTitleCountService)


// Book User
router.post('/user/create',authenticate, createBookUserService)
router.post('/user/total/counts',authenticate,getBookUsersService)

export default router;