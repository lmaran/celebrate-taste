(function(){

    // DOM ready
    $(function(){
        let menuDateElem = $("ul[data-menu-date]"); // first 'ul'' with 'data-menu-date' as attribute
        let menuDate = menuDateElem.data("menu-date"); // the value of 'data-menu-date' attribute

        var elements = document.querySelectorAll(".c-rating");        
        elements.forEach(function(el){
            addRatingWidget(el, menuDate);
        });       
    });

    function deleteReview(event){
        event.preventDefault();
        let params = event.data;

        var url = '/api/myReviews/' + params.dishId + "/" + params.menuDate;
        $.ajax({
                url:url,
                type: 'DELETE',
                contentType:'application/json',
            })
            .done(function(data){
                params.myRating.resetRating();
            })
            .fail(function(err){
                alert(err);
            })
            .always(function(err){
                // $setMyOptionIcon.removeClass("spinning glyphicon-refresh").addClass("glyphicon-pushpin");
            });        
    }

    function addRatingWidget(el, menuDate){
        // elements
        var $ratingElem = $(el)
        var $dishElem = $ratingElem.parents("li").first();
        var $deleteElem = $ratingElem.next();
        
        let dishName = $dishElem.children("span").first().text();
        let dishId = $dishElem.data("dish-id");

        // current rating, or initial rating
        var currentRating = $dishElem.data("dish-stars") || 0;

        // max rating, i.e. number of stars you want
        var maxRating= 5;

        // callback to run after setting the rating
        var callback = function(rating) { 
            var review = {
                stars: rating,
                starDetails: "test",
                dishId: dishId,
                dishName: dishName,
                menuDate: menuDate
            };
            saveMyReview(review);
        };

        // rating instance
        var myRating = rating(el, currentRating, maxRating, callback);

        let params = {
            dishId: dishId,
            menuDate: menuDate,
            myRating: myRating
        };

        // events
        $deleteElem.click(params, deleteReview);  
    } 

    function saveMyReview(review){
        var url = '/api/myReviews';
        $.post(url, review)
            .done(function(data){
                // alert("ok");
            })
            .fail(function(err){
                alert(err);
            })
            .always(function(err){
                // $setMyOptionIcon.removeClass("spinning glyphicon-refresh").addClass("glyphicon-pushpin");
            });                    
    }       
        
})();