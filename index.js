const path = require('path');
const express = require('express');
var session = require('express-session');
const ejs = require('ejs');
var bodyParser = require('body-parser')
const con = require("./handlers/mysql.js")

const app = express();

var TGEIO =
    `TTTTTTTTTTTTTTTTTTTTTTT       GGGGGGGGGGGGGEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIII     OOOOOOOOO           222222222222222         000000000     
T:::::::::::::::::::::T    GGG::::::::::::GE::::::::::::::::::::EI::::::::I   OO:::::::::OO        2:::::::::::::::22     00:::::::::00   
T:::::::::::::::::::::T  GG:::::::::::::::GE::::::::::::::::::::EI::::::::I OO:::::::::::::OO      2::::::222222:::::2  00:::::::::::::00 
T:::::TT:::::::TT:::::T G:::::GGGGGGGG::::GEE::::::EEEEEEEEE::::EII::::::IIO:::::::OOO:::::::O     2222222     2:::::2 0:::::::000:::::::0
TTTTTT  T:::::T  TTTTTTG:::::G       GGGGGG  E:::::E       EEEEEE  I::::I  O::::::O   O::::::O                 2:::::2 0::::::0   0::::::0
        T:::::T       G:::::G                E:::::E               I::::I  O:::::O     O:::::O                 2:::::2 0:::::0     0:::::0
        T:::::T       G:::::G                E::::::EEEEEEEEEE     I::::I  O:::::O     O:::::O              2222::::2  0:::::0     0:::::0
        T:::::T       G:::::G    GGGGGGGGGG  E:::::::::::::::E     I::::I  O:::::O     O:::::O         22222::::::22   0:::::0 000 0:::::0
        T:::::T       G:::::G    G::::::::G  E:::::::::::::::E     I::::I  O:::::O     O:::::O       22::::::::222     0:::::0 000 0:::::0
        T:::::T       G:::::G    GGGGG::::G  E::::::EEEEEEEEEE     I::::I  O:::::O     O:::::O      2:::::22222        0:::::0     0:::::0
        T:::::T       G:::::G        G::::G  E:::::E               I::::I  O:::::O     O:::::O     2:::::2             0:::::0     0:::::0
        T:::::T        G:::::G       G::::G  E:::::E       EEEEEE  I::::I  O::::::O   O::::::O     2:::::2             0::::::0   0::::::0
      TT:::::::TT       G:::::GGGGGGGG::::GEE::::::EEEEEEEE:::::EII::::::IIO:::::::OOO:::::::O     2:::::2       2222220:::::::000:::::::0
      T:::::::::T        GG:::::::::::::::GE::::::::::::::::::::EI::::::::I OO:::::::::::::OO      2::::::2222222:::::2 00:::::::::::::00 
      T:::::::::T          GGG::::::GGG:::GE::::::::::::::::::::EI::::::::I   OO:::::::::OO        2::::::::::::::::::2   00:::::::::00   
      TTTTTTTTTTT             GGGGGG   GGGGEEEEEEEEEEEEEEEEEEEEEEIIIIIIIIII     OOOOOOOOO          22222222222222222222     000000000     
                                                                                                                                          `

console.log(TGEIO)

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"))

app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 's%3Al3ozSdvQ83TtC5RvJ.CibaQoHtaY0H3QOB1kqR8H2A',
    cookie: {

        expires: 300000
    }
}));
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.render(`${__dirname}/views/index.ejs`);
});

app.listen(80, () => {
    console.log('Application listening on port 80!');
});

function authRole(role) {
    return (req, res, next) => {
        if (req.session.user.perm !== role) {
            res.status(403);
            let error = `<div class="error-msg" style="margin-left:33%;">
            <i class="fa fa-times-circle"></i>
            Acesso negado!
          </div>`
            //req.session.error = error;
            return res.redirect('/menu')
        }
        next();
    }
}

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        let error = `<div class="error-msg" style="margin-left:33%;">
            <i class="fa fa-times-circle"></i>
            Acesso negado!
          </div>`
        req.session.error = error;
        res.redirect('/login');
    }
}

