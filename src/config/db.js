// Using Node.js `require()`
const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Connect successfully!!!')

        const {autoSeed} = require('../database/seeder')
        await autoSeed() 
        console.log('Auto seed successfully!!!')

    } catch (error) {
        console.error('Connect failure!!!', error.message)
    }
}

module.exports = { connect } //Xuất đối tượng Object - sau này có thể có nhiều Object khác nữa (VD: disconnect())
// module.exports = connect => Xuất hàm function
