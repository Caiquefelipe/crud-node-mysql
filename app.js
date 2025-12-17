//importar módulo express
const express = require('express');


//importar modulo fileupload
const fileupload = require('express-fileupload');

//Importar módulo express-handlebars
const { engine } = require('express-handlebars');


//Importar módulo mysql
const mysql = require('mysql2');


//file Systems
const fs = require('fs');

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
app.use('/css', express.static('./css'));

// referenciar a pasta de imagens
app.use('/imagens', express.static('./imagens'));

//configuração do express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


//Manipulação de dados por rotas

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Rota Principal
app.get('/:situacao', (req, res) => {
    //SQL para selecionar os produtos
    let sql = 'SELECT * FROM produtos';

    //Executar o SQL
    conexão.query(sql, (erro, retorno) => {
        if (erro) throw erro;

        //Renderizar a página com os produtos
        res.render('formulario', { produtos: retorno, situacao: req.params.situacao });
    });
});

//Rota de cadastro

app.post('/cadastrar', (req, res) => {
    try {
        //obter os dados que serão utilizados para o cadastro
        let nome = req.body.nome;
        let valor = req.body.valor;
        let imagem = req.files.imagem.name;

        if (nome == '' || isNaN(valor) || valor == '') {
            res.redirect('/falhaCadastro');
        } else {
            //SQL
            let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagem}')`;

            //Executar o SQL
            conexão.query(sql, (erro, retorno) => {
                if (erro) throw erro;

                //caso ocorra o cadastro
                req.files.imagem.mv(__dirname + '/imagens/' + req.files.imagem.name);
                console.log(retorno);
            });

            res.redirect('/okCadastro');
        }
    } catch (erro) {
        res.redirect('/falhaCadastro')
    }
});

// Rota para remover produtos

app.get('/remover/:codigo&:imagem', (req, res) => {
    let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`;

    conexão.query(sql, (erro, retorno) => {
        if (erro) throw erro;

        fs.unlink(__dirname + '/imagens/' + req.params.imagem, (erro) => {
            if (erro) throw erro;
        });
    });

    res.redirect('/');
});

//Rota para redirecionar para o formulario de alteração/edição
app.get('/formularioEditar/:codigo', (req, res) => {

    let sql = `SELECT * FROM produtos WHERE codigo = ${req.params.codigo}`;

    //Executar o SQL
    conexão.query(sql, (erro, retorno) => {
        if (erro) throw erro;

        //caso consiga rexecutar o comando SQL
        res.render('formularioEditar', { produto: retorno[0] });
    })
})

//Rota para edição/atualização de produtos
app.post('/editar', (req, res) => {
    //obter os dados d formulario
    let nome = req.body.nome;
    let valor = req.body.valor;
    let codigo = req.body.codigo;
    let nomeImagem = req.body.nomeImagem;

    //validar nome do produto e valor
    if (nome == '' || isNaN(valor) || valor == '') {
        res.redirect('/falhaEdicao');
        return;
    } else {
        try {
            let imagem = req.files.imagem;

            //SQL
            let sql = `UPDATE produtos SET nome='${nome}', valor=${valor}, imagem='${imagem.name}' WHERE codigo=${codigo}`;

            //Executar o SQL
            conexão.query(sql, (erro, retorno) => {
                if (erro) throw erro;

                //Remover imagem antiga
                fs.unlink(__dirname + '/imagens/' + nomeImagem, (erro_imagem) => {
                    if (erro_imagem) console.log('Erro ao remover imagem antiga:' + erro.message)
                });

                //Cadastrar a nova imagem
                imagem.mv(__dirname + '/imagens/' + imagem.name, (erro_move) => {
                    if (erro_move) console.log('Erro ao mover a nova imagem:')
                });
            })
        } catch (erro) {
            //SQL
            let sql = `UPDATE produtos SET nome='${nome}', valor=${valor} WHERE codigo=${codigo}`;

            conexão.query(sql, (erro, retorno) => {
                if (erro) throw erro;
            })

        }

        res.redirect('/');
    }

    //definir  o tipo de edicão



})
//Servidor
app.listen(8080);