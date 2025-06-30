const Account = require('../app/models/Account');
const Role = require('../app/models/Role');

const handleGoogleLogin = async (profile) => {
    const email = profile.emails[0].value
    let user = await Account.findOne({ email: email })

    if (user) {
        if(user.loginType !== 'google') {
            return null; 
        }
        return user;
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
        return user;
    } 
}

module.exports = {
    handleGoogleLogin,
};