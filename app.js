const express= require('express');
const app = express();
const userModel = require("./models/user.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const path = require('path');
const cookieParser = require('cookie-parser');
const { hash, sign } = require('crypto');
const user = require('./models/user.js');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render("index")
});



app.post('/create', (req, res) => {
    let {username, email, password, age} = req.body

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                username,
                email,
                password: hash,
                age
            })
            
            let token = jwt.sign({email}, "shhhhhh"); //shhhh is basically a security key to secure our data 
            //we use {email} for validate user after request
            res.cookie("token", token) //Store cookie of above user which was createdd recently
            res.send(createdUser);
        } )
    })
    
})

//Login Route
app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", async (req,res) => {
    let user = await userModel.findOne({email: req.body.email});
    if(!user) return res.send("Something went wrong email");

    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if(result){
        let token = jwt.sign({email: user.email}, "shhhhhh")
        res.cookie("token", token);
        res.send("Login Successfully")
        }

        else res.send("Something is wrong pass")
    })
})

//Logout Route
app.get("/logout", (req,res) => {
    res.cookie("token", "") //to logout we have to remove token 
    res.redirect("/")
})

app.listen(3000);