module.exports = async function authorMiddleware(req, res, next){
    const account = res.locals.account
    if(account.role_name === 'user'){

        //Xóa cookie accessToken và refreshToken
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        //Trả về trang 404 nếu không có quyền truy cập 
        res.status(404).render('partials/404', { layout: false }); 
    }
    next()
}