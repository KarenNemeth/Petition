const pg = require('pg');
const util = require('util');
const database = 'postgres://Karen:password@localhost/signatures';
const dbsigs = require('../modular-files/db-calls-sigs.js');
const chalk = require('chalk');
var error = chalk.bold.magenta;
var prop = chalk.cyan;
var note = chalk.green;

function pgConnect(query, data){
    return new Promise(function(resolve,reject){
        pg.connect(database, function(err,client,done){
            if (err) {
                reject(err);
            }
            query(client,done,data).catch(function(err){
                reject(err);
                throw err;
            }).then(function(desiredData){
                resolve(desiredData);
            });
        }).catch(function(err){
            throw err;
        });
    });
}
function saveUser(client, done, userData){
    return new Promise(function(resolve, reject){
        client.query('INSERT INTO users (FirstName, LastName, Email, Password)\
        VALUES ($1,$2,$3,$4) RETURNING ID;',
        [userData.firstname, userData.lastname, userData.email, userData.password], function(err, ret){
            done();
            if (err){
                console.log(err);
                reject(err);
            } else {
                resolve(ret.rows[0].id);
            }
        });
    });
}
function checkUser(client,done,email){
    return new Promise(function(resolve, reject){
        client.query('SELECT FirstName, LastName, ID, Password FROM users WHERE Email = $1;',
        [email], function(err, result){
            done();
            if (err){
                reject(err);
            }
            resolve(result.rows[0]);
        });
    });
}
function addProfile(client,done,userData){
    return new Promise(function(resolve,reject){
        client.query('INSERT INTO user_profiles (User_ID, Age, City, URL) VALUES ($1,$2,$3,$4);',
        [userData.userID, userData.age, userData.city, userData.website], function(err){
            done();
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
function checkProfile(client,done,userID){
    return new Promise(function(resolve,reject){
        client.query('SELECT ID FROM user_profiles WHERE User_ID = $1;',
        [userID],function(err,result){
            done();
            if(err){
                reject(err);
            }
            resolve(result.rows[0]);
        });
    });
}
function editProfilePage(client,done,userID){
    return new Promise(function(resolve,reject){
        client.query('SELECT * FROM users LEFT JOIN user_profiles ON users.ID = user_profiles.user_ID\
        WHERE users.ID = $1;', [userID],
        function(err,result){
            done();
            if (err) {
                reject(err);
            }
            resolve(result.rows[0]);
        });
    });
}
function editProfile(client,done,userData){
    return new Promise(function(resolve,reject){
        client.query('UPDATE users SET FirstName=$1, LastName=$2, Email=$3, Password=$4\
        WHERE users.ID=$5;', [userData['firstname'], userData['lastname'], userData['email'], userData['password'], userData['userID']],
        function(err){
            if (err) {
                reject(err);
            }
            client.query('SELECT ID FROM user_profiles WHERE User_ID = $1;', [userData['userID']],
            function(err,result){
                if (err) {
                    reject(err);
                }
                if (!result.rows[0]) {
                    addProfile(client,done,userData).then(function(){
                        resolve();
                    });
                } else {
                    client.query('UPDATE user_profiles SET Age=$1, City=$2, URL=$3 WHERE User_ID=$4;',
                    [userData['age'], userData['city'], userData['website'], userData['userID']],
                    function(err){
                        done();
                        if (err) {
                            reject(err);
                        }
                        resolve();
                    });
                }
            });
        });
    });
}

module.exports = {
    "pgConnect": pgConnect,
    "saveUser": saveUser,
    "checkUser": checkUser,
    "addProfile": addProfile,
    "checkProfile": checkProfile,
    "editProfilePage": editProfilePage,
    "editProfile": editProfile
};
