const mongoose = require('mongoose');
const Tour = require('./modeltours');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Please enter your review']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: ['true', 'Review must belongs t a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: ['true', 'Review must belongs to a user']
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
reviewSchema.index({tour: 1, user: 1}, {unique: true});

reviewSchema.pre(/^find/, function (next) {
    this./*populate({
        path: 'tour',
        select: 'name'
    }).*/populate({
        path: 'user',
        select: 'name photo'
    })

    next();
})

reviewSchema.statics.calcAverageRatings = async function(tourId){
    //agregate returns a promise
    const stats= await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating:{ $sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ]);
    console.log(stats);
    //leaving it for later
    if(stats.length > 0){
        await mongoose.model('Tour').findByIdAndUpdate(tourId, {
            ratingQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating.toFixed(1)
          });
    } else{
        await mongoose.model('Tour').findByIdAndUpdate(tourId, {
            ratingQuantity: 0,
            ratingsAverage: 4.5
          });
    }
    
};
reviewSchema.post('save', function(){
    //this point to current schema
    this.constructor.calcAverageRatings(this.tour);
})
//this is a query middleware.
reviewSchema.pre(/^findOneAnd/, async function(next){
    //this.r will be available after query has been executed.
    //we cannot use POST middleware here because Query won't be available.
    this.r = await this.findOne();
    console.log(this.r);
    next();
});
reviewSchema.post(/^findOneAnd/, async function(){
    //this.r = await this.findOne(); Does not available. Query has already executed.
    
    this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;