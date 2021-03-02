const express = require('express');
const tourControllers = require('./../controllers/tourControllers');
const authControllers = require('./../controllers/authControllers');
//const reviewControllers = require('./../controllers/reviewControllers');
const reviewRouter = require('./reviewRoutes');

const route = express.Router();

//route.param('id', tourControllers.CheckId);

//POST /tour/skd238hhe334/reviews
route.use('/:tourId/reviews', reviewRouter);

route
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourControllers.getToursWithin);
//tour-within/5/center/-20,40/unit/km

route.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);

//routers
route
    .route('/top-5-tours')
    .get(tourControllers.aliastop5Tours, tourControllers.GetAlltours);

route
    .route('/aggregated')
    .get(tourControllers.getTourStats);

route
    .route('/')
    .get(tourControllers.GetAlltours) //authController.protect is a midldleware.
    .post(authControllers.protect,
        authControllers.restrictTo('admin', 'lead-guide'), //tour can be created by only admin and lead-guide
        //tourControllers.uploadTourImages,
        //tourControllers.resizeTourImages,
        tourControllers.CreateTours)

route
    .route('/:id')
    .get(tourControllers.GetToursByid)
    .patch(authControllers.protect,
        authControllers.restrictTo('admin', 'lead-guide'),
        tourControllers.uploadTourImages,
        tourControllers.resizeTourImages,
        tourControllers.UpdateTours)
    .delete(authControllers.protect,
        authControllers.restrictTo('admin', 'lead-guide'),
        tourControllers.DeleteTours)


//exporting a module
module.exports = route;