### Evaluacion 1 : API del Mundial 2026
Modulo 3 -Backend y API REST IPSS

### Nombre del grupo
EVALUACION 1 DIPLOMADOS IPSS

### Integrantes
Sergio Casapia Churata

### Descripción
Construir API REST para realizar consultas sobre el Campeonato Mundial, ademas de permitir el ingreso de resultados de semifinales y final.
API desarrolladas en Node.js y Express.

### Deploy
Sitio desplegado: 

### Capturas del sitio
N/A

### Cómo correr localmente
git clone : https://github.com/Gakertz/IPSS-evaluacion-clases-1-y-2.git
VSC ir a terminal de ruta de proyecto clonado y ejecutar : npm install
Levanta API REST : npm run dev (deja corriendo : http://localhost:3000)
Levantar PostMan y importar archivo : Book_Api_Mundial.postman_collection.json
Pruebas : Ejecutar en secuencia coleccion de carpeta Book_Api_Mundial

### Endpoinst (Rutas API)
Metodo HTTP (GET , POST)

### Detalle Metodos
Get Selecciones
Get Seleccion
Get Continente
Get Campeones
Get Copas
Get Copas Seleccion
Get Estadisticas
Post Semifinales
Get Semifinal
Get Semifinales
Post Final
Get Final
Get Tabla
Get Camino Titulo

### Estado API REST
Retorno : 200 al leer bien, 201 al crear, 400 si los datos que llegan están mal o faltan, 404 si el recurso no existe.

### Tecnologia y Conceptos JS utilizados
Metodos Array : find,filter, flatMap,reduce,
Funcion  : Flecha
Operador  : Ternario y fusion de Nulos