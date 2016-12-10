/* global process */
'use strict';

(function (menuController) {

    var menuService = require('../../api/menu/menuService');
    var preferenceService = require('../../api/preference/preferenceService');
    var orderService = require('../../api/order/orderService');
    var orderLineService = require('../../api/orderLine/orderLineService');
    var helper = require('../../data/dateTimeHelper');
    var _ = require('lodash');
      
    menuController.renderTodaysMenu = function (req, res, next) {
        var todayStr = helper.getRoTodayStr(); // "2016-03-26"
        if(req.user){
            let p1 = promiseToGetTodaysMenu(todayStr);
            let p2 = promiseToGetTodaysUserPreference(req.user.name, todayStr);
            let p3 = promiseToGetTodaysOrder(todayStr);
            let p4 = promiseToGetTodaysUserOrderLine(req.user.name, todayStr);
            
            Promise.all([p1, p2, p3, p4]).then(function(results){
                let menu = results[0];
                let pref = results[1];
                let order = results[2];
                let orderLine = results[3];

                var menuHasDishes = menu && menu.dishes && (menu.dishes.length > 0);
                if(menuHasDishes){                
                    menu.dishes = _.sortBy(menu.dishes, ['category', 'option']);
                    menu.dishes.forEach(function(dish) {
                        
                        var dishesInCategory = _.filter(menu.dishes, {'category': dish.category});
                        
                        if(dishesInCategory.length > 1){
                            
                            if(pref){
                                menu.preferenceId = pref._id;
                            }

                            if(dish.category === "1"){
                                if(pref && pref.option1 === dish.option){
                                    dish.isMyOption = true;
                                } else {
                                    dish.isNotMyOption = true;
                                }
                            }

                            if(dish.category === "2"){
                                if(pref && pref.option2 === dish.option){
                                    dish.isMyOption = true;
                                } else {
                                    dish.isNotMyOption = true;
                                }
                            }
                        }
                        
                    });                    
                }

                var orderStatus = {};

                if(!order){
                        orderStatus.inAsteptare = true;
                        orderStatus.details = "Anvis nu a trimis inca lista cu persoanele care urmeaza sa serveasca astazi masa (sau lista nu a fost importata in sistem).";
                } else { // there is an order
                    if(!orderLine){ // no orderLine for this employee
                            orderStatus.lipsaComanda = true;
                            orderStatus.details = "Anvis a trimis lista cu persoanele care urmeaza sa serveasca astazi masa, dar numele tau nu figureaza pe acesta lista.";
                    } else { // no orderLine for this employee
                        if(orderLine.status === "open"){
                            orderStatus.comandata = true;
                            orderStatus.details = "Anvis a anuntat ca astazi urmeaza sa servesti masa in " + orderLine.eatSeries + ". Te asteptam!";
                        } else { // completed
                            orderStatus.livrata = true;
                            orderStatus.details = "Ai servit deja masa. Daca doresti, ai posibilitatea sa evaluezi felurile de mancare servite astazi.";                            
                        }                         
                    }
                }

                var context = {
                    user: req.user,
                    menu: menu,
                    today: helper.getStringFromString(todayStr),
                    menuHasDishes: menuHasDishes,
                    orderStatus: orderStatus                    
                };
                
                res.render('menu/todaysMenu', context);

            })
            .catch(function(err){
                return handleError(res, err);
            })
        } else {
            promiseToGetTodaysMenu(todayStr).then(function(menu){
                var menuHasDishes = menu && menu.dishes && (menu.dishes.length > 0);
                if(menuHasDishes){                
                    menu.dishes = _.sortBy(menu.dishes, ['category', 'option']);
                }

                var context = {
                    user: req.user,
                    menu: menu,
                    today: helper.getStringFromString(todayStr),
                    menuHasDishes: menuHasDishes
                };
                
                res.render('menu/todaysMenu', context);

            })
            .catch(function(err){
                return handleError(res, err);
            })
        }
    }

    menuController.renderNextMenus = function (req, res, next) { 
        var todayStr = helper.getRoTodayStr(); // "2016-03-26"           
        menuService.getNextMenus(todayStr, function (err, menus) {
            if(err) { return handleError(res, err); }

            menus = _.map(menus, function(menu){
                menu.menuDateFormated = helper.getStringFromString(menu.menuDate);
                menu.dishes =  _.sortBy(menu.dishes, ['category', 'option']);
                return menu;
            });

            var context = {
                user: req.user,
                menus: menus,
                today: helper.getStringFromString(todayStr),
                areMenus: menus && (menus.length > 0)
            };
            
            if(req.user){
                
                // TODO: run this query in paralel with "getNextMenus" 
                preferenceService.getByEmployee(req.user.name, todayStr, function(err, preferences) {
                    if(err) { return handleError(res, err); }
                    
                    menus.forEach(function(menu) {
                        menu.dishes.forEach(function(dish) {
                            
                            var dishesInCategory = _.filter(menu.dishes, {'category': dish.category});
                            
                            if(dishesInCategory.length > 1){
                                var pref = _.find(preferences, {'date': menu.menuDate});
                                
                                if(pref){
                                    menu.preferenceId = pref._id;
                                };

                                if(dish.category === "1"){
                                    if(pref && pref.option1 === dish.option){
                                        dish.isMyOption = true;
                                    } else {
                                        dish.isNotMyOption = true;
                                    }
                                }

                                if(dish.category === "2"){
                                    if(pref && pref.option2 === dish.option){
                                        dish.isMyOption = true;
                                    } else {
                                        dish.isNotMyOption = true;
                                    }
                                }
                            }
                            
                        });
                    });

                    res.render('menu/myMenus', context);
                });
            } else {
                res.render('menu/nextMenus', context);
            }

        });    
    }  

    function promiseToGetTodaysMenu(todayStr){
        return new Promise(function(resolve, reject) {
            menuService.getTodaysMenu(todayStr, function (err, menu) {
                if(err) { reject(err) }
                resolve(menu);
            });  
        });   
    }

    function promiseToGetNextMenu(todayStr){
        return new Promise(function(resolve, reject) {
            menuService.getNextMenus(todayStr, function (err, menus) {
                if(err) { reject(err) }
                resolve(menus);
            });  
        });   
    }

    function promiseToGetUserPreferences(userName, todayStr){
        return new Promise(function(resolve, reject) {
            preferenceService.getByEmployee(userName, todayStr, function (err, preferences) {
                if(err) { reject(err) }
                resolve(preferences);  
            });
        });
    }   

    function promiseToGetTodaysUserPreference(userName, todayStr){
        return new Promise(function(resolve, reject) {
            preferenceService.getByEmployeeAndDate(userName, todayStr, function (err, preference) {
                if(err) { reject(err) }
                resolve(preference);  
            });
        });
    }  

    function promiseToGetTodaysOrder(todayStr){
        return new Promise(function(resolve, reject) {
            orderService.getByDate(todayStr, function (err, order) {
                if(err) { reject(err) }
                resolve(order);  
            });
        });
    }

    function promiseToGetTodaysUserOrderLine(employeeName, todayStr){
        return new Promise(function(resolve, reject) {
            orderLineService.getByUserAndDate(employeeName, todayStr, function (err, orderLine) {
                if(err) { reject(err) }
                resolve(orderLine);  
            });
        });
    }              
    
    function handleError(res, err) {
        return res.status(500).send(err);
    };

})(module.exports);