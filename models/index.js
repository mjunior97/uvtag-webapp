(async () => {
    const database = require('./db');
    const Leitura = require('./Leitura');
 
    try {
        const resultado = await database.sync();
        console.log(resultado);
    } catch (error) {
        console.log(error);
    }
})();