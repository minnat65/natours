const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIfeatures = require('./../utils/apiFeatures');
//const { json } = require('express');

exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        //const deleted= await Tour.deleteOne({_id: req.params.id});
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No document is found', 404));
        };
        res.status(204).json({
            status: 'Deleted',
        });
    });

exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        //console.log('updating tours');
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(new AppError('document with this ID is not found', 404));
        };

        res.status(201).json({
            status: 'success',
            data: {
                updatedata: doc
            }
        });
    });

exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        //JSON.parse(req.body.startLocation);
        
        console.log(req.body)
        const doc = await Model.create(req.body);
        console.log(doc);
        res.status(201).json({
            status: 'success',
            data: {
                newdata: doc
            }
        })
    });

exports.getOne = (Model, popOption) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (popOption) query = query.populate(popOption);
        const doc = await query;
        //const toursData = await Model.findById(req.params.id).populate('reviews');

        if (!doc) {
            return next(new AppError('document is not found', 404));
        };
        res.status(200).json({
            status: 'Success',
            data: {
                data: doc
            }
        });
    });

exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
        console.log('user data.')
        //to allow for nested GET reviews of tour (Hack) 
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId };

        const features = new APIfeatures(Model.find(filter), req.query)
            .filter()
            .sorting()
            .limitFields()
            .paginate();
        //const doc = await features.query.explain();
        const doc = await features.query
        //sending respose
        res.status(200).json({
            status: 'Success',
            result: doc.length,
            data: {
                data: doc
            }
        });
    });
