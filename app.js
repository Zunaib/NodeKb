//App
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./Config/database')

//MongoDB Connection
mongoose.connect(config.database, { useNewUrlParser: true });
let db = mongoose.connection;


//Check Connection
db.once('open', function() {
    console.log("Connected Successfull");
});


//Check DB Errors
db.on('error', function(err) {
    console.log(err);
});



//Init App
const app = express();

//Importing Models
let Article = require('./Models/article');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// Body PArser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session Middleware
app.use(session({
    secret: 'White Walker',
    resave: true,
    saveUninitialized: true
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


//Passport Config
require('./Config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Rout To Hide Register and Login (If Logged In)
app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
})

//Routes
//Home Route
app.get('/', function(req, res) {

    Article.find({}, function(err, articles) {

        if (err) {
            console.log(err);
        } else {

            res.render('index', {
                title: "Articles",
                articles: articles
            });
        }


    });
});

//Route Files
let articles = require('./Routes/articles');
let users = require('./Routes/users');
app.use('/articles', articles);
app.use('/users', users);

//Server Route
app.listen(3000, function(err) {

    if (err) {
        console.log(err);
    }

    console.log("Server Initiated On Port 3000");

});