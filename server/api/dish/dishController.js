'use strict';

var dishService = require('./dishService');
var config = require('../../config/environment');
var azure = require('azure-storage');
var multiparty = require('multiparty');
var sharp = require('sharp');
var stream = require('stream');
var fs = require('fs');
var path = require('path');
var removeDiacritics = require('diacritics').remove;
var moment = require('moment');

// ---------- OData ----------
exports.getAll = function (req, res) {
    var odataQuery = req.query;
    odataQuery.hasCountSegment = req.url.indexOf('/$count') !== -1 //check for $count as a url segment
    if(!odataQuery.$top) odataQuery.$top = "1000"; // if $top is not specified, return max. 1000 records
            
    dishService.getAll(odataQuery, function (err, dishes) {
        if(err) { return handleError(res, err); }
        res.status(200).json(dishes);        
    });
};


// ---------- REST ----------
exports.create = function(req, res){
    var dish = req.body;
    
    dish.createBy = req.user.name;    
    dish.createdOn = new Date(); 
                
    dishService.create(dish, function (err, response) {
        if(err) { return handleError(res, err); }
        res.status(201).json(response.ops[0]);
    });
};

exports.getById = function (req, res) {
    dishService.getById(req.params.id, function (err, dish) {
        if(err) { return handleError(res, err); }
        //if(!doc) { return res.status(404).send('Not Found'); }
        res.json(dish);
    });    
};

exports.update = function(req, res){    
    var dish = req.body;
    
    dish.modifiedBy = req.user.name;    
    dish.modifiedOn = new Date();     
    
    dishService.update(dish, function (err, response) {
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
    dishService.remove(id, function (err, response) {
        if(err) { return handleError(res, err); }
        res.sendStatus(204);
    });
};

// ---------- RPC ----------

exports.uploadImage = function(req, res){
    
    var dishesBaseURI = "https://" + config.azureStorage.account + ".blob.core.windows.net/dishes/";

    // https://github.com/andrewrk/node-multiparty/blob/master/examples/azureblobstorage.js
    var blobService = azure.createBlobService(config.azureStorage.account, config.azureStorage.key);   
    var form = new multiparty.Form();

    form.on('part', function(part) {
        if (!part.filename) return;
        //console.log(part);
        //return;

        var size = part.byteCount;

        var parsedFile = path.parse(part.filename); // Cuş Cuş.jpg

        var fileNameWithoutExtension = parsedFile.name; // Cuş Cuş
        var fileExtensionWithDot = parsedFile.ext; // .jpg

        var blobName = slugify(fileNameWithoutExtension) + fileExtensionWithDot; // cus-cus.jpg

        var containerName = 'dishes';
        
        // console.log('original size: ' + size);
              
        var options = {
            contentSettings:{contentType: part.headers['content-type']}
        };

        // var transformer = sharp()
        //     .resize(200, 200)
        //     //.withoutEnlargement()
        //     // .overlayWith(roundedCorners, { cutout: true })
        //     // .png();
        //     .on('info', function (info) {
        //         console.log('Image height is ' + info.height);
        //         console.log('Image size is ' + info.size);
        //         size = info.size;

        //     });

        // var xx = part.pipe(transformer);

        var cb = function(err, result, response) {
            if (err) {
                handleError(res, err)
            }
            else{               
                // res.json({url:dishesBaseURI + blobName});
                console.log('ok');
            }
        };

        // var writeStreamToBlob = createWriteStreamToBlockBlob(containerName, blobName, options, cb);

        
        // https://github.com/Azure/azure-storage-node/issues/102#issuecomment-164234599
        // part.pipe(transformer).pipe(writeStreamToBlob);

        //var uniqueTime = moment().format("YYMMDDHHmmss"); // 161120172824
        var uniqueTime = moment().format("HHmmss"); // 172824
        var blobName = slugify(fileNameWithoutExtension) + '-' + uniqueTime + fileExtensionWithDot;

        var sizes = [{
            label: "sm",
            width: 225,
            height: 150
        },{
            label: "lg",
            width: 960,
            height: 640
        }];

        // http://sharp.dimens.io/en/stable/api/#clone
        var transformer = sharp()
            .on('info', function (info) {
                console.log('Image height is ' + info.height);
                console.log('Image size is ' + info.size);
                //size = info.size;
            });

        sizes.forEach(function(size){
            console.log('size=' + size.label);
            // transformer.clone().resize(size.width, size.height)
            //     .on('info', function (info) {
            //         console.log('Image height is ' + info.height);
            //         console.log('Image size is ' + info.size);
            //         //size = info.size;
            //     })
            //     .pipe(blobService.createWriteStreamToBlockBlob(containerName + '-' + size.label, blobName, options, cb));

            var xx = transformer.clone().resize(size.width, size.height)
                .on('info', function (info) {
                    console.log('Image height is ' + info.height);
                    console.log('Image size is ' + info.size);
                    //size = info.size;
                    
                });
            xx.pipe(blobService.createWriteStreamToBlockBlob(containerName + '-' + size.label, blobName, options, cb));

        });

        transformer.clone()
            .pipe(blobService.createWriteStreamToBlockBlob(containerName, blobName, options, cb));

        part.pipe(transformer);

        //saveOriginal();

        // blobService.createBlockBlobFromStream(containerName, blobName, xx, size, options, function(err, result, response) {
        //     if (err) {
        //         // error handling
        //         // console.log(error);
        //         handleError(res, err)
        //     }
        //     else{
        //         // console.log(result);
        //         // console.log(response);
                
        //         res.json({url:dishesBaseURI + blobName});
        //     }
        // });

    });

    form.parse(req);    
    
    res.json({ok:'ok'});             
};

// ---------- Helpers ----------
function handleError(res, err) {
    return res.status(500).send(err);
};


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

