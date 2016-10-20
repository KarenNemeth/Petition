const db = require('./modular-files/db-connect.js');
const dbusers = require('./modular-files/db-calls-users.js');
const dbsigs = require('./modular-files/db-calls-sigs.js');
const express = require('express');
const app = express();
const userRouter = require('./routes/user-routes');
const petRouter = require('./routes/petition-routes');
const hb = require('express-handlebars');
app.engine('handlebars', hb({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const session = require('express-session');
const Store = require('connect-redis')(session);
const path = require('path');
const util = require('util');
const chalk = require('chalk');
const note = chalk.green;
const prop = chalk.cyan;
const error = chalk.bold.red;

app.use(bodyParser.urlencoded({
    extended:false
}));
app.use(cookieParser());
app.use(session({
    store: new Store({
        ttl: 86400,
        host: 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: 'This is a secret!'
}));

var staticURL = path.join(__dirname, 'files');
app.use(express.static(staticURL));

app.get('/', function(req,res){
    if (req.session.user) {
        var checkProfile = dbusers.checkProfile;
        checkProfile.params = [req.session.user.userID];
        db.pgConnect(checkProfile.call, checkProfile.params, checkProfile.callback).then(function(exists){
            if (!exists){
                res.redirect('/user/profile');
            } else {
                res.redirect('/petition/signed');
            }
        });
    } else {
        res.render('home', {
            "home": true
        });
    }
});

app.use('/user', userRouter);
app.get('*', function(req,res,next){
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
});
app.use('/petition', petRouter);

app.listen(process.env.PORT || 8080, console.log(note('Listening on port 8080')));
