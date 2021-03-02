const express = require('express');
const authControllers = require('./../controllers/authControllers');
const bookingControllers = require('./../controllers/bookingControllers');
const userControllers = require('./../controllers/userControllers');

const router = express.Router();

router.use(authControllers.protect);

router.get('/checkout-session/:tourId', bookingControllers.getCheckoutSession );

router.use(authControllers.restrictTo('admin', 'lead-guide'));
router
    .route('/')
        .get(bookingControllers.getAllBookings)
        .post(bookingControllers.createBookings);

router
    .route('/:id')
    .get(bookingControllers.getOnebooking)
    .patch(bookingControllers.updateBooking)
    .delete(bookingControllers.deleteBooking)

module.exports = router;