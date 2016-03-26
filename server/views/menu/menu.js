(function(){
    var changePreferenceBtn;

    // DOM ready
    $(function(){
        // def
        setMyOptionBtns = $(".setMyOption");

        // events
        setMyOptionBtns.click(changePreference);
        
    });
    
    function changePreference(event){
        event.preventDefault();
        
        var $setMyOption = $(event.target);

        var $parentMenuUl = $setMyOption.closest("ul");
        var menuDate = $parentMenuUl.data("menu-date");
        var preferenceId = $parentMenuUl.data("preference-id");
        
        var $parentMenuLi = $setMyOption.closest("li");
        var category = $parentMenuLi.data("category");
        var selectedOption = $parentMenuLi.data("option");
        
        var $parentCategoiesLi = $parentMenuUl.find("li[data-category='" + category + "']");        
        var $isMyOption = $parentCategoiesLi.find(".isMyOption");
        
        var preference = {
            menuDate: menuDate,
            category: category,
            selectedOption: selectedOption      
        };
        
        
        if(preferenceId){
            preference.preferenceId = preferenceId;
        };
        
        savePreference(preference, $isMyOption, $setMyOption, $parentMenuUl);
    }
    
    // http://stackoverflow.com/a/698440
    function swapNodes(a, b) {
        var aparent = a.parentNode;
        var asibling = a.nextSibling === b ? a : a.nextSibling;
        b.parentNode.insertBefore(a, b);
        aparent.insertBefore(b, asibling);
    }    
  
    function savePreference(preference, $isMyOption, $setMyOption, $parentMenuUl){
        var url = '/api/myPreferences';
        $.post(url, preference)
            .done(function(data){
                // if first time we create a new pref., next we want to use an update instead 
                if(!preference.preferenceId){
                    // does not change the html5 'data-*' attribute, just the jQuery cache
                    // but this is enough for this case: http://stackoverflow.com/a/17246540
                    $parentMenuUl.data("preference-id", data._id); 
                };
                
                // update DOM
                if($isMyOption.length){ // 1 'selected' + 1 'unselected' option => swap
                    swapNodes($isMyOption[0], $setMyOption[0]);
                } else { // 2 'unselected' options => replace with a new 'selected' button
                    var el = '<span class="label label-success isMyOption"><span class="glyphicon glyphicon-ok"></span>Optiunea mea</span>';
                    $(el).insertBefore($setMyOption);
                    $setMyOption.remove();
                } 
            })
            .fail(function(err){
                alert(err);
            });        
    }       
        
})();