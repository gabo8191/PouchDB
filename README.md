# Gestor local de heroes con PouchDB

Aplicación web PWA para gestionar heroes en almacenamiento local (IndexedDB) usando PouchDB.

La app permite:

- Crear y reiniciar la base de datos local `heroes`.
- Crear registros con clave primaria manual (`_id`) y con ID autogenerado.
- Adjuntar archivos de imagen como BLOB a un registro.
- Editar registros por dos enfoques: documento completo o objeto JSON.
- Eliminar registros por dos enfoques: documento completo o objeto JSON.
- Listar todos los registros almacenados en la base local.
- Registrar resultados y errores en la consola del navegador.
