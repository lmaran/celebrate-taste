/* global _ */
'use strict';

app.controller('partnerOrdersController', ['$scope', '$location', 'partnerOrderService', 'modalService', 'helperService', '$uibModal',
    function ($scope, $location, partnerOrderService, modalService, helperService, $uibModal) {
        
    $scope.partnerOrders = [];
    $scope.errors = {};

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();

    $scope.delete = function (item) {

        var modalOptions = {
            bodyDetails: item.name,           
        };
        
        modalService.confirm(modalOptions).then(function (result) {
        
            // get the index for selected item
            var i = 0;
            for (i in $scope.partnerOrders) {
                if ($scope.partnerOrders[i]._id === item._id) break;
            }

            partnerOrderService.delete(item._id).then(function () {
                $scope.partnerOrders.splice(i, 1);
            })
            .catch(function (err) {
                $scope.errors = JSON.stringify(err.data, null, 4);
                alert($scope.errors);
            });

        });
    };
    
    $scope.openCreatepartnerOrder = function () {
        var modalInstance = $uibModal.open({
            animation:false,
            templateUrl: 'app/partnerOrder/createpartnerOrderTpl.html',
            controller: 'createpartnerOrderTplController'
        });

        modalInstance.result.then(function () { // "yyyy-mm-dd" 
            $scope.refresh();
        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });       
    }    


    $scope.refresh = function () {
        init();
    };  

    function init() {
        partnerOrderService.getAll().then(function (data) {
            $scope.partnerOrders = data;
        })
        .catch(function (err) {
            if(err.status !== 401) {
                alert(JSON.stringify(err, null, 4));
            }
        });
    }
    
    $scope.dt = function (dateAsString) { // yyyy-mm-dd
        return helperService.getObjFromString(dateAsString);
    }
    
    $scope.closepartnerOrder = function(partnerOrderId){
        
        var modalOptions = {
            actionButtonText: 'Finalizeaza',
            headerText: 'Finalizare/Arhivare comanda',
            bodyTitle: 'Esti sigur ca vrei sa finalizezi aceasta comanda?',
            bodyDetails: 'Odata finalizata, comanda nu mai poate fi redeschisa!'         
        };
        
        modalService.confirm(modalOptions).then(function (result) {            
            partnerOrderService.closepartnerOrder(partnerOrderId).then(function(data){
                var currentpartnerOrder = _.find($scope.partnerOrders, {_id: partnerOrderId});
                currentpartnerOrder.summary = data;
                currentpartnerOrder.status = 'completed';
            })
            .catch(function (err) {
                if(err.status !== 401) {
                    alert(JSON.stringify(err, null, 4));
                }
            }); 
        });        
    }
    
    $scope.showEmployees = function(employees, msg){
        var modalSettings = {
            animation: false,
            templateUrl: 'app/common/templates/showEmployees.html'
        };
        
        var modalOptions = {
            closeButtonText: 'Renunta',
            headerText: msg,
            employees: employees       
        };
                
        modalService.show(modalSettings, modalOptions);
      
    }    

}]);