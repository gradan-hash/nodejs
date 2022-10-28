const path = require("path")
const express =require("express")
const socketio = require('socket.io')

const app = express()

const http = require("http")

const formatMessage = require("./utils/messages")

const {userJoin, getCurrentUser,getRoomUsers,userLeave} = require("./utils/users") 


const server = http.createServer(app)

const io = socketio(server)
//set static folder 

app.use(express.static(path.join(__dirname, 'public')));

const botname = "chatcord Bot"
//run when client connects

io.on( 'connection',socket => {


  socket.on("joinRoom", ({username,room}) =>{
    const user = userJoin(socket.id, username,room)

    socket.join(user.room)

    //single client gets the message
  socket.emit("message",formatMessage(botname,'welcome to  chat code'))

  //broadcast when a user connects
socket.broadcast.to(user.room).emit("message",formatMessage(botname, ` ${user.username} HAS JOINED THE CHAT`))

 //send users and room info

 io.to(user.room).emit("roomUsers",{
  room: user.room,
  users: getRoomUsers(user.room)
} )

  })

 

 
  

//listen for chatmessage

socket.on("chatmessage" , msg =>{

  const user = getCurrentUser(socket.id) 

  io.to(user.room).emit("message",formatMessage(user.username, msg))

})

//runs when the client disconnects

socket.on("disconnect", () => {

  const user = userLeave(socket.id)

  if(user){

    io.to(user.room).emit("message" ,formatMessage(botname,`${user.username} HAS LEFT THE CHAT` ));

     //send users and room info

  io.to(user.room).emit("roomUsers",{
    room: user.room,
    users: getRoomUsers(user.room)
  } )

}

  })
  

})


const PORT = 3000 || process.env.PORT

server.listen(PORT, ()=> {
  console.log(`server running on ${PORT} `)
}) ;


