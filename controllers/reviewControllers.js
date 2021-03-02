const catchAsync = require('./../utils/catchAsync');
//const AppError = require('./../utils/appError');
const Review = require('./../models/modelReview');
const factory= require('./handleFactory');


//middleware
exports.setUserAndTourid = (req, res, next)=>{
    if(!req.body.tour) req.body.tour= req.params.tourId;
    if(!req.body.user) req.body.user= req.user.id;

    next();
}

exports.getReviews= factory.getAll(Review);
exports.getOneReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview= factory.updateOne(Review);
exports.deleteReview= factory.deleteOne(Review);