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
    methods: ["GET","POST","DELETE","PUT"],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use( require('request-param')({ order: ["body","params","query"] } ) );

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
    database: "smartfarm"
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

app.post('/plantregister', (req,res)=> {
    const plantname = req.body.plantname;
    const plantnameEng = req.body.plantnameEng;
    const lifecycle = req.body.lifecycle;
    const utilization = req.body.utilization;
    const username = req.session.users.username;

    db.query("SELECT * FROM plants WHERE username =? AND plants_name=?",[username,plantname],(err,result)=>{
        if(err){
            console.log(err);
        }
        if(result.length>0){
            return res.send({message:"This plant was already recorded!"});
        }else{
        db.query("INSERT INTO plants(username,plants_name,plants_engname,plants_lifecycle,plants_utilization) VALUES(?,?,?,?,?)", 
        [username,plantname,plantnameEng,lifecycle,utilization],
        (err,result) => {
            if(err){
                console.log(err);
            } else {
            return res.send("Values inserted");
            }
        }
    );
    }
    });  
})

app.get('/plantname', (req,res)=>{
    const username = req.session.users.username;
    const plant = []
    db.query("SELECT * FROM plants WHERE username = ?",[username], (err,result) => {
        if(err){
            console.log(err);
        } else {
            console.log(result);
            for (let index = 0; index < result.length; index++) {
                plant.push(result[index].plants_name)
            }
            console.log(plant);
            return res.send(plant);
        }
    });
});

app.post('/plantparameter', (req,res)=> {
    const plantname = req.body.plantname;
    const stage = req.body.stage;
    const opentime = req.body.opentime;
    const closetime = req.body.closetime;
    const lowertemp = req.body.lowertemp;
    const highertemp = req.body.highertemp;
    const lowerhumid = req.body.lowerhumid;
    const higherhumid = req.body.higherhumid;
    const lowerpH = req.body.lowerpH;
    const higherpH = req.body.higherpH;
    console.log("create plant", req.session)
    const username = req.session.users.username;
    const ar = [];

    db.query("SELECT * FROM plants_parameters WHERE username =? AND plantname=? AND stage=?",[username,plantname,stage],(err,result)=>{
        if(err){
            console.log(err);
        }
        if(result.length>0){
            return res.send({message:"!This plant already has this stage recorded"});
        }else{
        db.query("INSERT INTO plants_parameters(username,plantname,stage,opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH) VALUES(?,?,?,?,?,?,?,?,?,?,?)", 
        [username,plantname,stage,opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH],
        (err,result) => {
            if(err){
                console.log(err);
            } else {
            return res.send("Values inserted");
            }
        }
    );
    }
    });  
})

app.post('/farmregister', (req,res)=> {
    const farmname = req.body.farmname;
    const plantname = req.body.plantname;
    const location = req.body.location;
    const plantamount = req.body.plantamount;
    const stage = req.body.stage;
    const username = req.session.users.username;

    db.query("SELECT * FROM farm WHERE username =? AND farm_name=?",[username,farmname],(err,result)=>{
        if(err){
            console.log(err);
        }
        if(result.length>0){
            return res.send({message:"This farm was already recorded!"});
        }else{
        db.query("INSERT INTO farm(username,farm_name,farm_location,plant_amount,farm_plant,farm_stage) VALUES(?,?,?,?,?,?)", 
        [username,farmname,location,plantamount,plantname,stage],
        (err,result) => {
            if(err){
                console.log(err);
            } else {
            return res.send("Values inserted");
            }
        }
    );
    }
    });  
})

app.post('/showparameter', (req,res)=>{
    console.log("session", req.session.users)
    const username = req.session.users.username;
    const plantname = req.body.plantname;
    db.query("SELECT * FROM plants_parameters WHERE username = ? AND plantname = ?",[username,plantname], (err,result) => {
        if(err){
            console.log(err);
        } else {
            //console.log(result);
            return res.send(result);
        }
    });
});

app.put('/updateparameter',(req, res)=>{
    const id = req.body.id;
    const plantname = req.body.plantname;
    //const stage = req.body.stage;
    const opentime = req.body.opentime;
    const closetime = req.body.closetime;
    const lowertemp = req.body.lowertemp;
    const highertemp = req.body.highertemp;
    const lowerhumid = req.body.lowerhumid;
    const higherhumid = req.body.higherhumid;
    const lowerpH = req.body.lowerpH;
    const higherpH = req.body.higherpH;
    //const selectstage = req.body.selectstage;
    //console.log(opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH,selectstage);
    db.query("UPDATE plants_parameters SET opentime=?,closetime=?,lowertemp=?,highertemp=?,lowerhumid=?,higherhumid=?,lowerpH=?,higherpH=?  WHERE id=?",
    [opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH,id],(err,result)=>{
        if(err){
            console.log(err)
        } else{
            res.send(result);
        }
    })
});

