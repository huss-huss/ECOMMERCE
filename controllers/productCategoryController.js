const ProductCategory = require('../models/productCategoryModel')
const asyncHandler = require('express-async-handler')
const validateMongodbId = require('../utils/validateMongodbId')

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { title } = req.body
    const newCategory = await ProductCategory.create({ title })
    res.json(newCategory)
  } catch (error) {
    throw new Error(error)
  }
})

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title } = req.body
  try {
    const updateCategory = await ProductCategory.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    )
    res.json(updateCategory)
  } catch (error) {
    throw new Error(error)
  }
})

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  try {
    const deleteCategory = await ProductCategory.findByIdAndDelete(id)
    res.json(deleteCategory)
  } catch (error) {
    throw new Error(error)
  }
})

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params
  try {
    const getCategory = await ProductCategory.findById(id)
    res.json(getCategory)
  } catch (error) {
    throw new Error(error)
  }
})

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const getAllCategories = await ProductCategory.find()
    res.json(getAllCategories)
  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
}
