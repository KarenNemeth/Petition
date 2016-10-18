const express = require('express');
const router = express.Router();
const csurf = require('csurf')
var csrfProtection = csurf({ cookie: true });
const userjs = require('../modular-files/users.js');
const bcrypt = require('../modular-files/bcrypt.js');
const db = require('../modular-files/db-connect.js');
const dbusers = require('../modular-files/db-calls-users.js');
const dbsigs = require('../modular-files/db-calls-sigs.js');
const util = require("util");
const chalk = require('chalk');
var error = chalk.bold.magenta;
var prop = chalk.cyan;
router.use(csrfProtection);

router.route('/register')
    .get(function(req,res){
        res.render('register', {csrfToken: req.csrfToken()});
    })
    .post(function(req,res){
        var userData = req.body;
        userjs.checkData(userData,res,'register').then(function(){
            bcrypt.hashPassword(userData.password).then(function(hash){
                userData.password = hash;
                var saveUser = dbusers.saveUser;
                saveUser.params = [userData.firstname, userData.lastname, userData.email, userData.password];
                db.pgConnect(saveUser.call, saveUser.params, saveUser.callback).catch(function(err){
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
        res.render('login', {csrfToken: req.csrfToken()});
    })
    .post(function(req,res){
        var userData = req.body;
        userjs.checkData(userData,res,'login').then(function(){
            var checkUser = dbusers.checkUser;
            checkUser.params = [userData.email];
            db.pgConnect(checkUser.call, checkUser.params, checkUser.callback).then(function(data){
                if (!data){
                    res.render('login', {"message": "Email Address Not Found. Please Register"});
                    return;
                }
                bcrypt.checkPassword(userData.password, data.password).then(function(matches){
                    if (!matches) {
                        res.render('login', {"message": "Incorrect Password"});
                        return;
                    } else {
                        req.session.user = {
                            "firstname": data.firstname,
                            "lastname": data.lastname,
                            "userID": data.id
                        };
                        var checkProfile = dbusers.checkProfile;
                        checkProfile.params = [data.id];
                        db.pgConnect(checkProfile.call, checkProfile.params, checkProfile.callback).then(function(exists){
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
        res.render('profile', {
            "message": "Welcome " + req.session.user.firstname + ".",
            csrfToken: req.csrfToken()
        });
    })
    .post(function(req,res){
        var userData = req.body;
        userData.userID = req.session.user.userID;
        //integers in postgres can not be null
        if (userData.age == "") {
            userData.age = null;
        }
        var params = [userData.userID, userData.age, userData.city, userData.website];
        db.pgConnect(dbusers.addProfile, params).catch(function(err){
            res.render('profile', {"message": "Could not save to database. Please try again."});
            throw err;
        }).then(function(){
            res.redirect('/petition');
        });
    });
router.route('/profile/edit')
    .get(function(req,res){
        var editProfilePage = dbusers.editProfilePage;
        editProfilePage.params = [req.session.user.userID];
        db.pgConnect(editProfilePage.call,editProfilePage.params,editProfilePage.callback).then(function(values){
            res.render('editprofile', {
                values: values,
                csrfToken: req.csrfToken()
            });
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
                userData.userID = req.session.user.userID;
                //edit profile
                var params = [userData.firstname, userData.lastname, userData.email, userData.password, userData.userID];
                db.pgConnect(dbusers.updateUsers,params).then(function(){
                    db.pgConnect(dbusers.checkProfile.call,[userData.userID]).then(function(data){
                        var params = [userData.userID, userData.age, userData.city, userData.website];
                        if (!data.rows[0]){
                            db.pgConnect(dbusers.addProfile,params).catch(function(err){
                                res.render('editprofile', {"message": "Could not save to database. Please try again."});
                                throw err;
                            }).then(function(){
                                res.redirect('/petition');
                            });
                        } else {
                            db.pgConnect(dbusers.updateProfile,params).catch(function(err){
                                res.render('editprofile', {"message": "Could not save to database. Please try again."});
                                throw err;
                            }).then(function(){
                                res.redirect('/petition');
                            });
                        }
                    });

                });
            });
        });
    });
module.exports = router;
