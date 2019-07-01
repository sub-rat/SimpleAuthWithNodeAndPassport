const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

router.post('/register', (req, res, next) => {
    const { body: { user  }} = req;
    
    if(!user.email){
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if(!user.password ){
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    const finalUser = new Users(user);
        finalUser.setPassword(user.password);
        finalUser._token = finalUser.generateJWT();
        Users.findOne({ email: user.email }).then((user) => {
        if(user){
            return res.json({ errors: { 'email': 'already exists'}});
        }
        return finalUser.save()
        .then(() => res.json({ user: finalUser.toAuthJSON() }));
    }).catch(res);

});

router.post('/login', (req, res, next) => {
    const { body: { user }} = req;

    if(!user.email){
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if(!user.password){
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
        if(err){
            next(err);
            return res.status(401).json({ error : "User doesn't exists" })
        }

        if(passportUser){
            const user = passportUser;
            user._token = passportUser.generateJWT();
            user.save();
            return res.json({ user: user.toAuthJSON() });
        }

        return status(400).info;
    })(req,res, next);
});


router.get('/current', auth.checkToken, (req, res, next) => {

    return Users.findOne({ _token : req.token })
        .then((user) => { 
            if(!user){
                return res.sendStatus(400);
            }

            return res.json({ user: user.toAuthJSON() })
        });
});

router.delete('/delete', auth.checkToken, (req, res, next) =>{
    return Users.findOne({ _token : req.token })
    .then((user) => { 
        if(!user){
            return res.status(400).json("user doen't existts");
        }
        user.delete()
        return res.json({ "success": "user successfully deleted" })
    });
});

router.post('/forget',(req, res, next) => {
    const { body: { user }} = req;

     return Users.findOne({ email: user.email })
        .then((user) => {
            if(!user){
                return res.status(400).json("user doen't existts");
            }
            return res.json({
                "message": "Please follow the link to reset password http://localhost:8080/api/users/resetpassword"
            })
        })
});

router.put('/resetpassword', (req, res, next) => {
    const { body: { user }} = req;
    
    if(!user.email){
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if(!user.password ){
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }
        Users.findOne({ email: user.email }, function(err, finalUser) {
            if(!err) {
                if(!finalUser) {
                    return res.json("user doen't exist")
                }
                finalUser.setPassword(user.password);
                finalUser._token = '';
                finalUser.save(function(err) {
                    if(!err) {
                        return res.status(400).json({ user: finalUser.toAuthJSON() });
                    }
                    else {
                        return res.status(400).json({"message":"could not save user"});
                    }
                });
            }
        }).catch(res);

});

module.exports = router;