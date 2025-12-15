//importar módulo express
const express = require('express');


//importar modulo fileupload
const fileupload = require('express-fileupload');

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

//habilitar o fileupload
app.use(fileupload());

//Adicionar Bootstrap
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
//adicionar CSS
app.use('/css', express.static('./css'))

// referenciar a pasta de imagens
app.use('/imagens', express.static('./imagens'));

//configuração do express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


//Manipulação de dados por rotas

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

//Rota Principal
app.get('/', (req, res) => {
    //SQL para selecionar os produtos
    let sql = 'SELECT * FROM produtos';

    //Executar o SQL
    conexão.query(sql, (erro, retorno) => {
        if (erro) throw erro;

        //Renderizar a página com os produtos
        res.render('formulario', { produtos: retorno })
    })
});


//Rota de cadastro

app.post('/cadastrar', (req, res) => {
    //obter os dados que serão utilizados para o cadastro
    let nome = req.body.nome;
    let valor = req.body.valor;
    let imagem = req.files.imagem.name;


    //SQL
    let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagem}')`;

    //Executar o SQL
    conexão.query(sql, (erro, retorno) => {
        if (erro) throw erro;

        //caso ocorra o cadastro
        req.files.imagem.mv(__dirname + '/imagens/' + req.files.imagem.name)
        console.log(retorno)
    })

    res.redirect('/')
})

//Servidor
app.listen(8080);