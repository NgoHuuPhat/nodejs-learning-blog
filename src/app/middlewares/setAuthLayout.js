module.exports = (req, res, next) => {
  if (req.url.startsWith('/admin/auth')) {
      res.locals.layout = 'auth';  // Đặt layout auth
  }
  next();
};
