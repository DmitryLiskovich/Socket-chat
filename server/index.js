const io = require('socket.io').listen(8080);

io.on('connection', (socket)=>{
	socket.on('join', (room, name)=>{
		socket.join(room);
		socket.broadcast.to(room).json.send(`User ${name} has been joined`);
		socket.on('disconnect', ()=>{
			socket.broadcast.to(room).json.send(`User ${name} has been disconnected`)
		})
	});
	socket.on('message', (message, room)=>{
		socket.broadcast.to(room).send(message)
	})
})
