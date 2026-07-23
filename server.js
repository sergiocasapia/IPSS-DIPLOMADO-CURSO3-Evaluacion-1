// ─────────────────────────────────────────────────────────────────────────────
// Evaluación 1 · API del Mundial 2026
// Diplomado IPS · Módulo 3 — Backend y APIs REST
//
// Este es tu punto de partida. Los DATOS ya están (datos-mundial.js): el resto
// lo escribes tú.
//
// ANTES DE EMPEZAR — instala lo que necesites. Por ejemplo:
//     npm install express
//     npm install cors
//
// Para levantar el servidor:
//     npm run dev        (se reinicia solo al guardar)
// ─────────────────────────────────────────────────────────────────────────────

import express from 'express'
import cors from 'cors'

import { continentes, grupos, selecciones, partidos } from './datos-mundial.js'

// TODO: importa express y crea tu app.
//
//   import express from 'express'
//   const app = express()
//
// Recuerda el middleware que hace falta para leer el cuerpo de los POST,
// y configura CORS (lo vas a necesitar para el video).

const app = express()

//Solo para demostrar restriccion de metodo DELETE
/*const opcionesCors = { 
   // Reemplaza '*' por la IP/URL exacta de tu frontend si quieres más seguridad 
   origin: '*', 
   // Especificamos SOLO los métodos permitidos. Dejamos fuera a 'DELETE' 
   methods: ['GET', 'POST', 'PUT', 'PATCH']
   // Opcional: Asegura que el navegador respete esta regla en peticiones complejas 
   //optionsSuccessStatus: 200 
   }; 
app.use(cors(opcionesCors))
*/

app.use(cors())

app.use(express.json())


const PORT = 3000

// ─────────────────────────────────────────────────────────────────────────────
// TUS RUTAS
//
// Este es el mapa de lo que tienes que construir. El detalle completo de cada
// una (qué recibe, qué devuelve, qué status) está en el enunciado: léelo.
//
//   ── Base ──────────────────────────────────────────────────────────────────

//   GET  /api/selecciones/:id                 una, o 404
     app.get('/api/selecciones/:id', (req, res) => {
         const id = Number(req.params.id)
         const seleccion = selecciones.find(s => s.id == id)
         if (!seleccion) {
            return res.status(404).json({error : `No Existe la seleccion : '${id}'`})
         }
        res.status(200).json(seleccion)
    })

//   ── Con lógica ⭐ ──────────────────────────────────────────────────────────
//   GET  /api/selecciones?continente=Europa   filtra por continente  (anidada)
//   GET  /api/selecciones?campeon=true        solo las que ganaron alguna copa
//   GET  /api/selecciones                     todas
     app.get('/api/selecciones', (req, res) => {
         const { continente , campeon} = req.query;
         if (continente) {
            const val_continente = req.query.continente;
            const res_continente = continentes.find(s => s.nombre.toLowerCase() === val_continente.toLowerCase())
            if (!res_continente) {
               return res.status(404).json({error : `No Existe el Continente : '${val_continente}'`})
            }
            const id_continente = res_continente.id
            const seleccion = selecciones.filter(s => s.continenteId == id_continente)
            if (!seleccion) {
               return res.status(404).json({error : `No Existe Selecciones para este Continente : '${val_continente}'`})
            }
            res.status(200).json(seleccion)
         } else if (campeon) {
                   const bol_campeon = req.query.campeon;
                   if (bol_campeon != "true") {
                      return res.status(400).json({error : `Debe Ingresar el valor correcto [true] : '${bol_campeon}'`})
                   }
                   const seleccion = selecciones.filter(s => s.copas.length > 0)
                   res.status(200).json(seleccion)
                 } else {
                        res.status(200).json(selecciones)
                        }
    })

//   GET  /api/copas                           todas las copas, en una lista plana
     app.get('/api/copas', (req, res) => {
            const lista_copas = selecciones.flatMap(s => s.copas ?? [])
            res.status(200).json(lista_copas)
    })

//   GET  /api/copas/:seleccion                las copas de una (por NOMBRE), o 404
     app.get('/api/copas/:seleccion', (req, res) => {
            const val_seleccion = req.params.seleccion
            const res_seleccion = selecciones.find(s => s.nombre.toLowerCase() === val_seleccion.toLowerCase())
            if (!res_seleccion) {
               return res.status(404).json({error : `No Existe la Seleccion : '${val_seleccion}'`})
            }
            if (res_seleccion.copas.length === 0){
               return res.status(400).json({error : `Seleccion : '${val_seleccion}' , no tiene Copas`})
            }
            const res_copas = res_seleccion.copas
            res.status(200).json(res_copas)
    })

