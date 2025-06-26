module.exports = (req, res, next) => {
    const authRoutes = [
        '/user/login',
        '/user/register',
        '/user/logout',
        '/user/refresh-token',
        '/user/forgot-password',
        '/user/verify-otp',
    ]

    // Layout cho trang authentication
    if (authRoutes.includes(req.url) || req.url.startsWith('/admin/auth')) {
        res.locals.layout = 'auth'
        return next()
    }

    // Layout cho trang học bài
    if (req.url.startsWith('/learning')) {
        res.locals.layout = 'learning'
        return next()
    }

    // Layout cho trang admin
    if (req.url.startsWith('/admin')) {
        res.locals.layout = 'admin'
    } else {
        res.locals.layout = 'client'
    }

    next()
}
