const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const Users = require('./mongoose');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET","POST"],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

app.use(
    session({
        key: "userId",
        secret: "confidential",
        resave: true,
        saveUninitialized: true,
        cookie: {
            expires: 60*60*24*1000,
        },
    })
);



const db = mysql.createConnection({
    user: "smartfarm",
    host:"localhost",
    password: "Smartfarm12345",
    database: "userSystem"
})

app.get('/users', (req,res)=>{
    db.query("SELECT * FROM users", (err,result) => {
        if(err){
            console.log(err);
        } else {
            return res.send(result);
        }
    });
});

app.get('/plants', (req,res)=>{
    console.log("session", req.session.users)
    const username = req.session.users.username;
    
    db.query("SELECT * FROM plants WHERE username = ?",[username], (err,result) => {
        if(err){
            console.log(err);
        } else {
            return res.send(result);
        }
    });
});

app.post('/create', (req,res)=> {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const username = req.body.username;
    const passwords = req.body.passwords;
    db.query("SELECT username FROM users WHERE username =?",[username],(err,result)=>{
        if(err){
            console.log(err);
        }
        if(result.length>0){
            return res.send({message:"! That username is taken. Try another"});
        }else{
        db.query("INSERT INTO users(firstname,lastname,username,passwords) VALUES(?,?,?,?)", 
        [firstname,lastname,username,passwords],
        (err,result) => {
        if(err){
            console.log(err);
        } else {
            return res.send({message:"Register Successfully!"});
        }
    }
)};
})

    let data = new Users({
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        username : req.body.username,
        passwords : req.body.passwords
    })
    Users.saveUsers(data,(err)=>{
        if(err) {console.log(err)}
        
    })
})

app.post('/createplant', (req,res)=> {
    const plantname = req.body.plantname;
    const stage = req.body.stage;
    const openclosetime = req.body.openclosetime;
    const lowertemp = req.body.lowertemp;
    const highertemp = req.body.highertemp;
    const lowerhumid = req.body.lowerhumid;
    const higherhumid = req.body.higherhumid;
    const lowerpH = req.body.lowerpH;
    const higherpH = req.body.higherpH;
    console.log("create plant", req.session)
    const username = req.session.users.username;

    db.query("INSERT INTO plants(username,plantname,stage,openclosetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH) VALUES(?,?,?,?,?,?,?,?,?,?)", 
    [username,plantname,stage,openclosetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH],
    (err,result) => {
        if(err){
            console.log(err);
        } else {
            return res.send("Values inserted");
        }
    }
    );
})

app.get("/login",(req,res)=>{
    if (req.session.users){
        res.send({loggedIn:true, user: req.session.users});
    } else {
        res.send({loggedIn: false});
    }
});

app.post('/login', (req,res)=> {
    const username = req.body.username;
    const passwords = req.body.passwords;
    db.query("SELECT * FROM users WHERE username =? AND passwords = ?",
    [username,passwords],
    (err,result)=>{
        if(err){
            console.log("a")
            return res.send({err: err});
        }
        if(result.length>0){
            req.session.users = result[0];
            console.log("username ", req.session.users)
             res.send(result);
        }else{
           return res.send({message:"! Invalid username or password."});
        }
    });

    

    

    //Users.findOne({username:username,passwords:passwords}).exec((err,doc)=>{
    //    console.log(doc)
    //    if(err){
    //        return res.send({err: err});
    //    }
    //    if(doc!=null){
    //        return res.send(doc);
    //    }else{
    //        return res.send({message:"! Invalid username or password."});
    //    }
    //})
})

app.listen('3001', () => {
    console.log('Server is running on port 3001');
})