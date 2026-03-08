const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./connect');

const http = require('http');
const { Server } = require('socket.io');

const Message = require('./models/Message'); // ⭐ added

const app = express();
const port = 8000;

const server = http.createServer(app);
const io = new Server(server);

app.set("view engine","ejs");

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static('public'));

connectDB();

const staticRoutes = require('./routes/static');
const authRoutes = require('./routes/authRoutes');

app.use('/',staticRoutes);
app.use('/auth',authRoutes);


/* SOCKET CHAT */

io.on("connection",(socket)=>{

    console.log("User connected:",socket.id);

    socket.on("sendMessage", async (data)=>{

        try{

            const {sender,receiver,text} = data;

            const message = new Message({
                sender,
                receiver,
                text
            });

            await message.save();

            io.emit("receiveMessage",{
                sender,
                receiver,
                text,
                time:new Date()
            });

        }catch(err){
            console.log(err);
        }

    });

    socket.on("disconnect",()=>{
        console.log("User disconnected");
    });

});


server.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});