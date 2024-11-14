const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const morgan = require('morgan');
const app = express();
const port = 3000;

const route = require('./routes/index');

//HTTP Logger
app.use(morgan('combined'));

//Template engine
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'resources/views'));

//Static file
app.use(express.static(path.join(__dirname, 'public'))); //Hoặc không dùng _dirname ('./src/public')

//Middleware body (POST method)
app.use(express.urlencoded({ extended: true })); //Sử dụng form để submit
                                   app.use(express.json()); //Sử dụng code JS để submit

//Định nghĩa router xử lí yêu cầu HTTP GET đến /news
route(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
