const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  email: String,
  hash: String,
  salt: String,
  _token: String
});

UsersSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 512,'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function(password){
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UsersSchema.methods.generateJWT = function(){
  // const today = new Date();
  // const expirationDate = new Date(today);
  // expirationDate.setDate(today.getDate + 3600);

  // return jwt.sign({
  //   email: this.email,
  //   id: this._id,
  //   exp: parseInt(expirationDate.getTime() / 1000, 10),
  // }, 'secret');
  var token = jwt.sign({
     email: this.email},
      "secret",
    { expiresIn: '24h' // expires in 24 hours
    }
  );
  this._token = token.toString();
  return token;
};

UsersSchema.methods.toAuthJSON = function(){
  return {
    _id : this._id,
    email: this.email,
    token: this._token,
  };
};

mongoose.model('Users', UsersSchema);

