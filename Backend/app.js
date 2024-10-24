const express = require("express")
const app = express()
require("dotenv").config()
const PORT = process.env.PORT
const {Server} = require("socket.io")
const http = require("http")
const {Chess} = require("chess.js")
const server = http.createServer(app)
const chess = new Chess()
const cors = require("cors")


const io = new Server(server , {
    cors :{
        origin : "http://localhost:5173/",
        methods : ['GET','POST']
    }
})

app.use(cors())
app.use(express.json())

let userInfo = {}
let currentPlayer = "w"

io.on("connection" , (userSocket)=>{
    console.log("Someone is connected to the server with id " + userSocket.id)
    if(!userInfo.white){
        userInfo.white = userSocket.id;
        userSocket.emit("playersRole" , "w");
    }
    else if(!userInfo.black){
        userInfo.black = userSocket.id
        userSocket.emit("playerRole", "b")
    }
    else{
        userSocket.emit("myFriendAsViewer")
    }


    userSocket.on("disconnected" , ()=>{
        if(userSocket.id === userInfo.white){
            delete userInfo.white
        }
        else if(userSocket.id === userInfo.black){
            delete userInfo.black
        }
    })
    
    userSocket.on("nextmove" , (nextmove)=>{
        try{
            if(chess.turn() === "w" && userSocket.id !== userInfo.white){
                return;
            }
            else if(chess.turn() === "b" && userSocket.id !== userInfo.black){
                return;
            }
            let checkMove = chess.move(nextmove)
            if(checkMove){
                currentPlayer = chess.turn()
                userSocket.emit("nextmove" , nextmove);
                userSocket.emit("currentBoardState" , chess.fen())
            }
            else{
                console.log("Invalid move : " , checkMove)
                userSocket.emit("invalidMove" , move)
            }
        }

        catch(err){
          console.log("Something went wrong while making a move" + err)
        }
       
    })

})


server.listen(PORT , ()=>{
    console.log(`server is running on the port number ${PORT}`)
})