@@include("alert.js")


    function testWebP(callback) {               //проверка браузера на поддержку webP
        let webP = new Image();
        webP.onload = webP.onerror = function() {
            callback(webP.height == 2);
        };
        webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    }

    testWebP(function(support) {
        if (support == true){
            document.querySelector("body").classList.add("webp")
        }
    });