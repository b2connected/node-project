var mongoose = require("mongoose");

// schema
var postSchema = mongoose.Schema({
  title: {type:String, required:true},
  body: {type:String, required:true},
  author: {type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  views: {type:Number, default: 0},
  numId: {type:Number, required:true},
  createdAt: {type:Date, default:Date.now},
  updatedAt: Date
});

postSchema.methods.getFormattedDate = function (date) {
  return date.getFullYear() + "-" + get2digits(date.getMonth()+1)+ "-" + get2digits(date.getDate());
};

postSchema.methods.getFormattedTime = function (date) {
  return get2digits(date.getHours()) + ":" + get2digits(date.getMinutes())+ ":" + get2digits(date.getSeconds());
};


// model & export
var Post = mongoose.model("post", postSchema);
module.exports = Post;

function get2digits(num){
  return ("0" + num).slice(-2);
}
