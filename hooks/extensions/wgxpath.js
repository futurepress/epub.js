EPUBJS.Hooks.register("beforeChapterDisplay").wgxpath = function(callback, renderer){

  wgxpath.install(renderer.render.window);

  if(callback) callback();
};

wgxpath.install(window);    
