/* global angular */
/* global _ */
'use strict';

app.controller('addToMenuController', ['$scope', '$route', '$window', '$location', 'helperService', 'dishService', 'menuService', 
	function ($scope, $route, $window, $location, helperService, dishService, menuService) {
               
    $scope.categories = [
        {value:0, name:'Toate felurile'},
        {value:1, name:'Supa'},
        {value:2, name:'Felul 2'},
        {value:3, name:'Salata'},
        {value:4, name:'Desert'}
    ];
    
    $scope.menu = {};
  
    
    $scope.selectedCategory =  $scope.categories[0];  
    $scope.isFastingSelected = false;       
    
    $scope.selectCategory = function(category){
        $scope.selectedCategory = category;
    }

    $scope.dishes = [];
    
    function loadMenuData() {
        menuService.getById($route.current.params.id).then(function (data) {
            $scope.menu = data;
            $scope.roMenuDate = helperService.getStringFromString(data.menuDate);
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });        
    }
    
    function loadDishesData() {
        dishService.getAll().then(function (data) {
            $scope.dishes = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });       
    }    
    
    function init() {
        loadDishesData()
        loadMenuData();     
    }    
    
    init();
    
    $scope.status = {
        isopen: false
    };

    $scope.addToMenu = function (dish) {
        // search in the same caterory as dish
        var dishesInCategory = _.filter($scope.menu.dishes, {category: dish.category})
        //console.log(dishesInCategory);
        if(dishesInCategory && dishesInCategory.length >= 2){
            alert('Exista deja doua mancaruri din felul ' + dish.category + '.');
            return false;
        }
        
        var dishClone = {};
        angular.copy(dish, dishClone); // deep copy
        
        //dishClone._id = helperService.makeId(6); // ex: "spr9na" (the original _id could not be unique in this menu)
        if(dish.category === '1' || dish.category === '2'){
            dishClone.option = getOptionChar(dishesInCategory, dish);
        }
        if($scope.menu.dishes === undefined) $scope.menu.dishes = [];
        $scope.menu.dishes.push(dishClone);

        menuService.update($scope.menu)
            .then(function (data) {
                dish.isAddedTmp = true;
                loadMenuData(); 
            })
            .catch(function (err) {
                alert(JSON.stringify(err.data, null, 4));
            });
    };
    
    $scope.removeFromMenu = function (dish) {   
        _.remove($scope.menu.dishes, function(item){
            return item._id === dish._id;
        });

        menuService.update($scope.menu)
            .then(function (data) {
                delete dish.isAddedTmp;
            })
            .catch(function (err) {
                alert(JSON.stringify(err.data, null, 4));
            });
    };    
    
    var getOptionChar = function(dishesInCategory, dish){       
        var firstChar = 'A';
        if(dish.category === '2') firstChar = 'C';

        if(dishesInCategory === undefined || dishesInCategory.length === 0)
            return firstChar;
        else{ // dishesInCategory.length == 1
            var existingDish = dishesInCategory[0];
            if(existingDish.option === firstChar)
                return String.fromCharCode(firstChar.charCodeAt(0) + 1);
            else
                return String.fromCharCode(existingDish.option.charCodeAt(0) - 1);                
        }       
    }    

    $scope.goBack = function(){
        $window.history.back();
        //$location.path('/admin/menus/');
    }
    $scope.refresh = function(){
        init();
    }
      
}]);