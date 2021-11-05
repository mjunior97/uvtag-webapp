const express = require("express")

const {Op} = require("sequelize")

//const Sequelize = require("sequelize")

const Sequelize = require('sequelize')

const db = require("./models/db")

//import './db'

// Instanciando o módulo do express

const app = express()

app.use(express.static('views/_files'));

// Handlebars

const handlebars = require('express-handlebars')

// Body Parser

const bodyParser = require('body-parser')

const alert = require('alert')

const session = require('express-session');

// Configuração do Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

// Configuração do body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Acessando models do banco
const Leitura = require('./models/Leitura')
const Monitor = require('./models/Monitor')
const Usuario = require('./models/Usuario')
const Controlador = require('./models/Controlador')
const Evento = require('./models/Evento')

const Remetente = require('./models/email')

process.env.TZ = 'America/Sao Paulo'

// Cria estrutra de sessão
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

// Rota principal da aplicação
app.get("/", function(req, res){
        res.redirect("/Login")
})

app.post("/Logout", function(req, res){
    req.session.destroy()
    res.redirect("/")
})

app.get("/Logout", function(req, res){
    req.session.destroy()
    res.redirect("/")
})

//Rotas para tela login
app.get("/Login", function(req, res){
    req.session.destroy
    res.render('login')
})

app.post("/Login", function(req, res){
    var email_req = req.body.email
    var senha_req = req.body.senha
    if(!email_req || !senha_req){
        alert('Campo em branco!')
    } else{
        Usuario.findOne({
            where:{
                email: email_req,
                senha: senha_req
            }
        }).then(usuarios =>{
            if(usuarios==null){
                alert('Usuario nao existe!')
                res.render('login')
            } else{
                req.session.usuario = usuarios.id;
                res.redirect("/Selecionar")
            }
        })
    }
})    

app.get("/ForgotPass", function(req,res){
    res.render('forgotpass')
})

app.post("/ForgotPass", function(req, res){
    var email = req.body.email
    if (email == null){
        alert('Email em branco!')
    } else{
        Usuario.findOne({
            where: {email: email}
        }).then(usuario =>{
            if(usuario == null){
                alert('Não foi encontrado cadastro com esse email')
            } else{
                var texto = 'Sua senha é: '+usuario.senha 
                var emailASerEnviado = {
                    from: 'noreply.uvtag@gmail.com',
                    to: email,
                    subject: 'UV Tag - Recuperação de Senha',
                    text: texto,
                    };
                Remetente.sendMail(emailASerEnviado).catch(err =>
                    console.log(err)
                )
                alert('Email de recuperação enviado!')
            }
        })
    }
    res.redirect("/")
})

// Rotas para tela monitor
app.get("/Selecionar", function(req, res){
    if(!req.session.usuario){
        res.redirect('/');
    } else{
    Controlador.findAll({
        attributes: ['nome'],
        where: {
            user_id: req.session.usuario,
            flag_uv: '0'
        }
    }).then(function(dispositivos){
        res.render('selecao',{posts: dispositivos})
    })
}
})

app.post("/Selecionar", function(req, res){
    if(!req.session.usuario){
        res.redirect('/');
    } else{
        var dispositivo_nome = req.body.dispositivo_nome
        req.session.dispositivo_nome = dispositivo_nome
        res.redirect('/Monitor')
    }
})

