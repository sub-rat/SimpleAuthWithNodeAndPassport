const passport = require('passport');
const router = require('express').Router();
const auth = require('../../auth');
const UserController = require('../../controller/UserController')


router.post('/register',UserController.create);
router.post('/login', UserController.login)
router.get('/current', auth.checkToken, UserController.get);
router.delete('/delete', auth.checkToken, UserController.remove);
router.put('/resetpassword', UserController.update);

module.exports = router;