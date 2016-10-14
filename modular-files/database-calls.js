const pg = require('pg');
const util = require('util');
const database = 'postgres://Karen:password@localhost/signatures';
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
            console.log(note("running query"));
            query(client,done,data).catch(function(err){
                // console.log(error(err));
                reject(err);
                throw err;
            }).then(function(desiredData){
                resolve(desiredData);
            });
        });
    });
}
function saveUser(client, done, userData){
    return new Promise(function(resolve, reject){
        client.query('INSERT INTO users (FirstName, LastName, Email, Password) VALUES ($1,$2,$3,$4) RETURNING ID;',
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
function checkSig(client,done,userID){
    return new Promise(function(resolve,reject){
        client.query('SELECT ID FROM signatures WHERE User_ID = $1;',
        [userID],function(err,result){
            done();
            if(err){
                reject(err);
            }
            resolve(result.rows[0]);
        });
    });
}
function saveSig(client,done,data){
    return new Promise(function(resolve, reject){
        // console.log(util.inspect(data), {showHidden: false, depth: null});
        client.query('INSERT INTO signatures (FirstName, LastName, Signature, User_ID) VALUES ($1,$2,$3,$4) RETURNING id;',
        [data.firstname, data.lastname, data.signature, data.userID], function (err, id){
            done();
            if (err) {
                console.log(error(err));
                reject(err);
            } else {
                // console.log(prop(id.rows[0]));
                resolve(id.rows[0].id);
            }
        });
    });
}
function getSigPic(client,done,sigID){
    return new Promise(function(resolve,reject){
        client.query('SELECT Signature FROM signatures WHERE User_ID=$1;',
        [sigID], function(err,result){
            done();
            // console.log(prop(result.rows[0].signature));
            if (err) {
                reject(err);
            }
            resolve(result.rows[0].signature);
        });
    });
}
function sigCount(client,done){
    return new Promise(function(resolve, reject){
        client.query('SELECT count(FirstName) FROM signatures;',
            function(err, result){
                done();
                if (err){
                    reject(err);
                } else {
                    var count = result.rows[0].count;
                    resolve(count);
                }
            }
        );
    });
}
function getSigs(client,done){
    return new Promise(function(resolve,reject){
        client.query('SELECT FirstName, LastName FROM signatures;', function(err, result){
            done();
            if (err) {
                reject(err);
            }
            var promises = [];
            var sigList = [];
            var array = result.rows;
            function list(i){
                return new Promise(function(resolve){
                    var first = array[i].firstname;
                    var second = array[i].lastname;
                    var fullname = first + " " + second;
                    sigList.push(fullname);
                    resolve();
                });
            }
            for (var i=0; i<array.length; i++){
                var name = list(i);
                promises.push(name);
            }
            Promise.all(promises).then(function(){
                resolve(sigList);
            });
        });
    });
}

module.exports = {
    "pgConnect": pgConnect,
    "saveUser": saveUser,
    "checkUser": checkUser,
    "getSigPic": getSigPic,
    "saveSig": saveSig,
    "sigCount": sigCount,
    "getSigs": getSigs,
    "addProfile": addProfile,
    "checkProfile": checkProfile,
    "checkSig": checkSig
};
