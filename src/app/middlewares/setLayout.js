module.exports = (req, res, next) => {
    const authRoutes = [
        '/user/login',
        '/user/register',
        '/user/logout',
        '/user/refresh-token',
        '/user/forgot-password',
        '/user/verify-otp',
    ]

    if (authRoutes.includes(req.url) || req.url.startsWith('/admin/auth')) {
        res.locals.layout = 'auth'
        return next()
    }

    if (req.url.startsWith('/admin')) {
        res.locals.layout = 'admin'
    } else {
        res.locals.layout = 'client'
    }

    next()
}
