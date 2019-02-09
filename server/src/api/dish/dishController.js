'use strict';

let dishService = require('./dishService');
let config = require('../../config/environment');
let azure = require('azure-storage');
let multiparty = require('multiparty');
let sharp = require('sharp');
let stream = require('stream');
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
        let createdDish = response.ops[0];
        res.status(201).json(response.ops[0]);

        updateImageStatus(dish.image, 'dishId', createdDish._id);  // mark newDish image as used  
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
    let newDish = req.body;
    
    dishService.getById(newDish._id, function (err, oldDish) {
        if (err) { return handleError(res, err); }

        newDish.modifiedBy = req.user.name;
        newDish.modifiedOn = new Date();

        dishService.update(newDish, function (err, response) {
            if (err) { return handleError(res, err); }
            if (!response.value) {
                res.sendStatus(404); // not found
            } else {
                res.sendStatus(200);
            }
        });

        updateImageStatus(newDish.image, 'dishId', newDish._id); // mark new image as used
        updateImageStatus(oldDish.image, 'isDeleted', true); // mark old image as deleted     
    });
};


exports.remove = function (req, res) {
    let id = req.params.id;
    dishService.getById(id, function (err, dish) {
        if (err) { return handleError(res, err); }

        dishService.remove(id, function (err, response) {
            if (err) { return handleError(res, err); }
            res.sendStatus(204);
        });

        updateImageStatus(dish.image, 'isDeleted', true); // mark image as deleted
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
        width: 60,
        height: Math.round(60 / ratio) // 40
    }, {
        name: "medium",
        label: "md",
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

                let blobService = azure.createBlobService(config.azureBlobStorage.account, config.azureBlobStorage.key);
                let blobOptions = {
                    contentSettings:{contentType: part.headers['content-type']}
                }; 
                let blobName = getBlobName(part.filename);
                let containerName = 'dishes';
                let dishesBaseURI = "https://" + config.azureBlobStorage.account + ".blob.core.windows.net/";
    
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
                    let blobServiceCool = azure.createBlobService(config.azureBlobStorageCool.account, config.azureBlobStorageCool.key);
                    resizeAndSave(blobServiceCool, outputBuffer, blobName, blobOptions, containerName, null);

                    // upload dishImages jurnal
                    let dishImage = {
                        blobName: blobName,
                        createdBy: req.user.name,    
                        createdOn: new Date()
                    }; 
                    dishService.createImageEntity(dishImage, function (err, response) {
                        if (err) { 
                            // todo: log this
                        }
                    });

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

function  updateImageStatus(image, field, value){
    // if image is null/undefined, nothing happens
    let blobInfo = getBlobInfo(image);
    if(blobInfo){
        dishService.getImageEntity(blobInfo.blobName, function (err, imageEntity) {
            if (err) { } // todo: log this
            
            if(imageEntity){                
                imageEntity[field] = value; // update status

                dishService.updateImageEntity(imageEntity, function (err, response) {
                    if (err) { } // todo: log this
                    if (!response.value) {
                        // todo: log this
                    } else {
                        // todo: log this
                    }
                });

                // optional (todo)
                // if field='isDeleted' => remove the original and all sizes
                // forEach(blobInfo.sizeContainers) =>  blobService.deleteBlob(containerName, blobName, cb);  
            }
        })
    }
}

function getBlobInfo(image){
    // "image" : {
    //     "small" : "https://celebratetastestg.blob.core.windows.net/dishes-sm/supa-de-visine-220722.jpg", 
    //     "medium" : "https://celebratetastestg.blob.core.windows.net/dishes-md/supa-de-visine-220722.jpg",
    //     "large" : "https://celebratetastestg.blob.core.windows.net/dishes-lg/supa-de-visine-220722.jpg"
    // }

    // uncomment if you need container name(s)
    if(image && Object.keys(image).length > 0){ // ususaly length=3 (small, medium, large)
        let firstKey = Object.keys(image)[0]; // usualy 'small'
        let firstUrl = image[firstKey]; // eg. 'https://celebratetastestg.blob.core.windows.net/dishes-sm/supa-de-visine-220722.jpg'
        let urlParts = firstUrl.split('/');
        // let firstContainer = urlParts[urlParts.length -2] // 'dishes-sm'
        // let sizeContainers = [];

        // for (var p in image) {
        //     let urlParts = image[p].split('/');
        //     let containerName = urlParts[urlParts.length -2];
        //     sizeContainers.push(containerName);
        // }

        return {
            // originalContainer: firstContainer.split('-')[0], // 'dishes'
            // sizeContainers: sizesContainers, // ['dishes-sm', 'dishes-md', 'dishes-lg'']
            blobName: urlParts[urlParts.length -1] // 'supa-de-visine-220722.jpg' 
        };
    };
    return false;
}