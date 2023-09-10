const express = require('express')
const {
  createBlog,
  updateBlogById,
  getAllBlogs,
  getBlogById,
  deleteBlogById,
  likeBlog,
  dislikeBlog,
  uploadBlogImages,
} = require('../controllers/blogController')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddlewares')
const { blogImageResize, uploadPhoto } = require('../middlewares/uploadImages')
const router = express.Router()

router.get('/all-blogs', getAllBlogs)
router.get('/single-blog/:id', getBlogById)
router.post('/create-blog', authMiddleware, isAdmin, createBlog)
router.put('/update-blog/:id', authMiddleware, isAdmin, updateBlogById)
router.put('/like-blog', authMiddleware, likeBlog)
router.put('/dislike-blog', authMiddleware, dislikeBlog)
router.put(
  '/upload/:id',
  authMiddleware,
  isAdmin,
  uploadPhoto.array('images', 2),
  blogImageResize,
  uploadBlogImages
)
router.delete('/delete-blog/:id', authMiddleware, isAdmin, deleteBlogById)

module.exports = router
