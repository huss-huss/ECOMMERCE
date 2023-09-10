const express = require('express')
const {
  createProduct,
  getProductById,
  getAllProducts,
  updateProductById,
  deleteProductById,
  addToWishlist,
  ratingProduct,
  uploadProductImages,
} = require('../controllers/productController')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddlewares')
const {
  uploadPhoto,
  productImageResize,
} = require('../middlewares/uploadImages')
const router = express.Router()

router.post('/', authMiddleware, isAdmin, createProduct)
router.get('/:id', getProductById)
router.get('/', getAllProducts)
router.put('/wishlist', authMiddleware, addToWishlist)
router.put('/rating-product', authMiddleware, ratingProduct)
router.put(
  '/upload/:id',
  authMiddleware,
  isAdmin,
  uploadPhoto.array('images', 10),
  productImageResize,
  uploadProductImages
)

router.put('/:id', authMiddleware, isAdmin, updateProductById)
router.delete('/:id', authMiddleware, isAdmin, deleteProductById)

module.exports = router
