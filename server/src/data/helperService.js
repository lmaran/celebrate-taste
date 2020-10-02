"use strict";
var _ = require("lodash");
var factory = {};

factory.getEmployeeByName = function (employeeName, employees) {
    // find employee by adjustedName
    var that = this;
    let employee = _.find(employees, function (e) {
        return that.normalize(e.adjustedName) == that.normalize(employeeName);
    });

    // if not found, search again by name
    if (!employee) {
        employee = _.find(employees, function (e) {
            return that.normalize(e.name) == that.normalize(employeeName);
        });
    }
    return employee;
};

factory.getBadgeByEmployee = function (employee, badges) {
    var that = this;
    var empName = employee.adjustedName || employee.name; // if "adjustedName" is present then use it

    let badge = _.find(badges, function (b) {
        return that.normalize(b.ownerCode) == that.normalize(empName);
    });

    return badge;
};

factory.normalize = function (str) {
    if (!str) return undefined;
    return (
        str
            .toLowerCase()
            //.replace(/-/g , ' ') // replace dash with one space
            .replace(/ {2,}/g, " ")
    ); // replace multiple spaces with a single space
};

module.exports = factory;
