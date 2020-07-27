
const io = require('socket.io')(process.env.PORT)

io.on('connection', socket =>{
  socket.emit('chat-message', 'Hello World')
})
