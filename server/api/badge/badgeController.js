'use strict';

var badgeService = require('./badgeService');
var badgeValidator = require('./badgeValidator');
var preferenceService = require('../preference/preferenceService');
var config = require('../../config/environment');
var emailService = require('../../data/emailService');

let multiparty = require('multiparty');
let path = require('path');

const xlsx = require('node-xlsx').default;


// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records
        
    badgeService.getAll(odataQuery, function (err, badges) {
        if(err) { return handleError(res, err); }
        res.status(200).json(badges);        
    });
};

// ---------- RPC ----------

exports.uploadFile = function (req, res) {
    let form = new multiparty.Form(); 
    const maxSizeInMB = 5;

    form.on('part', function (part) {
        if (!part.filename){
            part.resume(); // ignore field's content
            return false;
        }           

        var errMsg = validateFile(part, maxSizeInMB);
        if(errMsg){
            res.status(400).send({ msg : errMsg }); // 400 - bad request
            part.resume(); // used to fully consume the data from a stream without actually processing any of that data
            return false;
        }          

        // http://stackoverflow.com/a/14269536; https://github.com/stream-utils/stream-to-array
        var bufs = [];
        part.on('data', function (d) { bufs.push(d); });
        part.on('end', function () {
            var buf = Buffer.concat(bufs); 
            try {
                //console.log(111);
                const workSheets = xlsx.parse(buf);
                //console.log(222);
                // console.log(JSON.stringify(workSheets, null, 4)); 
                //console.log(333);
                let cards = getCardsFromWorksheet(workSheets[0]);
                if (typeof cards === "string") {
                    res.status(400).send({ msg : cards }); // 400 - bad request
                    //part.resume(); // not necessary, the input stream is already processed
                    return false;  
                } else {
                    // save cards to mongo
                    console.log(cards);
                    res.json({importedCards: cards.length});
                }
                
            }
            catch(e){
                res.status(400).send({ msg : `Fisierul importat nu poate fi citit.` }); // 400 - bad request
                //part.resume(); // not necessary, the input stream is already processed
                return false;              
            }
        });      

    });

    form.parse(req);
};

// ---------- REST ----------
exports.create = function(req, res){
    badgeValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            var badge = req.body;
            
            // badge.isActive = true;
            badge.createBy = req.user.name;    
            badge.createdOn = new Date();              
            
            badgeService.create(badge, function (err, response) {
            if(err) { return handleError(res, err); }
            res.status(201).json(response.ops[0]);
        });           
        }
    });    
};

exports.getById = function (req, res) {
    badgeService.getById(req.params.id, function (err, badge) {
        if(err) { return handleError(res, err); }
        res.json(badge);
    });    
};

exports.update = function(req, res){
    var badge = req.body;
    badgeValidator.all(req, res, function(errors){
        if(errors){
            res.status(400).send({ errors : errors }); // 400 - bad request
        }
        else{
            
            badge.modifiedBy = req.user.name;    
            badge.modifiedOn = new Date(); 
            
            if(badge.askForNotification){
                var askForNotification = badge.askForNotification;
                delete badge.askForNotification;
            } 
            
            // update customer
            badgeService.update(badge, function (err, response) {
                if(err) { return handleError(res, err); }
                if (!response.value) {
                    res.sendStatus(404); // not found
                } else {
    
                    var originalCustomerName = response.value.name;
                    if(originalCustomerName !== badge.name){
                        
                        // update preferences
                        var filter2 = {employeeName: originalCustomerName};
                        var update2 = {$set: {
                            employeeName : badge.name
                        }};
                        preferenceService.updateMany(filter2, update2, function(err, response){
                            if(err) { return handleError(res, err); }
                        });                                             
                    } 

                    if(askForNotification){
                        // send an email with an activationLink
                        var from = badge.email;
                        var subject = 'Creare cont';
                        
                        var tpl = '';
                            tpl += '<p style="margin-bottom:30px;">Buna <strong>' + badge.name + '</strong>,</p>';
                            tpl += 'Adresa ta de email a fost inregistrata. ';
                            tpl += 'Din acest moment iti poti crea un cont in aplicatie.';
                            tpl += '<br>Si pentru ca totul sa fie cat mai simplu pentru tine, am creat link-ul de mai jos:';
                            tpl += '<p><a href="' + config.externalUrl + '/register?email=' + encodeURIComponent(badge.email) + '">Creaza cont</a></p>';
                            tpl += '<p style="margin-top:30px">Acest email a fost generat automat.</p>';
                
                            emailService.sendEmail(from, subject, tpl).then(function (result) {
                                console.log(result);
                            }, function (err) {
                                console.log(err);
                                //handleError(res, err)
                            }); 
                    }                     
                    
                    res.sendStatus(200);
                }
            });
        }
    });
};

