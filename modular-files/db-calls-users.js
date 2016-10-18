const callbacks = require('./db-callbacks.js');

//query objects
exports.saveUser = {
    "call": 'INSERT INTO users (FirstName, LastName, Email, Password) VALUES ($1,$2,$3,$4) RETURNING ID;',
    "callback": callbacks.id
};
exports.checkUser = {
    "call": 'SELECT FirstName, LastName, ID, Password FROM users WHERE Email = $1;',
    "callback": callbacks.data
};
exports.checkProfile = {
    "call": 'SELECT ID FROM user_profiles WHERE User_ID = $1;',
    "callback": callbacks.data
};
exports.addProfile = 'INSERT INTO user_profiles (User_ID, Age, City, URL) VALUES ($1,$2,$3,$4);';
exports.editProfilePage = {
    "call": 'SELECT * FROM users LEFT JOIN user_profiles ON users.ID = user_profiles.user_ID WHERE users.ID = $1;',
    "callback": callbacks.data
};
exports.updateUsers = 'UPDATE users SET FirstName=$1, LastName=$2, Email=$3, Password=$4 WHERE users.ID=$5;';
exports.updateProfile = 'UPDATE user_profiles SET Age=$2, City=$3, URL=$4 WHERE User_ID=$1;';
