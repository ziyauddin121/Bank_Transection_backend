const express = require("express");
const authController = require("../controllers/auth.controller");
const cookieParser = require("cookie-parser");
const {authMiddleware} = require("../middleware/auth.middleware");


const router = express.Router();

//1: register for account creation
//full name of the api is /api/auth/register

/** Post /api/auth/register */
router.post("/register",authController.userRegisterController)
/** Post /api/auth/login */

router.post("/login",authController.userLoginController)

/**
 * POST /api/auth/logout
 * 
 */
router.post("/logout",authMiddleware,authController.userLogoutController)

module.exports  =router; //is router ko app.js file me require karenge 
