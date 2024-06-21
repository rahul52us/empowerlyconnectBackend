import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    type : {
        type : String
    },
    message : {
        type : mongoose.Schema.Types.Mixed
    },
    createdAt : {
        type : Date,
        default : new Date()
    },
    updatedAt: {
        type : Date
    },
    deletedAt:{
        type : Date
    }
})

module.exports =  mongoose.model('Notification',notificationSchema)