const socket = io();

// socket.on('countUpdated',(count)=>{
// 	console.log( "The count has been updated: ", count);
// });
//
// document.querySelector('#increment').addEventListener('click', ()=>{
// 	socket.emit('increment');
// });

// Elements
const $messageForm = document.querySelector( "#message-form" );
const $messageFormInput = $messageForm.querySelector( "input" );
const $messageFormButton = $messageForm.querySelector( "button" );
const $sendLocationButton = document.querySelector( "#send-location" );
const $messages = document.querySelector( "#messages" );

// Templates
const messageTemplate = document.querySelector( "#message-template" ).innerHTML;
const locationTemplate = document.querySelector( "#location-message-template" ).innerHTML;
const sidebarTemplate = document.querySelector( "#sidebar-template" ).innerHTML;
// Options
const { username, room } = Qs.parse( location.search, { ignoreQueryPrefix: true } );

const autoscroll = () => {
	const $newMessage = $messages.lastElementChild;
	
	const newMessageStyle = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyle.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
	
	const visibleHeight = $message.offsetHeight;
	
	const containerHeight = $messages.scrollHeight;
	
	const scrollOffset = $messages.scrollTop + visibleHeight;
	
	if(containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on( "message", ( message ) => {
	console.log( message );
	const html = Mustache.render( messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment( message.createdAt ).format( "HH:mm" )
	} );
	$messages.insertAdjacentHTML( "beforeend", html );
	autoscroll();
} );

socket.on( "locationMessage", ( message ) => {
	console.log( message );
	const html = Mustache.render( locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment( message.createdAt ).format( "HH:mm" )
	} );
	$messages.insertAdjacentHTML( "beforeend", html );
} );

socket.on( "roomData", ( { room, users } ) => {
	const html = Mustache.render( sidebarTemplate, {
			room,
			users
		}
	);
	document.querySelector('#sidebar').innerHTML = html;
} );

$messageForm.addEventListener( "submit", ( e ) => {
	e.preventDefault();
	//disable form
	$messageFormButton.setAttribute( "disabled", "disabled" );
	
	const message = e.target.elements.message.value;
	socket.emit( "sendMessage", message, ( error ) => {
		//enable form
		$messageFormButton.removeAttribute( "disabled" );
		$messageFormInput.value = "";
		$messageFormInput.focus();
		if ( error ) {
			return console.log( error );
		}
		console.log( "Message delivered" );
	} );
} );

document.querySelector( "#send-location" ).addEventListener( "click", () => {
	if ( !navigator.geolocation ) {
		return alert( "Geolocation is not supported by your browser" );
	}
	$sendLocationButton.setAttribute( "disabled", "disabled" );
	
	navigator.geolocation.getCurrentPosition( ( position ) => {
		socket.emit( "sendLocation", {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		}, () => {
			$sendLocationButton.removeAttribute( "disabled" );
			console.log( "Location shared" );
		} );
	} );
} );


socket.emit( "join", { username, room }, ( error ) => {
	if ( error ) {
		alert( error );
		location.href = "/";
	}
	
} );