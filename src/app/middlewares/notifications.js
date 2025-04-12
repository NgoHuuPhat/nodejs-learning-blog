const Notification = require('../models/Notification');

module.exports = async function (req, res, next) {
    if(res.locals.account.id){
        const notifications = await Notification.find({user_id: res.locals.account.id}).lean()
        res.locals.notifications = notifications
        console.log(res.locals.notifications)
    }
    next()
    
}
