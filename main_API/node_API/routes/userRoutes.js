var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

router.get('/', userController.list);
//router.get('/register', userController.showRegister);
//router.get('/login', userController.showLogin);
router.get('/profile/:id', userController.profile);
router.get('/logout', userController.logout);
router.get('/getjwt', requiresLogin, userController.getJwt);
router.get('/:id', userController.show);


router.post('/', userController.create);
router.post('/login', userController.login);
router.post('/loginPhoto', userController.loginPhoto);
router.post('/jwtlogin', userController.jwtAuth);
router.post('/photo/:id', userController.updatePhoto);


router.put('/:id', userController.update);

router.delete('/:id', userController.remove);

module.exports = router;
