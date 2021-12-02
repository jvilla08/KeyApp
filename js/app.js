var url=window.location.href;
var ubicacionSw='/keyApp/sw.js';
if ( navigator.serviceWorker ) {
    if(url.includes('localhost')){
        ubicacionSw='/sw.js';
    }
    navigator.serviceWorker.register(ubicacionSw);
}