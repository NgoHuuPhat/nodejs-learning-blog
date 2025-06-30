//Đọc file .env
require('dotenv').config()

const path = require('path')
const express = require('express')
const { engine } = require('express-handlebars')
const methodOverride = require('method-override') //Sử dụng các phương thức HTTP khác ngoài GET, POST (PUT, PATCH, DELETE)
const morgan = require('morgan')
const app = express()
const db = require('./config/db') //Ghi tắt vì trong db chỉ có 1 thư mục index.js
const route = require('./routes/client/index')
const routeAdmin = require('./routes/admin/index')
const port = process.env.PORT
const SortMiddleware = require('./app/middlewares/sortMiddleware')
const setLayout = require('./app/middlewares/setLayout')
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('passport')
require('./config/passport') 

// Sử dụng cookie-parse
app.use(cookieParser())

//Flash thông báo Alert (Middleware)
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    }),
)

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//TinyMCE
app.use('/tinymce', express.static(path.join(__dirname, '..', 'node_modules', 'tinymce')))

//Connect to DB
//{connect: function: connect}
db.connect()

//HTTP Logger
// app.use(morgan('dev'))

app.use(methodOverride('_method'))

//Custom Middleware
app.use(SortMiddleware)
app.use(setLayout)

//Template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        // Sử dụng helpers: Để tạo hàm sum index
        helpers: require('./helpers/handlebars'),
        defaultLayout: 'client',
    }),
)
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'resources', 'views')) //Hoặc có thể // nhưng nó có thể sai với hệ điều hành khác

console.log(path.join(__dirname, 'public'))
//Static file
app.use(express.static(path.join(__dirname, 'public'))) //Hoặc không dùng _dirname ('./src/public')

//Middleware body (POST method)
app.use(express.urlencoded({ extended: true })) //Sử dụng form để submit
app.use(express.json()) //Sử dụng code JS để submit

//Định nghĩa router xử lí yêu cầu HTTP (Ưu tiên đặt những router có link cụ thể ở trên)
routeAdmin(app)
route(app)

app.listen(port, () => {
    console.log(`🚀 App listening on http://localhost:${port}`)
})
