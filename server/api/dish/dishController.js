'use strict';

let dishService = require('./dishService');
let config = require('../../config/environment');
let azure = require('azure-storage');
let multiparty = require('multiparty');
let sharp = require('sharp');
let stream = require('stream');
let fs = require('fs');
let path = require('path');
let removeDiacritics = require('diacritics').remove;
let moment = require('moment');

// ---------- OData ----------
exports.getAll = function (req, res) {
    let odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if (!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records

    dishService.getAll(odataQuery, function (err, dishes) {
        if (err) { return handleError(res, err); }
        res.status(200).json(dishes);
    });
};


// ---------- REST ----------
exports.create = function (req, res) {
    let dish = req.body;

    dish.createBy = req.user.name;
    dish.createdOn = new Date();

    dishService.create(dish, function (err, response) {
        if (err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};

exports.getById = function (req, res) {
    dishService.getById(req.params.id, function (err, dish) {
        if (err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(dish);
    });
};

exports.update = function (req, res) {
    let dish = req.body;

    dish.modifiedBy = req.user.name;
    dish.modifiedOn = new Date();

    dishService.update(dish, function (err, response) {
        if (err) { return handleError(res, err); }
        if (!response.value) {
            res.sendStatus(404); // not found
        } else {
            res.sendStatus(200);
        }
    });
};


exports.remove = function (req, res) {
    let id = req.params.id;
    dishService.remove(id, function (err, response) {
        if (err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

// ---------- RPC ----------

exports.uploadImage = function (req, res) {
    let form = new multiparty.Form();

    const ratio = 1.5; // an aspect ratios of 3/2 (1.5) is used by most DSLRs; 4/3 is used by most phone/digital camera
    const maxWidth = 960; 
    const maxHeight = Math.round(maxWidth / ratio) // 640
    const maxSizeInMB = 15;

    const sizes = [{
        name: "small",
        label: "sm",
        width: 225,
        height: Math.round(225 / ratio) // 150
    }, {
        name: "large",
        label: "lg",
        width: maxWidth, // 900
        height: maxHeight // 640
    }];    

    form.on('part', function (part) {
        if (!part.filename){
            part.resume(); // ignore field's content
            return false;
        }            

        if(part.byteCount > maxSizeInMB * 1024 * 1024){
            res.status(400).send({ msg : `Sunt acceptate doar poze cu dimensiunea de maximum ${maxSizeInMB} MB.` }); // 400 - bad request
            part.resume(); // used to fully consume the data from a stream without actually processing any of that data
            return false;
        }

        let pipeline = sharp()
            .toBuffer(function (err, outputBuffer, info) {
                
                var errMsg = validateImage(err, info, maxWidth, maxHeight);
                if(errMsg){
                    res.status(400).send({ msg : errMsg }); // 400 - bad request
                    //part.resume(); // not necessary, the input stream is already processed
                    return false;
                }                    

                let blobService = azure.createBlobService(config.azureStorage.account, config.azureStorage.key);
                let blobOptions = {
                    contentSettings:{contentType: part.headers['content-type']}
                }; 
                let blobName = getBlobName(part.filename);
                let containerName = 'dishes';
                let dishesBaseURI = "https://" + config.azureStorage.account + ".blob.core.windows.net/";
    
                Promise.all(
                    sizes.map((size) => resizeAndSave(blobService, outputBuffer, blobName, blobOptions, containerName + '-' + size.label, size))
                )
                .then((values) => {
                    let image = {};
                    values.map((size) => {
                        image[size.name] = dishesBaseURI + containerName + '-' + size.label + "/" + blobName;
                    });
                    res.json(image);

                    // save the original image (yes, after the response has been sent to the client)
                    resizeAndSave(blobService, outputBuffer, blobName, blobOptions, containerName, null);

                }).catch(reason => { 
                    res.jon(err);
                }); 

            });
        part.pipe(pipeline);

    });

    form.parse(req);
};

// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};

// "Cuş Cuş.jpg" --> "cus-cus-172824.jpg"
function getBlobName(filename){
    let parsedFile = path.parse(filename); // Cuş Cuş.jpg
    let fileNameWithoutExtension = parsedFile.name; // Cuş Cuş
    let fileExtensionWithDot = parsedFile.ext; // .jpg

    let uniqueTime = moment().format("HHmmss"); // 172824          
    return slugify(fileNameWithoutExtension) + '-' + uniqueTime + fileExtensionWithDot; // cus-cus-172824.jpg
    
}

function slugify(text) {
    text = removeDiacritics(text);

    // http://blog.benmcmahen.com/post/41122888102/creating-slugs-for-your-blog-using-expressjs-and
    return text.toString().toLowerCase()
        .replace(/_/g, '-')        // Replace _ with -
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
}

function validateImage(err, info, maxWidth, maxHeight){
    // if you change this validations, change also the corresponding rules in the client-side
    if (err) {
        return "Fisierul incarcat nu poate fi convertit intr-o imagine.";
    }

    if(info.format !== "jpeg"){
        return "Sunt acceptate doar poze in format '.jpg'.";
    }

    if(info.width < info.height){
        return "Sunt acceptate doar poze in format 'landscape' (latime > inaltime).";
    }

    if(info.width < maxWidth){
        return `Sunt acceptate doar poze cu latimea de minimum ${maxWidth} px.`;
    }

    if(info.height < maxHeight){
        return `Sunt acceptate doar poze cu inaltimea de minimum ${maxHeight} px.`;
    }    

    return ""; 
}

function resizeAndSave(blobService, outputBuffer, blobName, blobOptions, containerName, size){
    return new Promise((resolve, reject) => {
        let writableStream =  blobService.createWriteStreamToBlockBlob(containerName, blobName, blobOptions, function(err, result, response) {
            if (err) {
                reject(err);
            }
            else { 
                resolve(size);
            }
        });

        if(size) {
            sharp(outputBuffer)
                .resize(size.width, size.height)
                .pipe(writableStream);
        } else { // save original image
            sharp(outputBuffer)
                .pipe(writableStream);
        }
    });
};