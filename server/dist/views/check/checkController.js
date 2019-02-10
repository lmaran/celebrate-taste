/* global process */
'use strict';

(function (checkController) {
      
    checkController.getInfo = function (req, res, next) {
        // set DEPLOYMET_SLOT as env variable on remote server
        // e.g. "celebrate-taste-blue-staging"
        res.send("celebrate-taste-" + (process.env.DEPLOYMENT_SLOT || "noslot") + "-" + process.env.NODE_ENV);
    }

})(module.exports);