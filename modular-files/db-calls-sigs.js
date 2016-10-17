const chalk = require('chalk');
var error = chalk.bold.magenta;
var prop = chalk.cyan;
var note = chalk.green;

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
        client.query('INSERT INTO signatures (Signature, User_ID)\
        VALUES ($1,$2) RETURNING id;',
        [data.signature, data.userID], function (err, id){
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
function deleteSig(client,done,userID){
    return new Promise(function(resolve,reject){
        client.query('DELETE FROM signatures WHERE User_ID=$1;', [userID],
        function(err){
            done();
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
function getSigPic(client,done,sigID){
    return new Promise(function(resolve,reject){
        client.query('SELECT Signature FROM signatures WHERE User_ID=$1;',
        [sigID], function(err,result){
            done();
            if (err) {
                reject(err);
            }
            resolve(result.rows[0].signature);
        });
    });
}
function sigCount(client,done){
    return new Promise(function(resolve, reject){
        client.query('SELECT count(ID) FROM signatures;',
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
        client.query('SELECT\
            users.FirstName,\
            users.LastName,\
            user_profiles.Age,\
            user_profiles.City,\
            user_profiles.URL\
        FROM\
            signatures\
        LEFT JOIN user_profiles ON signatures.user_ID = user_profiles.user_ID\
        LEFT JOIN users ON signatures.user_ID = users.ID;',
        function(err, result){
            done();
            if (err) {
                reject(err);
            }
            var promises = [];
            var array = result.rows;
            function list(i){
                return new Promise(function(resolve){
                    if (array[i].url.search('http') == -1){
                        array[i].url = 'http://' + array[i].url;
                    }
                    resolve();
                });
            }
            for (var i=0; i<array.length; i++){
                var data = list(i);
                promises.push(data);
            }
            Promise.all(promises).then(function(){
                resolve(array);
            });
        });
    });
}
function getSigsCity(client,done,city){
    return new Promise(function(resolve,reject){
        client.query('SELECT\
            users.FirstName,\
            users.LastName,\
            user_profiles.Age,\
            user_profiles.City,\
            user_profiles.URL\
        FROM\
            signatures\
        LEFT JOIN user_profiles ON signatures.user_ID = user_profiles.user_ID\
        LEFT JOIN users ON signatures.user_ID = users.ID\
        WHERE user_profiles.City = $1;', [city],
        function(err, result){
            done();
            if (err) {
                reject(err);
            }
            var promises = [];
            var array = result.rows;
            function list(i){
                return new Promise(function(resolve){
                    if (array[i].url.search('http') == -1){
                        array[i].url = 'http://' + array[i].url;
                    }
                    resolve();
                });
            }
            for (var i=0; i<array.length; i++){
                var data = list(i);
                promises.push(data);
            }
            Promise.all(promises).then(function(){
                resolve(array);
            });
        });
    });
}

module.exports = {
    "getSigPic": getSigPic,
    "saveSig": saveSig,
    "deleteSig": deleteSig,
    "sigCount": sigCount,
    "getSigs": getSigs,
    "checkSig": checkSig,
    "getSigsCity": getSigsCity
};
