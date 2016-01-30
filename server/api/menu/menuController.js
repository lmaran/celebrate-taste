'use strict';

var menuService = require('./menuService');
var helper = require('../../data/dateTimeHelper');

exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
        
    menuService.getAll(odataQuery, function (err, menus) {
        if(err) { return handleError(res, err); }
        res.status(200).json(menus);        
    });
};

exports.getById = function (req, res) {
    menuService.getById(req.params.id, function (err, menu) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(menu);
    });    
};

// exports.getTodaysMenu = function (req, res) {
//     var todayStr = req.query.today || helper.getStringFromDate(new Date());
//     menuService.getTodaysMenu(todayStr, function (err, menu) {
//         if(err) { return handleError(res, err); }
//         //if(!doc) { return res.status(404).send('Not Found'); }
//         res.json(menu);
//     });    
// };
// 
// exports.getNextMenus = function (req, res) {
//     var todayStr = req.query.today || helper.getStringFromDate(new Date());
//     menuService.getNextMenus(todayStr, function (err, menus) {
//         if(err) { return handleError(res, err); }
//         res.status(200).json(menus);        
//     });
// };

exports.getActiveMenus = function (req, res) { // today and next menus
    var todayStr = req.query.today || helper.getStringFromDate(new Date());
    menuService.getActiveMenus(todayStr, function (err, menus) {
        if(err) { return handleError(res, err); }
        res.status(200).json(menus);        
    });
};

exports.create = function(req, res){
    var menu = req.body;
    
    menu.createBy = req.user.name;    
    menu.createdOn = new Date();     
    
    menuService.create(menu, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};


exports.update = function(req, res){
    var menu = req.body;
    
    menu.modifiedBy = req.user.name;    
    menu.modifiedOn = new Date();     
    
    menuService.update(menu, function (err, response) {
        if(err) { return handleError(res, err); }
        if (!response.value) {
            res.sendStatus(404); // not found
        } else {
            res.sendStatus(200);
        }
    });
};


exports.remove = function(req, res){
    var id = req.params.id;
    menuService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

exports.printById = function (req, res) {
    // !!!important
    // daca primesti (in broser) un pdf blank, atunci asta e din cauza lui live-reload care corupe pdf-ul
    // Solutia1: folosesti o ruta cu extensia ".pdf"". Ex: app.route('aaa.pdf')
    // Solutia2: in momentul in care initiezi live-reload, poti sa-i transmiti ca si parametru ce fisiere/folder sa ignore
    // ex: in config/express.js -> app.use(require('connect-livereload')({ignore: ['/aaa']})); -> pt. ruta: "app.route('/aaa')"
    // http://stackoverflow.com/a/30010748/2726725
    
    menuService.getById(req.params.id, function (err, menu) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        //res.json(menu);
        
        // 1.          
        // var fs = require('fs');
        // var r = fs.createReadStream('aaa.txt');   
        // r.pipe(res); 
        
        // 2.
        // res.sendFile('/home/dadi/data/proiecte/celebrate-taste/aaa1.pdf');
        
        // 3.
        // var fs = require('fs');
        // var r = fs.createReadStream('aaa1.pdf');  
        // res.setHeader('Content-Type', 'application/pdf'); // functioneaza si fara           
        // r.pipe(res);     
                        
        //4. 
        var _ = require('lodash');
        var PDFDocument = require('pdfkit');                  

        var doc = new PDFDocument();
        
        doc.fontSize(30)
            .text("Meniul zilei", {align:'center'})
            .fontSize(20)
            .text(menu.menuDate, {align:'center'})
            .moveDown(3);
                    
        
        _.chain(menu.dishes)
            .sortBy(['category','option'])
            .map(function(dish){
                var dishTitle = dish.name;
                
                if(dish.option) dishTitle = dish.option + '. ' + dish.name;  
                if(dish.isFasting) dishTitle = dishTitle + ' (Post)'; 
                if(dish.calories) dishTitle = dishTitle + ' - ' + dish.calories + ' calorii';         
                
                doc.fontSize(20)
                    .text(dishTitle, {paragraphGap:30});
            })
            .value();
        
        doc.fontSize(15)
            .moveDown(7)
            .text("Va dorim pofta buna! ", {align:'right'});

        
        res.set('Content-Type', 'application/pdf');
        doc.pipe(res);
        doc.end();        
        
    });    
};

exports.printCurrentWeek = function (req, res) {
    var today = new Date();
    var dif = (today.getDay() + 6) % 7;
    
    var lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - dif);

    //console.log(lastMonday);
    //console.log(helper.getStringFromDate(lastMonday));
    createDoc(req, res, lastMonday);
};

exports.printNextWeek = function (req, res) {
    var today = new Date();
    var dif = (today.getDay() + 6) % 7;
    
    var nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() - dif + 7);
  
    createDoc(req, res, nextMonday);
};

function createDoc(req, res, firstDay){
    var lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6);
    
    var firstDayStr = helper.getStringFromDate(firstDay);
    var lastDayStr = helper.getStringFromDate(lastDay);
    
    menuService.getFromInterval(firstDayStr, lastDayStr, function (err, menus) {
        if(err) { return handleError(res, err); }

        var _ = require('lodash');
        var PDFDocument = require('pdfkit');                  
        var doc = new PDFDocument({margins:{top:20, bottom:10, left:72, right:50}});

        doc
            .fontSize(18)
            .text("Meniul saptamanii", {align:'center'})
            .fontSize(12)
            .text(helper.getFriendlyDate(firstDay).dmy + '  -  ' + helper.getFriendlyDate(lastDay).dmy, {align:'center'});
            
        _.chain(menus)
            .sortBy('menuDate')
            .map(function(menu){
                
                doc
                    .moveDown(1)
                    .fontSize(11)
                    .text(helper.getFriendlyDate(helper.getDateFromString(menu.menuDate)).dayAsString, {stroke:true})
                    .moveDown(0.5);
                    
                _.chain(menu.dishes)
                    .sortBy(['category','option'])
                    .map(function(dish){                        
                        if(dish.option) doc.text(dish.option + '. ', {stroke:true, continued: true});
                        doc.text(dish.name, {stroke:false, continued: true});
                        if(dish.isFasting) doc.text(' (Post) ', {stroke:false, continued: true});
                        if(dish.calories) doc.text(' - ' + dish.calories + ' cal.', {stroke:false});
                        doc.text('', {continued: false}); // force a new line
                    })
                    .value();                

            })
            .value();

        var finalMessage = "Pofta buna! ";
        if(menus.length == 0)
            finalMessage = "Nu exista meniuri in perioada selectata!";         
            
        doc.fontSize(12)
            .moveDown(2)
            .text(finalMessage);
            
        
        res.set('Content-Type', 'application/pdf');
        doc.pipe(res);
        doc.end();        
        
    });       
}

function handleError(res, err) {
    return res.status(500).send(err);
};