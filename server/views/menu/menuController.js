/* global process */
'use strict';

(function (menuController) {

    var menuService = require('../../api/menu/menuService');
    var helper = require('../../data/dateTimeHelper');
    var _ = require('lodash');
    
    menuController.renderTodaysMenu = function (req, res, next) { 
        var todayStr = req.query.today || helper.getStringFromDate(new Date());           
        menuService.getTodaysMenu(todayStr, function (err, menu) {
            if(err) { return handleError(res, err); }

            var menuHasDishes = menu && menu.dishes && (menu.dishes.length > 0);
            if(menuHasDishes){                
                menu.dishes = _.sortByAll(menu.dishes, ['category', 'option']);
            };
            
            var context = {
                user: req.user,
                menu: menu,
                today: helper.getStringFromString(todayStr),
                menuHasDishes: menuHasDishes
            };
            res.render('menu/todaysMenu', context);
        });    
    }
    
    
    menuController.renderNextMenus = function (req, res, next) { 
        var todayStr = req.query.today || helper.getStringFromDate(new Date());           
        menuService.getNextMenus(todayStr, function (err, menus) {
            if(err) { return handleError(res, err); }

            menus = _.map(menus, function(menu){
                menu.menuDate = helper.getStringFromString(menu.menuDate);
                menu.dishes =  _.sortByAll(menu.dishes, ['category', 'option']);
                return menu;
            });

            var context = {
                user: req.user,
                menus: menus,
                today: helper.getStringFromString(todayStr),
                areMenus: menus && (menus.length > 0)
            };
            res.render('menu/nextMenus', context);
        });    
    }    
    
    function handleError(res, err) {
        return res.status(500).send(err);
    };

})(module.exports);