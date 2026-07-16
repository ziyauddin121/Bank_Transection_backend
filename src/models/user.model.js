const mongoose  =require("mongoose");

const bcrypt = require("bcryptjs");


const userSchema = new  mongoose.Schema({

    email:{
        type : String,
        required : [true,"email is require for creating a user"],
        unique: true,
        trim: true,
        lowercase: true,  //check the format of email using regex
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email address"
        ]
        
    },
    name:{
        type: String,
        required:[true,"name is require for creating a user"],
        trim: true
    },
    password:{
        type: String,
        required:[true,"password is require for creating a user"],
        minlength:[6,"password should contain more than 6 characters"],
        select: false //password by default nahi aayega jab tk ham specially uske na get karwaye
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select: false
    }

},
{
    timestamps:true //time stamp on user creating time and last updating time 
})

userSchema.pre("save",async function(){
    // we use one way hashing for privach
    if(!this.isModified("password")){ // agar password modified nahi hai to return kar do agar modified hai to hashing apply karo
        return ;
    }
    // apply bcrypt hashing for password to incripted
    const hash = await bcrypt.hash(this.password,10); // 10 is salt 
    // why salt : salt ek random string hai jo password ke sath add karke hash kiya jata hai isase security badh jati hai
    this.password = hash;
    return;

})

userSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password, this.password); //compare both the hash
}

const userModel = mongoose.model("user",userSchema);

module.exports = userModel;