import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createBookCategoryService, findBookCategoryByIdService, getAllBookCategoryService, getBookCategoryCountService, getBookCategoryTitleCountService, updateBookCategoryService } from "../../services/liberary/books/BookCategory.service";
import { createBookService, getAllBookService, getBookCountService, getBookTitleCountService, getSingleBookByIdService, updateBookService } from "../../services/liberary/books/Book.service";
import { createBookUserService, getBookUsersService } from "../../services/liberary/books/BookUsers.service";
import { createRoomService, getAllRoomService, getRoomCountService, getRoomTitleCountService, getSingleRoomByIdService, updateRoomService } from "../../services/liberary/room/room.service";

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


// Liberary Room


router.post('/create',authenticate, createRoomService)
router.put('/:id',authenticate,updateRoomService)
router.get('/single/:id',authenticate,getSingleRoomByIdService)
router.post('/',authenticate,getAllRoomService)
router.post('/total/counts',authenticate,getRoomCountService)
router.post('/total/title/counts',authenticate,getRoomTitleCountService)



export default router;