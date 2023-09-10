const Brand = require('../models/brandModel')
const asyncHandler = require('express-async-handler')
const validateMongodbId = require('../utils/validateMongodbId')

const createBrand = asyncHandler(async (req, res) => {
  try {
    const { title } = req.body
    const newBrand = await Brand.create({ title })
    res.json(newBrand)
  } catch (error) {
    throw new Error(error)
  }
})

const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title } = req.body
  try {
    const updateBrand = await Brand.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    )
    res.json(updateBrand)
  } catch (error) {
    throw new Error(error)
  }
})

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params
  try {
    const deleteBrand = await Brand.findByIdAndDelete(id)
    res.json(deleteBrand)
  } catch (error) {
    throw new Error(error)
  }
})

const getBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params
  try {
    const getBrand = await Brand.findById(id)
    res.json(getBrand)
  } catch (error) {
    throw new Error(error)
  }
})

const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const getAllBrands = await Brand.find()
    res.json(getAllBrands)
  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
  getAllBrands,
}