app.get("/Monitor", function(req, res){
    if(!req.session.usuario){
        res.redirect('/');
    } else{
    var hoje = new Date();
    var ano = hoje.getFullYear();
    var mes = hoje.getMonth();
    var ultima_data = new Date(ano, mes+1, 0);
    var ultimo_dia = ultima_data.getDate();
    data_de = new Date(ano, mes, 1, 0, 0, 0);
    data_ate = new Date(ano, mes, ultimo_dia, 23, 59, 59);
    if(req.session.dispositivo_nome == "Todos"){
        Monitor.findAndCountAll({ 
            attributes: ['id_leitura','controlador','dispositivo','indice','dose','distancia','data','hora'],
            where: {
                timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                id_usuario: req.session.usuario
            }
            }).then(function(posts){
                Monitor.sum('indice',
                {where: {
                    timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                    id_usuario: req.session.usuario,
                }
            }).then(function(indice){
                    Monitor.sum('dose',
                    {where: {
                        timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                        id_usuario: req.session.usuario,
                    }
                }).then(function(dose){
                    if(posts.count == 0){
                        var avg_dose = 0;
                        var avg_indice = 0;
                    } else{
                        var avg_dose = dose/posts.count;
                        var avg_indice = indice/posts.count;
                    }
                    if(avg_indice <= 2){
                        var risco = 'Baixo'
                    }
                    if(avg_indice >= 3 && avg_indice <=5 ){
                        var risco = 'Moderado'
                    }
                    if(avg_indice >= 6 && avg_indice <=7 ){
                        var risco = 'Alto'
                    }
                    if(avg_indice >= 8 && avg_indice <=10 ){
                        var risco = 'Muito Alto'
                    }
                    if(avg_indice >= 11){
                        var risco = 'Extremo'
                    }

                    res.render('monitor', {posts: posts.rows, avg_indice: avg_indice, avg_dose: avg_dose, risco: risco});
                }).catch(err =>
                    console.log(err)
                )
             })
        })
     } else{
            Monitor.findAndCountAll({ 
                attributes: ['id_leitura','controlador','dispositivo','indice','dose','distancia','data','hora'],
                where: {
                    timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                    id_usuario: req.session.usuario,
                    dispositivo: req.session.dispositivo_nome
                }
                }).then(function(posts){
                    Monitor.sum('indice',
                        {where: {
                            timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                            id_usuario: req.session.usuario,
                            dispositivo: req.session.dispositivo_nome
                        }
                    }).then(function(indice){
                            Monitor.sum('dose',
                            {where: {
                                timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                                id_usuario: req.session.usuario,
                                dispositivo: req.session.dispositivo_nome
                            }
                        }).then(function(dose){
                            if(posts.count == 0){
                                var avg_dose = 0;
                                var avg_indice = 0;
                            } else{
                                var avg_dose = dose/posts.count;
                                var avg_indice = indice/posts.count;
                            }
                            if(avg_indice <= 2){
                                var risco = 'Baixo'
                            }
                            if(avg_indice >= 3 && avg_indice <=5 ){
                                var risco = 'Moderado'
                            }
                            if(avg_indice >= 6 && avg_indice <=7 ){
                                var risco = 'Alto'
                            }
                            if(avg_indice >= 8 && avg_indice <=10 ){
                                var risco = 'Muito Alto'
                            }
                            if(avg_indice >= 11){
                                var risco = 'Extremo'
                            }
        
                            res.render('monitor', {posts: posts.rows, avg_indice: avg_indice, avg_dose: avg_dose, risco: risco});
                        }).catch(err =>
                            console.log(err)
                        )
                     })
                })
            }
        }
    })

app.post("/Monitor", function(req, res){
    if(!req.session.usuario){
        res.redirect('/');
    } else{    
    data_de = new Date(req.body.data_from);
    data_ate = new Date(req.body.data_to);
    if(data_de == null || data_ate == null || isNaN(data_de) || isNaN(data_ate)){
        var hoje = new Date();
        var ano = hoje.getFullYear();
        var mes = hoje.getMonth();
        var ultima_data = new Date(ano, mes+1, 0);
        var ultimo_dia = ultima_data.getDate();
        data_de = new Date(ano, mes, 1, 0, 0, 0);
        data_ate = new Date(ano, mes, ultimo_dia, 23, 59, 59);
    } else{
        data_de.setHours(data_de.getHours()+24)
        data_de.setHours(0)
        data_de.setMinutes(0)
        data_de.setSeconds(0)
        data_ate.setHours(data_ate.getHours()+24)
        data_ate.setHours(23)
        data_ate.setMinutes(59)
        data_ate.setSeconds(59)
    }
    if(req.session.dispositivo_nome == "Todos"){
        Monitor.findAndCountAll({ 
            attributes: ['id_leitura','controlador','dispositivo','indice','dose','distancia','data','hora'],
            where: {
                timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                id_usuario: req.session.usuario
            }
            }).then(function(posts){
                Monitor.sum('indice',
                {where: {
                    timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                    id_usuario: req.session.usuario,
                }
            }).then(function(indice){
                    Monitor.sum('dose',
                    {where: {
                        timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                        id_usuario: req.session.usuario,
                    }
                }).then(function(dose){
                    if(posts.count == 0){
                        var avg_dose = 0;
                        var avg_indice = 0;
                    } else{
                        var avg_dose = dose/posts.count;
                        var avg_indice = indice/posts.count;
                    }

                    if(avg_indice <= 2){
                        var risco = 'Baixo'
                    }
                    if(avg_indice >= 3 && avg_indice <=5 ){
                        var risco = 'Moderado'
                    }
                    if(avg_indice >= 6 && avg_indice <=7 ){
                        var risco = 'Alto'
                    }
                    if(avg_indice >= 8 && avg_indice <=10 ){
                        var risco = 'Muito Alto'
                    }
                    if(avg_indice >= 11){
                        var risco = 'Extremo'
                    }

                    res.render('monitor', {posts: posts.rows, avg_indice: avg_indice, avg_dose: avg_dose, risco: risco});
                }).catch(err =>
                    console.log(err)
                )
             })
        })
     } else{
            Monitor.findAndCountAll({ 
                attributes: ['id_leitura','controlador','dispositivo','indice','dose','distancia','data','hora'],
                where: {
                    timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                    id_usuario: req.session.usuario,
                    dispositivo: req.session.dispositivo_nome
                }
                }).then(function(posts){
                    Monitor.sum('indice',
                        {where: {
                            timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                            id_usuario: req.session.usuario,
                            dispositivo: req.session.dispositivo_nome
                        }
                    }).then(function(indice){
                            Monitor.sum('dose',
                            {where: {
                                timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
                                id_usuario: req.session.usuario,
                                dispositivo: req.session.dispositivo_nome
                            }
                        }).then(function(dose){
                            if(posts.count == 0){
                                var avg_dose = 0;
                                var avg_indice = 0;
                            } else{
                                var avg_dose = dose/posts.count;
                                var avg_indice = indice/posts.count;
                            }
                            if(avg_indice <= 2){
                                var risco = 'Baixo'
                            }
                            if(avg_indice >= 3 && avg_indice <=5 ){
                                var risco = 'Moderado'
                            }
                            if(avg_indice >= 6 && avg_indice <=7 ){
                                var risco = 'Alto'
                            }
                            if(avg_indice >= 8 && avg_indice <=10 ){
                                var risco = 'Muito Alto'
                            }
                            if(avg_indice >= 11){
                                var risco = 'Extremo'
                            }
        
                            res.render('monitor', {posts: posts.rows, avg_indice: avg_indice, avg_dose: avg_dose, risco: risco});;
                        }).catch(err =>
                            console.log(err)
                        )
                     })
                })
            }
        }
})

