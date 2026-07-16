const mongoose  =require("mongoose")

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true,"Ledger must be associated with an account"],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true,"ledger amount can not be empty"],
        immutable:true // debit or credit hone ke baad amount change nahi hoga
    },
    transaction :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required:[true,"Transaction is required for creating a ledger"],
        index: true,
        immutable: true
    },
    type:{
        type:String,
        enum:{
            values:["DEBIT","CREDIT"],
            message:"type can be either DEBIT or CREDIT"
        },
        required:[true,"ledger type is required"],
        immutable:true
    }

})

// kabhi modified nahi hona chiye uske liye

function preventLedgerModification(){
    throw new Error("Ledger can not be modified after creation")
}

ledgerSchema.pre("save", function(next) {
    if (!this.isNew) {
        return next(new Error("Ledger can not be modified after creation"));
    }
    next();
})

ledgerSchema.pre("update",preventLedgerModification)
ledgerSchema.pre("remove",preventLedgerModification)
ledgerSchema.pre("updateOne",preventLedgerModification)
ledgerSchema.pre("findOneAndUpdate",preventLedgerModification)
ledgerSchema.pre("deleteMany",preventLedgerModification)
ledgerSchema.pre("updateMany",preventLedgerModification)
ledgerSchema.pre("findOneAndDelete",preventLedgerModification)

const ledgerModel = mongoose.model("ledger",ledgerSchema)

module.exports = ledgerModel