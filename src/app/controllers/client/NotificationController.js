const Notification = require('../../models/Notification')

class NotificationController {

    //[PATCH] notifications/:id/:read
    async isRead(req, res, next) {
        try {
            if(req.params.id){
                await Notification.updateOne(
                    { _id: req.params.id },
                    { $set: { isRead: true } },
                )
            }
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] notifications/readAll
    async readAll(req, res, next) {
        try {

            if(res.locals.account.id){
                await Notification.updateMany(
                    { user_id: res.locals.account.id },
                    { $set: { isRead: true } },
                )
            }
            
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    
}

module.exports = new NotificationController()
