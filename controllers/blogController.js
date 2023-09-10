const Blog = require('../models/blogModel')
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')
const fs = require('fs')
const validateMongodbId = require('../utils/validateMongodbId')
const cloudinaryUploadImage = require('../utils/cloudinary')

const createBlog = asyncHandler(async (req, res) => {
  try {
    const { title, description, category, image, author } = req.body
    const newBlog = await Blog.create({
      title,
      description,
      category,
      image,
      author,
    })
    res.json(newBlog)
  } catch (error) {
    throw new Error(error)
  }
})

const updateBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const { title, description, category, image, author } = req.body
    const updateBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        image,
        author,
      },
      { new: true }
    )
    res.json(updateBlog)
  } catch (error) {
    throw new Error(error)
  }
})

const deleteBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const deleteBlog = await Blog.findByIdAndDelete(id)
    res.json(deleteBlog)
  } catch (error) {
    throw new Error(error)
  }
})

const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
    const findBlog = await Blog.findById(id)
      .populate('likes')
      .populate('dislikes')
    const updatedViews = await Blog.findByIdAndUpdate(
      id,
      { $inc: { numViews: 1 } },
      { new: true }
    )
    res.json(findBlog)
  } catch (error) {
    throw new Error(error)
  }
})

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find()
    res.json(blogs)
  } catch (error) {
    throw new Error(error)
  }
})

const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body
  validateMongodbId(blogId)
  // console.log(blogId)
  const loginUserId = req?.user?._id

  const blog = await Blog.findById(blogId)
  const isLiked = await blog?.isLiked
  //console.log(isLiked, blog, loginUserId)
  const alreadyDisliked = await blog?.dislikes?.find(
    (userId) => userId.toString() === loginUserId.toString()
  )

  if (alreadyDisliked) {
    const removeDislike = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { dislikes: loginUserId }, isDisliked: false },
      { new: true }
    )
    res.json(removeDislike)
  }

  if (isLiked) {
    const removeLike = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { likes: loginUserId }, isLiked: false },
      { new: true }
    )
    res.json(removeLike)
  } else {
    const addLike = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { likes: loginUserId }, isLiked: true },
      { new: true }
    )
    res.json(addLike)
  }
})

const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body
  // console.log(blogId)
  validateMongodbId(blogId)
  const loginUserId = req?.user?._id

  const blog = await Blog.findById(blogId)
  const isDisliked = await blog?.isDisliked
  const alreadyLiked = await blog?.likes?.find(
    (userId) => userId.toString() === loginUserId.toString()
  )
  if (alreadyLiked) {
    const removeLike = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { likes: loginUserId }, isLiked: false },
      { new: true }
    )
    res.json(removeLike)
  }
  if (isDisliked) {
    const removeDislike = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { dislikes: loginUserId }, isDisliked: false },
      { new: true }
    )
    res.json(removeDislike)
  } else {
    const addDislike = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { dislikes: loginUserId }, isDisliked: true },
      { new: true }
    )
    res.json(addDislike)
  }
})

const uploadBlogImages = asyncHandler(async (req, res) => {
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
    const findBlogs = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => file),
      },
      { new: true }
    )
    res.json(findBlogs)
  } catch (error) {
    throw new Error(error)
  }
})
module.exports = {
  createBlog,
  updateBlogById,
  getBlogById,
  getAllBlogs,
  deleteBlogById,
  likeBlog,
  dislikeBlog,
  uploadBlogImages,
}
