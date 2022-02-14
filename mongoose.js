const mongoose = require('mongoose')
const dbUrl = 'mongodb://localhost:27017/userDB'
mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).catch(err=>console.log(err))
let userSchema = mongoose.Schema({
    firstname:String,
    lastname:String,
    username:{ type: String, required: true, unique: true},
    passwords:String
})
let Users = mongoose.model("users",userSchema)
module.exports = Users

module.exports.saveUsers=function(model,data){
    model.save(data)
}