const mongoose = require("mongoose");
const ledger = require("./ledger.model");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required: [true ," account must be associated with auser"],
        index: true // searcing fast karne ke liye index ka use karte hai
    }, 
    status: {
        type: String,
        enum:{
            values:["ACTIVE",'FROZEN',"CLOSED"],
            message:"status can be either ACTIVE, FROZEN or CLOSED"
        },
        default:"ACTIVE"
    },
    currency:{
        type: String,
        required: [true, "Currency is required fro creating an account"],
        default: "INR"
    }
})
//balance ke liye ladger ka use karenge

accountSchema.index({
    user:1, //user id ke hisaab se search karega
    status:1  // status ke hisaab se search karega
})

accountSchema.methods.getBalance = async function(){
    const balanceData = await ledgerModel.aggregate([
        {$match: {account: this._id}},
        {
            $group:{
                _id:null,
                totalDebit:{
                    $sum:{
                        $cond:[{
                            $eq: ["$type","DEBIT"]
                        },"$amount",0]
                    }

                },
                totalCredit:{
                    $sum:{
                        $cond:[{
                            $eq: ["$type","CREDIT"]
                        },"$amount",0]
                    }

                }
            }
        },
        {
            $project:{
                _id:0,
                balance:{
                    $subtract:["$totalCredit","$totalDebit"]
                }
            }
        }
    ])

    if(!balanceData || balanceData.length ===0){
        return 0;
    }

    return balanceData[0].balance;
}

const accountModel = mongoose.model("account",accountSchema)


module.exports = accountModel