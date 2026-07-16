const accountModel = require("../models/account.model")
const ledgerModel = require("../models/ledger.model")
const transactionModel = require("../models/transaction.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")


/**
 * --create a new transaction
 * 10 step transfer flow:
 * *1. validate request
 * *2. validate idempotency key
 * *3. check account status
 * *4. Driven sender balance from ledger
 * *5. Create transaction (pending)
 * *6. Create DEBIT ledger entry
 * *7. create credit ledger entry
 * *8. mark transaction completed
 * *9. commit mogonDB session
 * *10. Send email notification
 * 
 */

async function createTransaction(req,res) {
    /**
     * 1.validate request
     */
    const {fromAccount, toAccount, amount} = req.body
    const idempotencyKey = req.body.idempotencyKey || req.body.idempotencykey

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id:toAccount,
    }).populate("user")

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"invalid fromAccoutn or to account"
        })
    }


    /**
     * 2. validate idempotency key
     */

    const isTransationalreadyExist = await transactionModel.findOne({
        idempotencykey: idempotencyKey
    })

    if(isTransationalreadyExist){
    
        if(isTransationalreadyExist.status === "COMPLETED"){
            return res.status(200).json({
                message:"transation is already completed",
                transaction:isTransationalreadyExist
            })
        }

        if(isTransationalreadyExist.status === "PENDING") {
            return res.status(200).json({
                message:"transaction is still processing",
            })
        }

        if(isTransationalreadyExist.status === "FAILED"){
            return res.status(500).json({
                message:"transaction is failed , please retry",
            })
        }

        if(isTransationalreadyExist.status == "REVERSED"){
            return res.status(500).json({
                message:"transaction is reversed ,please retry",
            })
        }
        
    }

    /**
     * 3. check account status
     */

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message:"fromAccount or toAccount is not active"
        })
    }

    /**
     * 4. Driven sender balance from ledger // check sufficiant balance with the help of aggregation pipeline
     */
    const balance = await fromUserAccount.getBalance()

    if(balance < amount){
        return res.status(400).json({
            message: `insufficiant balance. Current balance is ${balance}. Request amount is ${amount}`
        }) 
    }
    let transaction;
    try{

    // now we have to make a session 
    /**
     * 5. create transaction (pending)
     */
    const session  = await mongoose.startSession()

    session.startTransaction()

     transaction = (await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencykey: idempotencyKey,
        status:"PENDING"
    }] ,{session}))[0];
    
    const debitLedgerEntry  =await ledgerModel.create([{
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type:"DEBIT"
    }],{session})

    await(()=>{
        return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })()

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type:"CREDIT"
    }],{session})

    await transactionModel.findOneAndUpdate(
        {_id:transaction._id},
        {status:"COMPLETED"},
        {session}
    )
    await session.commitTransaction()
    session.endSession()
    }catch(error){
        console.error("Transaction error:", error);
        return res.status(500).json({
            message: "Transaction failed",
            error: error.message
        })
    }

    /**
     * 10. Send email notification
     */

    // send email to both user
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toUserAccount.user.name);
    await emailService.sendTransactionEmail(toUserAccount.user.email, toUserAccount.user.name, amount, req.user.name);

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction:transaction
    })
}

async function createInitialFundsTransaction(req,res){

    const {toAccount, amount} = req.body
    const idempotencyKey = req.body.idempotencyKey || req.body.idempotencykey

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id:toAccount,
    }).populate("user")
    
    if(!toUserAccount){
        return res.status(400).json({
            message:"invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user:req.user._id
    })
    
    if(!fromUserAccount){
        return res.status(400).json({
            message:"system user not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencykey: idempotencyKey,
        status:"PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }], {session})

    const creditLedgerEntry = await ledgerModel.create([{
        account: toUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }], {session})

    transaction.status = "COMPLETED"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    await emailService.sendTransactionEmail(toUserAccount.user.email, toUserAccount.user.name, amount, req.user.name);

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction:transaction
    })
}

module.exports  = {
    createTransaction,
    createInitialFundsTransaction
}