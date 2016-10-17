const express = require('express');
const router = express.Router();
const userjs = require('../modular-files/users.js');
const bcrypt = require('../modular-files/bcrypt.js');
const db = require('../modular-files/db-calls-connect&users.js');
const dbsigs = require('../modular-files/db-calls-sigs.js');
const util = require("util");
const chalk = require('chalk');
var error = chalk.bold.magenta;
var prop = chalk.cyan;

router.route('/register')
    .get(function(req,res){
        res.render('register');
    })
    .post(function(req,res){
        var userData = req.body;
        userjs.checkData(userData,res,'register').then(function(){
            bcrypt.hashPassword(userData.password).then(function(hash){
                userData.password = hash;
                db.pgConnect(db.saveUser, userData).catch(function(err){
                    res.render('register', {"message": "You already have an account with that email! Try Logging In."});
                    throw err;
                }).then(function(userID){
                    req.session.user = {
                        "firstname": userData.firstname,
                        "lastname": userData.lastname,
                        "userID": userID
                    };
                    res.redirect('/user/profile');
                });
            });
        });
    });

router.route('/login')
    .get(function(req,res){
        res.render('login');
    })
    .post(function(req,res){
        var userData = req.body;
        userjs.checkData(userData,res,'login').then(function(){
            console.log("Users okay");
            db.pgConnect(db.checkUser, userData.email).then(function(data){
                if (!data){
                    res.render('login', {"message": "Email Address Not Found. Please Register"});
                }
                bcrypt.checkPassword(userData.password, data.password).then(function(matches){
                    if (!matches) {
                        console.log("db okay");
                        res.render('login', {"message": "Incorrect Password"});
                        return;
                    } else {
                        console.log("db okay");
                        req.session.user = {
                            "firstname": data.firstname,
                            "lastname": data.lastname,
                            "userID": data.id
                        };
                        db.pgConnect(db.checkProfile, data.id).then(function(exists){
                            if (!exists){
                                res.redirect('/user/profile');
                            } else {
                                res.redirect('/petition');
                            }
                        });
                    }
                });
            });
        });
    });
router.route('*')
    .get(function(req,res,next){
        if (req.session.user) {
            next();
        } else {
            res.redirect('/');
        }
    });
router.route('/profile')
    .get(function(req,res){
        if (!req.session.user) {
            res.redirect('/');
        }
        res.render('profile', {"message": "Welcome Back " + req.session.user.firstname + "."});
    })
    .post(function(req,res){
        var userData = req.body;
        userData.userID = req.session.user.userID;
        //integers in postgres can not be null
        if (userData.age == "") {
            userData.age = null;
        }
        console.log(userData.age);
        db.pgConnect(db.addProfile, userData).catch(function(err){
            res.render('profile', {"message": "Could not save to database. Please try again."});
            throw err;
        }).then(function(){
            console.log("resolved");
            res.redirect('/petition');
        });
    });
router.route('/profile/edit')
    .get(function(req,res){
        db.pgConnect(db.editProfilePage,req.session.user.userID).then(function(values){
            res.render('editprofile', values);
        });
    })
    .post(function(req,res){
        var userData = req.body;
        if (userData.age == "") {
            userData.age = null;
        }
        //Change this so it only checksthe first 4 datapoints
        userjs.checkData(userData,res,'editprofile').then(function(){
            bcrypt.hashPassword(userData.password).then(function(hash){
                userData.password = hash;
                userData["userID"] = req.session.user.userID;
                db.pgConnect(db.editProfile,userData).then(function(){
                    console.log("finished");
                    res.redirect('/petition/signed');
                });
            });
        });
    });
module.exports = router;
