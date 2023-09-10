const BlogCategory = require('../models/blogCategoryModel')
const asyncHandler = require('express-async-handler')
const validateMongodbId = require('../utils/validateMongodbId')

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { title } = req.body
    const newCategory = await BlogCategory.create({ title })
    res.json(newCategory)
  } catch (error) {
    throw new Error(error)
  }
})

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title } = req.body
  try {
    const updateCategory = await BlogCategory.findByIdAndUpdate(
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
    const deleteCategory = await BlogCategory.findByIdAndDelete(id)
    res.json(deleteCategory)
  } catch (error) {
    throw new Error(error)
  }
})

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params
  try {
    const getCategory = await BlogCategory.findById(id)
    res.json(getCategory)
  } catch (error) {
    throw new Error(error)
  }
})

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const getAllCategories = await BlogCategory.find()
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
