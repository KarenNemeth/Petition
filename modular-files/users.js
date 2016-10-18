exports.checkData = function(userData, res, page){
    return new Promise(function(resolve, reject){
        var promises = [];
        for (var prop in userData) {
            var promise = checkFields(userData[prop]);
            promises.push(promise);
        }
        function checkFields(userField){
            return new Promise(function(resolve,reject){
                if (userField == ''){
                    reject("Please fill in all fields");
                } else {
                    resolve();
                }
            });
        }
        Promise.all(promises).catch(function(msg){
            res.render(page, {"message": msg});
            throw msg;
        }).then(function(){
            if (userData.email.search("@") == -1){
                reject("Email Address Not Valid");
            } else {
                resolve();
            }
        });
    }).catch(function(msg){
        res.render(page, {"message": msg});
        throw msg;
    });
};
