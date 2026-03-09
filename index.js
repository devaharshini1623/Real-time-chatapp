const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./connect');

const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Message = require('./models/Message'); 

const app = express();


const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin:"*"
  }
});

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


const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

