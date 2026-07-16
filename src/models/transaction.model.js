const mongoose  =require("mongoose")

const transactionSchema = new mongoose.Schema({

    // in the transaction there are two account one for debited and one for credit
    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true,"Transaction must be associated with a from acoount"],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true,"Transaction must be associated with a to acoount"],
        index: true
    },
    status:{
        type: String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"status can be either PENDING , COMPLETED , FAILED , REVERSED",
        },
        default:"PENDING"
    },
    amount:{
        type: Number,
        required: [true,"transaction amount can not be empty"],
        min: [0,"Amount must be positive"]
    },
    idempotencykey:{ // same payment ko 2 baar karne se rokte hai server down hone par
        type: String,
        required:[true,"idempotency key is required for creating transation"],
        index: true,
        unique:true
    }
}, {
    timestamps: true
})

const transationModel = mongoose.model("transaction",transactionSchema)


module.exports = transationModel