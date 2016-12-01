/* global process */
'use strict';

(function (menuController) {

    var menuService = require('../../api/menu/menuService');
    var preferenceService = require('../../api/preference/preferenceService');
    var helper = require('../../data/dateTimeHelper');
    var _ = require('lodash');
      
    menuController.renderTodaysMenu = function (req, res, next) {
        var todayStr = helper.getRoTodayStr(); // "2016-03-26"
        if(req.user){
            let p1 = promiseToGetTodaysMenu(todayStr);
            let p2 = promiseToGetUserPreferenceByDate(req.user.name, todayStr);
            
            Promise.all([p1, p2]).then(function(results){
                let menu = results[0];
                let pref = results[1];

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

    function promiseToGetUserPreferenceByDate(userName, todayStr){
        return new Promise(function(resolve, reject) {
            preferenceService.getByEmployeeAndDate(userName, todayStr, function (err, preference) {
                if(err) { reject(err) }
                resolve(preference);  
            });
        });
    }         
    
    function handleError(res, err) {
        return res.status(500).send(err);
    };

})(module.exports);