var mongoose = require("mongoose");
var bcrypt   = require("bcrypt-nodejs");

// schema
var userSchema = mongoose.Schema({
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Should be a vaild email address!"],
    required:true, 
    unique:true
  },
  nickname: {
    type:String, 
    required:[true, "nickname is required!"], 
    unique:true
  },
  password:{
    type:String,
    required:[true,"Password is required!"],
  }
});

// bcrypt
userSchema.pre("save", function(next){
  var user = this;
  if(!user.isModified("password")){
    return next();
  } else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

userSchema.methods.mapObject = function (target) {
  var exceptions = ["createdAt","_id","__v"];
  for(var key in this.schema.paths){
    if(exceptions.indexOf(key)<0 && target[key]){
      this[key] = target[key];
    }
  }
};
// model & export
var User = mongoose.model("user",userSchema);
module.exports = User;
