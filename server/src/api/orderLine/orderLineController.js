"use strict";

var orderLineService = require("./orderLineService");
var orderLineValidator = require("./orderLineValidator");
var importDataValidator = require("./importDataValidator");
var customerEmployeeService = require("../customerEmployee/customerEmployeeService");
var badgeService = require("../badge/badgeService");
var preferenceService = require("../preference/preferenceService");
var menuService = require("../menu/menuService");
var async = require("async");
var helperService = require("../../data/helperService");
var _ = require("lodash");

// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf("/$count") !== -1; //check for $count as a url segment
    if (!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records

    promiseToGetOrderLines(odataQuery)
        .then(function (orderLines) {
            res.status(200).json(orderLines);
        })
        .catch(function (err) {
            return handleError(res, err);
        });
};

exports.getAllWithBadgeInfo = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf("/$count") !== -1; //check for $count as a url segment
    if (!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records

    let p1 = promiseToGetOrderLines(odataQuery);
    let p2 = promiseToGetCustomerEmployees("");
    let p3 = promiseToGetBadges("");

    Promise.all([p1, p2, p3])
        .then(function (results) {
            let orderLines = results[0];
            let customerEmployees = results[1];
            let badges = results[2];

            let newOrderLines = [];
            orderLines.forEach(function (orderLine) {
                let employee = helperService.getEmployeeByName(orderLine.employeeName, customerEmployees);
                if (employee) {
                    let badge = helperService.getBadgeByEmployee(employee, badges);
                    orderLine.badgeCode = badge && badge.code;
                }

                newOrderLines.push(orderLine);
            });
            res.status(200).json(newOrderLines);
        })
        .catch(function (err) {
            return handleError(res, err);
        });
};

// ---------- REST ----------
exports.create = function (req, res) {
    var orderLine = req.body;

    orderLine.createBy = req.user.name;
    orderLine.createdOn = new Date();
    orderLine.status = "open";

    orderLineValidator.all(req, res, function (errors) {
        if (errors) {
            res.status(400).send({ errors: errors }); // 400 - bad request
        } else {
            if (
                orderLine.option1 === undefined ||
                orderLine.option1.trim() === "" ||
                orderLine.option2 === undefined ||
                orderLine.option2.trim() === ""
            ) {
                // get available options
                menuService.getTodaysMenu(orderLine.orderDate, function (err, menu) {
                    if (err) {
                        return handleError(res, err);
                    }

                    var availableOptions1 = getAvailableOptions(menu, "1"); // => ['A', 'B']
                    var availableOptions2 = getAvailableOptions(menu, "2"); // => ['C', 'D']

                    // we don't want to set up a default option for option 1 (this option can be empty)
                    // if(orderLine.option1 === undefined || orderLine.option1.trim() === ''){
                    //     orderLine.option1 = getOption(availableOptions1);
                    // };
                    if (orderLine.option2 === undefined || orderLine.option2.trim() === "") {
                        orderLine.option2 = getOption(availableOptions2);
                    }

                    // save orderLine
                    orderLineService.create(orderLine, function (err, response) {
                        if (err) {
                            return handleError(res, err);
                        }
                        res.status(201).json(response.ops[0]);
                    });
                });
            } else {
                // save orderLine
                orderLineService.create(orderLine, function (err, response) {
                    if (err) {
                        return handleError(res, err);
                    }
                    res.status(201).json(response.ops[0]);
                });
            }
        }
    });
};

exports.getById = function (req, res) {
    var orderLineId = req.params.id;
    orderLineService.getById(orderLineId, function (err, orderLine) {
        if (err) {
            return handleError(res, err);
        }
        res.json(orderLine);
    });
};

exports.update = function (req, res) {
    var orderLine = req.body;
    orderLine.modifiedBy = req.user.name;
    orderLine.modifiedOn = new Date();

    orderLineValidator.all(req, res, function (errors) {
        if (errors) {
            res.status(400).send({ errors: errors }); // 400 - bad request
        } else {
            orderLineService.update(orderLine, function (err, response) {
                if (err) {
                    return handleError(res, err);
                }
                if (!response.value) {
                    res.sendStatus(404); // not found
                } else {
                    //res.sendStatus(200);

                    // get new status
                    orderLineService.getDeliverySummary(orderLine.orderId, orderLine.eatSeries, function (
                        err,
                        deliverySummary
                    ) {
                        if (err) {
                            return handleError(res, err);
                        }
                        res.status(200).json(deliverySummary);
                    });
                }
            });
        }
    });
};

exports.remove = function (req, res) {
    var orderLineId = req.params.id;
    orderLineService.remove(orderLineId, function (err, response) {
        if (err) {
            return handleError(res, err);
        }
        res.sendStatus(204);
    });
};

