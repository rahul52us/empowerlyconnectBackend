import express from 'express'
import authenticate from "../../modules/config/authenticate";
import { deleteBlogById } from '../../modules/blog/blog';
import { createBlogService, getBlogByIdService, getBlogsService } from '../../services/blog/Blog.service';
import {createBlogCommentService, getBlogCommentService} from '../../services/blogComment/blogComment.service'
const router = express.Router()

router.post('/',authenticate,createBlogService)
router.post('/get', getBlogsService)
router.get('/:blogId',getBlogByIdService)
router.delete('/:blogId',authenticate,deleteBlogById)

router.post('/comment/:blogId',authenticate,createBlogCommentService)
router.get('/comments/:blogId',getBlogCommentService)
export default router;