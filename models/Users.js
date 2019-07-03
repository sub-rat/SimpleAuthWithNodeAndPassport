const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validate = require('mongoose-validator');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  first   : {type: String},
    last    : {type: String},
    phone   : {type: String, lowercase: true, trim: true, index: true, unique: true, sparse: true, //sparse is because now we have two possible unique keys that are optional
            validate: [validate({
                validator: 'isNumeric',
                arguments: [7, 20],
                message: 'Not a valid phone',
            })] 
        },
    email   : {type: String, lowercase: true, trim: true, index: true, unique: true, sparse: true,
            validate: [validate({
                validator: 'isEmail',
                message: 'Not a valid email',
            })]
        },
    salt : {type: String},
    password  : {type: String},
    _token: { type: String}
}, { timestamps: true });

UsersSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 512,'sha512').toString('hex');
  this.password = hash
};

UsersSchema.methods.validatePassword = function(password){
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 512, 'sha512').toString('hex');
  return this.password === hash;
};

UsersSchema.methods.generateJWT = function(){
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
    let json = this.toJSON();
    json.id = this._id;
    return json;
};

mongoose.model('Users', UsersSchema);