app.get("/Eventos", function(req, res){
    if(!req.session.usuario){
        res.redirect('/');
    } else{
    var hoje = new Date();
    var ano = hoje.getFullYear();
    var mes = hoje.getMonth();
    var ultima_data = new Date(ano, mes+1, 0);
    var ultimo_dia = ultima_data.getDate();
    data_de = new Date(ano, mes, 1, 0, 0, 0);
    data_ate = new Date(ano, mes, ultimo_dia, 23, 59, 59);
    Evento.findAll({ 
        attributes: ['id','controlador','evento','data','hora'],
        where: {
           timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
            id_usuario: req.session.usuario
        }
        }).then(function(eventos){
            res.render('eventos', {posts: eventos})
        })
    }
})

app.post("/Eventos", function(req, res){
    if(!req.session.usuario){
        res.redirect('/');
    } else{   
    data_de = new Date(req.body.data_from);
    data_ate = new Date(req.body.data_to);
    if(data_de == null || data_ate == null || isNaN(data_de) || isNaN(data_ate)){
        var hoje = new Date();
        var ano = hoje.getFullYear();
        var mes = hoje.getMonth();
        var ultima_data = new Date(ano, mes+1, 0);
        var ultimo_dia = ultima_data.getDate();
        data_de = new Date(ano, mes, 1, 0, 0, 0);
        data_ate = new Date(ano, mes, ultimo_dia, 23, 59, 59);
    } else{
        data_de.setHours(data_de.getHours()+24)
        data_de.setHours(0)
        data_de.setMinutes(0)
        data_de.setSeconds(0)
        data_ate.setHours(data_ate.getHours()+24)
        data_ate.setHours(23)
        data_ate.setMinutes(59)
        data_ate.setSeconds(59)
    }
    Evento.findAll({ 
        attributes: ['id','controlador','evento','data','hora'],
        where: {
           timestamp: {[Op.gte]:data_de, [Op.lte]:data_ate},
            id_usuario: req.session.usuario
        }
        }).then(function(eventos){
            res.render('eventos', {posts: eventos})
        })
    }
})

// Rotas para tela Registro
app.get("/Registro", function(req, res){
    res.render('registro')
})

