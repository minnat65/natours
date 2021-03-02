const express = require('express');
const router = express.Router({mergeParams: true}); //True to get parameters of another(tour) routes

const reviewControllers= require('./../controllers/reviewControllers');
const authControllers= require('./../controllers/authControllers');

router.use(authControllers.protect);

// POST /tour/:tourId/reviews or /reviews both can be done.
router
    .route('/')
    .get(reviewControllers.getReviews)
    .post(authControllers.restrictTo('user'),
        reviewControllers.setUserAndTourid,
        reviewControllers.createReview);

router
    .route('/:id')
    .get(reviewControllers.getOneReview)
    .patch(authControllers.restrictTo('user', 'admin'), reviewControllers.updateReview)
    .delete(authControllers.restrictTo('user', 'admin'), reviewControllers.deleteReview);

module.exports= router;