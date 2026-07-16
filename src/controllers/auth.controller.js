const userModel  =require("../models/user.model")
const emailService = require("../services/email.service")
const tokenBlacklistModel = require("../models/blackList.model")
const jwt = require("jsonwebtoken");
//register user controller
/**
 * - user register controller 
 * - POST /api/auth/register
 */
async function userRegisterController(req,res){

    const {email, password, name, systemUser} =req.body;

    //validate the input field 
    const isExist = await userModel.findOne({
        email:email
    })
    if(isExist){ 
        return res.status(422).json({
            message:"user already exist",
            status:"failed"
        })
    }
    //if user not exist then create new
    const user = await userModel.create({
        email:email,
        password:password,
        name:name,
        systemUser: systemUser
    })

    //create token and is token ko set karne ke liye hame cookies ka use karna hoga
    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})//iske liye ek privet key lagegi 
    res.cookie("token",token)

    // Send registration email
    try {
        await emailService.sendRegistrationEmail(user.email, user.name);
    } catch (emailError) {
        console.error("Error sending registration email:", emailError);
    }

    //jab bhi new resourse create hoga to respone code 201 bhejte hai
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
}
/**
 * _user login controller
 * _post /api/auth/Login
 */
async function userLoginController(req,res) {

    const {email,password} = req.body; //req. body se email password milega
    // ab isko verify karna hai
    const user = await userModel.findOne({email}).select("+password") //password ko isliye select karwana taaki compare kar sake 
    if(!user){
        return res.status(401).json({
            message:"user not found"
        })
    }
    
   const isValidPassword = await user.comparePassword(password)
    if(!isValidPassword){
        return res.status(401).json({
            message:"invalid password",
            status:"failed"
        })
    }

    //now after that we need to create token and save the token in cookies than return it
    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})
    res.cookie("token",token)
    return res.status(200).json({ //login the user
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
}

/**
 * -logout controller
 * -POST /api/auth/logout
 */

async function userLogoutController(req,res) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

        if(!token){
            return res.status(400).json({
                message:"you are not logged in"
            })
        }

        await tokenBlacklistModel.create({
            token:token
        })
        
        res.clearCookie("token")

        res.status(200).json({
            message:"logout successfully",
        })
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            message: "Logout failed",
            error: error.message
        })
    }
}


// ab ham ek functionality add karenge jisme jab bhi user valid mail se regeister karega to uske mail box par successfully register ka mail jayega
// ham nodemailer ka use karenge jo ki google ka use karta hai jisse ham kisi ko bhi mail bhej sakte hai 
// 

module.exports = {userRegisterController,userLoginController,userLogoutController}