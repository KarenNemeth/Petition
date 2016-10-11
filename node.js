const pg = require('pg');
const database = 'postgres://Karen:password@localhost/signatures';
const util = require('util');
const chalk = require('chalk');
var error = chalk.bold.magenta;
var prop = chalk.cyan;
var note = chalk.green;

function saveData(data){
    return new Promise(function(resolve,reject){
        pg.connect(database, function(err,client,done){
            if (err) {
                reject(err);
            }
            client.query('INSERT INTO signatures (FirstName, LastName, Signature) VALUES ($1,$2,$3);',
            [data.firstName, data.lastName, data.signature], function (err, result){
                done();
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }).catch(function(err){
        console.log(error("Error: " + err));
    });
}

function sigCount(){
    return new Promise(function(resolve, reject){
        pg.connect(database, function(err,client,done){
            if (err) {
                reject(err);
            }
            client.query('SELECT count(FirstName) FROM signatures', function(err, result){
                done();
                if (err){
                    reject(err);
                } else {
                    var count = result.rows[0].count;
                    resolve(count);
                }
            });
        });
    }).catch(function(err){
        console.log(error("Error: " + err));
    });
}
function getSigs(){
    return new Promise(function(resolve, reject){
        pg.connect(database, function(err,client,done){
            if (err) {
                reject(err);
            }
            client.query('SELECT FirstName, LastName FROM signatures', function(err, result){
                done();
                if (err) {
                    reject(err);
                } else {
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
                }
            });
        }).catch(function(err){
            console.log(error("Error: " + err));
        });
    });
}

module.exports = {
    "saveData": saveData,
    "sigCount": sigCount,
    "getSigs": getSigs
};
