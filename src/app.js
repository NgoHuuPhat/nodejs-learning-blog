const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override')
const morgan = require('morgan');
const app = express();
const port = 3000;

const route = require('./routes/index');
const db = require('./config/db'); //Ghi tắt vì trong db chỉ có 1 thư mục index.js

//Connect to DB
//{connect: function: connect}
db.connect();

//HTTP Logger
app.use(morgan('combined'));

app.use(methodOverride('_method'))

//Template engine
app.engine('hbs', engine({ 
    extname: '.hbs',
    // Sử dụng helpers: Để tạo hàm sum index
    helpers: {
        sum: (a,b) => a + b
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources','views'));

//Static file
app.use(express.static(path.join(__dirname, 'public'))); //Hoặc không dùng _dirname ('./src/public')

//Middleware body (POST method)
app.use(express.urlencoded({ extended: true })); //Sử dụng form để submit
app.use(express.json()); //Sử dụng code JS để submit

//Định nghĩa router xử lí yêu cầu HTTP GET đến /news
route(app);

app.listen(port, () => {
    console.log(`🚀 App listening on http://localhost:${port}`);
});
