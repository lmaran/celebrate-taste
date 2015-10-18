'use strict';
//Dan Whalin: http://stackoverflow.com/a/29602528
app.service('modalService', ['$uibModal',function ($uibModal) {

    var modalDefaults = {
        //backdrop: true,
        //keyboard: true,
        animation: false,
        templateUrl: 'app/common/templates/confirm.html'
    };

    var modalOptions = {
        closeButtonText: 'Renunta',
        actionButtonText: 'Sterge',
        headerText: 'Sterge',
        bodyTitle: 'Esti sigur ca vrei sa stergi aceasta inregistrare?',
        bodyDetails: ''        
    };

    this.confirm = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        //customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            }
        }

        return $uibModal.open(tempModalDefaults).result;
    };

}]);