const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },

    username:{
        type:String,
        unique:true,
        sparse:true
    },

    bio:{
        type:String,
        default:""
    },

    profilePhoto:{
        type:String,
        default:"/images/default.png"
    },

    friends:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],

    // NEW — incoming friend requests
    friendRequests:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],

    isAdmin:{
        type:Boolean,
        default:false
    },
    resetToken:       { type: String },
    resetTokenExpiry: { type: Date }

});

module.exports = mongoose.model('User',userSchema);