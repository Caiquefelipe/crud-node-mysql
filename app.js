//importar módulo express
const express = require('express');

//Importar módulo express-handlebars
const { engine } = require('express-handlebars');


//Importar módulo mysql
const mysql = require('mysql2');

//configuração de conexão com o banco de dados
const conexão = mysql.createConnection({
    host: 'localhost',
    user: 'usuario',
    password: 'senha123',
    database: 'projeto'
});
//teste de conexao
conexão.connect((erro) => {
    if (erro) throw erro;
    console.log('Conectado ao MySQL!');
});


const app = express();

//Adicionar Bootstrap
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));

//configuração do express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//Rota Principal
app.get('/', (req, res) => {
    res.render('formulario');
});


//Servidor
app.listen(8080);