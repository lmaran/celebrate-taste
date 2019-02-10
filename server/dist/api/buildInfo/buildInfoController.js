'use strict';

var buildInfoService = require('./buildInfoService');

exports.getAll = function (req, res) {
    
    if(process.env.NODE_ENV == 'development'){
        return res.status(200).json({nodeEnv: process.env.NODE_ENV});
    }
    
    buildInfoService.getAll(function (err, buildInfo) {
        if(err) { return handleError(res, err); }
        res.status(200).json(buildInfo);        
    });
};

function handleError(res, err) {
    return res.status(500).send(err);
};