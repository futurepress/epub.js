## class EpubCFI(cfiFrom, base, ignoreClass)     
#### properties  
    str  
    base  
    spinePos  
    range  
    path  
    start  
    end  
#### methods  
    checkType(cfi)  
    parse(cfiStr)  
    parseComponent(componentStr)  
    parseStep(stepStr)  
    parseTerminal(termialStr)  
    getChapterComponent(cfiStr)  
    getPathComponent(cfiStr)  
    getRange(cfiStr)  
    getCharecterOffsetComponent(cfiStr)  
    joinSteps(steps)  
    segmentString(segment)  
    toString()  
    compare(cfiOne, cfiTwo)  
    step(node)  
    filteredStep(node, ignoreClass)  
    pathTo(node, offset, ignoreClass)  
    equalStep(stepA, stepB)  
    fromRange(range, base, ignoreClass)  
    fromNode(anchor, base, ignoreClass)  
    filter(anchor, ignoreClass)  
    patchOffset(anchor, offset, ignoreClass)  
    normalizedMap(children, nodeType, ignoreClass)  
    position(anchor)  
    filteredPosition(anchor, ignoreClass)  
    stepsToXpath(steps)  
    stepsToQuerySelector(steps)  
    textNodes(container, ignoreClass)  
    walkToNode(steps, _doc, ignoreClass)  
    findNode(steps, _doc, ignoreClass)  
    fixMiss(steps, offset, _doc, ignoreClass)  
    toRange(_doc, ignoreClass)  
    isCfiString(str)  
    generateChapterComponent(_spineNodeIndex, _pos, id)  