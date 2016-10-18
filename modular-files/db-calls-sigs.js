const callbacks = require('./db-callbacks.js');

exports.checkSig = {
    "call": 'SELECT ID FROM signatures WHERE User_ID = $1;',
    "callback": callbacks.data
};
exports.saveSig = {
    "call": 'INSERT INTO signatures (Signature, User_ID) VALUES ($1,$2) RETURNING id;',
    "callback": callbacks.id
};
exports.deleteSig = 'DELETE FROM signatures WHERE User_ID=$1;';
exports.getSigPic = {
    "call": 'SELECT Signature FROM signatures WHERE User_ID=$1;',
    "callback": callbacks.sig
};
exports.sigCount = {
    "call": 'SELECT count(ID) FROM signatures;',
    "callback": callbacks.count
};
exports.getSigs = {
    "call": 'SELECT users.FirstName, users.LastName, user_profiles.Age,\
    user_profiles.City, user_profiles.URL FROM signatures\
    LEFT JOIN user_profiles ON signatures.user_ID = user_profiles.user_ID\
    LEFT JOIN users ON signatures.user_ID = users.ID;',
    "callback": callbacks.sigList
};
exports.getSigsCity = {
    "call": 'SELECT users.FirstName, users.LastName, user_profiles.Age,\
    user_profiles.City, user_profiles.URL FROM signatures\
    LEFT JOIN user_profiles ON signatures.user_ID = user_profiles.user_ID\
    LEFT JOIN users ON signatures.user_ID = users.ID WHERE user_profiles.City = $1;',
    "callback": callbacks.sigList
};
