const express = require('express');
const fs = require('fs');
const path= require('path') //builtin in express 
const helmet= require('helmet');

const morgan = require('morgan');
const rateLimit= require('express-rate-limit');
const mongoSanitize= require('express-mongo-sanitize');
const xss= require('xss-clean');
const hpp= require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');

//including our own module
const appError= require('./utils/appError');
const globalError = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRoutes.js');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

//express
const app = new express();

//setting template engine as pug in express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files through Middleware
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({limit: '10kb'})); //uploading data should be less than or equal to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb'}))
app.use(cookieParser());

//Data sanitization against NoSql query injection
app.use(mongoSanitize());

//Data sanitization against XSS(cross site scripting)
app.use(xss());

//prevent parameters pollution
app.use(hpp({
    whitelist:['duration', 'ratingsQuantity', 'ratingsAverage', 'difficulty', 'price', 'maxGoupSize']
}));

//set security HTTP header
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'http:', 'data:'],
        scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
      },
    })
  );

//Global middleware, development logging
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
}

//prevent Brute force attack from hackers
const rateLimiter= rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message: 'Too many request from this IP, please try after an hour'
})
app.use('/api', rateLimiter);

//app.use(morgan('dev')); //logger middleware

//Own middleware
app.use((req, res, next)=>{
  //console.log(req.params);
    next();
});

app.use(compression());

//Test middleware
/*app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.cookies);
    next();
});*/


//own middleware for tourRoute and userRoute
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

//Handling all the other url
//middleware execute by their order.
app.all('*', (req, res, next)=>{
    /*res.status(404).json({
        status: 'Failed',
        message: 'Page is not found.'
    });*/
    //console.log(req.params);
    const err= new appError('Page not Found', 404);
    //err.statusCode= 404;
    //err.status= 'failed';
    //err will be passed in the next error middleware.
    next(err);
});

app.use(globalError);

module.exports = app;