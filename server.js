const puppeteer = require('puppeteer');
const ExcelJS =require('exceljs');
const randomUseragent = require('random-useragent');

const saveExcel = (data) => {
    const workbook = new ExcelJS.Workbook();

    const fileName = 'lista-de-laptop.xlsx';

    const sheet = workbook.addWorksheet('Resultados');

    const reColumns =[
        {header: 'Nombre', key: 'name'},
        {header: 'Precio', key: 'price'},
        {header: 'Image', key: 'image'}        
    ]
    sheet.columns = reColumns

    sheet.addRows(data);

    workbook.xlsx.writeFile(fileName).then((e) => {
        console.log('Creado exitosamente');
    })
    .catch(()=>{
        console.log('Algo sucedio guardando el archivo EXCEL');
    })
} 

const initialization = async()=>{
    const header = randomUseragent.getRandom();//de que navegador

    const browser = await puppeteer.launch();//abreme el Chrome

    const page = await browser.newPage();//creame un nueva pestaña

    await page.setUserAgent(header);

    await page.setViewport({width: 1920, height: 1080});//simula que estas en esta pantalla de computadora

    await page.goto('https://listado.mercadolibre.com.pe/laptops#D[A:laptops]');//la pagina de donde sacamos los datos

    await page.screenshot({path: 'example.png'});// tomame un screenshot
    
    await page.waitForSelector('.ui-search-results');//indicamos que es la etiqueta 'select' mediante su clase
    
    const listaDeItems = await page.$$('.ui-search-layout__item');//indicamos que es la etiqueta 'li' mediante su clase
    
    let data = []

    for (const item of listaDeItems){
        const objetoNombre = await item.$('.ui-search-item__title');
        const image = await item.$('.ui-search-result-image__element');
        const objetoPrecio = await item.$('.price-tag-fraction');
        
        const getPrice = await page.evaluate(price => price.innerText, objetoPrecio);
        const getImage = await page.evaluate(image => image.getAttribute('src'), image);
        const getName = await page.evaluate(nombre => nombre.innerText, objetoNombre);
        
        // console.log(`${getName} --- ${getPrice} --- ${getImage}`);

        data.push({
           name:getName,
           price:getPrice,
           image:getImage
        })
    }
    
    await browser.close();

    saveExcel(data)
}


initialization();