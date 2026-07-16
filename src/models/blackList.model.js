const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required"],
        unique: [true, "token already exists in blacklist"]
    }
}, 
{
    timestamps:true
})

tokenBlacklistSchema.index({createdAt:1},{expireAfterSeconds: 60*60*24*7})

const tokenBlacklistModel = mongoose.model("tokenBlacklist",tokenBlacklistSchema);

module.exports = tokenBlacklistModel;

