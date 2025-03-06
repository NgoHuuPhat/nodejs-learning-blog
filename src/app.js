const path = require('path')
const express = require('express')
const { engine } = require('express-handlebars')
const methodOverride = require('method-override') //Sử dụng các phương thức HTTP khác ngoài GET, POST (PUT, PATCH, DELETE)
const morgan = require('morgan')
const app = express()
const port = 3000

const SortMiddleware = require('./app/middlewares/sortMiddleware')

const route = require('./routes/index')
const db = require('./config/db') //Ghi tắt vì trong db chỉ có 1 thư mục index.js

//Connect to DB
//{connect: function: connect}
db.connect()

//HTTP Logger
app.use(morgan('dev'))

app.use(methodOverride('_method'))

//Custom Middleware
app.use(SortMiddleware)

//Template engine
app.engine('hbs', engine({ 
    extname: '.hbs',
    // Sử dụng helpers: Để tạo hàm sum index
    helpers: require('./helpers/handlebars')
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'resources','views')) //Hoặc có thể // nhưng nó có thể sai với hệ điều hành khác 

//Static file
app.use(express.static(path.join(__dirname, 'public'))) //Hoặc không dùng _dirname ('./src/public')

//Middleware body (POST method)
app.use(express.urlencoded({ extended: true })) //Sử dụng form để submit
app.use(express.json()) //Sử dụng code JS để submit

//Định nghĩa router xử lí yêu cầu HTTP GET đến /news
route(app)

app.listen(port, () => {
    console.log(`🚀 App listening on http://localhost:${port}`)
})
