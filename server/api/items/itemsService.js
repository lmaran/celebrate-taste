(function (itemsService) {

    itemsService.getAll = function (next) {
        next({name:'myName', value:12345});
    };


})(module.exports);
