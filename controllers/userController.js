const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const uniqid = require('uniqid')

const validateMongodbId = require('../utils/validateMongodbId')

const { generateAccessToken } = require('../config/jwtAccessToken')
const { generateRefreshToken } = require('../config/jwtRefreshToken')
const sendEmail = require('./emailController')

const createUser = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, mobile, password } = req.body

  const findUser = await User.findOne({ email })

  if (findUser) {
    throw new Error('User already exists')
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    mobile,
    password,
  })

  user.save()

  res.status(201).json({ msg: 'User created successfully', user })
})

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  //console.log(email, password)
  // Check if user exists

  const findUser = await User.findOne({ email })
  //console.log(findUser)
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id)
    const updateUser = await User.findByIdAndUpdate(
      findUser?._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    )
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })
    res.status(200).json({
      _id: findUser?._id,
      firstName: findUser?.firstName,
      lastName: findUser?.lastName,
      email: findUser?.email,
      mobile: findUser?.mobile,
      role: findUser?.role,
      token: generateAccessToken(findUser?._id),
    })
  } else {
    throw new Error('Invalid email or password')
  }
})

// Login admin

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  //console.log(email, password)
  // Check if user exists

  const findAdmin = await User.findOne({ email })
  //console.log(findAdmin)
  if (findAdmin.role !== 'admin') throw new Error('Not Authorized')
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id)
    const updateUser = await User.findByIdAndUpdate(
      findAdmin?._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    )
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })
    res.status(200).json({
      _id: findAdmin?._id,
      firstName: findAdmin?.firstName,
      lastName: findAdmin?.lastName,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      role: findAdmin?.role,
      token: generateAccessToken(findAdmin?._id),
    })
  } else {
    throw new Error('Invalid email or password')
  }
})

// update a user by id

const updateUserById = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user
    validateMongodbId(_id)
    const { firstName, lastName, email, mobile } = req.body
    const user = await User.findByIdAndUpdate(
      _id,
      {
        firstName,
        lastName,
        email,
        mobile,
      },
      {
        new: true,
      }
    )
    res.json(user)
  } catch (error) {
    throw new Error(error)
  }
})

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({})
    res.json(users)
  } catch (error) {
    throw new Error(error)
  }
})

// Get a user by id
const getUserById = asyncHandler(async (req, res) => {
  //console.log(req.params.id)
  try {
    const { id } = req.params
    validateMongodbId(id)
    const user = await User.findById({ _id: id })
    res.json(user)
  } catch (error) {
    throw new Error(error)
  }
})

// delete a user by id

const deleteUserById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  const user = await User.findByIdAndDelete({ _id: id })
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// block a user by id
const blockUserById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const blockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    )
    res.json(blockUser)
  } catch (error) {
    throw new Error(error)
  }
})

// unblock a user by id
const unblockUserById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const unblockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    )
    res.json(unblockUser)
  } catch (error) {
    throw new Error(error)
  }
})

// Handle Refresh Token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies
  //console.log(cookie)
  if (!cookie?.refreshToken) {
    throw new Error('No Refresh Token in cookie')
  }
  const { refreshToken } = cookie
  //console.log(refreshToken)
  const findUser = await User.findOne({ refreshToken })
  //console.log(findUser)
  if (!findUser) throw new Error('No Refresh Token in database or not matched')
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    //console.log(user)
    if (err || findUser._id.toString() !== user.id) {
      throw new Error(
        'Invalid Refresh Token or There is Something Wrong with the Refresh Token'
      )
    }
    const accessToken = generateAccessToken(user.id)
    res.json({ accessToken })
  })
})

const logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies
  if (!cookie?.refreshToken) {
    throw new Error('No Refresh Token in cookie')
  }
  const { refreshToken } = cookie
  const findUser = await User.findOne({ refreshToken })

  if (!findUser) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    })
    return res.status(204).json({ msg: 'User logged out successfully' })
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: ' ',
    }
  )
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  })
  res.status(204).json({ msg: 'User logged out successfully' })
})

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validateMongodbId(_id)
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(_id)
  if (user && (await user.isPasswordMatched(oldPassword))) {
    user.password = newPassword
    const updatedPassword = await user.save()
    res.json(updatedPassword)
  } else {
    throw new Error('Invalid Old Password or User not found')
  }
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('User not found')
  }
  try {
    const token = await user.createPasswordResetToken()
    await user.save()
    const resetURL = `Hi ${user.firstName} ${user.lastName},<br><br>Please click on the link below to reset your password:<br><br>${process.env.CLIENT_URL}/reset-password/${token}<br><br>If you did not request this, please ignore this email and your password will remain unchanged.<br><br>Thanks,<br>Team ${process.env.APP_NAME}`
    const data = {
      to: email,
      subject: `Password Reset Link for ${process.env.APP_NAME}`,
      text: resetURL,
      html: `<p>${resetURL}</p>`,
    }
    await sendEmail(data)
    res.json(token)
  } catch (error) {
    throw new Error(error)
  }
})

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })
  if (!user) {
    throw new Error('Token is invalid or has expired')
  }
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()
  res.json(user)
})

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validateMongodbId(_id)
  try {
    const findUser = await User.findById(_id).populate('wishlist')
    res.json(findUser)
  } catch (error) {
    throw new Error(error)
  }
})

