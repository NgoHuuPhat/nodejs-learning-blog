
module.exports = (req, res, next) => {
    if (req.url.startsWith('/admin')) {
      res.locals.layout = 'admin';  // Set layout mặc định cho các route của admin
    }
    next();
  };
  