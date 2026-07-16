const mongoose = require("mongoose");



function connectToDB(){

    mongoose.connect(process.env.MONGO_URI)
    .then( ()=>{
        console.log("db connected successfully");
    })
    .catch(err => {
        console.log("Error connection to DB");
        process.exit(1); // database is not connect so sever is off
    })
}

module.exports = connectToDB;