const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validateMongodbId(_id)
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    )
    res.json(updatedUser)
  } catch (error) {
    throw new Error(error)
  }
})

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body
  const { _id } = req.user
  validateMongodbId(_id)
  try {
    let products = []
    const user = await User.findById(_id)
    const alreadyInCart = await Cart.findOne({ orderedby: user._id })
    if (alreadyInCart) {
      alreadyInCart.remove()
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {}
      object.product = cart[i]._id
      object.count = cart[i].count
      object.color = cart[i].color
      let getPrice = await Product.findById(cart[i]._id).select('price').exec()
      object.price = await getPrice.price
      products.push(object)
    }
    const cartTotal = products.reduce((acc, curr) => {
      return acc + curr.price * curr.count
    }, 0)
    //console.log(cartTotal, products)
    const newCart = await new Cart({
      products,
      cartTotal,
      orderedby: user._id,
    }).save()
    res.json(newCart)
  } catch (error) {
    throw new Error(error)
  }
})

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validateMongodbId(_id)
  try {
    const user = await User.findById(_id)
    const cart = await Cart.findOne({ orderedby: user._id })
      .populate('products.product', '_id title price totalAfterDiscount')
      .exec()
    res.json(cart)
  } catch (error) {
    throw new Error(error)
  }
})

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validateMongodbId(_id)
  try {
    const user = await User.findById(_id)
    const cart = await Cart.findOneAndRemove({ orderedby: user._id })
    res.json(cart)
  } catch (error) {
    throw new Error(error)
  }
})

const applyCouponToUserCart = asyncHandler(async (req, res) => {
  const { coupon } = req.body
  const { _id } = req.user
  try {
    const validCoupon = await Coupon.findOne({ name: coupon })
    if (!validCoupon) {
      throw new Error('Invalid Coupon')
    }
    const user = await User.findById(_id)
    const { products, cartTotal } = await Cart.findOne({
      orderedby: user._id,
    }).populate('products.product', '_id title price')
    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2)
    await Cart.findOneAndUpdate(
      { orderedby: user._id },
      { totalAfterDiscount },
      { new: true }
    )
    res.json(totalAfterDiscount)
  } catch (error) {
    throw new Error(error)
  }
})

const createOrder = asyncHandler(async (req, res) => {
  const { COO, couponApplied } = req.body
  const { _id } = req.user
  validateMongodbId(_id)
  try {
    if (!COO) throw new Error('Create Cash Order Failed')
    const user = await User.findById(_id)
    const { products, cartTotal, totalAfterDiscount } = await Cart.findOne({
      orderedby: user._id,
    })
    let finalAmount =
      couponApplied && totalAfterDiscount ? totalAfterDiscount : cartTotal

    const newOrder = await new Order({
      products,
      paymentIntent: {
        id: uniqid(),
        method: 'COO',
        amount: finalAmount,
        status: 'Cash On Delivery',
        created: Date.now(),
        currency: 'usd',
      },
      orderedby: user._id,
      orderStatus: 'Cash On Delivery',
    }).save()

    let update = products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      }
    })

    const updated = await Product.bulkWrite(update, {})
    res.json({
      message: 'Order Placed Successfully',
    })
  } catch (error) {
    throw new Error(error)
  }
})

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validateMongodbId(_id)
  try {
    const userOrders = await Order.find({ orderedby: _id })
      .populate('products.product')
      .exec()
    res.json(userOrders)
  } catch (error) {
    throw new Error(error)
  }
})

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const { id } = req.params
  validateMongodbId(id)
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    )
    res.json(updatedOrder)
  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  createUser,
  loginUser,
  loginAdmin,
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
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCouponToUserCart,
  createOrder,
  getOrders,
  updateOrderStatus,
}
