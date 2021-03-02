const mongoose= require('mongoose');
const validator= require('validator');
const bcrypt= require('bcryptjs');
const crypto = require('crypto'); //crypto is built in node module

const userSchema= new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your Name.'],

    },
    email:{
        type: String,
        required: [true, 'Please enter your email.'],
        unique: true,
        lowercase: true,
        validate:[validator.isEmail, 'Please enter a valid Email.'],
    },
    photo:{
        type: String,
        default: 'default.jpg'
    },
    role:{
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true, 'enter password'],
        minlength: 8,
        select: false
    },
    passwordConfirm:{
        type: String,
        required: true,
        validate:{
            //This only works on save and Create
            validator: function(element){
                return element===this.password; //return True if it is same.
            },
            message: 'Password is not same.'
        }
    },
    passwordchangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
});

//Query middleware
userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next();
})

//execute before save 
userSchema.pre('save', async function(next){
    //Runs when password modified
    if(!this.isModified('password')) return next();
    
    //Hash the password with the cost of 12
    this.password= await bcrypt.hash(this.password, 12);
    //delete the passwordconfirm field
    this.passwordConfirm= undefined;
    next();
});
userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordchangedAt= Date.now()-1000;
    next();
})

//Creating an instance method that will be available for all the documents of this file
userSchema.methods.correctPassword= async function(candidatePassword, userPassword){
    //return true if password will be correct and then only user can logged in.
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedpasswordAfter= function(JWTTimestamp){
    if(this.passwordchangedAt){
        //console.log(passwordchangedAt);
    }

    return false;
}

userSchema.methods.createPasswordResetToken= function(){
    const resetToken= crypto.randomBytes(32).toString('hex');

    this.passwordResetToken= crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires= Date.now()+10*60*1000;
    
    return resetToken;
}

const User= mongoose.model('User', userSchema);

module.exports= User;