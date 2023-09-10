const express = require('express')
const {
  createCoupon,
  getAllCoupons,
  updateCouponById,
  deleteCouponById,
} = require('../controllers/couponController')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddlewares')
const router = express.Router()

router.post('/create-coupon', authMiddleware, isAdmin, createCoupon)
router.get('/get-all-coupons', authMiddleware, isAdmin, getAllCoupons)
router.put('/update-coupon/:id', authMiddleware, isAdmin, updateCouponById)
router.delete('/delete-coupon/:id', authMiddleware, isAdmin, deleteCouponById)

module.exports = router
