const express  =require("express");
const accountsController = require("../controllers/account.controller");
const {authMiddleware} = require("../middleware/auth.middleware");

const routes = express.Router();


/**
 * --post /api/accounts/me
 * --create a new account
 * -- protected route
 */

routes.post("/",authMiddleware,accountsController.createAccountController)


/**
 * --GET /api/accounts/me
 * --get logged in user account
 * -- protected route
 */

routes.get("/",authMiddleware,accountsController.getLoggedInUserAccounts)


/**
 * -GET /api/account/balsnce: accountid
 */

routes.get("/balance/:accountId",authMiddleware,accountsController.getBalanceController)
module.exports  =routes