app.post("/Registro", function(req, res){   
    var email_req = req.body.email
    var senha_req = req.body.senha
    var controladorID_req = req.body.controlador_id
    var controladorNome_req = req.body.controlador_nome
    var dispositivoID_req = req.body.dispositivo_id
    var dispositivoNome_req = req.body.dispositivo_nome
    if( email_req > ''  && senha_req >'' &&  controladorID_req >'' && controladorNome_req >'' && dispositivoID_req >'' && dispositivoNome_req >'' ){
        Usuario.findOne({
            where:{
                email: email_req
            }
        }).then(usuarios =>{
            if(usuarios == null){
                Controlador.findOne({
                    where:{
                        id: controladorID_req
                }
                }).then(controladores =>{
                    if(controladores == null){
                        Controlador.findOne({
                            where:{
                              id: dispositivoID_req
                            }
                        }).then(controladores =>{
                            if(controladores == null){
                                Usuario.max('id').then(function(max){
                                    var usuario_max = max+1
                                    Usuario.create({
                                        id: usuario_max,
                                        email: email_req,
                                        senha: senha_req
                                    })
                                    Controlador.create({
                                        id: controladorID_req,
                                        user_id: usuario_max,
                                        nome: controladorNome_req,
                                        flag_uv: 1
                                    })
                                    Controlador.create({
                                        id: dispositivoID_req,
                                        user_id: usuario_max,
                                        nome: dispositivoNome_req,
                                        flag_uv: 0
                                    })
                                    res.redirect('/Login')
                                })
                            } else{
                                alert('Dispositivo já existe!')
                            }
                    })
                    } else{
                        alert('Controlador já existe!')
                    }
                })
            } else{
                alert('Usuário já existe!')
            }
        })
    } else{
        alert('Campos em branco detectados!\nFavor preencher todos os campos.')
    }
})

app.get("/Perfil", function(req, res){
    if(!req.session.usuario){
        res.redirect('/');
    } else{
    Controlador.findAll({
        attributes: ['nome'],
        where:{user_id: req.session.usuario}
    }).then(function(perfil){
        res.render('perfil', {posts: perfil})
    })
    }
})

app.post("/Perfil", function(req, res){
    if(!req.session.usuario){
        res.redirect('/');
    } else{
    var novo_email = req.body.novo_email
    var confirmar_email = req.body.confirmar_email
    var nova_senha = req.body.nova_senha
    var confirmar_senha1 = req.body.confirmar_senha1
    var op_dispositivo = req.body.op_dispositivo
    var novo_dispositivo = req.body.novo_dispositivo
    var confirmar_dispositivo = req.body.confirmar_dispositivo
    var id_dispositivo = req.body.id_dispositivo
    var nome_dispositivo = req.body.nome_dispositivo
    var senha = req.body.senha
    var confirmar_senha2 = req.body.confirmar_senha2
    var flag_atualizar = 0;
    var flag_erro = 0;
    if(novo_email>'' || nova_senha>'' || novo_dispositivo>'' || id_dispositivo>''){
        if(senha>''){
            if(senha!=confirmar_senha2){
                alert('Senha atual e confirmação são diferentes')
                res.redirect('/Perfil')
            } else{
                if(novo_email>''){
                    if(novo_email!=confirmar_email){
                        alert('email nao alterado, valores diferentes')
                        flag_erro = 1;
                    } else{
                        Usuario.update({
                            email: novo_email},
                            {where:{id: req.session.usuario}
                        })
                        flag_atualizar = 1;
                        alert('email alterado')
                    }
                }
                if(nova_senha>''){
                    if(nova_senha!=confirmar_senha1){
                        alert('senha nao alterada, valores diferentes')
                        flag_erro = 1;
                    } else{
                        Usuario.update({
                            senha: nova_senha},
                            {where:{id: req.session.usuario}
                        })
                        flag_atualizar = 1;
                        alert('senha alterada')
                    }
                }
                if(novo_dispositivo>''){
                    if(novo_dispositivo!=confirmar_dispositivo){
                        alert('dispositivo nao alterado, valores diferentes')
                        flag_erro = 1;
                    } else{
                        Controlador.update({
                            nome: novo_dispositivo},
                            {where:{
                                nome: op_dispositivo,
                                user_id: req.session.usuario
                            }
                        })
                        flag_atualizar = 1;
                        alert('dispositivo alterado')
                    }
                }
                if(id_dispositivo>'' && nome_dispositivo>''){
                    Controlador.findOne({
                        where:{
                            [Op.or]: [
                                {id: id_dispositivo},
                            ],
                            user_id: req.session.usuario,
                            nome: nome_dispositivo
                            }
                    }).then(function(controladores){
                        if(controladores){
                            alert("Não foi possível cadastrar novo dispositivo, ")
                            flag_erro = 1;
                        } else{
                            Controlador.create({
                                id: id_dispositivo,
                                user_id: req.session.usuario,
                                nome: nome_dispositivo,
                                flag_uv: '0'
                            })
                            flag_atualizar = 1
                            alert('dispositivo criado')
                        }
                    })
                } else if(id_dispositivo>''){
                    alert('novo dispositivo: id não preenchido')
                } else if(nome_dispositivo>''){
                    alert('novo dispositivo: nome não preenchido')
                }
                res.redirect('/Monitor')    
            }
        } else{
            alert('Digite a senha para confirmar as alterações!')
            res.redirect('/Perfil')
        }
    } else{
        res.redirect('/Perfil')
    }
    }
})

// Função de callback
// A chamada listen tem que ser a última do código

app.listen(3000, function(){

    console.log("Servidor rodando!")

})