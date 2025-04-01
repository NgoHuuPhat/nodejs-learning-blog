module.exports = (req, res, next) => {
  if (req.url.startsWith('/admin/auth') || req.url.startsWith('/auth')) {
    res.locals.layout = 'auth';  // Layout cho trang authentication
    return next(); // Dừng lại ở đây nếu là auth
  }

  if (req.url.startsWith('/admin')) {
    res.locals.layout = 'admin';  // Layout cho trang admin
  } else {
    res.locals.layout = 'client'; // Layout mặc định cho client
  }

  next();
};
