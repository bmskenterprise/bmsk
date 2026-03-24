import { Server } from "socket.io";
let io;
export default {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: ['http://localhost:5173','http://localhost:3000']/*process.env.CLIENT_URL*/,
        methods: ['GET','POST','PATCH','PUT','DELETE' ],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
    });
    io.on('connection',(socket) =>{
      console.log('client connected', socket.id);
      socket.on('disconnect', () => {
        console.log('user disconnected');
      })
    })
    return io;
  },
  getIO: () => {
    if(!io) {
      //throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
