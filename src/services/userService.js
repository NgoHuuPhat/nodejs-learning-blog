const Account = require('../app/models/Account');
const Role = require('../app/models/Role');

const handleGoogleLogin = async (profile) => {
    const email = profile.emails[0].value
    let user = await Account.findOne({ email: email })

    if (user) {
        if(user.loginType !== 'google') {
            // Nếu người dùng đã đăng ký bằng email nhưng không phải qua Google
            return done(null, false, { message: 'Email này đã được sử dụng !' })
        }
    } else {
        // Lấy giá trị ID của role 'user'
        const role = await Role.findOne({ name: 'user' })
        
        user = await Account.create({
            fullName: profile.displayName,
            email: email,
            avatar: profile.photos[0].value,
            role_id: role._id, 
            status: 'active',
            loginType: 'google'
        })
    } 
}

module.exports = {
    handleGoogleLogin,
};