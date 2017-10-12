const mongoose      = require('mongoose');
const passport      = require('passport');
const Users         = require('../app/users/model/user');
const userTypeArray = [Users];

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Serialize user for creating user session/professional session
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
passport.serializeUser((user,done) => {
    done(null, user.id);
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Deserialize the user and check wheter the serialize key equivalient is for professional or client
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
passport.deserializeUser((id, done) => {
    let callback = (err, user) => {
        if(err){
            done(err);
        } 
            
        if(user){
            done(null, user);
        }
    };

    getArrayToDeserialize(userTypeArray, id, callback); 
});

let getArrayToDeserialize = (array, id, callback) => {
    for(let item in array){
        array[item].findById(id, callback).select({'__v': 0, 'password':0 });
    }
};