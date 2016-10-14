var bcrypt = require('bcrypt');

function hashPassword(password){
    return new Promise(function(resolve,reject){
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                reject(err);
            }
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    }).catch(function(err){
        console.log("error hashing password:" + err);
    });
}

function checkPassword(loginText, hash){
    return new Promise(function(resolve,reject){
        bcrypt.compare(loginText, hash, function(err, matches) {
            if (err) {
                reject(err);
            }
            resolve(matches);
        });
    }).catch(function(err){
        console.log("error checking password:" + err);
    });
}


module.exports = {
    "hashPassword": hashPassword,
    "checkPassword": checkPassword
};
