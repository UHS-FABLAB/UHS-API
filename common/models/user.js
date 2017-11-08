'use strict';

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
};
