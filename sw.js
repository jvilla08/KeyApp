const CACHE ='cache-1';
const CACHE_DINAMICO ='dinamico-1';
const CACHE_INMUTABLE ='inmutable-1';


self.addEventListener('install', evento=>{
    const promesa =caches.open(CACHE)
        .then(cache=>{
            return cache.addAll([
                //'/',
                'index.html',
                'css/normalize.css',
                'css/style.css',
                'img/logo.png',
                'nosotros.html',
                'productos.html',
                'contacto.html',
                'img/1.svg',
                'img/nfc.svg',
                'img/3.svg',
                'offline.html',
                'manifest.json',
                
            ]);
        });

        
        const cacheInmutable =  caches.open(CACHE_INMUTABLE)
            .then(cache=>{
                cache.add('');
            });
       
    
        evento.waitUntil(Promise.all([promesa]));
});



self.addEventListener('activate', evento =>{
    //antes de activar el sw, obten los nombres de los espacios de cache existentes
    const respuesta=caches.keys().then(keys =>{
        //verifica cada nombre de espacios de cache
        keys.forEach(key =>{
            //si el espacio no tiene el nombre actual del cache e incluye la palabra cache
            if(key !== CACHE && key.includes('cache')){
                //borralo, la condición de include cache evitará borrar el espacio dinamico o inmutable
                return caches.delete(key);
            }
        });
    });
    evento.waitUntil(respuesta);
});
self.addEventListener('fetch', evento =>{

    
    //Estrategia 2 CACHE WITH NETWORK FALLBACK
    const respuesta=caches.match(evento.request)
        .then(res=>{
            //si el archivo existe en cache retornalo
            if (res) return res;
            //Imprimos en consola para saber que no se encontro en cache
            console.log('No existe', evento.request.url);
        
            //Procesamos la respuesta a la petición localizada en la web
            return fetch(evento.request)
                .then(resWeb=>{//el archivo recuperado se almacena en resWeb
                    //se abre nuestro cache
                    caches.open(CACHE_DINAMICO)
                        .then(cache=>{
                            //se sube el archivo descargado de la web
                            cache.put(evento.request,resWeb);
                            //llamar la limpieza al cargar un nuevo archivo
                            //se limpiará el cache dinamico y que 
                            //debe haber 5 archivos
                            limpiarCache(CACHE_DINAMICO,5);
                        })
                    //se retorna el archivo recuperado para visualizar la página
                    return resWeb.clone();  
                });
        })
        .catch(err => {
            //si ocurre un error
            if(evento.request.headers.get('accept').includes('text/html')){
                //muestra página offline que esta en cache
                return caches.match('/offline.html');
            }else{
                return caches.match('/images/no-img.jpeg');
            }
        });
        evento.respondWith(respuesta);
        

});
function limpiarCache(nombreCache, numeroItems){
    //abrimos el cache
    caches.open(nombreCache)
        .then(cache=>{
            //recuperacion del arreglo de archivos exixtentes en el cache
            return cache.keys()
                .then(keys=>{
                    //si el número de archivos supera el limite permitido
                    if (keys.length>numeroItems){
                        //se elimina el más antigüo y repite el proceso
                        cache.delete(keys[0])
                            .then(limpiarCache(nombreCache, numeroItems));
                    }
                });
        });
}
