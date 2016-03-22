(function(){
    var changePreferenceBtn;
    
    // DOM ready
    $(function(){
        // def
        changePreferenceBtns = $(".changePreferenceBtn");

        // events
        changePreferenceBtns.click(changePreference);
        
    });
    
    function changePreference(event){
        event.preventDefault();

        var $changeBtn = $(event.target);
        var menuDate = $changeBtn.data('menu-date');
        var category = $changeBtn.data('category');
        var selectedOption = $changeBtn.data('selected-option');
        
        alert(menuDate + ' ' + category + ' ' + selectedOption);
    }
    
})();