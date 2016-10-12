const db = require('./database-calls.js');
const express = require('express');
const app = express();
const hb = require('express-handlebars');
app.engine('handlebars', hb({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
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
app.use(cookieSession({
    secret: 'This is a secret!',
    maxAge: 1000 * 60 * 60 * 24 * 14,
    name: 'session'
}));

var staticURL = path.join(__dirname, 'files');
app.use(express.static(staticURL));

app.get('/', function(req,res){
    if (req.session.signatureID) {
        console.log(note("Cookie is available; user already signed petition"));
        res.redirect('/signed');
    } else {
        res.render('main');
    }
});
//if someone clicks the button write jquery to slide down to the main body
app.post('/', function(req,res){
    db.pgConnect(db.saveData,req.body).then(function(sigID){
        req.session.signatureID = sigID;
        res.send({redirect: '/signed'});
    });
});

app.get('/signed', function(req,res){
    var sigID = req.session.signatureID;
    if (sigID == undefined) {
        res.redirect('/');
        return;
    } else {
        db.pgConnect(db.getSigPic,req.session.signatureID).then(function(sigSrc){
            db.pgConnect(db.sigCount).then(function(count){
                res.render('signed', {
                    "sigpic": sigSrc,
                    "sigCount": count
                });
            });
        });
    }
});
app.get('/signatures', function(req,res){
    db.pgConnect(db.getSigs).then(function(sigList){
        res.render('signatures', {
            "sigList": sigList
        });
    });
});

app.get('*', function(req,res){
    res.redirect('/');
});
app.listen(8080, console.log(note('Listening on port 8080')));