//   GET  /api/estadisticas                    resumen del torneo         (vale 2%)
     app.get('/api/estadisticas', (req, res) => {
        const resultado = selecciones.reduce((resumir,selecc,indice,array) =>{
              const llave = selecc.continenteId
              //Total de Selecciones
              resumir.totalselecciones = indice + 1 
              //Total de Copas
              resumir.totalcopas += (selecc.copas ?? []).length;
              //Total de Selecciones por Continente
              const res_continente = continentes.find(s => s.id === llave)
              const continente = res_continente.nombre
              resumir.porContinente[continente] = (resumir.porContinente[continente] || 0) + 1
              //Promedio Ranking FIFA
              resumir.promranking += selecc.fifaRanking
              if (indice === array.length - 1) {
                 const prom = resumir.promranking / array.length;
                 resumir.promranking = Number(prom.toFixed(0)) 
              }
              return resumir
        }, {
        totalselecciones : 0,
        totalcopas : 0,
        promranking : 0,
        porContinente : {}
        })
        res.status(200).json({ total: resultado }); 
     })

//   ── Semifinales y final ⭐ ─────────────────────────────────────────────────
//   POST /api/worldcup/2026/semifinals/:n     registra la semifinal n (1 a 4)
     app.post('/api/worldcup/2026/semifinals/:n', (req, res) => {
        const val_num = Number(req.params.n) 
         //Validar que solo sean entre 1 y 4 partidos y datos validos
         if (isNaN(val_num) || val_num < 1 || val_num > 4) {
            return res.status(400).json({error : `Parametro de Partidos incorrecto [1..4] y ingreso : '${val_num}'`})
         }
         //Validar si partido ya fue ingresado
         const val_partido = partidos.semifinales.find(s => s.numero === val_num)
         if (val_partido) {
               return res.status(400).json({error : `Partido ya fue ingresado nro : '${val_num}'`})
         }
         //Validar si las 2 selecciones existen 
         const {local, visita} = req.body
         const equipo_1 = local.seleccionId
         const equipo_2 = visita.seleccionId
         const res_seleccion_1 = selecciones.find(s => s.id === equipo_1)
            if (!res_seleccion_1) {
               return res.status(404).json({error : `No Existe codigo de Seleccion nro : '${equipo_1}'`})
            }
         const res_seleccion_2 = selecciones.find(s => s.id === equipo_2)
            if (!res_seleccion_2) {
               return res.status(404).json({error : `No Existe codigo de Seleccion  nro : '${equipo_2}'`})
            }
         const nombreseleccion_1 = res_seleccion_1.nombre
         const nombreseleccion_2 = res_seleccion_2.nombre
         const semifinal = `semifinal ${val_num}`
         const equipo = {numero:val_num, 
                  partido : semifinal,
                  local : {
                         seleccion: nombreseleccion_1,
                         goles: local.goles
                        }, 
                  visita : {
                         seleccion: nombreseleccion_2,
                         goles: visita.goles
                        },
                  ganador : (local.goles > visita.goles) ? nombreseleccion_1 : (visita.goles > local.goles) ? nombreseleccion_2 : null
                        }
        partidos.semifinales.push(equipo)
        res.status(201).json(equipo)
     })

//   GET  /api/worldcup/2026/semifinals/:n     el resultado de la semifinal n
     app.get('/api/worldcup/2026/semifinals/:n', (req, res) => {
        const val_num = Number(req.params.n) 
         //Validar que solo sean parametros entre 1 y 4 y datos invalidos
         if (isNaN(val_num) || val_num < 1 || val_num > 4) {
            return res.status(400).json({error : `Parametro de Partidos incorrecto [1..4] y ingreso : '${val_num}'`})
         }
         const res_semifinales = partidos.semifinales.find(s => s.numero === val_num)
         if (!res_semifinales) {
            return res.status(404).json({error : `No Existe este partido de semifinales nro : '${val_num}'`})
         }
        res.status(200).json(res_semifinales)
     })

