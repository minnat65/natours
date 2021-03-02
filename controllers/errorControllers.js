const AppError = require('./../utils/appError');

const handleCastError = err => {
    const message = `Invalid ${err.path}: ${err.value} `;
    console.log(message);
    return new AppError(message, 400);
}

const handleJWTerror = () => {
    return new AppError('Invalid token, please log in', 401);
}
const handleExpiredToken = () => {
    return new AppError('Login time Expired, please login again', 401);
}
const appErrorDev = (err, req, res) => {
    //API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            Error: err,
            message: err.message,
            stack: err.stack
        });
    }
    console.error('Error:', err);
    //Render website
    return res.status(err.statusCode).render('error', {
        title: 'Oops, something went wrong.',
        msg: err.message
    })
}

const appErrorProd = (err, req, res) => {
    
    //API
    if (req.originalUrl.startsWith('/api')) {
        
        //Only operational error will be sent to client.
        if (err.isOperation) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
                Error: err.message,
            });
        } else {
            console.error('Error:', err); //for ourself to know the error

            //programming or other unknown error : don't leak this error to the client.
            res.status(err.statusCode).render('error', {
                title: 'Oops, something went wrong.',
                msg: err.message
            })
        }
    } else {
        
        //Rendered website
        if (err.isOperation) {
            res.status(err.statusCode).render('error', {
                title: 'Oops, something went wrong.',
                msg: err.message
            });
        } else {
            console.error('Error:', err); //for ourself to know the error

            //programming or other unknown error : don't leak this error to the client.
            res.status(err.statusCode).render('error', {
                title: 'Oops, something went wrong.',
                msg: 'Please Try Later.'
            })
        }
    }

}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        appErrorDev(err, req, res);

    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        if (error.name === 'CastError') {
            error = handleCastError(error);
            //console.log('cast error');
        }

        if (error.name === 'JsonWebTokenError') {
            error = handleJWTerror;
        }
        if (error.name === 'TokenExpiredError') {
            error = handleExpiredToken;
        }

        appErrorProd(error, req, res);
    }
    next();
}