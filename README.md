# Taller PouchDB - Evidencias

Proyecto base para el taller de PouchDB (Electiva III - PWA).

## Estructura base

- index.html
- manifest.json
- sw.js
- src/js/app.js
- src/css/main.css
- src/html/offline.html
- src/html/guia-evidencias.html
- icons/

## Investigacion solicitada

- Punto 1: investigacion-punto-1-async-await.txt
- Punto 2: investigacion-punto-2-integracion-pouchdb.txt

## Como ejecutar

1. Abre esta carpeta en VS Code.
2. Levanta un servidor local (por ejemplo Live Server).
3. Abre la app en el navegador.
4. Abre DevTools en tu navegador (Console y Application > IndexedDB).
5. Ejecuta los botones en este orden sugerido:
   - Crear DB heroes
   - Crear registro con clave primaria
   - Agregar con ID auto (documento)
   - Agregar con ID auto (JSON)
   - Agregar BLOB al registro
   - Editar por documento
   - Editar por JSON
   - Eliminar por documento
   - Eliminar por JSON
   - Listar todos los registros

## Evidencias para capturas

- IndexedDB > base de datos heroes creada.
- Documento con \_id explicito (clave primaria).
- Inserciones con ID autogenerado (documento y JSON).
- Registro con adjunto BLOB (avatar.png).
- Edicion por documento y por JSON.
- Eliminacion por documento y por JSON.
- Respuesta de listar todos los registros.
- Manejo de errores en la consola visual (panel de salida).

## Notas

- El codigo de src/js/app.js tiene comentarios de investigacion desde el punto 3 al 11.
- El manejo de errores esta centralizado en executeOperation().
- Los resultados y errores se revisan en la consola del navegador.
