const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

//PeopleSchema definition
const UserSchema = new Schema({
  username    : { type: String, unique: true },
  email       : { type: String, unique: true },
  password    : String,
  dateCreated : { type: Date, default: Date.now }
});

// Sets the createdAt parameter equal to the current time
UserSchema.pre('save', next => {
  now = new Date();
  if(!this.dateCreated) {
    this.dateCreated = now;
  }
  next();
});

UserSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

UserSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

//Exports the PeopleSchema for use elsewhere.
module.exports = mongoose.model('User', UserSchema);