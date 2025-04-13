const Notification = require('../models/Notification');

module.exports = async function (req, res, next) {
    if(res.locals.account.id){

        // Thông báo tổng hợp
        const notifications = await Notification.find({user_id: res.locals.account.id}).lean()
        res.locals.notifications = notifications

        // Lọc thông báo chưa đọc
        const unreadNotifications = await Notification.find({user_id: res.locals.account.id, isRead: false}).lean()
        res.locals.unreadNotifications = unreadNotifications
    }
    next()
    
}
