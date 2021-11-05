const nodemailer = require('nodemailer')

const Remetente = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'smtp.gmail.com',
    port: 587,
    auth:{
        user: 'noreply.uvtag@gmail.com',
        pass: '123uvtag321'
    }
})

module.exports = Remetente