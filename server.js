const express = require('express');
const server = express();
const port = process.env.PORT || 5000;

require('./global_loader')();

server.use(express.static(path.join(__dirname, 'client/build')));
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.set('view engine', 'ejs');
server.use('/static', express.static('public'));

server.use('/api', require('./routes/torob_api'));
server.use(express.static('src'));
server.get('/', (req, res) => {
    return res.sendFile(__dirname + '/src/index.html');
});
server.listen(port, () => {
    console.log("Server is running on port: " + port);
});