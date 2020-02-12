const path = require('path')
const express = require('express')
const app = express()
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug')

app.get('/', function (req, res) {
    res.render('index', { title: 'Hey Hey Hey!', message: 'Yo Yo'})
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})