//console.log(process.env);
const mongoose = require('mongoose');
//require environment variable (npm)
const dotenv = require('dotenv');
//including environment file
dotenv.config({ path: './config.env' });

const app= require('./app');

//REPLACE the password as database_password.
const DB= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//connect Mongoose and it returns a Promise
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
}).then(con=>{
    //console.log(con.connections);
    console.log('DB connection successful');
});


const port = 3000;
const server = app.listen(port, () => {

    console.log('App is running....');
});

process.on('unhandledRejection', err =>{
    console.log(err.name, err.message);
    console.log('Unhandled Rejection, Server is shutting down...');
    server.close(()=>{
        process.exit(1);
    })
})
