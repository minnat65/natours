const express = require('express');
const multer = require('multer');
//const { CheckId } = require('../controllers/tourControllers');

const authControllers = require('./../controllers/authControllers');
const userControllers = require('./../controllers/userControllers');
const route = express.Router();

//route.param('id', userControllers.CheckId);

route.post('/signup', authControllers.signup);
route.post('/login', authControllers.login);
route.get('/logout', authControllers.logout);

route.post('/forgotPassword', authControllers.forgotPassword);
route.patch('/resetPassword/:token', authControllers.resetPassword);

//All the below req needs authentication called 'protect'.
//we can use middleware "route.use(authControllers.protect)" once, instead repeating it in every req;
route.use(authControllers.protect); //middleware works in sequence, so after this all the ewq will be protected
//route.patch('/updatePassword', authControllers.protect, authControllers.updatePassword);

route.patch('/updatePassword', authControllers.updatePassword);
route.get('/me', userControllers.getMe, userControllers.GetUserById);
route.patch('/updateMe',
    userControllers.uploadPhoto,
    userControllers.resizeUserPhoto,
    userControllers.updateMe);
    
route.delete('/deleteMe', userControllers.deleteMe);

route.use(authControllers.restrictTo('admin'));

route
    .route('/')
    .get(userControllers.GetUsers)
    .post(userControllers.CreateUser);

route
    .route('/:id')
    .get(userControllers.GetUserById)
    .delete(userControllers.deleteUser)
    .patch(userControllers.updateUser);

module.exports = route;