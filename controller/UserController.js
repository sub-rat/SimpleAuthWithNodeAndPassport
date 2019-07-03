
const mongoose = require('mongoose');
const passport = require('passport');
const Users = mongoose.model('Users');
const create = (req, res) => {
    var response = {
        success:false
    }

    const { body: { user  }} = req;
    
    if(!user.email){
        response.message = "Email is required"
        return res.status(422).json(response);
    }

    if(!user.password ){
        response.message = "Password is required"
        return res.status(422).json(response);
    }

    const finalUser = new Users(user);
        finalUser.setPassword(user.password);
        finalUser._token = finalUser.generateJWT();
        Users.findOne({ email: user.email }).then((user) => {
        if(user){
            response.message = "Email Already Exists"
            return res.json(response);
        }
        return finalUser.save()
         .then(() => {
            response.data = finalUser.toAuthJSON()
            response.success = true
             res.json(response)
            })
    }).catch(res);

        
}
module.exports.create = create

const get = (req, res) => {
    var response = {
        success:false
    }
    Users.findOne({ _token : req.token })
    .then((user) => { 
        if(!user){
            response.message = "User Not Found!!"
            return res.status(422).json(response);
        }

        response.data = user.toAuthJSON() 
        response.success = true
        return res.status(422).json(response);
    })
}
module.exports.get = get; 

const update =  (req, res) => {
    var response = {
        success:false
    }
    const { body: { user }} = req;
    
    if(!user.email){
        response.message = "Email is required"
        return res.status(422).json(response);
    }

    if(!user.password ){
        response.message = "Password is required"
        return res.status(422).json(response);
    }
        Users.findOne({ email: user.email }, function(err, finalUser) {
            if(!err) {
                if(!finalUser) {
                    response.message = "User Doesn't Exists"
                    return res.status(422).json(response);
                }
                finalUser.setPassword(user.password);
                finalUser._token = '';
                finalUser.save(function(err) {
                    if(!err) {
                        response.data =  finalUser.toAuthJSON()
                        response.success = true
                        return res.status(200).json(response)
                    }
                    else {
                        response.message = "could not save user"
                        return res.status(422).json(response)
                    }
                });
            }
        }).catch(res);

}
module.exports.update = update;

const remove =  (req, res) => {
    var response = {
        success:false
    }
    return Users.findOne({ _token : req.token })
    .then((user) => { 
        if(!user){
            response.message = "User dont exitsts"
            return res.status(422).json(response)
        }
        user.delete()
        response.message =  "user successfully deleted"
        response.success = true
        return res.status(200).json(response)
    });
}

module.exports.remove = remove;

const login =  (req, res, next) => {
    var response = {
        success:false
    }
     const { body: { user }} = req;

    if(!user.email){
        response.message = "Email is required"
        return res.status(422).json(response);
    }

    if(!user.password){
        response.message = "Password is required"
        return res.status(422).json(response);
    }

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if(err){
            response.message = "User Doesnt exists"
            return res.status(422).json(response);
        }

        if(passportUser){
            const user = passportUser;
            user._token = passportUser.generateJWT();
            user.save();
            response.data =  user.toAuthJSON()
            response.success = true
            return res.status(200).json(response)
        }

        return status(400).info;
    })(req,res, next);
}
module.exports.login = login