module.exports = (req, res, next) => {
  const authRoutes = ['/login', '/register', '/logout', '/refresh-token', '/forgot-password', '/verify-otp'];
  
  if (authRoutes.includes(req.url) || req.url.startsWith('/admin/auth')) {
    res.locals.layout = 'auth';
    return next(); 
  }

  if (req.url.startsWith('/admin')) {
    res.locals.layout = 'admin';  
  } else {
    res.locals.layout = 'client';
  }

  next();
};
