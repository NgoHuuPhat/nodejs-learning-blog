// Using Node.js `require()`
const mongoose = require('mongoose');

async function connect(){

    try {
        await mongoose.connect('mongodb://localhost:27017/f8_education_dev');
        console.log('Connect successfully!!!')
    } catch (error) {
        console.log('Connect failure!!!')
    }
}

module.exports = { connect } //Sử dụng export Object để sau này có thể có nhiều Object khác nữa (VD: disconnect())