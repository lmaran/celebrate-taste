'use strict';

var menuService = require('./menuService');

exports.getAll = function (req, res) {
    menuService.getAll(function (err, menus) {
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

exports.getTodaysMenu = function (req, res) {
    menuService.getTodaysMenu(req.params.today, function (err, menu) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(menu);
    });    
};

exports.create = function(req, res){
    var menu = req.body;
    menuService.create(menu, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};


exports.update = function(req, res){
    var menu = req.body;
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
            .sortByAll(['category','option'])
            .map(function(dish){
                var dishTitle = dish.name;
                
                if(dish.option) dishTitle = dish.option + '. ' + dish.name;  
                if(dish.isFasting) dishTitle = dishTitle + ' (Post)'; 
                if(dish.calories) dishTitle = dishTitle + ' - ' + dish.calories + ' calorii';         
                
                doc.fontSize(20)
                    .text(dishTitle, {paragraphGap:30});
            })
            .value();

        // dishes.forEach(function(dish){
        // ...
        // });
        
        doc.fontSize(15)
            .moveDown(7)
            .text("Va dorim pofta buna! ", {align:'right'});

        
        res.set('Content-Type', 'application/pdf');
        doc.pipe(res);
        doc.end();        
        
    });    
};

function handleError(res, err) {
    return res.status(500).send(err);
};