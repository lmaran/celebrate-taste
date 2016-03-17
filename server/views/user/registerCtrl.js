(function(){
    var emailEl;
    
    // DOM ready
    document.addEventListener("DOMContentLoaded", function(event) {
        emailEl = document.getElementById('email');
        emailEl.addEventListener("change", onChangeEmail);

        emailGlyphOkEl = document.getElementById('emailGlyphOk');
        emailGlyphOkEl.style.visibility="hidden";
        
        emailGlyphWarnEl = document.getElementById('emailGlyphWarn');
        emailGlyphWarnEl.style.visibility="hidden";
    });


    function onChangeEmail() {
        if(emailEl.value == 1){
            emailGlyphOkEl.style.visibility="visible";
            emailGlyphWarnEl.style.visibility="hidden";
        } else{
            emailGlyphOkEl.style.visibility="hidden";
            emailGlyphWarnEl.style.visibility="visible";
        }
    } 
    
    function loadDoc() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                document.getElementById("demo").innerHTML = xhttp.responseText;
            }
        };
        xhttp.open("GET", "demo_get.asp", true);
        xhttp.send();
    }    
})();