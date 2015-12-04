/* global process */
'use strict';

(function (menuController) {

    var menuService = require('../../api/menu/menuService.js');
    
    menuController.renderTodaysMenu = function (req, res, next) {  
            
        menuService.getTodaysMenu(req.query.today, function (err, menu) {
            if(err) { return handleError(res, err); }
            //if(!doc) { return res.status(404).send('Not Found'); }
            console.log(menu);
            var context = {
                user: req.user,
                menu: menu
            };
            res.render('menu/todaysMenu', context);
        });    
    }
    
    
    function handleError(res, err) {
        return res.status(500).send(err);
    };

})(module.exports);