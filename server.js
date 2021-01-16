const http = require('http')
const express = require('express')
const cors = require('cors')

const Promise = require('bluebird')
const AppDAO = require('./dbhelper')
const TallyHelper = require('./tallyhelper')
var bodyParser = require('body-parser')

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const Api = express();
const HTTP = http.Server(Api);

Api.use(cors());


Api.post('/login', jsonParser, function (req, res) {
    var dao = new AppDAO('./data.sqlite')
    dao.run('select * from user_login where user_name="'+req.body.username+'" and password="'+req.body.password+'"')
    .then((data) => {
        console.log(data);
        if(data)
        res.status(200).send(data)
        else
        res.status(500).send('')
    })
    .catch((err) => {
        console.log('Error: ')
        console.log(JSON.stringify(err))
        res.status(500).send('')
      })
});

Api.get('/invoice', async function (req, res) {
    var dao = new AppDAO('./data.sqlite')
    var tally = new TallyHelper();
    tally.all().then((data) => {
        // console.log(data);
        if(data)
        {
            dao.run(
                'DELETE FROM invoice',
                []
            ).then((data) => {
                // console.log(data);
            })
            .catch((err) => {
                console.log('Error: ')
                console.log(JSON.stringify(err))
            });
            console.log('delete');
            for (let index = 0; index < data.length; index++) {
                var element = data[index];
                // console.log(element['id']);
                dao.run(
                    'INSERT INTO invoice (InvoiceNumber,PartyName,InvoiceDate,ProductName,'+
                    'ProductRate,ProductTotal,ActualQty,BilledQty) VALUES ('+
                    element['id']+','+
                    '"'+element['PARTYLEDGERNAME']+'",'+
                    '"'+element['DATE']+'",'+
                    '"'+element['PRODUCT']+'",'+
                    '"'+element['RATE']+'",'+
                    '"'+element['AMOUNT']+'",'+
                    '"'+element['ACTUALQTY']+'",'+
                    '"'+element['BILLEDQTY']+'")'
                ).then((data) => {
                    console.log(data);
                })
                .catch((err) => {
                    console.log('Error: ')
                    console.log(JSON.stringify(err))
                });
            }
            dao.run('select * from invoice')
            .then((data) => {
                // console.log(data);
                if(data)
                    res.header('Content-Range','posts 0-'+data.length+'/'+data.length).status(200).send(data)
                else
                    res.status(500).send('')
            })
            .catch((err) => {
                console.log('Error: ')
                console.log(JSON.stringify(err))
                res.status(500).send('')
            })
            // res.header('Content-Range','posts 0-'+data.length+'/'+data.length).status(200).send(data)
        }
        else
        {
            res.status(500).send('')
        }
    })
    .catch((err) => {
        // console.log('Error: ')
        // console.log(JSON.stringify(err))
        // res.status(500).send('')
        dao.run('select * from invoice')
        .then((data) => {
            // console.log(data);
            if(data)
                res.header('Content-Range','posts 0-'+data.length+'/'+data.length).status(200).send(data)
            else
                res.status(500).send('')
        })
        .catch((err) => {
            console.log('Error: ')
            console.log(JSON.stringify(err))
            res.status(500).send('')
        })
      })
});

Api.get('/invoice/:id', urlencodedParser, function (req, res) {
    // var tally = new TallyHelper();
    // tally.single(req.params.id).then((data) => {
    //     // console.log(data);
    //     if(data)
    //     res.status(200).send(data)
    //     else
    //     res.status(500).send('')
    // })
    // .catch((err) => {
        // console.log('Error: ')
        // console.log(JSON.stringify(err))
        // res.status(500).send('')
        var dao = new AppDAO('./data.sqlite')
        dao.run('select * from invoice where id='+req.params.id)
        .then((data) => {
            // console.log(data);
            if(data)
                res.header('Content-Range','posts 0-'+data.length+'/'+data.length).status(200).send(data)
            else
                res.status(500).send('')
        })
        .catch((err) => {
            console.log('Error: ')
            console.log(JSON.stringify(err))
            res.status(500).send('')
        })
    //   })
});
// Api.post('/login', (req, res) => res.status(200).send('success!'));

HTTP.listen(9001, () => {
    console.log('listening on *:9001');
});