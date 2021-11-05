const Sequelize = require('sequelize')

// Criar uma conexão com o banco

const sequelize =  new Sequelize('uv_tag', 'admin', '123admin321', {
    host: "uv-tag.ckuguuxrh4fi.sa-east-1.rds.amazonaws.com",
    port: 3306,
    dialect: 'mysql',
    timezone: '-03:00'
})

// Exportar o Sequelize como objeto

module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
}

sequelize.authenticate().then(function(){
     console.log("Conectado com sucesso!")
 }).catch(function(erro){
     console.log("Falha a se conectar: " + erro)
 })