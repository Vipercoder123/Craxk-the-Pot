const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;
console.log(db)

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology:true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use( express.static( "public" ) );

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: true}));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//File uploads
app.use(fileUpload());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/quiz',require('./routes/quiz.js'));
// app.use('/recover', require('./routes/reset.js'));

const PORT = process.env.PORT || 3000;

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, console.log(`Server started on port ${PORT}`));
