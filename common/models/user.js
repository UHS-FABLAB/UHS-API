'use strict';
var crypto = require('crypto');

module.exports = function(User) {
  var app = require('../../server/server');
  User.observe('before save', function(ctx,next) {
    var Session = app.models.Session;
    var register_session_id=ctx.instance.registerSessionId;
    Session.findById(register_session_id, function(err, session) {
      if(session===null){
          var error = new Error();
          error.status = 400;
          error.message = "The session doesn't exist"
          next(error);
      }else{
          next();
      }
    });
  });

  User.prototype.createAccessToken = function(ttl, cb) {
    let tokenData = {ttl, userId: this.id}
    app.models.AccessToken.findOrCreate(
      {
        where: {
          "userId": this.id,
          "created": {gt: Date.now() - (ttl*1000)}
        }
      }, tokenData, function(err, token, created) {
        if (err) {
          cb(err, undefined);
          return;
        }
        cb(undefined, token)
      });
  };

  User.login = function(imei, cb) {
    User.findOrCreate({where: {imei}}, {imei}, function(err, user, created) {
      if (err) {
        cb(err, undefined);
        return;
      }
      user.createAccessToken(14400, cb);
      // else if (created) {
      //   user.createAccessToken(3600, cb);
      // } else {
      //   var error = new Error();
      //   error.status = 401;
      //   error.message = "This IMEI is already authenticated !"
      //   cb(error, undefined);
      // }
    });
  };

  /**
   * Logout a user with the given accessToken id.
   *
   * ```js
   *    User.logout('asd0a9f8dsj9s0s3223mk', function (err) {
  *      console.log(err || 'Logged out');
  *    });
   * ```
   *
   * @param {String} accessTokenID
   * @callback {Function} callback
   * @param {Error} err
   * @promise
   */

  User.logout = function(tokenId, fn) {
    var err;
    if (!tokenId) {
      err = new Error(g.f('{{accessToken}} is required to logout'));
      err.status = 401;
      fn(error);
      return fn.promise;
    }

    this.relations.accessTokens.modelTo.destroyById(tokenId, function(err, info) {
      if (err) {
        fn(err);
      } else if ('count' in info && info.count === 0) {
        err = new Error(g.f('Could not find {{accessToken}}'));
        err.status = 401;
        fn(err);
      } else {
        fn();
      }
    });
    return fn.promise;
  };
};
