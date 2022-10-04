const express = require('express');
const mysql = require('mysql');
const bodyparser = require('body-parser')
const ejs = require('ejs');
const app = express();

if(process.env.NODE_ENV!=='production')
{
    require('dotenv')
}

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))
app.engine('html', require('ejs').renderFile);
var mysqlc = mysql.createConnection(
    {
        host: process.env.DATABASE_host,
        user: process.env.DATABASE_user,
        password: process.env.DATABASE_password,
        database: process.env.DATABASE_database
    }
)


mysqlc.connect((err) => {
    if (!err) {
        console.log('connection successful')
    }
    else {
        
        console.log('connection unsuccessful ' + JSON.stringify(err, undefined, 2))
        // console.log('connection unsuccessful')
    }
})

app.listen( process.env.PORT, () => {
    console.log('Server running')
})

app.get('/', (req, res) => {
    mysqlc.query('select * from customer', (err, rows, fields) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log(rows)
            res.send(JSON.stringify(rows) + ' <br><br>total records: ' + rows.length + '<br><a href="/input">INPUT DATA<a><br><a href="/show-id">SHOW ID<a><br><a href="/delete-id">DELETE ID<a>')
        }
    })
})

app.get('/show-id', (req, res) => {
    res.render('ids.html')
})

app.get('/delete-id', (req, res) => {
    res.render('ids.html')
})

app.post('/delete-id', (req, res) => {
    mysqlc.query('delete from customer where cid=?',[req.body.id], (err, rows, fields) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log(rows)
            res.send('SUCCESSFULLY DELETED:'+JSON.stringify(req.body)+'<br><a href="/">GO BACK</a>')
        }
    })
})


app.post('/show-id', (req, res) => {
    res.redirect('/'+req.body.id)
})


app.get('/input', (req, res) => {
    mysqlc.query('select * from customer', (err, rows, fields) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log(rows)
            if(rows.length>=30){
                res.send('maximux records set to be 30 delete previous records to input new ones <br><br><a href="/">Go back<a>')
                
            }
            else{
                res.render('index.html')
            }
        }
    })
    
})

app.post('/input', (req, res) => {
    if(req.body.email!='' && req.body.name!='' && req.body.password!='')
    {
        
        mysqlc.query('insert into customer(cname,cemail,cpassword) values (?,?,?) ',[req.body.name,req.body.email,req.body.password],(err,rows,fields)=>{
            if (err) {
                console.log(err)
            }
            else {
                res.send('SUCCESSFULLY RECIEVD AND SAVED INTO DATABASE VALUES<br>'+JSON.stringify( req.body)+'<br><a href="/">GO BACK</a>')
            }
        })
        
    }
    else{
        res.send('incomplete data <br>'+'<br><a href="/">GO BACK</a>')
    }

})


app.get('/:id', (req, res) => {
    mysqlc.query('select * from customer where cid=?', [req.params.id], (err, rows, fields) => {
        if (err) {
            console.log(err)
        }
        else {
            if (rows.length == 0) {
                res.send('no resutl with such ID saved <br><br><a href="/">Go back<a>')
            }
            else {
                // console.log(rows)
                res.send(JSON.stringify(rows) + '<br><br><a href="/">Go back<a>')
            }
        }
    })
})