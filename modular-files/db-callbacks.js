exports.id = function(data){
    return new Promise(function(resolve){
        resolve(data.rows[0].id);
    });
};
exports.data = function(data){
    return new Promise(function(resolve){
        if (!data.rows[0]){
            resolve();
        } else {
            resolve(data.rows[0]);
        }
    });
};
exports.sig = function(data){
    return new Promise(function(resolve){
        resolve(data.rows[0].signature);
    });
};
exports.count = function(data){
    return new Promise(function(resolve){
        resolve(data.rows[0].count);
    });
};
exports.sigList = function(data){
    return new Promise(function(resolve){
        var promises = [];
        var array = data.rows;
        function list(i){
            return new Promise(function(resolve){
                if (array[i].url.search('http') == -1){
                    array[i].url = 'http://' + array[i].url;
                }
                resolve();
            });
        }
        for (var i=0; i<array.length; i++){
            var item = list(i);
            promises.push(item);
        }
        Promise.all(promises).then(function(){
            resolve(array);
        });
    });
};
