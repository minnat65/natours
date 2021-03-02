const Tour = require('./../models/modeltours');
const multer = require('multer');
const sharp = require('sharp'); //image processing library
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory');

//middleware to get top-5-tours
exports.aliastop5Tours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage, price';
    //req.query.fields = 'name, price, ratingAverage, summary, difficulty, ratingQuantity, imageCover';
    next();
}

//uploading tour images
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('File is not image. please upload an image', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([
    { 'name': 'imageCover', maxCount: 1 },
    { 'name': 'images', maxCount: 3 }
]);
//upload.single('image') req.file
//upload.array('images') req.files

exports.resizeTourImages = async (req, res, next) => {
    //console.log(req.files);
    //console.log(req.user.id);
    //if (!req.files.imageCover || !req.files.images) return next();
    //1 Cover image
    //req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    req.body.imageCover = `tour-${req.user.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);
    console.log(req.body.imageCover);
    //2 images
    req.body.images = [];
    if (req.files.images) {
        await Promise.all(req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        }));
    }
    next();
}

/*exports.CheckId = (req, res, next, val) => {

    //console.log(id);
    if (val > toursData.length || val < 0) {
        res.status(404).json({
            status: 'Failed',
            message: 'Invalid ID'
        });
    }
    console.log(val);
    next();
}*/

//Catch the error of all Async function to get rid of Try catch block.
/*const catchAsync= fn=>{
    return (req, res, next)=>{
        fn(req, res, next).catch(next);
    }
};*/

//console.log(toursData[toursData.length-1].id);

//Build the query and Filtering
/*const queryObj = { ...req.query }; //make an independent object
const excludeFileds = ['page', 'limit', 'sort', 'fields']; //an array of 4 elements
excludeFileds.forEach(el => delete queryObj[el]);

//Advance filtering
let queryStr = JSON.stringify(queryObj);
queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //replace gte to $gte through RegEx

//console.log(JSON.parse(queryStr));
let query = Tour.find(JSON.parse(queryStr)); //find() will return an array of elements or object.
*/
//Execute query

exports.GetAlltours = factory.getAll(Tour);
exports.GetToursByid = factory.getOne(Tour, { path: 'reviews' });

/* exports.GetToursByid = catchAsync(async (req, res, next) => {
    const id = req.params.id * 1;
    /*const tours_id = toursData.find(el => {
        if (el.id == id)
            return el;
    });
    const toursData = await Tour.findById(req.params.id).populate('reviews');
    if(!toursData){
        return next(new AppError('ID is not found', 404));
    };
    res.status(200).json({
        status: 'Success',
        data: {
            tours: toursData
        }
    });
});*/

exports.CreateTours = factory.createOne(Tour);
exports.UpdateTours = factory.updateOne(Tour);
exports.DeleteTours = factory.deleteOne(Tour);

/*exports.DeleteTours = catchAsync(async (req, res, next) => {
    //const deleted= await Tour.deleteOne({_id: req.params.id});
    const toursData= await Tour.findByIdAndDelete(req.params.id);
})*/

exports.getTourStats = catchAsync(async (req, res, next) => {

    const stat = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                Num_of_Tours: { $sum: 1 },
                avgRating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                MaxPrice: { $max: '$price' }
            }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            tour: stat
        }
    });
});

//tours-within/:distance/center/:latlng/unit/:unit'
//tours-within/5/center/22.526420, 88.399443/unit/km
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit == 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        return next(new AppError('please provide latitude and longitude in the format of lat, long', 400));
    }
    console.log(distance, lat, lng, unit, radius);

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit == 'mi' ? 0.000621371 : 0.001

    if (!lat || !lng) {
        return next(new AppError('please provide latitude and longitude in the format of lat, long', 400));
    }
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            //only selected field will be visible after searching
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
});