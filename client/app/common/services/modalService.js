'use strict';
//Dan Whalin: http://stackoverflow.com/a/29602528
app.service('modalService', ['$uibModal',function ($uibModal) {

    this.show = function (modalSettings, modalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalSettings = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalSettings, modalSettings);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions);

        if (!tempModalSettings.controller) {
            tempModalSettings.controller = ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            }]
        }

        return $uibModal.open(tempModalSettings).result;
    };
      
    this.confirm = function (modalOptions) {
        var modalSettings = {
            animation: false,
            templateUrl: 'app/common/templates/confirm.html'
        };
        
        var defaultModalOptions = {
            closeButtonText: 'Renunta',
            actionButtonText: 'Sterge',
            headerText: 'Sterge',
            bodyTitle: 'Esti sigur ca vrei sa stergi aceasta inregistrare?',
            bodyDetails: ''        
        };
        
        angular.extend(defaultModalOptions, modalOptions);
    
        return this.show(modalSettings, defaultModalOptions);
    };    
    
    this.showImage = function (modalOptions) {
        var modalSettings = {
            templateUrl: 'app/common/templates/showImage.html'
        };
        return this.show(modalSettings, modalOptions);
    };

}]);