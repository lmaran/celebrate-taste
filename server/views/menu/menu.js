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
        
        var $setMyOption = $(event.target);//.closest("button");
        
        var menuDate = $setMyOption.data('menu-date');
        var category = $setMyOption.data('category');
        var selectedOption = $setMyOption.data('selected-option');        


        var $parentMenuUl = $setMyOption.closest("ul");
        var $parentCategoiesLi = $parentMenuUl.find("li[data-category='" + category + "']");        
        var $isMyOption = $parentCategoiesLi.find(".isMyOption");

        if($isMyOption.length){ // we have a previous "myOption" element -> swap
            swapNodes($isMyOption[0], $setMyOption[0]);
        } else { // 1 element
            // create a new "myOption" elem. to replace the existing button
            var el = '<span class="label label-success isMyOption"><span class="glyphicon glyphicon-ok"></span>Optiunea mea</span>';
            $(el).insertBefore($setMyOption);
            $setMyOption.remove();
        }
    }
    
    // http://stackoverflow.com/a/698440
    function swapNodes(a, b) {
        var aparent = a.parentNode;
        var asibling = a.nextSibling === b ? a : a.nextSibling;
        b.parentNode.insertBefore(a, b);
        aparent.insertBefore(b, asibling);
    }
        
})();