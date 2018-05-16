var url         = window.location.href;
var index       = url.indexOf('chat/rooms/');
var nameIndex   = url.slice(index + 11);
var socket      = io();
var room        = nameIndex;
var decodeIndex = decodeURI((nameIndex).replace(/\-/g , " "));

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// On connect - join the room based on a request query or url parameter
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('connect', function(){
  socket.emit('subscribe', room);
  $('#chatWith').append(' ' + decodeIndex);
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Message handler
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function submitfunction(){
  var from = $('#user').val();
  var message = $('#message').val();
  if(message != ''){ 
    socket.emit('chatMessage', from, message); 
  } 
  $('#message').val('').focus();
  return false;
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Notify user when someone is typing
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function notifyTyping() { 
  var user = $('#user').val();
  socket.emit('showTypingUser', user);
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Load Chat history function
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
function displayChatHistory (chatData){
  var me = $('#user').val();
  var color = (chatData.from == me) ? 'green' : '#009afd';
  chatData.from = (chatData.from == me) ? 'Me' : chatData.from;
  var dateValue = chatData.dateCreated;
  dateValue = new Date(dateValue);
  dateValue = dateValue.toLocaleString();

  if(chatData.from == "Me"){
    $('#messages').append('<div class="speech-bubble">'  + '<b style="color:' 
      + color + '">' + chatData.from + ':</b> ' + chatData.message + ' <span class="pull-right" style="color:gray">' 
      + dateValue + '</span>' +'</div>');
  } else {
    $('#messages').append('<div class="speech-bubble-reply">' +  '<b style="color:' + color + '">' 
      + chatData.from + ':</b> ' + chatData.message + ' <span class="pull-right" style="color:gray">' 
      + dateValue + '</span>' +'</div>');
  }
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Everytime a user connect to socket with /index namespace, add the user to list
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('userlist', function(users){
  var dataList = '';

  users.forEach(function(item){
    dataList += '<li style="font-size: 15px; color: #51d820;">' 
      + decodeURI((item).replace(/\-/g , " "))  + '</li>';
  });

  $('#connectedUserList').html(dataList);
}); 

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Everytime someone connect to the chat room display it on screen
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('connectedUser', function(users){
  var name = $('#currentUser').val();
  var me = $('#user').val(name);
  socket.username = users;
  if(socket.username != name){
    $('#connectedUser').append('<tr><td>' + '<b>' + socket.username +'</b>' + ' is now online. </td></tr>' );
  } else {
    $('#connectedUser').append('<tr><td>' + '<b> You </b>' + ' are now online. </td></tr>' );
  }
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// On loadChatHistory function, load all message
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('loadChatHistory', function(messages){
  for(var i =0; i < messages.length; i++){
    displayChatHistory(messages[i]);
  }
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Everytime someone create a chat message display it on screen
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('chatMessage', function(from, msg){
  var me = $('#user').val();
  var color = (from == me) ? 'green' : '#009afd';
  var from = (from == me) ? 'Me' : from;
  var date = new Date();
  if(from == "Me"){
    $('#messages').append('<div class="speech-bubble">'  + '<b style="color:' 
      + color + '">' + from + ':</b> ' + msg + ' <span class="pull-right" style="color:gray">' 
      + date.toLocaleString() + '</span>' +'</div>');
  } else {
    $('#messages').append('<div class="speech-bubble-reply">' +  '<b style="color:' + color + '">' 
      + from + ':</b> ' + msg + ' <span class="pull-right" style="color:gray">' 
      + date.toLocaleString() + '</span>' +'</div>');
  }
});
 
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Use the show typing function and plug it to an event handler
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
socket.on('showTypingUser', function(user){
  var name = $('#currentUser').val();
  var me = $('#user').val(name);
  if(user != me) {
    $('#notifyUser').text(user + ' is typing ...');
  }
  setTimeout(function(){ $('#notifyUser').text(''); }, 10000);;
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Everytime someone disconnect from chat, display it on screen
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('disconnect', function(user){
  var name = $('#currentUser').val(); 
  var me = $('#user').val(name);
  if(socket.username != me){
    $('#connectedUser').append('<tr><td class="text-danger">' + '<b>' + socket.username + '</b>' + ' leaved the room. </td></tr>' )//.delay(5000).fadeOut();
  }
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// On document initialize add the currently log in user
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$(document).ready(function(){
  var name = $('#currentUser').val();
  $('#welcomeMessage').append('<div class="text-center"><h3>Welcome to ' 
    + room + ': ' + name + '</h3><hr></div>');
  socket.emit('connectedUser', name);
});
 