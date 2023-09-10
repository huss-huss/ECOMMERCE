const express = require('express')
const {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
  blockUserById,
  unblockUserById,
  handleRefreshToken,
  logoutUser,
  updatePassword,
  forgotPassword,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCouponToUserCart,
  createOrder,
  getOrders,
  updateOrderStatus,
} = require('../controllers/userController')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddlewares')
const router = express.Router()

router.post('/register', createUser)
router.post('/login', loginUser)
router.post('/admin-login', loginAdmin)
router.post('/forgot-password', forgotPassword)
router.post('/user-cart', authMiddleware, userCart)
router.post('/cart/apply-coupon', authMiddleware, applyCouponToUserCart)
router.post('/cart/cash-order', authMiddleware, createOrder)

router.get('/all-users', getAllUsers)
router.get('/refresh', handleRefreshToken)
router.get('/logout', logoutUser)
router.get('/wishlist', authMiddleware, getWishlist)
router.get('/user-cart', authMiddleware, getUserCart)
router.get('/get-orders', authMiddleware, getOrders)
router.get('/:id', authMiddleware, isAdmin, getUserById)

router.put('/reset-password/:token', resetPassword)
router.put('/update-password', authMiddleware, updatePassword)
router.put('/save-address', authMiddleware, saveAddress)
router.put('/edit-user', authMiddleware, updateUserById)
router.put('/block-user/:id', authMiddleware, isAdmin, blockUserById)
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUserById)
router.put(
  '/order/update-order-status/:id',
  authMiddleware,
  isAdmin,
  updateOrderStatus
)

router.delete('/remove-cart', authMiddleware, emptyCart)
router.delete('/:id', deleteUserById)

module.exports = router
