const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 8000;
const { v4: uuidv4} = require('uuid');
const cookieParser = require('cookie-parser');

// middlewraes
app.use(express.urlencoded( {extended: false }));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.json());
app.set('views', './views');
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });
// connetion 
mongoose.connect('mongodb://127.0.0.1:27017/Authentication_System')
.then(() => console.log('mongodb connected successfulyy'))
.catch((err) => console.log(`unable to connect mongoDb ${err}`));

// schema
const userScheme = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    sessionId: {
        type: String,
    }
}, { timestamps: true});
const userModel = mongoose.model('User', userScheme);


// Routes


app.get('/signup', async (req, res) =>{
    
    if(req.cookies.uniqeId){
        const checkUser = await userModel.findOne({sessionId: req.cookies.uniqeId});
        if(checkUser){
            return res.redirect('/');
        }else{
            return res.render('signup');
        }
        
    }else{
        return res.render('signup');
    }
    
});

app.post('/signup', async (req, res) =>{
    const uniqeId = uuidv4();
    const {name, email, password} = req.body;
    
    await userModel.create({
        name: name,
        email: email,
        password: password,
        sessionId: uniqeId,
    });
   res.cookie('uniqeId', uniqeId); 
   return res.redirect('/');
});

// get login page
app.get('/login', async (req, res) =>{

    if(req.cookies.uniqeId){
        const checkUserLogin = await userModel.findOne({sessionId: req.cookies.uniqeId});
        if(checkUserLogin){
            return res.redirect('/');
        }else{
            return res.render('login');
        }
        
    }else{
        return res.render('login');
    }
    
});

// post login page
app.post('/login', async (req, res) =>{
    const {email, password} = req.body;
    const user = await userModel.findOne({email});
    if(!user || user.password !== password){
        return res.render('login', {error: "invalid credentials"});
    }else{
        if(!req.cookies.uniqeId){
            res.cookie('uniqeId', user.sessionId);
        }
        return res.redirect('/');
    }
});

// home page
app.get('/', async (req, res) =>{
    

    if(req.cookies.uniqeId){
        const userWithSessionId = await userModel.findOne({sessionId: req.cookies.uniqeId});

        if(userWithSessionId){
            return res.render('home', {
                user: userWithSessionId.name
            });
        }else{
            return res.render('home', {
                user: null
            });
        }
    }else{
        return res.render('home', {
            user: null
        });
    }
    
    
});

// logout
app.get('/logout', (req, res) =>{
    res.clearCookie('uniqeId');
    return res.redirect('/');
});


// listen
app.listen(PORT, ()=>{console.log(`server is running on the port ${PORT}`)});