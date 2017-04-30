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
            

            let feedbackArea = $dishElem.find(".feedback-area").first();
            let detailsArea = $dishElem.find("textarea").first();
            let btnCancelFeedback = $dishElem.find(".btnCancel").first();
            let btnCSubmitFeedback = $dishElem.find(".btnSubmit").first();

            var review = {
                stars: rating,
                dishId: dishId,
                dishName: dishName,
                menuDate: menuDate
            };

            $(feedbackArea).show();

            detailsArea.focus();

            // cancel
            let cancelParams = {
                feedbackArea: feedbackArea,
            };
            btnCancelFeedback.click(cancelParams, cancelFeedback);

            //submit
            let submitParams = {
                feedbackArea: feedbackArea,
                detailsArea: detailsArea,
                btnCSubmitFeedback: btnCSubmitFeedback,
                review:review
            };
            btnCSubmitFeedback.click(submitParams, submitFeedback);
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

    function cancelFeedback(event){
        let params = event.data;
        params.feedbackArea.hide();
    } 

    function submitFeedback(event){
        event.preventDefault();
        let params = event.data;
        params.review.starDetails = params.detailsArea.val();

        params.feedbackArea.hide();
        params.btnCSubmitFeedback.unbind('click');

        saveMyReview(params.review);
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