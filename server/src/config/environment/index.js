/* global __dirname */
/* global process */
"use strict";
var path = require("path");
var _ = require("lodash");

function requiredProcessEnv(name) {
    if (!process.env[name]) {
        throw new Error("You must set the " + name + " environment variable");
    }
    return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
    env: process.env.NODE_ENV || "development",

    // Root path of server
    root: path.normalize(__dirname + "/../../.."), // 3 folders back from the current folder

    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
        session: "node-fullstack-secret",
    },

    // List of user roles
    userRoles: ["guest", "user", "partner", "admin"], // the order is important

    mailgun: {
        api_key: process.env.MAILGUN_KEY,
    },

    zoho: {
        user: process.env.ZOHO_USER,
        psw: process.env.ZOHO_PSW,
    },

    rollbarToken: "c40dd41c292340419923230eed1d0d61",
    logglyToken: "ffa32efd-fe1b-4de4-99c2-9c0d6b1f07bc",
    logglySubdomain: "lmaran",
    roUtcOffset: 3, // stg/prod => userTime=srvTime + 2,  dev => userTime=srvTime // TODO: not ok...fix it
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(all, require("./" + all.env + ".js") || {});
