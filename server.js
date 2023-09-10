require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const dbConnect = require('./config/dbConnect')

const authRoute = require('./routes/authRoute')
const productRoute = require('./routes/productRoute')
const blogRoute = require('./routes/blogRoute')
const productCategoryRoute = require('./routes/productCategoryRoute')
const blogCategoryRoute = require('./routes/blogCategoryRoute')
const brandRoute = require('./routes/brandRoute')
const couponRoute = require('./routes/couponRoute')
const { notFound, errorHandler } = require('./middlewares/errorHandler')
const couponModel = require('./models/couponModel')

const app = express()
const PORT = process.env.PORT || 4000

dbConnect()
app.use(express.json())
app.use(cookieParser())
app.use(morgan())

app.use('/api/user', authRoute)
app.use('/api/product', productRoute)
app.use('/api/blog', blogRoute)
app.use('/api/product-category', productCategoryRoute)
app.use('/api/blog-category', blogCategoryRoute)
app.use('/api/brand', brandRoute)
app.use('/api/coupon', couponRoute)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}...`))
