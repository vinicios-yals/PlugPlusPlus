var socket = io();
$('#web-chat form').submit(function(){
	socket.emit('chat message', $('#web-chat #m').val());
	$('#web-chat #m').val('');
	return false;
});
socket.on('chat message', function(msg){
	$('#web-chat #messages').append($('<li>').text(msg));
});