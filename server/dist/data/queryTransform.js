/*!
 * Copyright(c) 2014 Jan Blaha (pofider)
 *
 * Parse query string OData params and transform into mongo/nedb type of query
 */

// https://github.com/pofider/node-simple-odata-server/blob/master/lib/queryTransform.js
module.exports = function(query) {

    if (query.$filter) {
        query.$filter = new Node(query.$filter.type, query.$filter.left, query.$filter.right, query.$filter.func, query.$filter.args).transform();
    } else {
        query.$filter = {};
    }

    if (query.$top) {
        query.$limit = query.$top;
        delete query.$top; // lm
    }

    if (query.$orderby) {
        query.$sort = {};
        query.$orderby.forEach(function(prop) {
            var propName = Object.keys(prop)[0];
            query.$sort[propName] = prop[propName] === "desc" ? -1 : 1;
        });
        delete query.$orderby; // lm
    }

    if (query.$inlinecount === "allpages") {
        //query.$count = true
        query.$inlinecount =true; // lm
    }

    var select = {};
    for (var key in query.$select || []) {
        select[query.$select[key]] = 1;
    }
    query.$select = select;
    if(Object.keys(query.$select).length === 0) //lm
        delete query.$select;

    return query;
}

function Node(type, left, right, func, args) {
    this.type = type;
    this.left = left;
    this.right = right;
    this.func = func;
    this.args = args;
}

Node.prototype.transform = function() {
    var result = {};

    if (this.type === "eq" && this.right.type === 'literal') {        
        //result[this.left.name] = this.right.value;
        //lm:
        
        // $filter=fullName eq 'Lucian Maran' --> true
        // $filter=fullName eq 'lucian maran' --> false
        if(this.left.type === "property")
            result[this.left.name] = this.right.value;
            
        // $filter=tolower(fullName) eq 'Lucian Maran' --> true
        // $filter=tolower(fullName) eq 'lucian maran' --> false
        if(this.left.type === "functioncall" && this.left.func === "tolower"){
            // we use "tolowwer" OData key as a hack for "case insensitive" search
            var newProp = this.left.args[0];
            result[newProp.name] = new RegExp('^' + this.right.value + '$', "i"); //http://stackoverflow.com/a/1863452
        }
    }

    if (this.type === "lt" && this.right.type === 'literal') {
        result[this.left.name] = { "$lt": this.right.value };
    }

    if (this.type === "gt" && this.right.type === 'literal') {
        result[this.left.name] = { "$gt": this.right.value };
    }

    if (this.type === "and") {
        result["$and"] = result["$and"] || [];
        result["$and"].push(new Node(this.left.type, this.left.left, this.left.right, this.left.func, this.left.args).transform()); //lm
        result["$and"].push(new Node(this.right.type, this.right.left, this.right.right, this.right.func, this.right.args).transform());//lm
    }

    if (this.type === "or") {
        result["$or"] = result["$or"] || [];
        result["$or"].push(new Node(this.left.type, this.left.left, this.left.right, this.left.func, this.left.args).transform());//lm
        result["$or"].push(new Node(this.right.type, this.right.left, this.right.right, this.right.func, this.right.args).transform());//lm
    }

    if (this.type === "functioncall") {
        switch (this.func) {
            case "substringof": substringof(this, result); break;
            //case "endswith": endswith(this, result); break; //lm
        }
    }

    return result;
}

function substringof(node, result) {
    var prop = node.args[0].type === "property" ? node.args[0] : node.args[1];
    var lit = node.args[0].type === "literal" ? node.args[0] : node.args[1];

    //result[prop.name] = new RegExp(lit.value);
    
    // lm:
    if(prop.type === "property")
        result[prop.name] = new RegExp(lit.value);
    
    if(prop.type === "functioncall" && prop.func === "tolower"){
        // we use "tolowwer" OData key as a hack for "case insensitive" search
        var newProp = prop.args[0];
        result[newProp.name] = new RegExp(lit.value, "i");
    }
}

// function endswith(node, result) {
//     var prop = node.args[0].type === "property" ? node.args[0] : node.args[1];
//     var lit = node.args[0].type === "literal" ? node.args[0] : node.args[1];

//     result[prop.name] = new RegExp(lit.value + '$');
// }



