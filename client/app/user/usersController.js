'use strict';

app.controller('usersController', ['$scope', '$http', 'Auth', 'User', function ($scope, $http, Auth, User) {

    /*jshint latedef: nofunc */ // https://jslinterrors.com/a-was-used-before-it-was-defined
    init();
    
    function init(){
        // Use the User $resource to fetch all users
        $scope.users = User.query();
    }

    $scope.delete = function(user) {
        User.remove({ id: user._id });
        angular.forEach($scope.users, function(u, i) {
            if (u === user) {
                $scope.users.splice(i, 1);
            }
        });
    };
    
    $scope.refresh = function () {
        init();
    };
}]);
