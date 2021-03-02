const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./modelusers');
const Review = require('./modelReview');

//Creating a Schema in Mongoose
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A name must be enterd'],
        unique: true,
        minlength: [10, 'Tour name should be more than or equal to 10 letter'],
        maxlength: [40, 'Tour name should be less than or equal to 40 letter'],
        //validate: [validator.isAlpha, 'Tour name must contain Character']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have duration.'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have group size.'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty.'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: ['Difficulty should be either: easy, medium or difficult.'],
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Min rating should be 1.'],
        max: [5, 'max rating should be 5.'],
    },
    ratingQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'Price must be enterd'],//VALIDATOR

    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (value) {
                //this only point to current doc on new doc creation
                return value < this.price;
            },
            message: 'Discount price should be less than regular price'
        },
    },
    summary: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        //required: [true, 'A tour must have Cover-image.'],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false, //excluding this field from front end.
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
    },
    
    //array of location
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number,
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User' //It will take reference from User Schema and store only UserId as reference
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});
//tourSchema.index({price: 1});
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});

//Document Middleware. this will run only on .save() and .create() command
//here save is called Hook.
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true }); //slug is a string that is used in url.
    next();
});

//Embedding Tour guide, This can be done via referencing(look at )
/*tourSchema.pre('save', async function(next) {
    //guidePromises is an array of promises
    const guidePromises= this.guides.map( async id=> await User.findById(id)); //return user as promise
    this.guides= await Promise.all(guidePromises); 

    next();
})*/

/*tourSchema.post('save', function(doc, next){
    console.log(doc);
    next();
})*/

//QUERY middleware
tourSchema.pre(/^find/, function (next) { //regExp will match the string starting with 'find'.
    //console.log(this.name);
    this.start = Date.now();
    next();
});

//middleware to populate guides in every tours,
tourSchema.pre(/^find/, function (next) {
    //populate function will populate the data of 'guides' field at Query time,
    this.populate({
        path: 'guides',
        select: '-__v -passwordchangedAt' //this won't display these two fileds at querying
    });
    next();
})

tourSchema.post(/^find/, function (doc, next) {
    //console.log(doc);
    console.log(Date.now() - this.start);
    next();
});

//creating model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;