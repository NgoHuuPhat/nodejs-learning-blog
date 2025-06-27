const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const PostDeleteRequest = require('../../models/PostDeleteRequest')
const Payment = require('../../models/Payment')
const UserCourse = require('../../models/UserCourse')
const Lesson = require('../../models/Lesson')
const Chapter = require('../../models/Chapter')
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay')

class PaymentController {

    //[POST] /payment/:id
    async paymentDetails(req, res, next) {
        try {
            const courseId = req.params.id
            const userId = res.locals.account.id

            // Kiểm tra khóa học có tồn tại hay không
            const course = await Course.findById(courseId)
            if (!course) {
                req.flash('error', 'Khóa học không tồn tại')
                return res.redirect('back')
            }

            // Tạo mã đơn hàng duy nhất
            const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}` 

            // Tạo bản ghi thanh toán
            await Payment.create({
                user_id: userId,
                course_id: courseId,
                order_id: orderId,
                amount: course.price,
                status: 'pending', 
            })

            // Khởi tạo VNPay
                const vnpay = new VNPay({
                tmnCode: 'PV9XHY50',
                secureSecret: '1A8VUU8GVZ7GV2OVW8TS3QR8UXAQOXSE',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true,
                hashAlgorithm: 'SHA512',
                loggerFn: ignoreLogger,
            })
            const vnpayReponse = await vnpay.buildPaymentUrl({
                vnp_Amount: course.price, 
                vnp_IpAddr: '127.0.0.1',
                vnp_TxnRef: orderId, // Mã giao dịch duy nhất
                vnp_OrderInfo: `Thanh toán khóa học: ${course.title}`, 
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: 'http://localhost:3000/payment/vnpay-return', 
                vnp_Locale: VnpLocale.VN, 
                vnp_CreateDate: dateFormat(new Date()), 
                vnp_ExpireDate: dateFormat(new Date(Date.now() + 15 * 60 * 1000)), 
            })

            res.redirect(vnpayReponse)

        } catch (error) {
            next(error) 
        }         
    }

    //[GET] /payment/vnpay-return
    async vnpayReturn (req, res, next) {
        try {
            const { vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef, vnp_BankCode, vnp_PayDate} = req.query

            if( vnp_ResponseCode !== '00' || vnp_TransactionStatus !== '00') {
                req.flash('error', 'Thanh toán không thành công, vui lòng thử lại!')
                return res.redirect('back')
            }

            // Cập nhật trạng thái thanh toán
            const payment = await Payment.findOneAndUpdate(
                { 
                    order_id: vnp_TxnRef, 
                    status: 'pending' 
                },
                { status: 'completed', 
                    vnp_ResponseCode, 
                    bank_code: vnp_BankCode,
                    payDate:  new Date(vnp_PayDate)  // Chuyển đổi chuỗi ngày sang đối tượng Date
                },
                { new: true }
            )

            if (!payment) {
                req.flash('error', 'Thanh toán không hợp lệ hoặc đã được xử lý trước đó!')
                return res.redirect('back')
            }

            // Cập nhật trạng thái khóa học
            await UserCourse.create({
                user_id: payment.user_id,
                course_id: payment.course_id,
                order_id: payment._id,
                status: 'active',
            })

            // Lấy id lesson đầu tiên trong khóa học
            let lessonIdFirst = null
            const course = await Course.findById(payment.course_id)
            if (!course) {
                req.flash('error', 'Khóa học không tồn tại!')
                return res.redirect('back')
            }
            const firstChapter = await Chapter.findOne({ course_id: course._id }).sort({ _id: 1 })
            if (firstChapter) {
                const firstLesson = await Lesson.findOne({ chapter_id: firstChapter._id }).sort({ _id: 1 })
                if (firstLesson) {
                    lessonIdFirst = firstLesson._id
                }
            }

            // Thanh toán thành công trả về trang learning
            req.flash('success', 'Thanh toán thành công. Bắt đầu học thôi nào !!!  ')
            res.redirect(`/learning/${course.slug}?id=${lessonIdFirst}`)

        } catch (error) {
            next(error)
        }
    }
}

module.exports = new PaymentController()
