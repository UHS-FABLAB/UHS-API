var dsConfig = require('../datasources.json');
var path = require('path');

module.exports = function(app) {
  var User = app.models.User;

  //log a user in
  app.post('/login', function(req, res) {
    User.login(req.body.imei, function(err, token) {
      if (err) {
        res.send(err);
        return;
      }
      if (token) {
        res.send(token)
      }
    });
  });

  //log a user out
  app.get('/logout', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    User.logout(req.accessToken.id, function(err) {
      if (err) return next(err);
      res.redirect('/');
    });
  });
};
