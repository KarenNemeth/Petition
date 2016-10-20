const express = require('express');
const router = express.Router();
const db = require('../modular-files/db-connect.js');
const dbsigs = require('../modular-files/db-calls-sigs.js');
const redis = require('redis');
const client = redis.createClient({
    host: 'localhost',
    port: 6379
});
client.on('error', function(err) {
    console.log(err);
});
const util = require('util');
const path = require('path');
const chalk = require('chalk');
var error = chalk.bold.magenta;
var prop = chalk.cyan;

router.route('/')
    .get(function(req,res){
        var checkSig = dbsigs.checkSig;
        checkSig.params = [req.session.user.userID];
        db.pgConnect(checkSig.call,checkSig.params,checkSig.callback).then(function(exists){
            if (!exists) {
                res.render('petition');
            } else {
                res.redirect('/petition/signed');
            }
        });
    })
    .post(function(req,res){
        var saveSig = dbsigs.saveSig;
        saveSig.params = [req.body.signature,req.session.user.userID];
        db.pgConnect(saveSig.call,saveSig.params,saveSig.callback).then(function(){
            client.del('signatures');
            res.send({redirect: '/petition/signed'});
        });
    });

router.route('/signed')
    .get(function(req,res){
        var checkSig = dbsigs.checkSig;
        checkSig.params = [req.session.user.userID];
        db.pgConnect(checkSig.call,checkSig.params,checkSig.callback).then(function(exists){
            if (!exists) {
                res.redirect('/petition');
            } else {
                var getSigPic = dbsigs.getSigPic;
                getSigPic.params = [req.session.user.userID];
                db.pgConnect(getSigPic.call,getSigPic.params,getSigPic.callback).then(function(sigSrc){
                    var sigCount = dbsigs.sigCount;
                    db.pgConnect(sigCount.call,[],sigCount.callback).then(function(count){
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
        db.pgConnect(dbsigs.deleteSig,[req.session.user.userID]).then(function(){
            client.del('signatures');
            res.redirect('/petition');
        });
    });

router.route('/signatures')
    .get(function(req,res){
        client.get('signatures', function(err, sigList){
            if (err) {
                return console.log(err);
            }
            if (sigList) {
                sigList = JSON.parse(sigList);
                res.render('signatures', {
                    "sigList": sigList,
                    "signed": true
                });
            } else {
                var getSigs = dbsigs.getSigs;
                db.pgConnect(getSigs.call,[],getSigs.callback).then(function(sigList){
                    var sigListString = JSON.stringify(sigList);
                    client.setex('signatures', 86400, sigListString, function(err){
                        if (err) {
                            console.log(error("Couldn't set redis cache"));
                        }
                        res.render('signatures', {
                            "sigList": sigList,
                            "signed": true
                        });
                    });
                });
            }
        });
    });

router.route('/signatures/*')
    .get(function(req,res){
        var city = path.basename(req.url);
        city = decodeURI(city);
        var getSigsCity = dbsigs.getSigsCity;
        getSigsCity.params = [city];
        db.pgConnect(getSigsCity.call,getSigsCity.params,getSigsCity.callback).catch(function(err){
            res.redirect('/signatures');
            throw err;
        }).then(function(sigList){
            if (sigList.length == 0){
                res.render('signatures', {
                    "message": "Could not find any signatures from " + city,
                    "signed": true
                });
                return;
            }
            res.render('signatures', {
                "sigList": sigList,
                "signed": true
            });
        });
    });

module.exports = router;
