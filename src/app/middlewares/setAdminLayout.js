module.exports = (req, res, next) => {
  if (req.url.startsWith('/admin/auth')) {
      return next(); // Bỏ qua nếu là route auth
  }
  if (req.url.startsWith('/admin')) {
      res.locals.layout = 'admin';  // Đặt layout admin
  }
  next();
};
