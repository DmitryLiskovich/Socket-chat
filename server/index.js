const io = require('socket.io').listen(8080);

io.on('connection', (socket)=>{
	socket.on('join', (room, name)=>{
		console.log(socket);
		socket.join(room);
		socket.broadcast.to(room).json.send(`User ${name} has been joined`)
		socket.on('message', (message)=>{
			socket.broadcast.to(room).json.send(message)
		})
		socket.on('disconnect', ()=>{
			socket.broadcast.to(room).json.send(`User ${name} has been disconnected`)
		})
	})
})
