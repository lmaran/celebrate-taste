(function() {
    // DOM ready
    $(function() {
        // elements
        setMyOptionBtns = $(".setMyOption");
        cancelMyOptionBtns = $(".cancelMyOption");

        // events
        setMyOptionBtns.click(changePreference);
        cancelMyOptionBtns.click(cancelPreference);
    });

    function cancelPreference() {
        var $cancelMyOption = $(this);

        var $parentMenuUl = $cancelMyOption.closest("ul");
        var menuDate = $parentMenuUl.data("menu-date");
        var preferenceId = $parentMenuUl.data("preference-id");

        var $parentMenuLi = $cancelMyOption.closest("li");
        var category = $parentMenuLi.data("category");

        $cancelMyOption
            .find("span")
            .removeClass("glyphicon-pushpin")
            .addClass("spinning glyphicon-refresh");

        var preference = {
            menuDate: menuDate,
            category: category,
            // selectedOption: null, // remove options
        };

        if (preferenceId) {
            preference.preferenceId = preferenceId;
        }

        savePreference(preference, null, $cancelMyOption, $parentMenuUl);
    }

    function changePreference() {
        var $setMyOption = $(this);

        var $parentMenuUl = $setMyOption.closest("ul");
        var menuDate = $parentMenuUl.data("menu-date");
        var preferenceId = $parentMenuUl.data("preference-id");

        var $parentMenuLi = $setMyOption.closest("li");
        var category = $parentMenuLi.data("category");
        var selectedOption = $parentMenuLi.data("option");

        var $parentCategoriesLi = $parentMenuUl.find("li[data-category='" + category + "']");
        var $isMyOption = $parentCategoriesLi.find("[data-is-my-option='true']:visible");

        $setMyOption
            .find("span")
            .removeClass("glyphicon-pushpin")
            .addClass("spinning glyphicon-refresh");

        var preference = {
            menuDate: menuDate,
            category: category,
            selectedOption: selectedOption,
        };

        if (preferenceId) {
            preference.preferenceId = preferenceId;
        }

        savePreference(preference, $isMyOption, $setMyOption, $parentMenuUl);
    }

    function savePreference(preference, $isMyOption, $setMyOption, $parentMenuUl) {
        var url = "/api/myPreferences";
        $.post(url, preference)
            .done(function(data) {
                // if first time we create a new pref., next we want to use an update instead
                if (!preference.preferenceId) {
                    // does not change the html5 'data-*' attribute, just the jQuery cache
                    // but this is enough for this case: http://stackoverflow.com/a/17246540
                    $parentMenuUl.data("preference-id", data);
                }

                // update DOM
                $setMyOption
                    .find("span")
                    .removeClass("spinning glyphicon-refresh")
                    .addClass("glyphicon-pushpin");

                toggleVisibility($setMyOption);

                if ($isMyOption) {
                    toggleVisibility($isMyOption);
                }
            })
            .fail(function(err) {
                alert(err);
            })
            .always(function(err) {
                //$setMyOptionIcon.removeClass("spinning glyphicon-refresh").addClass("glyphicon-pushpin");
            });
    }

    function toggleVisibility($crtBtn) {
        // "switch" visibility between the 2 buttons on the same "row" (<li> element)
        var $parentMenuLi = $crtBtn.closest("li");

        var $isMyOptionSection = $parentMenuLi.find("[data-is-my-option='true']");
        var $isNotMyOptionSection = $parentMenuLi.find("[data-is-not-my-option='true']");
        $isMyOptionSection.toggle();
        $isNotMyOptionSection.toggle();
    }
})();
