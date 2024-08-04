const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Define the user Schema

const userSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true
    },
    age: {
        type : Number,
        required : true
    },
    email: {
        type : String,
    },
    mobile: {
        type : String,
    },
    address: {
        type : String,
        required : true
    },
    aadharCardNumber: {
        type : Number,
        required: true,
        unique: true
    },
    password : {
        type : String,
        required: true
    },
    role : {
        type : String,
        enum: ['voter','admin'],
        default: 'voter'
    },
    isVoted: {
        type : Boolean,
        default : false
    }

})

userSchema.pre('save',  async function(next){
    const user = this;

    //Hash the password only if it has been modified (or is new)
    if(!user.isModified('password')) return next();
    try{
      //hash password generate
      const salt  = await bcrypt.genSalt(10);

      //hash password
      const hashPassword =  await bcrypt.hash(user.password, salt);

      //override the plan password with the hash password 
      user.password = hashPassword;
        next();
    }catch(err){
      return next(err);
    }
    
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
     const isMatch = await bcrypt.compare(candidatePassword, this.password);
     return isMatch;
    }catch(err){
      throw err;
    }
}


const User = mongoose.model('User', userSchema);
module.exports = User;