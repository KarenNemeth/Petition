const express = require('express');
const router = express.Router();
const db = require('../modular-files/database-calls.js');
const util = require('util');
const chalk = require('chalk');
var error = chalk.bold.magenta;
var prop = chalk.cyan;

router.route('/')
    .get(function(req,res){
        db.pgConnect(db.checkSig,req.session.user.userID).then(function(exists){
            if (!exists) {
                res.render('petition');
            } else {
                res.redirect('/petition/signed');
            }
        });
    })
    .post(function(req,res){
        var data = req.body;
        // console.log(req.body.signature);
        // console.log(prop('Break'));
        data.userID = req.session.user.userID;
        data.firstname = req.session.user.firstname;
        data.lastname = req.session.user.lastname;
        // console.log(util.inspect(data), {showHidden: false, depth: null});
        // console.log("posted");
        db.pgConnect(db.saveSig,data).then(function(){
            console.log("issue with redirect");
            res.send({redirect: '/petition/signed'});
        });
    });

router.route('/signed')
    .get(function(req,res){
        db.pgConnect(db.checkSig,req.session.user.userID).then(function(exists){
            if (!exists) {
                res.redirect('/petition');
            } else {
                db.pgConnect(db.getSigPic,req.session.user.userID).then(function(sigSrc){
                    db.pgConnect(db.sigCount).then(function(count){
                        console.log(sigSrc);
                        res.render('signed', {
                            "sigpic": sigSrc,
                            "sigCount": count,
                            "signed": true
                        });
                    });
                });
            }
        });
    });

router.route('/signatures')
    .get(function(req,res){
        db.pgConnect(db.getSigs).then(function(sigList){
            res.render('signatures', {
                "sigList": sigList,
                "signed": true
            });
        });
    });

module.exports = router;
