/* global process */
"use strict";

(function(buildInfoService) {
    var buildInfoCache = null;

    buildInfoService.getAll = function(next) {
        if (!buildInfoCache) {
            var fs = require("fs");
            var config = require("../../config/environment");
            var path = require("path");
            var filePath = path.join(__dirnamet, "buildInfo.json");

            fs.readFile(filePath, "utf8", function(err, data) {
                if (err) return next(err, null);

                var buildInfo = JSON.parse(data);
                var buildInfoCache = {
                    nodeEnv: process.env.NODE_ENV,
                    commitId: buildInfo.commitId,
                    buildId: buildInfo.buildId,
                    buildDate: buildInfo.buildDate,
                };
                next(null, buildInfoCache);
            });
        } else {
            next(null, buildInfoCache);
        }
    };
})(module.exports);
