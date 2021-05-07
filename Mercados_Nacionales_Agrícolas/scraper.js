const request = require("request-promise");
const cheerio = require("cheerio");
const Promise = require("bluebird");
const excel = require('exceljs');
const workbook = new excel.Workbook();
const worksheet = workbook.addWorksheet('Tutorials');
const processs = require('process');

//Import the mongoose module
const mongoose = require('mongoose');

//Set up default mongoose connection
const mongoDB = 'mongodb://127.0.0.1/Mercados_Nacionales_Agrícolas';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Define a schema
const Schema = mongoose.Schema;

const SomeModelSchema = new Schema({
    fecha: String,
    precio_min: String,
    precio_max: String,
    precio_frec: String,
    observaciones: String,
    url: String,
    producto: String,
    productoId: String,
    origen: String,
    destino: String
});

const SomeModel = mongoose.model('Granos', SomeModelSchema );

const productos_list = {
    '598': 'Alubia chica',
    '599': 'Alubia grande',
    '1': 'Arroz pulido Morelos',
    '2': 'Arroz pulido Sinaloa',
    '3': 'Arroz pulido sin especificar',
    '4': 'Arroz pulido tipo Morelos',
    '332': 'Frijol Azufrado',
    '334': 'Frijol Bayo',
    '333': 'Frijol Bayo berrendo',
    '335': 'Frijol Cacahuate bola',
    '336': 'Frijol Cacahuate largo',
    '337': 'Frijol Canario',
    '338': 'Frijol Colorado',
    '339': 'Frijol Flor de junio',
    '340': 'Frijol Flor de mayo',
    '341': 'Frijol Garbancillo',
    '342': 'Frijol Garbancillo zarco',
    '343': 'Frijol Mayocoba',
    '347': 'Frijol Negro',
    '344': 'Frijol Negro bola',
    '345': 'Frijol Negro importado',
    '346': 'Frijol Negro Nayarit',
    '348': 'Frijol Negro Veracruz',
    '349': 'Frijol Ojo de cabra',
    '350': 'Frijol Peruano',
    '352': 'Frijol Pinto',
    '351': 'Frijol Pinto importado',
    '353': 'Frijol Serahui',
    '354': 'Frijol Tepari',
    '355': 'Frijol Yurimun',
    '600': 'Garbanzo chico',
    '601': 'Garbanzo grande',
    '602': 'Haba',
    '603': 'Lenteja chica',
    '604': 'Lenteja grande',
    '605': 'Maíz Blanco',
    '606': 'Maíz blanco pozolero'
}
const origen_list = {
    '1': 'Aguascalientes',
    '2': 'Baja%20California',
    '3': 'Baja%20California%20Sur',
    '4': 'Campeche',
    '7': 'Coahuila',
    '8': 'Colima',
    '5': 'Chiapas',
    '6': 'Chihuahua',
    '9': 'Distrito%20Federal',
    '10': 'Durango',
    '11': 'Guanajuato',
    '12': 'Guerrero', '13': 'Hidalgo',
    '55': 'Importaci%C3%B3n',
    '14': 'Jalisco',
    '15': 'M%C3%A9xico',
    '16': 'Michoac%C3%A1n',
    '17': 'Morelos',
    '44': 'Nacional',
    '18': 'Nayarit',
    '19': 'Nuevo%20Le%C3%B3n',
    '20': 'Oaxaca',
    '21': 'Puebla',
    '22': 'Quer%C3%A9taro',
    '23': 'Quintana%20Roo',
    '24': 'San%20Luis%20Potos%C3%AD',
    '0': 'Sin%20Especificar',
    '25': 'Sinaloa',
    '26': 'Sonora',
    '27': 'Tabasco',
    '28': 'Tamaulipas',
    '29': 'Tlaxcala',
    '30': 'Veracruz',
    '31': 'Yucat%C3%A1n',
    '32': 'Zacatecas'
}
const destinos_list = {
    "11": "Aguascalientes%3A%20Central%20de%20Abasto%20de%20Aguascalientes",
    "10": "Aguascalientes%3A%20Centro%20Comercial%20Agropecuario%20de%20Aguascalientes",
    "33": "Baja%20California%20%3A%20Central%20de%20Abasto%20INDIA%2C%20Tijuana",
    "20": "Baja%20California%20Sur%3A%20Uni%C3%B3n%20de%20Comerciantes%20de%20La%20Paz",
    "40": "Campeche%3A%20Mercado%20%22Pedro%20S%C3%A1inz%20de%20Baranda%22%2C%20Campeche",
    "50": "Coahuila%3A%20Central%20de%20Abasto%20de%20La%20Laguna%2C%20Torre%C3%B3n",
    "80": "Colima%3A%20Centros%20de%20distribuci%C3%B3n%20de%20Colima",
    "70": "Chiapas%3A%20Central%20de%20Abasto%20de%20Tuxtla%20Guti%C3%A9rrez",
    "61": "Chihuahua%3A%20Central%20de%20Abasto%20de%20Chihuahua",
    "100": "DF%3A%20Central%20de%20Abasto%20de%20Iztapalapa%20DF",
    "102": "Durango%3A%20Central%20de%20Abasto%20%22Francisco%20Villa%22",
    "101": "Durango%3A%20Centro%20de%20Distribuci%C3%B3n%20y%20Abasto%20de%20G%C3%B3mez%20Palacio",
    "110": "Guanajuato%3A%20Central%20de%20Abasto%20de%20Le%C3%B3n",
    "112": "Guanajuato%3A%20Mercado%20de%20Abasto%20de%20Celaya%20%28%22Benito%20Ju%C3%A1rez%22%29",
    "111": "Guanajuato%3A%20M%C3%B3dulo%20de%20Abasto%20Irapuato",
    "121": "Guerrero%3A%20Central%20de%20Abastos%20de%20Acapulco",
    "130": "Hidalgo%3A%20Central%20de%20Abasto%20de%20Pachuca",
    "140": "Jalisco%3A%20Mercado%20de%20Abasto%20de%20Guadalajara",
    "151": "M%C3%A9xico%3A%20Central%20de%20Abasto%20de%20Ecatepec",
    "150": "M%C3%A9xico%3A%20Central%20de%20Abasto%20de%20Toluca",
    "160": "Michoac%C3%A1n%3A%20Mercado%20de%20Abasto%20de%20Morelia",
    "170": "Morelos%3A%20Central%20de%20Abasto%20de%20Cuautla",
    "180": "Nayarit%3A%20Mercado%20de%20abasto%20%27Adolfo%20L%C3%B3pez%20Mateos%27%20de%20Tepic",
    "181": "Nayarit%3A%20Nayarabastos%20de%20Tepic",
    "191": "Nuevo%20Le%C3%B3n%3A%20Central%20de%20Abasto%20de%20Guadalupe%2C%20Nvo.%20Le%C3%B3n",
    "190": "Nuevo%20Le%C3%B3n%3A%20Mercado%20de%20Abasto%20%22Estrella%22%20de%20San%20Nicol%C3%A1s%20de%20los%20Garza",
    "200": "Oaxaca%3A%20M%C3%B3dulo%20de%20Abasto%20de%20Oaxaca",
    "210": "Puebla%3A%20Central%20de%20Abasto%20de%20Puebla",
    "220": "Quer%C3%A9taro%3A%20Mercado%20de%20Abasto%20de%20Quer%C3%A9taro",
    "230": "Quintana%20Roo%3A%20Mercado%20de%20Chetumal%2C%20Quintana%20Roo",
    "240": "San%20Luis%20Potos%C3%AD%3A%20Centro%20de%20Abasto%20de%20San%20Luis%20Potos%C3%AD",
    "250": "Sinaloa%3A%20Central%20de%20Abasto%20de%20Culiac%C3%A1n",
    "261": "Sonora%3A%20Central%20de%20Abasto%20de%20Cd.%20Obreg%C3%B3n",
    "260": "Sonora%3A%20Mercado%20de%20Abasto%20%22Francisco%20I.%20Madero%22%20de%20Hermosillo",
    "270": "Tabasco%3A%20Central%20de%20Abasto%20de%20Villahermosa",
    "281": "Tamaulipas%3A%20M%C3%B3dulo%20de%20Abasto%20de%20Reynosa",
    "280": "Tamaulipas%3A%20M%C3%B3dulo%20de%20Abasto%20de%20Tampico%2C%20Madero%20y%20Altamira",
    "302": "Veracruz%3A%20Central%20de%20Abasto%20de%20Minatitl%C3%A1n",
    "306": "Veracruz%3A%20Mercado%20Malibr%C3%A1n",
    "307": "Veracruz%3A%20Otros%20Centros%20Mayoristas%20de%20Xalapa",
    "304": "Veracruz%3A%20Otros%20puntos%20de%20cotizaci%C3%B3n%20en%20Poza%20Rica%2C%20Ver.",
    "310": "Yucat%C3%A1n%3A%20Central%20de%20Abasto%20de%20M%C3%A9rida",
    "320": "Zacatecas%3A%20Mercado%20de%20Abasto%20de%20Zacatecas"
}

