var url    = window.location.href;
var socket = io('/index');


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// On connect - join the room
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('connect', function(){
  socket.emit('subscribe', $('#currentUser').val());
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Everytime a new user connect set socket.username to users
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('connectedUser', function(users){
  var name = $('#currentUser').val();
  var me = $('#user').val(name);
  socket.username = users;
});

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
// On document initialize add the currently log in user
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$(document).ready(function(){
  var name = $('#currentUser').val();
  socket.emit('connectedUser', name);
});
 