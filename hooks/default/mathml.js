EPUBJS.Hooks.register("beforeChapterDisplay").mathml = function(callback, renderer){

    // check of currentChapter properties contains 'mathml'
    if(renderer.currentChapter.manifestProperties.indexOf("mathml") !== -1 ){
        
        // Assign callback to be inside iframe window
        renderer.render.iframe.contentWindow.mathmlCallback = callback;
        
        // add MathJax config script tag to the renderer body
        var s = document.createElement("script");
        s.type = 'text/x-mathjax-config';
        s.innerHTML = '\
        MathJax.Hub.Register.StartupHook("End",function () { \
          window.mathmlCallback(); \
        });\
        MathJax.Hub.Config({jax: ["input/TeX","input/MathML","output/SVG"],extensions: ["tex2jax.js","mml2jax.js","MathEvents.js"],TeX: {extensions: ["noErrors.js","noUndefined.js","autoload-all.js"]},MathMenu: {showRenderer: false},menuSettings: {zoom: "Click"},messageStyle: "none"}); \
                ';
        renderer.doc.body.appendChild(s);
        // add MathJax.js to renderer head
        EPUBJS.core.addScript("http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML", null, renderer.doc.head);
    
    } else {
        if(callback) callback();
    }
}
