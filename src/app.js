// server ke instance ko create karna h
// server ko config karna hai (middle ware and api ki types)
// routes ko server ke andar import karna h
// server ko export karna h
const express  =require("express")
const cookieParser = require("cookie-parser");


const app =express()

app.use(express.json())
app.use(cookieParser())


/**
 * _Routes
 */
const authRouter  =require("./routes/auth.routes")
const accountRouter  =require("./routes/account.routes")
const transactionRouter  =require("./routes/transaction.routes")
/**
 * --use routes
 */
app.use("/api/auth",authRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/transactions",transactionRouter)


//create accounts routes




module.exports  =app