app.delete('/deleteparameter/:id', (req, res) => {
    const id  = req.params.id;
    console.log(id);
    db.query("DELETE FROM plants_parameters WHERE id = ?",[id],(err,result)=>{
        if(err){
            console.log(err)
        } else{
            res.send(result);
        }
    })
    
});

app.post('/showplant', (req,res)=>{
    console.log("session", req.session.users)
    const username = req.session.users.username;
    const plantname = req.body.plantname;
    db.query("SELECT * FROM plants WHERE username = ? AND plants_name = ?",[username,plantname], (err,result) => {
        if(err){
            console.log(err);
        } else {
            console.log(result);
            return res.send(result);

        }
    });
});
















//ของเก่า

let plantlist = [];
app.get('/plantlist', (req,res)=>{
    db.query("SELECT * FROM plants", (err,result) => {
        if(err){
            console.log(err);
        } else {
            plantlist = result;
            return res.send(plantlist);
        }
    });
});

app.delete('/delete/:id', (req, res) => {
    const id  = req.params.id;
    console.log(id);
    db.query("DELETE FROM plants WHERE id = ?",[id],(err,result)=>{
        if(err){
            console.log(err)
        } else{
            res.send(result);
        }
    })
    
});

app.put('/update',(req, res)=>{
    const id = req.body.id;
    const plantname = req.body.plantname;
    const stage = req.body.stage;
    const opentime = req.body.opentime;
    const closetime = req.body.closetime;
    const lowertemp = req.body.lowertemp;
    const highertemp = req.body.highertemp;
    const lowerhumid = req.body.lowerhumid;
    const higherhumid = req.body.higherhumid;
    const lowerpH = req.body.lowerpH;
    const higherpH = req.body.higherpH;
    const selectstage = req.body.selectstage;
    //console.log(opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH,selectstage);
    db.query("UPDATE plants SET opentime=?,closetime=?,lowertemp=?,highertemp=?,lowerhumid=?,higherhumid=?,lowerpH=?,higherpH=?,selectstage=?  WHERE id=?",
    [opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH,selectstage,id],(err,result)=>{
        if(err){
            console.log(err)
        } else{
            res.send(result);
        }
    })
});

app.get('/plants', (req,res)=>{
    console.log("session", req.session.users)
    const username = req.session.users.username;
    const plant = []
    db.query("SELECT * FROM plants WHERE username = ?",[username], (err,result) => {
        if(err){
            console.log(err);
        } else {
            console.log(result);
            for (let index = 0; index < result.length; index++) {
                plant.push(result[index].plantname)
            }
            let unique = [...new Set(plant)]
            console.log(unique);
            return res.send(unique);
        }
    });
});

app.post('/plantid', (req,res)=>{
    
    const username = req.session.users.username;
    const id = req.body.id;
    db.query("SELECT * FROM plants WHERE username = ? AND id = ?",[username,id], (err,result) => {
        if(err){
            console.log(err);
        } else {
            //console.log(result);
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
    const inputtime = req.body.inputtime;
    const opentime = req.body.opentime;
    const closetime = req.body.closetime;
    const lowertemp = req.body.lowertemp;
    const highertemp = req.body.highertemp;
    const lowerhumid = req.body.lowerhumid;
    const higherhumid = req.body.higherhumid;
    const lowerpH = req.body.lowerpH;
    const higherpH = req.body.higherpH;
    const selectstage = req.body.selectstage;
    console.log("create plant", req.session)
    const username = req.session.users.username;
    const ar = [];

    db.query("SELECT * FROM plants WHERE username =? AND plantname=? AND stage=?",[username,plantname,stage],(err,result)=>{
        if(err){
            console.log(err);
        }
        if(result.length>0){
            return res.send({message:"!This plant already has this stage recorded"});
        }else{
        db.query("INSERT INTO plants(username,plantname,stage,opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH,selectstage) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", 
        [username,plantname,stage,opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH,selectstage],
        (err,result) => {
            if(err){
                console.log(err);
            } else {
            return res.send("Values inserted");
            }
        }
    );
    }
    });  

    //for (let index = 0; index < inputtime.length; index++) {
    //    const ar = [];
    //    ar.push(inputtime[index])
    //    db.query("INSERT INTO time(username,plantname,opentime,closetime) VALUES(?,?,?,?)", 
    //    [username,plantname,ar.map(ar=>[ar.opentime]),ar.map(ar=>[ar.closetime])],
    //    (err,result) => {
    //    if(err){
    //        console.log(err);
    //    } 
    //}
    //);}

    //db.query("INSERT INTO plants(opentime,closetime) VALUES?",
    //[inputtime.map(inputtime=>[inputtime.opentime,inputtime.closetime])],
    //(err,result) => {
    //    if(err){
    //        console.log(err);
    //    } else {
    //        return res.send("Values inserted");
    //    }
    //}
    //);
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