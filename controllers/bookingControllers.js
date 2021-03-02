const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('./../models/modeltours');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory');
const Booking = require('./../models/modelBooking');

exports.getCheckoutSession = catchAsync(async(req, res, next) => {
    //1 Get currently booked tour
    const tour = await Tour.findById(req.params.tourId );
    //console.log(req.params.TravelDate);
    //2 create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,

        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
        }]
    })
    //3 create session as response
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = async (req, res, next)=>{
    const {tour, user, price, TravelDate} = req.query;

    if(!tour && !user && !price && !TravelDate) return next();
    await Booking.create({tour, user, price, TravelDate});

    res.redirect(req.originalUrl.split('?')[0]);
}

exports.getAllBookings = factory.getAll(Booking);
exports.createBookings = factory.createOne(Booking);
exports.getOnebooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
