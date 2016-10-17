const express = require('express');
const router = express.Router();
const db = require('../modular-files/db-calls-connect&users.js');
const dbsigs = require('../modular-files/db-calls-sigs.js');
const util = require('util');
const path = require('path');
const chalk = require('chalk');
var error = chalk.bold.magenta;
var prop = chalk.cyan;

router.route('/')
    .get(function(req,res){
        db.pgConnect(dbsigs.checkSig,req.session.user.userID).then(function(exists){
            if (!exists) {
                res.render('petition');
            } else {
                res.redirect('/petition/signed');
            }
        });
    })
    .post(function(req,res){
        var data = req.body;
        data.userID = req.session.user.userID;
        data.firstname = req.session.user.firstname;
        data.lastname = req.session.user.lastname;
        db.pgConnect(dbsigs.saveSig,data).then(function(){
            res.send({redirect: '/petition/signed'});
        });
    });

router.route('/signed')
    .get(function(req,res){
        db.pgConnect(dbsigs.checkSig,req.session.user.userID).then(function(exists){
            if (!exists) {
                res.redirect('/petition');
            } else {
                db.pgConnect(dbsigs.getSigPic,req.session.user.userID).then(function(sigSrc){
                    db.pgConnect(dbsigs.sigCount).then(function(count){
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
router.route('/delete')
    .get(function(req,res){
        db.pgConnect(dbsigs.deleteSig,req.session.user.userID).then(function(){
            res.redirect('/petition');
        });
    });

router.route('/signatures')
    .get(function(req,res){
        db.pgConnect(dbsigs.getSigs).then(function(sigList){
            res.render('signatures', {
                "sigList": sigList,
                "signed": true
            });
        });
    });

router.route('/signatures/*')
    .get(function(req,res){
        var city = path.basename(req.url);
        city = decodeURI(city);
        console.log(city);
        db.pgConnect(dbsigs.getSigsCity, city).catch(function(err){
            res.redirect('/signatures');
            throw err;
        }).then(function(sigList){
            res.render('signatures', {
                "sigList": sigList,
                "signed": true
            });
        });
    });

module.exports = router;
