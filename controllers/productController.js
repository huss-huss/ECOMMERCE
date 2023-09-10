const Product = require('../models/productModel')
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const fs = require('fs')
const validateMongodbId = require('../utils/validateMongodbId')
const cloudinaryUploadImage = require('../utils/cloudinary')

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }

    const newProduct = await Product.create(req.body)
    res.json(newProduct)
  } catch (error) {
    throw new Error(error)
  }
})

const updateProductById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    validateMongodbId(id)
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    })
    res.json(updateProduct)
  } catch (error) {
    throw new Error(error)
  }
})

const deleteProductById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const product = await Product.findByIdAndDelete(id)
    res.json(product)
  } catch (error) {
    throw new Error(error)
  }
})

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const product = await Product.findById(id)
    res.json(product)
  } catch (error) {
    throw new Error(error)
  }
})

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObject = { ...req.query }
    //console.log(queryObject)
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach((el) => delete queryObject[el])
    console.log(queryObject)

    let queryStr = JSON.stringify(queryObject)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    //console.log(JSON.parse(queryStr))

    let query = Product.find(JSON.parse(queryStr))

    // Sorting
    if (req.query.sort) {
      //console.log(req.query.sort)
      const sortBy = req.query.sort.split(',').join(' ')
      //console.log(sortBy)
      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }

    // Limiting The Fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields)
    } else {
      query = query.select('-__v')
    }

    // Pagination
    const page = req.query.page
    const limit = req.query.limit
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)

    if (req.query.page) {
      const numProducts = await Product.countDocuments()
      if (skip >= numProducts) throw new Error('This page does not exist')
    }

    const products = await Product.find(query)
    res.json(products)
  } catch (error) {
    throw new Error(error)
  }
})

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { productId } = req.body
  try {
    const user = await User.findById(_id)
    const alreadyInWishlist = await user.wishlist.find(
      (item) => item.toString() === productId
    )
    if (alreadyInWishlist) {
      let user = await User.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: productId } },
        { new: true }
      )
      res.json(user)
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        { $push: { wishlist: productId } },
        { new: true }
      )
      res.json(user)
    }
  } catch (error) {
    throw new Error(error)
  }
})

const ratingProduct = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { productId, rating, comment } = req.body
  try {
    const product = await Product.findById(productId)
    let alreadyRated = await product.ratings.find(
      (item) => item.postedby.toString() === _id.toString()
    )
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        { ratings: { $elemMatch: alreadyRated } },
        { $set: { 'ratings.$.star': rating, 'ratings.$.comment': comment } },
        { new: true }
      )
    } else {
      const updateRating = await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: { star: rating, comment: comment, postedby: _id },
          },
        },
        { new: true }
      )
    }
    const getAllRating = await Product.findById(productId)
    let totalRating = getAllRating.ratings.length
    let ratingSum = getAllRating.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0)
    let averageRating = Math.round(ratingSum / totalRating)
    let finalProduct = await Product.findByIdAndUpdate(
      productId,
      { totalrating: averageRating },
      { new: true }
    )
    res.json(finalProduct)
  } catch (error) {
    throw new Error(error)
  }
})

const uploadProductImages = asyncHandler(async (req, res) => {
  //console.log(req.files)
  const { id } = req.params
  validateMongodbId(id)
  try {
    const uploader = (path) => cloudinaryUploadImage(path, 'images')
    const urls = []
    const files = req.files
    for (const file of files) {
      const { path } = file
      const newPath = await uploader(path)
      urls.push(newPath)
      fs.unlinkSync(path)
    }
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => file),
      },
      { new: true }
    )
    res.json(findProduct)
  } catch (error) {
    throw new Error(error)
  }
})

module.exports = {
  createProduct,
  getProductById,
  getAllProducts,
  updateProductById,
  deleteProductById,
  addToWishlist,
  ratingProduct,
  uploadProductImages,
}
