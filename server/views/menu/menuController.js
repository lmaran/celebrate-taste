/* global process */
'use strict';

(function (menuController) {

    var menuService = require('../../api/menu/menuService');
    var helper = require('../../data/dateTimeHelper');
    var _ = require('lodash');
    
    menuController.renderTodaysMenu = function (req, res, next) {      
        menuService.getTodaysMenu(req.query.today, function (err, menu) {
            if(err) { return handleError(res, err); }

            var menuHasDishes = menu && menu.dishes && (menu.dishes.length > 0);
            if(menuHasDishes){                
                menu.dishes = _.sortByAll(menu.dishes, ['category', 'option']);
            };

            var context = {
                user: req.user,
                menu: menu,
                today: helper.getStringFromString(req.query.today),
                menuHasDishes: menuHasDishes
            };
            res.render('menu/todaysMenu', context);
        });    
    }
    
    
    menuController.renderNextMenus = function (req, res, next) {            
        menuService.getNextMenus(req.query.today, function (err, menus) {
            if(err) { return handleError(res, err); }

            menus = _.map(menus, function(menu){
                menu.menuDate = helper.getStringFromString(menu.menuDate);
                menu.dishes =  _.sortByAll(menu.dishes, ['category', 'option']);
                return menu;
            });

            var context = {
                user: req.user,
                menus: menus,
                today: helper.getStringFromString(req.query.today),
                areMenus: menus && (menus.length > 0)
            };
            res.render('menu/nextMenus', context);
        });    
    }    
    
    function handleError(res, err) {
        return res.status(500).send(err);
    };

})(module.exports);