//   GET  /api/worldcup/2026/semifinals        las cuatro
     app.get('/api/worldcup/2026/semifinals', (req, res) => {
        const res_carga_semifinales = partidos.semifinales.length
        if (res_carga_semifinales === 0) {
           return res.status(400).json({error : `Aun no se han cargados los Partidos de Semifinales `})
        }
        res.status(200).json(partidos.semifinales)
     })

//   POST /api/worldcup/2026/final             registra la final
     app.post('/api/worldcup/2026/final', (req, res) => {
         //Validar si las 2 selecciones existen 
         const {local, visita} = req.body
         const equipo_1 = local.seleccionId
         const equipo_2 = visita.seleccionId
         const res_carga_final = partidos.final
         if (res_carga_final) {
            return res.status(400).json({error : `Partido Final, ya fue cargado `})
         }
         const res_seleccion_1 = selecciones.find(s => s.id === equipo_1)
         if (!res_seleccion_1) {
            return res.status(404).json({error : `No Existe codigo de Seleccion nro : '${equipo_1}'`})
         }
         const res_seleccion_2 = selecciones.find(s => s.id === equipo_2)
         if (!res_seleccion_2) {
            return res.status(404).json({error : `No Existe codigo de Seleccion  nro : '${equipo_2}'`})
         }
         const nombreseleccion_1 = res_seleccion_1.nombre
         const nombreseleccion_2 = res_seleccion_2.nombre
         const campeon_mundial = (local.goles > visita.goles) ? nombreseleccion_1 : (visita.goles > local.goles) ? nombreseleccion_2 : null
         const res_campeon_mundial = selecciones.find(s => s.nombre === campeon_mundial)
         res_campeon_mundial.copas.push(2026)
         const final = { 
                  partido : "Final",
                  local : {
                         seleccion: nombreseleccion_1,
                         goles: local.goles
                        }, 
                  visita : {
                         seleccion: nombreseleccion_2,
                         goles: visita.goles
                        },
                  ganador : campeon_mundial
                        }
         partidos.final =final

        res.status(201).json(partidos.final)
     })

//   GET  /api/worldcup/2026/final             la final, con su ganador
      app.get('/api/worldcup/2026/final', (req, res) => {
         const res_carga_final = partidos.final
        if (res_carga_final === null) {
           return res.status(400).json({error : `Aun no se ha cargado Partido Final `})
        }
        res.status(200).json(partidos.final)
     })

//   ── Desafios opcionales ⭐ ─────────────────────────────────────────────────   
//   GET /api/grupos/:nombre/tabla
      app.get('/api/grupos/:nombre/tabla', (req, res) => {
         const val_grupo = req.params.nombre
         const res_grupo = grupos.find(s => s.nombre === val_grupo)
         if (!res_grupo) {
            return res.status(404).json({error : `No Existe el grupo : '${val_grupo}'`})
         }
         const nro_grupo = res_grupo.id
         const res_equipos_grupo = selecciones.filter(s => s.grupoId === nro_grupo)
         res_equipos_grupo.sort((a, b) => a.fifaRanking - b.fifaRanking);
         res.status(200).json(res_equipos_grupo)
     })

//   GET /api/worldcup/2026/camino/:seleccionId
      app.get('/api/worldcup/2026/camino/:seleccionId', (req, res) => {
         const val_id_seleccion = Number(req.params.seleccionId) 
         const res_seleccion = selecciones.find(s => s.id === val_id_seleccion)
         if (!res_seleccion) {
               return res.status(404).json({error : `No Existe la Seleccion : '${val_id_seleccion}'`})
         }
         const nom_seleccion = res_seleccion.nombre
         const res_semifinal_1 = partidos.semifinales.find(s => s.local?.seleccion === nom_seleccion || s.visita?.seleccion === nom_seleccion)
         if (!res_semifinal_1) {
               return res.status(404).json({error : `No se ha cargado resultado de Semifinales para Seleccion : '${nom_seleccion}'`})
         }
         const Copas_1 = partidos.final?Object.values(partidos.final).find(s => s.seleccion === nom_seleccion):undefined
         if (!Copas_1) {
               res.status(200).json({semifinal : res_semifinal_1})
         }else{
               res.status(200).json({semifinal : res_semifinal_1, final : partidos.final})
         }
     })


app.listen( PORT,()=>{
    console.log(`⚽ API del Mundial escuchando en http://localhost:${PORT}`)
    console.log("=== SERVIDOR INICIADO DESDE CERO ===");
})