exports.remove = function(req, res){
    var id = req.params.id;
    badgeService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

exports.checkEmail = function (req, res) {
    var email = req.params.email;
       
    badgeService.getByValue('email', email, null, function (err, badge) {
        if(err) { return handleError(res, err); }

        if(badge){
            res.send(true);
        } else {
            res.send(false);
        }   
    }); 
};

// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};


function validateFile(part, maxSizeInMB){
    // if you change this validations, change also the corresponding rules in the client-side
    // if (err) {
    //     return "Fisierul incarcat nu poate fi prelucrat.";
    // }

    let size = part.byteCount;
    if(size > maxSizeInMB * 1024 * 1024){
        return `Sunt acceptate doar fisiere cu dimensiunea de maximum ${maxSizeInMB} MB.`;
    }

    let parsedFile = path.parse(part.filename); // myExcel.xls
    let fileExtensionWithDot = parsedFile.ext; // .xls   
    if(fileExtensionWithDot !== ".xls" && fileExtensionWithDot !== ".xlsx"){
        return "Sunt acceptate doar fisiere Excel."
    }

    return ""; 
}

function getCardsFromWorksheet(workSheet){
    // worksheet format:
    // {
    //     "name": "Cartele_noi",
    //     "data": [
    //         [
    //             "Serie",
    //             "Nume utilizator",
    //             "Nivel de Acces"
    //         ],
    //         [
    //             "00008:19414 ()",
    //             ",Vizitator 1",
    //             "Tesa"
    //         ],
    //         ...
    //     ]
    // }

    const badgeCodeHeaderName = "Serie";
    const ownerCodeHeaderName = "Nume utilizator";

    var originalCards = workSheet.data;
    let len = originalCards.length;
    if(len == 0){
        return `Fisierul este gol.`;
    }

    let headerRow = originalCards[0];

    let badgeCodeIdx = headerRow.indexOf(badgeCodeHeaderName);
    if( badgeCodeIdx == -1) return `Fisierul nu are o coloana cu numele '${badgeCodeHeaderName}'`;
    let ownerCodeIdx = headerRow.indexOf(ownerCodeHeaderName);
    if( ownerCodeIdx == -1) return `Fisierul nu are o coloana cu numele '${ownerCodeHeaderName}'`;

    // if badgeCodeIdx = 0 and ownerCodeIdx = 2 we have to have a minimum of 3 cols on each row
    let maxIdx = Math.max(badgeCodeIdx, ownerCodeIdx);
    let minCols = maxIdx + 1;

    var cards = []
    for(let i=1; i < len; i++){
        let cardRow = originalCards[i];

        if(cardRow.length < minCols){
            return `Randul ${i} nu are minimum de informatii necesare: codCard si numeCard.`;
        }

        let badgeCode = cardRow[badgeCodeIdx];
        if(!badgeCode){
            return `Pe randul ${i} coloana ${badgeCodeIdx + 1} nu exista informatii despre codul cardului.`;
        } 
        let newBadgeCode = getNewBadgeCode(badgeCode);   
        if(newBadgeCode === "invalid"){
            return `Pe randul ${i} coloana ${badgeCodeIdx + 1} nu exista un cod de card valid.`;
        }

        let ownerCode = cardRow[ownerCodeIdx];
        if(!ownerCode){
            return `Pe randul ${i} coloana ${ownerCodeIdx + 1} nu exista informatii despre detinatorul cardului.`;
        } 
        let newOwnerCode = getNewOwnerCode(ownerCode);             
      
        // console.log(newBadgeCode + " " + newOwnerCode);
        cards.push({
            code: newBadgeCode,
            ownerCode: newOwnerCode
        });

        
    }
    return cards;
}

function getNewBadgeCode(badgeCode){
    // 00008:19414 () -> 0000819414
    var parts = badgeCode.split(":");
    if(parts.length != 2) return "invalid";
    let newBadgeCode = parts[0] + parts[1].substring(0,5);
    if(newBadgeCode.length != 10) return "invalid";

    return newBadgeCode;
}

function getNewOwnerCode(ownerCode){
    // Popescu, Ioan Mihai -> 0000819414
    // ,Vizitator 1 -> Vizitator 1
    return ownerCode        
        .replace(/,/g , ' ') // replace comma with one space
        .replace(/ {2,}/g,' ') // replace multiple spaces with a single space
        .trim();
}