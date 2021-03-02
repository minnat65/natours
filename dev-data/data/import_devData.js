const mongoose = require('mongoose');
const fs= require('fs');
const Tour= require('./../../models/modeltours');
const User= require('./../../models/modelusers');
const Review= require('./../../models/modelReview');

//require environment variable (npm)
const dotenv = require('dotenv');
const { deleteMany } = require('../../models/modeltours');

//including environment file
dotenv.config({ path: './../../config.env' });

//REPLACE the password as database_password.
const DB= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//connect Mongoose and it returns a Promise
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
}).then(con=>{
    //console.log(con.connections);
    console.log('DB connection successful');
});


const tours = JSON.parse(fs.readFileSync('tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('reviews.json', 'utf-8'));

//import data into DB
const importData= async ()=>{
    try{
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);
        console.log('Data successfuly loaded');
    } catch(err){
        console.log(err);
    }
    process.exit();
}

//Delete all data from DB
//Command for delete is node fileName.js --delete
const DeleteData= async ()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('DB deleted');
    } catch(err){
        console.log(err);
    }
    process.exit();
}

//console.log(process.argv);
if(process.argv[2]==='--import'){
    importData();
} else if(process.argv[2]==='--delete'){
    DeleteData();
}