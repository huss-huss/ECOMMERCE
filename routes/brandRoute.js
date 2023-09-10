const express = require('express')
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
  getAllBrands,
} = require('../controllers/brandController')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddlewares')
const router = express.Router()

router.post('/create-brand', authMiddleware, isAdmin, createBrand)
router.put('/update-brand/:id', authMiddleware, isAdmin, updateBrand)
router.delete('/delete-brand/:id', authMiddleware, isAdmin, deleteBrand)
router.get('/get-brand/:id', getBrandById)
router.get('/get-all-brands', getAllBrands)

module.exports = router
