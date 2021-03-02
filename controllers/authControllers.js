const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/modelusers');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const SignToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = SignToken(user._id);
    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
        //secure: true,
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

    res.cookie('jwt', token, cookieOption);
    //remove password field from output not from DB
    user.password = undefined;
    res.status(statusCode).json({
        status: 'Success',
        token,
        data: {
            user: user
        }
    })
}
exports.signup = catchAsync(async (req, res, next) => {
    //const newUser= await User.create(req.body);
    console.log('Signing up...');
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,

    });
    //send welcome email to the user
    const url=`${req.protocol}://${req.get('host')}/me`;
    //console.log(url);
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 202, res);
    
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1 check if mail & password is entered
    if (!email || !password) {
        return next(new AppError('Please enter Email and Password.'))
    }

    //2 check if password is correct and user exist or not?
    const user = await User.findOne({ email }).select('+password'); //select was false in ModelUsers therefore we need + sign to include here
    //console.log(user);
    let correct;
    if (user) {
        correct = await user.correctPassword(password, user.password);
    }

    if (!user || !correct) {
        return next(new AppError('Incorrect Email or Password', 401));
    }
    //3 if everything okay then send token to the client.
    createSendToken(user, 200, res);
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    })
}

exports.protect = catchAsync(async (req, res, next) => {
    //1 Getting token and checking if it is there?
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    
    if (!token) {
        return next(new AppError('Please Sign in before requesting', 401));
    }

    //2 verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //3 check if user still exist
    const fresh_user = await User.findById(decoded.id);
    //console.log(fresh_user);
    if (!fresh_user) {
        return next(new AppError('User does not exist anymore', 401));
    }

    //check if user changed password
    //if(fresh_user.changedpasswordAfter(decoded.iat)){

    // }

    //grant access to the user
    req.user = fresh_user;
    res.locals.user = fresh_user;
    next();
})

//only for rendered pages not for error.
exports.isLoggedin = async (req, res, next) => {
    //1 Getting token and checking if it is there?
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET);

            //3 check if user still exist
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            //check if user changed password

            //there is a logged in user
            res.locals.user = currentUser; //current user will be available in pug template
            return next();

        } catch (err) {
            console.log(err);
            return next();
        }
    }
    next();
}


exports.restrictTo = (...roles) => {
    
    return (req, res, next) => {
        //console.log(req.user);
        if (!roles.includes(req.user.role)) {
            //req.user data is coming from above(fresh_user) middleware
            return next(new AppError('You do not have permission to perform this action.', 403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1 get user by POSTed email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('Email does not exist', 404));
    }
    //2 generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //3 send it to user email
    try {
        
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('Error in email sending', 500));
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1 get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    //2 if token is not expired and user exist then reset password
    if (!user) {
        return next(new AppError('Token is expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3 Update changePasswordAt property for the users

    //4Log the user in and send JWT
    createSendToken(user, 201, res);

})

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1 Get user from collection
    const user = await User.findById(req.user.id).select('+password');


    //2 check if POSTed current password is same
    if (!await user.correctPassword(req.body.Currentpassword, user.password)) {
        return next(new AppError('Wrong password', 401));
    }
    //3 if everything okay then update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4 Log the user in and send JWT
    createSendToken(user, 200, res);

});