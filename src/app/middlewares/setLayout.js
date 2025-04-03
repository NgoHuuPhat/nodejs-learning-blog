module.exports = (req, res, next) => {
  if (req.url === '/login' || req.url === '/register' || req.url === '/logout' || req.url === '/refresh-token' || req.url.startsWith('/admin/auth')) {
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
