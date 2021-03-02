const User = require('./../models/modelusers');
const multer = require('multer');
const sharp = require('sharp'); //image processing library
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory');

const filterObj = (obj, ...allowedfield) => {
    const newobj = {};
    Object.keys(obj).forEach(el => {
        if (allowedfield.includes(el)) newobj[el] = obj[el];
    });
    return newobj;
}
/*
exports.GetUsers = catchAsync(async (req, res) => {
    const usersData = await User.find();
    //sending respose
    res.status(200).json({
        status: 'Success',
        result: usersData.length,
        data: {
            users: usersData
        }

    });
});*/
//Get current user
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}
//user update
exports.updateMe = catchAsync(async (req, res, next) => {

    //1 create error if user POSTed password
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('please use updatePassword link to update your password', 400));
    }
    //filter out unwanted field that is not allowed to changed
    const filterbody = filterObj(req.body, 'name', 'email'); //only name & email can be changed
    if (req.file) filterbody.photo = req.file.filename;
    //find user and update
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterbody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

//uploading images
//const multerStorage = multer.diskStorage({
    //cb stands for callback(it is like next function)
    /*destination: (req, file, cb) => {
        cb(null, 'public/img/users'); //null means No Error
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }*/

//});
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
exports.uploadPhoto = upload.single('photo');

//Resizing photo
exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if (!req.file) return next();

    //req.file.filename so we can use filename in anothr middleware
    req.file.filename= `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next();
})

//user deleting their account
exports.deleteMe = catchAsync(async (req, res, next) => {
    const deletedUser = await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'Deleted',
        data: {
            user: deletedUser
        }
    });
})

exports.CreateUser = factory.createOne(User);
/*
((req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Use Sign up, this route is not created.'
    });
});
*/
exports.GetUserById = factory.getOne(User);
exports.GetUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User); //don't use for update password
exports.deleteUser = factory.deleteOne(User);
