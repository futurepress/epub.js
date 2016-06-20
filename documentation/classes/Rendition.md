## class Rendition(book, options)
---    
#### properties  
    settings  
    viewSettings  
    book  
    views  
    hooks   
    epubcfi  
    q  
    starting  
    started  
    ViewManager  
    View  
    manager  
#### methods  
    setManager(manager)  
    requireManager(manager)  
    requireView(view)  
    start()  
    attachTo(element)  
    display(target)  
    _display(target)  
    render(view, show)  
    afterDisplayed(view)  
    onResized(size)  
    moveTo(offset)  
    next()  
    prev()  
    parseLayoutProperties(_metadata)  
    determineLayout(settings)  
    reportLocation()  
    destroy()  
    passViewEvents(view)  
    triggerViewEvent(e)  
    triggerSelectedEvent(cfirange)  
    replacements()  
    replaceCss(href, urls, replacementUrls)  
    replaceAssets(section, urls, replacementUrls)  
    range(_cfi, ignoreClass)  
    adjustImages(view)  