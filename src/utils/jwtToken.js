const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

//  create and send token and save in the cookie
const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production' ? true : false, // Uncomment this in production
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token
    });
};

 module.exports = sendToken;
 
 