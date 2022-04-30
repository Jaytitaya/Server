const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
// const Users = require('./mongoose');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(cors({credentials: true, origin: true}));
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
    user: "root",
    host:"localhost",
    password: "root",
    database: "smartfarm"
})

app.get('/session/:request', (req, res) => {
    const request = req.params.request;
    if (request === 'check'){
        if ( req.session.users){
            console.log(req.session.users)
            res.send({loggedIn:true, user: req.session.users})}
        else { 
            console.log("session not found, automatically log out.")
            res.send({loggedIn: false})}
    }
    else if (request === 'clear'){
        req.session.destroy();
    }
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

app.get('/farmname', (req,res)=>{
    if(req.session.users !== undefined){
        const username = req.session.users.username;
        const farm = []
        db.query("SELECT * FROM farm WHERE username = ?",[username], (err,result) => {
            if(err){console.log('error')}
            else {
                for (let index = 0; index < result.length; index++) {
                    farm.push(result[index].farm_name)
                }
                //console.log(`Captain, this line was not suppose to show.`)
                return res.status(200).send(farm);
            }
        });
    }
    else{res.status(400).send("fail")}
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
    db.query("SELECT * FROM plants_parameters WHERE username = ? AND plantname = ? ORDER BY CASE WHEN stage = 'seed' then 1 WHEN stage = 'veget' then 2 WHEN stage = 'flowr' then 3 WHEN stage = 'late' then 4 END ASC ",[username,plantname], (err,result) => {
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

app.put('/updateplant',(req, res)=>{
    const id = req.body.id;
    const plantname = req.body.plantname;
    //const stage = req.body.stage;
    const plantnameEng = req.body.plantnameEng;
    const lifecycle = req.body.lifecycle;
    const utilization = req.body.utilization;
    //const selectstage = req.body.selectstage;
    //console.log(opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH,selectstage);
    db.query("UPDATE plants SET plants_engname=?,plants_lifecycle=?,plants_utilization=?  WHERE id=?",
    [plantnameEng,lifecycle,utilization,id],(err,result)=>{
        if(err){
            console.log(err)
        } else{
            res.send(result);
        }
    })
});

app.delete('/deleteplant/:id', (req, res) => {
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

app.post('/showfarm', (req,res)=>{
    console.log("session", req.session.users)
    const username = req.session.users.username;
    const plantname = req.body.plantname;
    db.query("SELECT * FROM farm WHERE username = ? AND farm_plant = ?",[username,plantname], (err,result) => {
        if(err){
            console.log(err);
        } else {
            console.log(result);
            return res.send(result);

        }
    });
});

app.put('/updatefarm',(req, res)=>{
    const id = req.body.id;
    const farmname = req.body.farmname;
    const location = req.body.location;
    const plantamount = req.body.plantamount;
    const stage = req.body.stage;
    
    //console.log(opentime,closetime,lowertemp,highertemp,lowerhumid,higherhumid,lowerpH,higherpH,selectstage);
    db.query("UPDATE farm SET farm_name=?,farm_location=?,plant_amount=?,farm_stage=?  WHERE id=?",
    [farmname,location,plantamount,stage,id],(err,result)=>{
        if(err){
            console.log(err)
        } else{
            res.send(result);
        }
    })
});

app.delete('/deletefarm/:id', (req, res) => {
    const id  = req.params.id;
    console.log(id);
    db.query("DELETE FROM farm WHERE id = ?",[id],(err,result)=>{
        if(err){
            console.log(err)
        } else{
            res.send(result);
        }
    })
    
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
            //console.log("a")
            return res.send({err: err});
        }
        if(result.length>0){
            req.session.users = result[0];
            //console.log("username ", req.session.users)
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


/* อัพเดตใหม่ 3/4/65 โค้ดส่วนแสดงค่า sensor, controller และส่วนกำหนดค่า controller */
// get sensor parts

app.get('/getSensorVal/:farmname/:sensor_type', (req,res)=>{
    const farmname = req.params.farmname;
    const sensor_type = req.params.sensor_type;
    db.query(`SELECT iot_${sensor_type} FROM farm_iot WHERE iot_farmname = ? ORDER BY iot_datetime DESC LIMIT 1`,[farmname], (err,result) => {
        if(err){
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

app.get('/getRange/:plantname/:stage/:sensor_type', (req,res)=>{
    const plantname = req.params.plantname;
    const sensor_type = req.params.sensor_type;
    const stage = req.params.stage;
    db.query(`SELECT lower${sensor_type},higher${sensor_type} FROM plants_parameters WHERE plantname = ? AND stage = ?`,[plantname,stage], (err,result) => {
        if(err){
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

app.get('/getPlantname/:farmname', (req,res)=>{
    const farmname = req.params.farmname;
    db.query(`SELECT farm_plant,farm_stage FROM farm WHERE farm_name = ?`,[farmname], (err,result) => {
        if(err){
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

// get controller parts

app.get('/getController/:farmname/:param', (req,res)=>{
    const farmname = req.params.farmname;
    const param = req.params.param;;
    if (param === 'temp'){
        db.query(`SELECT temp_MC,fan,heatlight FROM farm_controller WHERE iot_farmname = ?`,[farmname], (err,result) => {
            if(err){
                console.log(err);
            } else {
                console.log(result);
                res.send(result);
            }
        });
    }
    if (param === 'humid'){
        db.query(`SELECT humid_MC,fan,fog FROM farm_controller WHERE iot_farmname = ?`,[farmname], (err,result) => {
            if(err){
                console.log(err);
            } else {
                console.log(result);
                res.send(result);
            }
        });
    }
    if (param === 'ph'){
        db.query(`SELECT pH_MC,phhigh,phlow FROM farm_controller WHERE iot_farmname = ?`,[farmname], (err,result) => {
            if(err){
                console.log(err);
            } else {
                console.log(result);
                res.send(result);
            }
        });
    }
    if (param === 'light'){
        db.query(`SELECT light_MC,light FROM farm_controller WHERE iot_farmname = ?`,[farmname], (err,result) => {
            if(err){
                console.log(err);
            } else {
                console.log(result);
                res.send(result);
            }
        });
    }
});

// push controller parts

app.put('/pushController/:farmname/:param', (req,res) => {
    const farmname = req.params.farmname;
    const param = req.params.param;
    if (param === 'temp'){
        const temp_MC = req.body.temp_MC;
        const fan = req.body.fan;
        const heatlight = req.body.heatlight;
        if (temp_MC == 1){
            db.query(`UPDATE farm_controller SET temp_MC =?, fan = ?, heatlight = ? WHERE iot_farmname = ?;`,[temp_MC, fan, heatlight,farmname], (err,result) => {
                if(err){
                    console.error(err);
                } else {
                    console.log(result);
                    res.send({message:`Manual control update success !! \n${result.message.substring(1)}`});
                }
            })
        } else {
            db.query(`UPDATE farm_controller SET temp_MC =? WHERE iot_farmname = ?;`,[temp_MC ,farmname], (err,result) => {
                if(err){
                    console.error(err);
                } else {
                    console.log(result);
                    res.send({message:`Auto control update success !! \n${result.message.substring(1)}`});
                }
            })
        }
    }

    if (param === 'humid'){
        const humid_MC = req.body.humid_MC;
        const fan = req.body.fan;
        const fog = req.body.fog;
        if (humid_MC == 1){
            db.query(`UPDATE farm_controller SET humid_MC =?, fan = ?, fog = ? WHERE iot_farmname = ?;`,[humid_MC, fan, fog,farmname], (err,result) => {
                if(err){
                    console.error(err);
                } else {
                    console.log(result);
                    res.send({message:`Manual control update success !! \n${result.message.substring(1)}`});
                }
            })
        } else {
            db.query(`UPDATE farm_controller SET humid_MC =? WHERE iot_farmname = ?;`,[humid_MC ,farmname], (err,result) => {
                if(err){
                    console.error(err);
                } else {
                    console.log(result);
                    res.send({message:`Auto control update success !! \n${result.message.substring(1)}`});
                }
            })
        }
    }

    if (param === 'ph'){
        const ph_MC = req.body.ph_MC;
        const phhigh = req.body.phhigh;
        const phlow = req.body.phlow;
        if (ph_MC == 1){
            db.query(`UPDATE farm_controller SET pH_MC =?, phhigh = ?, phlow = ? WHERE iot_farmname = ?;`,[ph_MC, phhigh, phlow,farmname], (err,result) => {
                if(err){
                    console.error(err);
                } else {
                    console.log(result);
                    res.send({message:`Manual control update success !! \n${result.message.substring(1)}`});
                }
            })
        } else {
            db.query(`UPDATE farm_controller SET pH_MC =? WHERE iot_farmname = ?;`,[ph_MC ,farmname], (err,result) => {
                if(err){
                    console.error(err);
                } else {
                    console.log(result);
                    res.send({message:`Auto control update success !! \n${result.message.substring(1)}`});
                }
            })
        }
    }

    if (param === 'light'){
        const light_MC = req.body.light_MC;
        const light = req.body.light_checked;
        console.log(light);
        if (light_MC == 1){
            db.query(`UPDATE farm_controller SET light_MC =?, light = ? WHERE iot_farmname = ?;`,[light_MC, light,farmname], (err,result) => {
                if(err){
                    console.error(err);
                } else {
                    console.log(result);
                    res.send({message:`Manual control update success !! \n${result.message.substring(1)}`});
                }
            })
        } else {
            db.query(`UPDATE farm_controller SET light_MC =? WHERE iot_farmname = ?;`,[light_MC ,farmname], (err,result) => {
                if(err){
                    console.error(err);
                } else {
                    console.log(result);
                    res.send({message:`Auto control update success !! \n${result.message.substring(1)}`});
                }
            })
        }
    }
})


//
app.listen('3001', () => {
    console.log('Server is running on port 3001');
})
