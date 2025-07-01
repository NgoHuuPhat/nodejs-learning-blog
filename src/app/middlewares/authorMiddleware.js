module.exports = async function authorMiddleware(req, res, next) {
    const account = res.locals.account

    // Trường hợp chưa đăng nhập hoặc không có tài khoản
    if (!account || account.role_name === 'user') {
        // Xóa cookie nếu có
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        // Trả về trang 404
        return res.status(404).render('partials/404', { layout: false })
    }

    // Được phép truy cập
    next()
}
