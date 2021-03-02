const express = require('express');
const router = express.Router();
const viewControllers = require('./../controllers/viewControllers');
const authControllers = require('./../controllers/authControllers');
const bookingControllers = require('./../controllers/bookingControllers');
const tourControllers = require('./../controllers/tourControllers');

router.get('/',
        bookingControllers.createBookingCheckout,
        authControllers.isLoggedin,
        viewControllers.getOverview);

router.get('/tour/:slug', authControllers.isLoggedin, viewControllers.getTour);
router.get('/login', authControllers.isLoggedin, viewControllers.login);
router.get('/signup', authControllers.isLoggedin, viewControllers.signup);
router.get('/me', authControllers.protect, viewControllers.getMe);
router.get('/my-tour', authControllers.protect, viewControllers.getMyTour);
router.get('/my-reviews', authControllers.protect, viewControllers.getMyReview);
router.get('/top-5-tours', authControllers.isLoggedin, viewControllers.getTop5Tours);

//Tour managements
router.get('/manage-tours', authControllers.isLoggedin, viewControllers.manageTours);
router.get('/manage-tours/create-tour', authControllers.isLoggedin,
                                        viewControllers.createTours);
router.get('/manage-tours/upload-cover-pic', authControllers.isLoggedin,
                                        viewControllers.updateTours);
router.get('/manage-tours/get-all-tours', authControllers.isLoggedin, viewControllers.getAllTours);
router.get('/manage-tours/update-tour/:tourId', authControllers.isLoggedin, viewControllers.updatetoursByAdmin);
router.get('/manage-tours/delete-tour/:tourId', authControllers.isLoggedin, viewControllers.deletetour);

//users management
router.get('/manage-users', authControllers.isLoggedin, viewControllers.manageUsers);
router.get('/manage-users/create-user', authControllers.isLoggedin, viewControllers.createUser);
router.get('/manage-users/update-user/:userId', authControllers.isLoggedin, viewControllers.updateUserByAdmin);
router.get('/manage-users/get-all-user', authControllers.isLoggedin,
                                          viewControllers.getAllUsers);
router.get('/manage-users/delete-user/:userId', authControllers.isLoggedin, viewControllers.deleteUser, viewControllers.getAllUsers);

//review managements
router.get('/manage-reviews', authControllers.isLoggedin, viewControllers.manageReviews);
router.get('/manage-reviews/get-all-review', authControllers.isLoggedin, viewControllers.getAllReviews)

router.post('/submit-user-data', authControllers.protect, viewControllers.updateUser);
//router.get('/add-review', authControllers.isLoggedin, viewControllers.addReview);

module.exports = router; 