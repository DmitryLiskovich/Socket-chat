import React, {useState, useRef, useEffect} from 'react';
import io from 'socket.io-client';
import logo from './logo.svg';
import './App.css';

const socket = io.connect('http://10.20.5.7:8080');

function App() {
	const [messages, setMessage] = useState([]);
	const [state, setState]= useState(false);
	const [userName, setUserName] = useState({});
	const [isTyping, setIsTyping] = useState({state: false, name: null});
	let input = '';
	// localStorage.setItem('messages', JSON.stringify(messages));
	const wrap = useRef(null);
	const button = useRef(null);

	useEffect(() => {
		socket.on('message', (data)=>{
			if(data.type === 'typing'){
				setIsTyping({state: true, name: data.message});
			}else if(data.type === 'connect'){
				setMessage((messages) => [...messages, {message: data.message, id: null}]);
			}else if(data.type === 'typing-end'){
				setIsTyping({state: false, name: null});
			}else{
				setMessage((messages) => [...messages, {message: data.input, id: data.id}]);
			}
		});
		if(sessionStorage.getItem('chatInfo')){
			const data = JSON.parse(sessionStorage.getItem('chatInfo'));
			socket.emit('join', data.room, data.name);
			setUserName({name: data.name});
			setState(true);
		}
	}, []);

	useEffect(() => {
		if(wrap.current){
			wrap.current.scrollTop = wrap.current.scrollHeight;
		}
	}, [messages]);

	function init(e){
		socket.emit('join', e.target.room.value, e.target.userName.value);
		setUserName({name: e.target.room.value});
		setState(true);
		sessionStorage.setItem('chatInfo', JSON.stringify({room: e.target.room.value, name: e.target.userName.value}));
	}

	function disconect(){
		sessionStorage.removeItem('chatInfo');
		setState(false);
	}

	function sendData(e){
		e.preventDefault();
		socket.send({input: input, id: userName.name});
		setMessage([...messages, {message: input, id: `You`}]);
		e.target.message.value = '';
		button.current.focus();
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

	return (
		<div className="App">
			<button className='disconect' onClick={disconect}>Disconnect</button>
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
					<input ref={button} name='message' placeholder={isTyping.state ? isTyping.name : 'message'} onInput={()=>socket.emit('typing', userName.name)} onChange={(e)=> {input=e.target.value;}} type='text'></input>
					<button type='submit'>Send</button>
				</form>
			</div>
		</div>
	);
}

export default App;
