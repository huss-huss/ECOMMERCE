const express = require('express')
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
} = require('../controllers/productCategoryController')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddlewares')
const router = express.Router()

router.post('/create-category', authMiddleware, isAdmin, createCategory)
router.put('/update-category/:id', authMiddleware, isAdmin, updateCategory)
router.delete('/delete-category/:id', authMiddleware, isAdmin, deleteCategory)
router.get('/get-category/:id', getCategoryById)
router.get('/get-all-categories', getAllCategories)

module.exports = router
