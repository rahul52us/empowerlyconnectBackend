import express from 'express'
import authenticate from "../../modules/config/authenticate";
import { createNewComment, deleteBlogById, getBlogById, getBlogs, getComments } from '../../modules/blog/blog';
import { createBlogService, getBlogByIdService, getBlogsService } from '../../services/blog/Blog.service';

const router = express.Router()

router.post('/',authenticate,createBlogService)
router.post('/get', getBlogsService)
router.get('/:blogId',getBlogByIdService)
router.delete('/:blogId',authenticate,deleteBlogById)

router.post('/comment/:blogId',authenticate,createNewComment)
router.get('/comments/:blogId',getComments)
export default router;