app.use(function (req, res, next) {
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = err;
    if (msg) res.locals.message = msg;
    next();
});


app.get('/logout', function (req, res) {
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get('/login', function (req, res) {
    if (req.session.user != (null || undefined)) return res.redirect('/menu')
    res.render('login');
});

app.post('/login', async function (req, res, next) {
    //console.log(await req.body)

    //if (req.session.user) res.redirect('/menu')

    let u = await req.body.username
    let p = await req.body.pass

    var sql = `SELECT * FROM accounts WHERE nif = ${u} AND ppw = "${p}"`
    con(sql, function (err, result1) {
        if (err) return console.log(err)
        if (result1.length > 0) {
            req.session.user = result1[0]
            res.redirect('/menu');
        } else {

            let error = `<div class="error-msg" style="margin-left:17%;">
                <i class="fa fa-times-circle"></i>
            Utilizador ou Palavra Passe Incorretos!
          </div>`

            req.session.error = error;
            res.redirect('/login');
        }
    })

});

app.get('/registar', function (req, res) {
    res.render('register');
});

app.post('/registar', async function (req, res, next) {

    let u = await req.body.username
    let p = await req.body.pass
    let cp = await req.body.pass_check
    let n = await req.body.nome

    let error1 = `<div class="error-msg" style="margin-left:20%;">
                <i class="fa fa-times-circle"></i>
            As palavras passes são diferentes!
          </div>`
    if(n.includes('"')) {

        let error3 = `<div class="error-msg" style="margin-left:20%;">
                <i class="fa fa-times-circle"></i>
            O nome não podes conter aspas!
          </div>`

        req.session.error = error3;
        return res.redirect('/registar');
    }
    else if (p != cp) {
        req.session.error = error1;
        return res.redirect('/registar');
    }

    var sql3 = `SELECT * FROM pending_accounts WHERE nif = ${u}`
    con(sql3, function (err, result) {
        if (err) return console.log(err)

        let error1 = `<div class="warning-msg" style="margin-left:23%;">
                <i class="fa fa-warning"></i>
            Conta a aguardar aprovação!
          </div>`

        if (result.length > 0) {
            req.session.error = error1;
            return res.redirect('/registar');
        } else {

            var sql = `SELECT * FROM accounts WHERE nif = ${u}`
            con(sql, function (err, result1) {
                if (err) return console.log(err)
                if (result1.length > 0) {
                    let error2 = `<div class="error-msg" style="margin-left:19%;">
                        <i class="fa fa-times-circle"></i>
                        Já existe uma conta com esse NIF!
                        </div>`

                    req.session.error = error2

                    return res.redirect('/registar');
                } else {

                    var sql2 = `INSERT INTO pending_accounts (nif, ppw, nome) VALUES (${u}, '${p}', '${n}')`
                    con(sql2, async function (err, result) {
                        if (err) return console.log(err)

                        let error = `<div class="success-msg" style="margin-left:23%;">
                        <i class="fa fa-check"></i>
                        Conta a aguardar aprovação!
                      </div>`

                        req.session.error = error;

                        return res.redirect('/registar');



                    })
                }
            })

        }
    })

});

app.get('/menu', restrict, async function (req, res) {
    let btn
    //aceitar users & gerir users
    admBtn = `
    <li class="nav-link">
    <a href="/admin/pend">
    <i class='bx bx-user-plus icon' ></i>
        <span class="text nav-text">Users Pendentes</span>
    </a>
</li>

<li class="nav-link">
    <a href="#">
    <i class='bx bxs-user-detail icon' ></i>
        <span class="text nav-text">Gerir Users</span>
    </a>
</li>
    `


    let pBtn = ``


    let alBtn = ``

    if (req.session.user.perm == 'admin') btn = admBtn
    else if (req.session.user.perm == 'professor') btn = pBtn
    else if (req.session.user.perm == 'aluno') btn = alBtn

    res.render(`${__dirname}/views/select.ejs`, { user: req.session.user, btns: btn});//Buffer.from(imgGlobal).toString('base64') //imgGlobal.buffer.toString('base64')

});

app.get('/settings/:nif', restrict, async function (req, res) {
    let btn
    //aceitar users & gerir users
    let admBtn = `
    <li class="nav-link">
    <a href="/admin/pend">
    <i class='bx bx-user-plus icon' ></i>
        <span class="text nav-text">Users Pendentes</span>
    </a>
</li>

<li class="nav-link">
    <a href="#">
    <i class='bx bxs-user-detail icon' ></i>
        <span class="text nav-text">Gerir Users</span>
    </a>
</li>
    `


    let pBtn = ``


    let alBtn = ``

    if (req.session.user.perm == 'admin') btn = admBtn
    else if (req.session.user.perm == 'professor') btn = pBtn
    else if (req.session.user.perm == 'aluno') btn = alBtn

    res.render(`${__dirname}/views/settings`, {nome: req.session.user.nome, perm: req.session.user.perm, btns: admBtn, nif: req.session.user.nif});
})

app.post('/settings/:nif', restrict, async function (req, res){
    
    let n = req.params.nif

    let nome
    let oPpw
    let nPpw1
    let nPpw2

    if(req.session.user.perm != 'admin' && req.session.user.nif != n) {
        return res.redirect(`/settings/${req.session.user.nif}`)
    }

    if (await req.body.nome)nome = req.body.nome
    if (await req.body.oPpw) oPpw =  req.body.oPpw
    if (await req.body.nPpw1) nPpw1 = req.body.nPpw1
    if (await req.body.nPpw2)nPpw2 = req.body.nPpw2

    if(!oPpw && (nPpw1 ||nPpw2)) {
        let err5 = `<div class="error-msg" style="margin-left:23%;">
        <i class="fa fa-times-circle"></i>
       Palavra passe antiga não corresponde!
      </div>`

      req.session.error = err5
      return res.redirect(`/settings/${n}`)
    }

    if(oPpw && nPpw1 && nPpw2) {

    if ( oPpw != req.session.user.ppw ) {
        let err3 = `<div class="error-msg" style="margin-left:23%;">
        <i class="fa fa-times-circle"></i>
        A palavra passe antiga não corresponde!
      </div>`

      req.session.error = err3;
      return res.redirect(`/settings/${n}`)
    }

    if( (req.body.oPpw && req.body.nPpw1 && req.body.nPpw2) != (null || undefined)) {

        if(oPpw == nPpw1) {
            let err1 = `<div class="error-msg" style="margin-left:23%;">
            <i class="fa fa-times-circle"></i>
            A palavra passe antiga é igual à nova!
          </div>`
    
            req.session.error = err1;
            return res.redirect(`/settings/${n}`)
        } else if(nPpw2 != nPpw1){
            let err2 = `<div class="error-msg" style="margin-left:23%;">
            <i class="fa fa-times-circle"></i>
            A nova palavra passe é diferente do que está na confirmação!
          </div>`
    
            req.session.error = err2;
            return res.redirect(`/settings/${n}`)
        } else {
            var sql = `UPDATE accounts SET ppw = "${nPpw1}" WHERE nif = ${n}`
            con(sql, function (err, result){
                if (err) return console.log(err)

                let error = `<div class="success-msg" style="margin-left:23%;">
                        <i class="fa fa-check"></i>
                        Conta atualizada!
                      </div>`

                        req.session.error = error;
                        return res.redirect(`/settings/${n}`)
            })
        }

    } }
   else if ( req.body.nome != (null || undefined) ) {

        if(nome.includes('"')) {
            let err4 = `<div class="success-msg" style="margin-left:23%;">
            <i class="fa fa-check"></i>
            O nome não pode conter aspas!
          </div>`
    
            req.session.error = err4;
            return res.redirect(`/settings/${n}`)
        } else {
            var sql = `UPDATE accounts SET nome = "${nome}" WHERE nif = ${n}`
                con(sql, function (err, result){
                    if (err) return console.log(err)
                    let error = `<div class="success-msg" style="margin-left:23%;">
                        <i class="fa fa-check"></i>
                        Conta atualizada!
                      </div>`

                        req.session.error = error;
                        setTimeout(() => {

                            req.session.user.nome = nome

                            return res.redirect(`/settings/${n}`)
                        }, 500)
                })

        }

    }


})

/*
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
||||||||||||||||||||||||||ADMIN||||||||||||||||||||||||||||
//////////////////////////////////////////////////////////
*/

app.get('/admin/pend', restrict, authRole('admin'), async function (req, res) {
    let lista = ``

    var sql = `SELECT * FROM pending_accounts`
    con(sql, function (err, result) {
        if (err) return console.log(err)

        let t = result.length

        for (var i = 0; i < t; i++) {
            lista += `
           
            <div class="center">
            
            Nome: ${result[i].nome} <br>
            NIF: ${result[i].nif} <br>
            <a href="/admin/pend/${result[i].nif}/a"><button class="button-34" role="button">Mais
                    informações</button></a>
    </div>
            
            `
        }

        res.render(`${__dirname}/views/admin_pend`, { user: req.session.user, btns: admBtn, list: (lista != '')? lista : 'Não existem utilizadores pendentes!', nif: req.session.user.nif });
    })

})

app.get('/admin/pend/:nif/a', restrict, authRole('admin'), async function (req, res) {

    let n = req.params.nif

    var sql = `SELECT * FROM pending_accounts WHERE nif = ${n}`
    con(sql, function (err, result) {
        if (err) return console.log(err)

        let h = `
        <form method="post">
            <div class="center">
                Nome: ${result[0].nome} <br>
                NIF: ${result[0].nif} <br>
                <select name="perm" id="perm" class="custom-select sources" placeholder="Permissão">
                    <option value="aluno">Aluno</option>
                    <option value="professor">Professor</option>
                    <option value="admin">Administrador</option>
                </select> <br>
                <a href="/admin/pend/${result[0].nif}/a"><input type="submit" value="Aprovar" class="button-a"></a>
                <a href="/admin/pend/${result[0].nif}/r"><input type="submit" value="Reprovar" class="button-r"></a>
            </div>
        </form>
        `

        res.render('admin_pend_u', { user: req.session.user.nome, perm: req.session.user.perm, btns: admBtn, uinfo: h, nif: req.session.user.nif })
    })

})

app.post('/admin/pend/:nif/a', restrict, authRole('admin'), async function (req, res) {
    let n = req.params.nif
    let perm = await req.body.perm

    var sql = `SELECT * FROM pending_accounts WHERE nif = ${n}`
    con(sql, function (err, result) {
        if (err) return console.log(err)

        var sql1 = `INSERT INTO accounts (nif, ppw, perm, nome) VALUES (${n}, "${String(result[0].ppw)}", "${perm}", "${String(result[0].nome)}")`
        con(sql1, function (err, result) {
            if (err) return console.log(err)
        })

        var sql2 = `DELETE FROM pending_accounts WHERE nif = ${n}`
        con(sql2, function (err, result) {
            if (err) return console.log(err)
        })
    })

    setTimeout(() => {

        res.redirect('/admin/pend')

    }, 500)
    

})

app.post('/admin/pend/:nif/r', restrict, authRole('admin'), async function (req, res) {
    let n = req.params.nif

    var sql = `SELECT * FROM pending_accounts WHERE nif = ${n}`
    con(sql, function (err, result) {
        if (err) return console.log(err)

        var sql2 = `DELETE FROM pending_accounts WHERE nif = ${n}`
        con(sql2, function (err, result) {
            if (err) return console.log(err)
        })
    })

    setTimeout(() => {
        
        res.redirect('/admin/pend')

    }, 500)

})

app.get('/admin/gerir', restrict, authRole('admin'), async function (req, res) {

})

app.get('/admin/gerir/:nif', restrict, authRole('admin'), async function (req, res) {

})

/*
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
|||||||||||||||||||||||||PROFESSOR|||||||||||||||||||||||||
//////////////////////////////////////////////////////////
*/
app.get('/professor', restrict, authRole('professor'), async function (req, res) {

    res.send(`Professor view`);//Buffer.from(imgGlobal).toString('base64') //imgGlobal.buffer.toString('base64')

});


