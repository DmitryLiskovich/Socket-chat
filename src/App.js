import React, {useState, useRef, useEffect} from 'react';
import io from 'socket.io-client';
import logo from './logo.svg';
import './App.css';

const socket = io.connect('http://10.20.5.7:8080');

function App() {
	const [messages, setMessage] = useState(JSON.parse(localStorage.getItem('messages')) || []);
	const [state, setState]= useState(false);
	const [userName, setUserName] = useState('');
	let input = '';
	// localStorage.setItem('messages', JSON.stringify(messages));
	const wrap = useRef(null);

	function init(e){
		socket.emit('join', e.target.room.value, e.target.userName.value);
		setUserName(e.target.userName.value)
		setState(true);
	}

	if(!state){
		return(
			<div className='sign-in-wrap'>
				<form className='sign-in' onSubmit={init}>
					<input required name='room' placeholder='room' type='text'></input>
					<input required name='userName' placeholder='name' type='text'></input>
					<button type='submit'>Ok</button>
				</form>
			</div>
		)
	};

	function sendData(e){
		e.preventDefault();
		socket.send({input: input, id: userName});
		setMessage([...messages, {message: input, id: `You`}]);
		e.target.message.value = '';
		wrap.current.scrollTo(0, wrap.current.offsetHeight);
	}

	socket.on('message', (data)=>{
		wrap.current.scrollTo(0, wrap.current.offsetHeight);
		if(typeof data == 'string'){
			setMessage([...messages, {message: data, id: null}]);
		}else{
			setMessage([...messages, {message: data.input, id: data.id}]);
		}
	})

	return (
		<div className="App">
			<div ref={wrap} className='messages-wrap'>
				{messages.map((item, index)=>{
					const my = item.id === 'You';
					if(!item.id){
						return(
							<div key={index} className={`message-connect`}>
								<p>{item.message}</p>
							</div>
						)
					}
					return(
						<div key={index} className={`message ${my && 'my'}`}>
							<p>{item.message}</p>
							<p className='id'>{item.id}</p>
						</div>
					)
				})}
			</div>
			<div className='input'>
				<form onSubmit={sendData}>
					<input name='message' placeholder='message' onChange={(e)=> {input=e.target.value;}} type='text'></input>
					<button type='submit'>Send</button>
				</form>
			</div>
		</div>
	);
}

export default App;
