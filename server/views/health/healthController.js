/* global process */
'use strict';

(function (healthController) {
      
    healthController.renderHealth = function (req, res, next) {
        var discriminator = process.env.NODE_ENV === "staging" ? "-stg" : "";

        var context = {
            layout: false,
            healthValue: "celebrate-taste" + discriminator + "-ok"
        };

        res.render('health/health', context);
  
    }

})(module.exports);