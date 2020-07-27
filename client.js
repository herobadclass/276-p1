const socket = io('https://magnustar.herokuapp.com')

socket.on('chat-message',data =>{
	console.log(data)
})