const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
    {
        type: {
            type: String, 
            enum:[
                'delete_post_request_denied',  // Yêu cầu xóa bài viết bị từ chối
                'delete_post_request_approved',  // Yêu cầu xóa bài viết được phê duyệt
                'post_deleted',  // Bài viết đã bị xóa
                'comment_on_post',  // Bình luận trên bài viết
                'post_liked',  // Bài viết được yêu thích
                'new_user_registered',  // Người dùng mới đăng ký
                'post_restored',  // Bài viết đã được khôi phục
                'system_notification',  // Thông báo hệ thống
                'violation_warning'  // Cảnh báo vi phạm
        ]   , 
            required: true
        }, 
        meta: { type: Object, required: true }, // Dữ liệu thông báo
        user_id: { type: String, required: true }, // Người nhận thông báo
        isRead: { type: Boolean, default: false }, // Trạng thái đã đọc hay chưa
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
