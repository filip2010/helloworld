var userCtrl = require('../controllers/userCtrl.js');


module.exports = function (app) {

    app.get('/user/login/:username/:password', userCtrl.login);



}