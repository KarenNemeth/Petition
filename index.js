const node = require('./node.js');
const express = require('express');
const app = express();
const hb = require('express-handlebars');
app.engine('handlebars', hb({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
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

var staticURL = path.join(__dirname, 'files');
app.use(express.static(staticURL));

app.get('/', function(req,res){
    var cookie = req.cookies.signature;
    if (cookie == "provided") {
        console.log(note("Cookie is available; user already signed petition"));
        res.redirect('/signed');
    } else {
        res.render('main');
    }
});
//if someone clicks the button write jquery to slide down to the main body
app.post('/', function(req,res){
    node.pgConnect(node.saveData,req.body).then(function(){
        res.cookie("signature", "provided");
        res.send({redirect: '/signed'});
    });
});

app.get('/signed', function(req,res){
    node.pgConnect(node.sigCount).then(function(count){
        res.render('signed', {
            "sigCount": count
        });
    });
});

app.get('/signatures', function(req,res){
    node.pgConnect(node.getSigs).then(function(sigList){
        res.render('signatures', {
            "sigList": sigList
        });
    });
});

app.get('*', function(req,res){
    res.redirect('/');
});


app.listen(8080, console.log(note('Listening on port 8080')));
