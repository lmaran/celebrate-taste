/* global _ */
'use strict';

app.controller('addToMenuController', ['$scope', '$route', '$window', '$location', 'dayTimeService', 'dishService', 'menuService', 
	function ($scope, $route, $window, $location, dayTimeService, dishService, menuService) {
               
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
            $scope.roMenuDate = dayTimeService.getStringFromString(data.menuDate);
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
        if(dish.category === '1' || dish.category === '2'){
            dish.option = getNextChar($scope.menu, dish);
            console.log(getNextChar($scope.menu, dish));
        }
        if($scope.menu.dishes === undefined) $scope.menu.dishes = [];
        $scope.menu.dishes.push(dish);

        menuService.update($scope.menu)
            .then(function (data) {
                delete dish.option;
                dish.isAddedTmp = true;
                loadMenuData(); 
            })
            .catch(function (err) {
                alert(JSON.stringify(err.data, null, 4));
            });
    };
    
    $scope.removeFromMenu = function (dish) {       
        _.remove($scope.menu.dishes, function(item){
            return item.name === dish.name;
        });

        menuService.update($scope.menu)
            .then(function (data) {
                delete dish.isAddedTmp;
            })
            .catch(function (err) {
                alert(JSON.stringify(err.data, null, 4));
            });
    };    
    
    var getNextChar = function(menu, dish){       
        var lastItemInCategory= _.chain(menu.dishes)
            .filter('category', dish.category)  // search in the same caterory as dish  
            .sortBy('option')
            .last()
            .value();
       
       console.log(lastItemInCategory);
       if(lastItemInCategory === undefined || lastItemInCategory.option === undefined){
           return 'A';
       }
              
        var lastChar = lastItemInCategory.option;          
        return String.fromCharCode(lastChar.charCodeAt(0) + 1);           
    }
    
    $scope.goBack = function(){
        $window.history.back();
        //$location.path('/menus/');
    }

    $scope.refresh = function(){
        init();
    }
      
}]);