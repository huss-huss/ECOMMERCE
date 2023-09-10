const Coupon = require('../models/couponModel')
const asyncHandler = require('express-async-handler')
const validateMongodbId = require('../utils/validateMongodbId')

const createCoupon = asyncHandler(async (req, res) => {
  const { name, expiry, discount } = req.body
  try {
    const newCoupon = await Coupon.create({
      name,
      expiry,
      discount,
    })
    res.status(201).json(newCoupon)
  } catch (error) {
    throw new Error(error)
  }
})

const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find({})
    res.json(coupons)
  } catch (error) {
    throw new Error(error)
  }
})

const updateCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const { name, expiry, discount } = req.body
    const updateCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        name,
        expiry,
        discount,
      },
      { new: true }
    )
    res.json(updateCoupon)
  } catch (error) {
    throw new Error(error)
  }
})

const deleteCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const deleteCoupon = await Coupon.findByIdAndDelete(id)
    res.json(deleteCoupon)
  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  createCoupon,
  getAllCoupons,
  updateCouponById,
  deleteCouponById,
}
