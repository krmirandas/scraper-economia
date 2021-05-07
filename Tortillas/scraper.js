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

const SomeModel = mongoose.model('Granos', SomeModelSchema);

dqMesMes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
dqAnioMes = [2007, 2008, 2009, 2010, 2011, 2012, 2013,
    2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
preEdo = ['Edo', 'Cd', 'Amb']
prod = ['T', '2', '1']
Formato = 'Nor'

const string_to_query = `http://www.economia-sniim.gob.mx/TortillaAnualPorDia.asp?Cons=D&prod=1&Anio=2020&preEdo=Cd&Formato=Nor&submit=Ver+Resultados`;
console.log(string_to_query)
return new Promise(function (resolve) {
    return resolve(
        request.get(string_to_query)
            .then(result => {

                const $ = cheerio.load(result);
                const trs = $("#Datos").find("tr");
                const tableTR = trs.slice(4, trs.length - 5);
                tableTR.each((index, element) => {
                    const tds = $(element).find("td");
                    tds.each((index, row)  => {
                        const algo =  $(row).text();
                        console.log(row);
                        
                    });
                })
            })
    );
})
