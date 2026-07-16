const userModel = require("../models/user.model");

const jwt  =require("jsonwebtoken");

const tokenBlacklistModel = require("../models/blackList.model")
// token check karna ki wo cookie or header me se kisme hai

async function authMiddleware(req,res,next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"unauthorized access token is missing",
        })
    }

    const isBlacklisted  =await tokenBlacklistModel.findOne({token})
    if(isBlacklisted){
        return res.status(401).json({
            message:"unauthorized access token is blacklisted",
        })
    }
    try{
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userId)
        if(!user){
            return res.status(401).json({
                message:"unauthorized access, user not found"
            })
        }

        req.user = user;

        return next();

    }catch(err){
        return res.status(401).json({
            message:"unauthorized user , token is invalid"
        })
    } 
}

async function authSystemUserMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"unauthorized access token is missing",
        })
    }

    const isBlacklisted  =await tokenBlacklistModel.findOne({token})
    if(isBlacklisted){
        return res.status(401).json({
            message:"unauthorized access token is blacklisted",
        })
    }
    try{

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        const systemUser = await userModel.findById(decoded.userId).select("+systemUser")
        if(!systemUser || !systemUser.systemUser){
            return res.status(401).json({
                message:"unauthorized access , system user not found"
            })
        }

        req.systemUser = systemUser;
        req.user = systemUser;
        return next();

    }
    catch(err){
        return res.status(401).json({
            message:"unauthorized user , token is invalid"
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}