var express  = require('express');
var app      = express();
var path     = require('path');
var mongoose = require('mongoose');
var session  = require('express-session');
var flash    = require('connect-flash');
var bodyParser     = require('body-parser');
var cookieParser   = require('cookie-parser');
var methodOverride = require('method-override');
var passport = require('./config/passport');

// var multer  =   require('multer');
// var fs = require('fs')
// var crypto = require('crypto');

// // upload
// var storage = multer.diskStorage({
//   // folder upload
//   destination: 'public/upload/',
//   filename: function (req, file, cb) {
//     crypto.pseudoRandomBytes(16, function (err, raw) {
//       if (err) return cb(err)
//       cb(null, Math.floor(Math.random()*9000000000) + 1000000000 + path.extname(file.originalname))
//     })
//   }
// })
// var upload = multer({ storage: storage });

// DB setting
mongoose.connect(
  "mongodb+srv://node-board:" +
   process.env.MONGO_ATLAS_PW +
   '@cluster0-drfob.mongodb.net/test?retryWrites=true&w=majority',
  {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
  }
);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.once("open", function(){
  console.log("DB connected");
});
db.on("error", function(err){
  console.log("DB ERROR : ", err);
});
// Other settings
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({secret:"MySecret", resave:true, saveUninitialized:true}));
app.use(countVisitors);
// view engine
app.set("view engine", 'ejs');

// middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({secret:'MySecret', resave: false, saveUninitialized:true}));
app.use(countVisitors);

// passport
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', require('./routes/home'));
app.use('/users', require('./routes/users'));
app.use('/posts', checkQuery, require('./routes/posts'));

// app.get('/files', function (req, res) {
//   const images = fs.readdirSync('public/upload')
//   var sorted = []
//   for (let item of images){
//       if(item.split('.').pop() === 'png'
//       || item.split('.').pop() === 'jpg'
//       || item.split('.').pop() === 'jpeg'
//       || item.split('.').pop() === 'svg'){
//           var abc = {
//                 "image" : "/upload/"+item,
//                 "folder" : '/'
//           }
//           sorted.push(abc)
//       }
//   }
//   res.send(sorted);
// })

// app.post('/upload', upload.array('flFileUpload', 12), function (req, res, next) {
//     res.redirect('back')
// });

app.post('/delete_file', function(req, res, next){
  var url_del = 'public' + req.body.url_del
  console.log(url_del)
  if(fs.existsSync(url_del)){
    fs.unlinkSync(url_del)
  }
  res.redirect('back')
});


// start server
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Server On!');
});

function countVisitors(req,res,next){
  if(!req.cookies.count&&req.cookies['connect.sid']){
    res.cookie('count', "", { maxAge: 3600000, httpOnly: true });
    var now = new Date();
    var date = now.getFullYear() +"/"+ now.getMonth() +"/"+ now.getDate();
    if(date != req.cookies.countDate){
      res.cookie('countDate', date, { maxAge: 86400000, httpOnly: true });

      var Counter = require('./models/Counter');
      Counter.findOne({name:"vistors"}, function (err,counter) {
        if(err) return next();
        if(counter===null){
          Counter.create({name:"vistors",totalCount:1,todayCount:1,date:date});
        } else {
          counter.totalCount++;
          if(counter.date == date){
            counter.todayCount++;
          } else {
            counter.todayCount = 1;
            counter.date = date;
          }
          counter.save();
        }
      });
    }
  }
  return next();
}

function checkQuery(req, res, next){
  if(req.originalMethod != "GET") return next();

  var path = req._parsedUrl.pathname;
  var queryString = req._parsedUrl.query?req._parsedUrl.query:"";
  if(queryString.indexOf("page=")<0){
    if(queryString.length !== 0 ) queryString += "&";
    queryString += "page=1";
  }
  if(queryString.indexOf("limit=")<0){
    queryString += "&limit=10";
  }
  if(queryString.indexOf("searchType=")<0){
    queryString += "&searchType=";
  }
  if(queryString.indexOf("searchText=")<0){
    queryString += "&searchText=";
  }

  if(queryString == req._parsedUrl.query){
    return next();
  } else {
    return res.redirect(path+"?"+queryString);
  }
}