
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    username: {

        type: String,
        trim: true
    },

    hash : {

        type: String,
        trim: true
    },
    // img: {
    //     data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    //     contentType: 'image/png'
    // }
    img:{
        type:String
        // trim: true
    }
})

const User = mongoose.model("User", userSchema)

module.exports = User