const process = [];
const excel_list = [];
let errores = 0;
async function getData(semana, mes, anio) {
    let counter = 0;
    let round = 0;


    for (const destinos in destinos_list) {
        for (const origen in origen_list) {
            for (const producto in productos_list) {
                const string_to_query = `http://www.economia-sniim.gob.mx/nuevo/Consultas/MercadosNacionales/PreciosDeMercado/Agricolas/ResultadosConsultaFechaGranos.aspx?Semana=${semana}&Mes=${mes}&Anio=${anio}&ProductoId=${producto}&OrigenId=${origen}&Origen=${origen_list[origen]}&DestinoId=${destinos}&Destino=${destinos_list[destinos]}`;
                // const string_to_query = 'http://www.economia-sniim.gob.mx/nuevo/Consultas/MercadosNacionales/PreciosDeMercado/Agricolas/ResultadosConsultaFechaGranos.aspx?Semana=2&Mes=1&Anio=2019&ProductoId=606&OrigenId=55&Origen=Importaci%c3%b3n&DestinoId=320&Destino=Zacatecas:%20Mercado%20de%20Abasto%20de%20Zacatecas'
                round += 1;
                console.log(round);
                process.push(new Promise(function (resolve) {
                    return resolve(
                        request.get(string_to_query)
                            .then(result => {
                                const $ = cheerio.load(result);

                                $("#tblResultados").find("tr").each((index, element) => {
                                    if (index === 0) return true;
                                    counter += 1;

                                    const tds = $(element).find("td");
                                    const fecha = $(tds[0]).text();
                                    const precio_min = $(tds[1]).text();
                                    const precio_max = $(tds[2]).text();
                                    const precio_frec = $(tds[3]).text();
                                    const observaciones = $(tds[4]).text();

                                    const tableRow = {
                                        fecha,
                                        precio_min,
                                        precio_max,
                                        precio_frec,
                                        observaciones,
                                        url: string_to_query,
                                        producto: productos_list[producto],
                                        productoId: producto,
                                        origen: origen_list[origen],
                                        destino: destinos_list[destinos]
                                    };
                                    // excel_list.push(tableRow);
                                    const awesome_instance = new SomeModel(tableRow);
                                    awesome_instance.save(function (err) {
                                        if (err) return handleError(err);
                                        // saved!
                                    });
                                });
                            }).catch(error => {
                                console.log(error);
                                // console.log(`Fallo el caso de ${string_to_query}`)
                                errores += 1;
                            })
                    )
                }))
            }
        }
    }
}

async function generate(semana, mes, anio) {
    const start = Date.now();
    await Promise.all(process);
    const end = Date.now();
    console.log(((end - start) / 1000) / 60 + " minutos")
    console.log(`Fallaron ${errores} casos`)
}

const myArgs = processs.argv.slice(2);
const [semana, mes, anio] = myArgs;
if (myArgs.length < 3) {
    console.log("node scraper.js semana mes año");
    console.log("Productos: ")
    console.log(productos_list)
    console.log("Ejemplo: ");
    console.log("node scraper.js 2 1 2019");
    return;
}
getData(semana, mes, anio);
generate(semana, mes, anio)

