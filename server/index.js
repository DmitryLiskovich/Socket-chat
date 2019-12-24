const io = require('socket.io').listen(8080);
let timer;

io.on('connection', (socket)=>{
	socket.on('join', (room, name)=>{
		socket.join(room);
		socket.broadcast.to(room).send({message:`User ${name} has been joined`, type: 'connect'});
		socket.on('message', (message)=>{
			socket.broadcast.to(room).send(message)
		})
		socket.on('typing', (userName)=>{
			socket.broadcast.to(room).send({message:`${userName} is typing`, type: 'typing'});
			if(timer){
				clearInterval(timer);
			}
			timer = setTimeout(()=> socket.broadcast.to(room).send({message: null, type: 'typing-end'}), 1000);
		});
		socket.on('disconnect', ()=>{
			socket.broadcast.to(room).send({message:`User ${name} has been disconnected`, type: 'connect'});
		})
	});
})
