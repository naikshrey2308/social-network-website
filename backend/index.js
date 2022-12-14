const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan =  require("morgan");
const path = require("path");
const app = express();
const cors = require("cors");

global.__baseURL = __dirname;
module.exports = { baseURL: __baseURL }

var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

const http = require('http').Server(express);

// create new socket.io instance linked with http server
const io = require('socket.io')(http);  

//handle the event like connection, disconnection
io.on('connection',function(socket){
    console.log("User connected");
    socket.on('disconnect',function(){
        console.log("user disconnected");
    })
})

// catch the msg sent by one user and again send that msg to another user 
io.on('msgSent',(msg)=>{
    io.emit('msgOther',msg);
})

http.listen(5000);

/**
 * Defines the configuration for the current node.js server
 * connection urls, passwords and other environment variables to be kept here
 * require('config') loads the default.json file in the config folder by default as an object
 */

const config = require('config');
const dbConfig = config.get('App.dbConfig.dbName');

// using middleware
app.use(cors());
// app.use(bodyParser.json());
app.use(express.static('images/'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//connect mongodb with node 
//create connection
mongoose.connect(dbConfig).then(
    () => {
        console.log('Congo!! Database Connected Successfully');
    }).catch(
        (err)=>{
            console.log('Not Connected '+err);
        }
    );

// Routes Index
const userRoutes = require("./routes/userRoutes");
const locationRoutes = require("./apis/location");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/user", userRoutes);
app.use("/location", locationRoutes);
app.use("/posts", postRoutes);
app.use("/chats", chatRoutes);
app.use('/static', express.static('images'))

app.get("/", (req, res) => {
    // CORS policy would block the request if this is not specified
    res.header("Access-Control-Allow-Origin", "*");
    res.json({msg: "hello"});
});

app.listen(4000, () => {
    console.info("Node server started!");
});