// ---------- RPC ----------
exports.import = function (req, res) {
    var importData = req.body;

    importDataValidator.all(req, res, function (errors) {
        if (errors) {
            res.status(400).send({ errors: errors }); // 400 - bad request
        } else {
            // get 'customerEmployees' and 'prefeences'
            async.parallel(
                [
                    function (callback) {
                        var odataQuery1 = { $filter: "isActive eq true" };
                        customerEmployeeService.getAll(odataQuery1, callback);
                    },
                    function (callback) {
                        var odataQuery2 = { $filter: "date eq '" + importData.orderDate + "'" };
                        preferenceService.getAll(odataQuery2, callback);
                    },
                    function (callback) {
                        menuService.getTodaysMenu(importData.orderDate, callback);
                    }
                ],
                function (err, results) {
                    // here we have the results

                    if (err) {
                        return handleError(res, err);
                    }

                    var employees = results[0];
                    var preferences = results[1];
                    var menu = results[2];
                    var orderLines = [];

                    var availableOptions1 = getAvailableOptions(menu, "1"); // => ['A', 'B']
                    var availableOptions2 = getAvailableOptions(menu, "2"); // => ['C', 'D']

                    // transform the string in array + remove empty lines: http://stackoverflow.com/a/19888749
                    var employeesName = req.body.employeesName.split("\n").filter(Boolean);

                    // create a new record for each received name
                    employeesName.forEach(function (employeeName) {
                        employeeName = employeeName.trim();

                        var preference = _.find(preferences, function (item) {
                            return normalize(item.employeeName) == normalize(employeeName);
                        });
                        var employee = _.find(employees, function (item) {
                            return normalize(item.name) == normalize(employeeName);
                        });

                        var orderLine = {
                            orderId: importData.orderId,
                            orderDate: importData.orderDate,
                            eatSeries: importData.eatSeries,
                            employeeName: employee ? employee.name : employeeName, // better formatting
                            createBy: req.user.name,
                            createdOn: new Date(),
                            status: "open"
                        };

                        if (preference && preference.option1) {
                            orderLine.option1 = preference.option1;
                            orderLine.fromOwnerOpt1 = true;
                        } else {
                            // get a random value
                            // we don't want to set up a default option for option 1 (this option can be empty)
                            // orderLine.option1 = getOption(availableOptions1);
                        }

                        if (preference && preference.option2) {
                            orderLine.option2 = preference.option2;
                            orderLine.fromOwnerOpt2 = true;
                        } else {
                            // get a random value
                            // orderLine.option2 = getOption(availableOptions2);

                            // new (daca nu si-a ales nici supa nici felul 2 atunci primeste automat optiunea "C" (cerintă 2 Martie 2020))
                            if (!orderLine.option1) {
                                orderLine.option2 = "C";
                            }
                        }

                        orderLines.push(orderLine);
                    });

                    // save to db
                    orderLineService.createMany(orderLines, function (err, response) {
                        if (err) {
                            return handleError(res, err);
                        }
                        res.status(201).json(response.ops[0]);
                    });
                }
            );
        }
    });
};

// ---------- Helpers ----------
function getOption(availableOptions) {
    // => ['A', 'B']
    if (availableOptions.length == 0) return null;
    if (availableOptions.length == 1) return availableOptions[0];

    if (availableOptions.length == 2) {
        var weightedOptions = [];

        for (var i = 0; i < 3; i++) {
            // A: 30%
            weightedOptions.push(availableOptions[0]); // => ['A','A','A']
        }
        for (var i = 0; i < 7; i++) {
            // B: 70%
            weightedOptions.push(availableOptions[1]); // => ['A','A','A','B','B','B','B','B','B','B']
        }
        var randomNr = Math.floor(Math.random() * weightedOptions.length); // random nr. [0..9]
        return weightedOptions[randomNr]; // => 'A' or 'B' with probability: A: 30%, B: 70%
    }

    if (availableOptions.length == 3) {
        var weightedOptions = [];

        for (var i = 0; i < 4; i++) {
            // A: 40%
            weightedOptions.push(availableOptions[0]); // => ['A','A','A','A']
        }
        for (var i = 0; i < 6; i++) {
            // B: 60%
            weightedOptions.push(availableOptions[1]); // => ['A','A','A','A','B','B','B','B','B','B']
        }
        // for(var i=0; i<5; i++){ // C: 50%
        //     weightedOptions.push(availableOptions[2]) // => ['A','A','A','A','B','B','B','C','c','c','C','C']
        // }
        var randomNr = Math.floor(Math.random() * weightedOptions.length); // random nr. [0..9]
        return weightedOptions[randomNr]; // => 'A' or 'B' or 'C' with probability: A: 40%, B: 60%, C: 0%
    }
}

function getAvailableOptions(menu, category) {
    if (!menu) return [];
    return _.chain(menu.dishes)
        .filter({ category: category })
        .map(function (item) {
            return item.option;
        })
        .sortBy()
        .value(); // => ['A', 'B']
}

function handleError(res, err) {
    return res.status(500).send(err);
}

function normalize(str) {
    if (!str) return undefined;
    return (
        str
            .toLowerCase()
            //.replace(/-/g, " ") // replace dash with one space
            .replace(/ {2,}/g, " ")
    ); // replace multiple spaces with a single space
}

function promiseToGetOrderLines(odataQuery) {
    return new Promise(function (resolve, reject) {
        orderLineService.getAll(odataQuery, function (err, orderLines) {
            if (err) {
                reject(err);
            }
            resolve(orderLines);
        });
    });
}

function promiseToGetCustomerEmployees(odataQuery) {
    return new Promise(function (resolve, reject) {
        customerEmployeeService.getAll(odataQuery, function (err, customerEmployees) {
            if (err) {
                reject(err);
            }
            resolve(customerEmployees);
        });
    });
}

function promiseToGetBadges(odataQuery) {
    return new Promise(function (resolve, reject) {
        badgeService.getAll(odataQuery, function (err, badges) {
            if (err) {
                reject(err);
            }
            resolve(badges);
        });
    });
}
