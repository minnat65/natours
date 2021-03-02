const Tour = require('./../models/modeltours');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/modelusers');
const Booking = require('./../models/modelBooking');
const Review = require('./../models/modelReview');
const axios = require('axios');

//const authControllers = require('./authControllers');
//const csp = "default-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com; base-uri 'self'; block-all-mixed-content; connect-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com/ https://*.mapbox.com/; font-src 'self' https://fonts.google.com/ https: data:;frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com/ https://api.mapbox.com/ blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;";


exports.getOverview = catchAsync(async (req, res, next) => {
    //1 get Tour data from collection
    const tours = await Tour.find();

    //2 Build template
    //3 Render that template using 1
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
});

exports.getTour = catchAsync(async (req, res, next) => {
    //get the data for requested tour(including guide and review)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if (!tour) {
        return next(new AppError('There is no tour with that name.'))
    }
    res.status(200).render('tour', {
        title: `${tour.name}`,
        tour
    })
});

exports.signup = catchAsync(async (req, res, next) => {
    res.status(200).render('signUp', { title: 'Sign Up' });
})

exports.login = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'log in'
    })
});

exports.getMe = (req, res, next) => {
    res.status(200).render('account', { title: 'My account' })
}

exports.getMyTour = catchAsync(async (req, res, next) => {
    //1 find all bookings of current users
    const bookings = await Booking.find({ user: req.user.id });

    //2 find tours with return id.
    const tourId = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourId } });
    tours.addreview = true;
    //console.log(tours.review);
    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
});
/*exports.addReview = async(req, res, next)=>{
    const tour = await Tour.findById(req.param.id);
    console.log(tour);
    res.status(200).render('tour', {
        tour
    })
}
*/
exports.getMyReview = async (req, res, next) => {
    const reviews = await Review.find({ user: req.user.id });
    //console.log(reviews.tour);
    const tourId = reviews.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourId } });
    const tourNames = await tours.map(el => el.name);
    //console.log(reviews);

    res.status(200).render('myReview', {
        title: 'My Reviews',
        reviews,
        tourNames
    })
}

exports.updateUser = async (req, res, next) => {
    const updateData = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    },
        {
            new: true,
            runValidators: true
        });
    res.status(200).render('account', { title: 'My account' });
}

exports.getTop5Tours = async (req, res, next) => {
    try {
        const result = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/tours/top-5-tours',

        })
        const tours = result.data.data.data
        res.status(200).render('top5tour', {
            title: 'Top-5-Tours',
            tours
        });

    } catch (err) {
        console.log(err);
    }
}

//Tour managements
exports.manageTours = (req, res, next) => {
    res.status(200).render('manageTours', {
        title: 'Tours management'
    })
}
exports.getAllTours = async (req, res, next)=>{
    const tours = await Tour.find();

    res.status(200).render('allTourForAdmin', {
        title: 'All Tours',
        tours
    })
}

exports.createTours = (req, res, next) => {
    res.status(200).render('createTour', {
        title: 'Create Tour'
    })
}

exports.updateTours = (req, res, next) => {
    res.status(200).render('CoverImageUpload', {
        title: 'Update Tour'
    })
}

exports.updatetoursByAdmin = async (req, res, next)=>{
    const tour = await Tour.findById(req.params.tourId);
    res.status(200).render('updateTourByAdmin', {
        title: `tour.name`,
        tour
    })
}
exports.deletetour = async (req, res, next)=>{
    try{
        console.log(req.params.tourId)
        const tour = await Tour.findByIdAndDelete(req.params.tourId);
        //console.log(tour, 'deleted...')
        const tours = await Tour.find();
        res.status(200).render('allTourForAdmin', {
        title: 'All Tours',
        tours
    })
    } catch(err){
        console.log(err);
    }
    
}

exports.manageUsers = (req, res, next) => {
    res.status(200).render('manageUsers', {
        title: 'Users management',
        temp: 'user'
    })
}

exports.createUser = (req, res, next) => {
    res.status(200).render('createUser', {
        title: 'Create User',
    })
}

exports.updateUserByAdmin = async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    //console.log(req.body);

    res.status(200).render('updateUser', {
        title: 'Users',
        user
    })
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).render('userOverview', {
            title: 'Users',
            users
        })
    } catch (err) {
        console.log(err);
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const deletedUser = await User.findByIdAndDelete(userId);

        next();
    } catch (err) {
        console.log(err);
    }
}

//Review management

exports.manageReviews = (req, res, next) => {
    res.status(200).render('manageUsers', {
        title: 'Review Manage',
        temp: 'review'
    })
}

exports.getAllReviews = async (req, res, next)=>{
    const reviews = await Review.find();

    res.status(200).render('myReview', {
        title: 'All Reviews',
        reviews
    })
}