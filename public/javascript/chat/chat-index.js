var url = window.location.href;
var index = url.indexOf('chat/room/');
var name = url.slice(index + 10);
var socket = io('/index');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Function for displaying the chat history
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function displayChatHistory (chatData){
  var name = $('#currentUser').val();
  var decodeName = decodeURI((name).replace(/\-/g , " "));
  var dateValue = chatData.dateCreated;

  dateValue = new Date(dateValue);
  dateValue = dateValue.toLocaleString();

  if(decodeName != chatData.from){
    $('#messages').append('<p style="color:gray"> New message from: ' 
      + chatData.from +'</p>' +'<div class="speech-bubble">'  + '<b style="color:#009afd">' 
      + chatData.from + ':</b> ' + chatData.message +'</div>' + '<p style="color:gray">' 
      + dateValue + '<span class="pull-right" style="color:gray"><a href="chat/room/'
      + $('#currentUser').val() + '">Reply</a></span></p><hr>');
  }
}

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
// On loadChatHistory function, load all message
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('loadChatHistory', function(messages){
  for(var i =0; i < messages.length; i++){
    displayChatHistory(messages[i]);
  }
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Everytime a user connect to socket with /index namespace, add the user to list
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('userlist', function(users){
  var dataList = '';
  for(var i=0; i < users.length; i++){
    dataList += '<li style="font-size: 15px; color: #67ef5d;">' + decodeURI((users[i]).replace(/\-/g , " "))  + '</li>';
            //<a style="color:whitesmoke;" href="/chat/room/' 
            //    + encodeURI((users[i]).replace(/\s/g , "-")) + '"></a>'       
  }
  $('#connectedUserList').html(dataList);
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Load all new messages
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
socket.on('chatMessage', function(from, msg){
  var me = $('#user').val();
  var color = (from == me) ? 'green' : '#009afd';
  var from = (from == me) ? 'Me' : from;
  var date = new Date();
  $('#messages').append('<p style="color:gray"> New message from: ' 
    + from +'</p>' +'<div class="speech-bubble">'  + '<b style="color:' 
    + color + '">' + from + ':</b> ' + msg +'</div>' + '<p style="color:gray">' 
    + date.toLocaleString() + '<span class="pull-right" style="color:gray"><a href="chat/room/'
    + $('#currentUser').val() + '">Reply</a></span></p>');
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// On document initialize add the currently log in user
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$(document).ready(function(){
  var name = $('#currentUser').val();
  socket.emit('connectedUser', name);
});
 
/* FOR PRIVATE CHAT DONT DELETE
 <div class="userData"></div>
 <div>
 <input type="hidden" id="user" value="" />
   <% if(user){%>
     <input type="hidden" name="currentUser" id="currentUser" value="<%= encodeURI((user.name||user.local.name||user.facebook.name).replace(/\s/g , "-")) %>">
   <%} else {%> 
   <% randomNumber = Math.floor(Math.random() * (999 - 1 + 1)) + 1%>
     <input type="hidden" name="currentUser" id="currentUser" value="GuestUser<%= randomNumber%>">
   <%}%>
   <br>
   <legend class="text-center text-primary">Chat History</legend>
   <div id="private_message">
     <div id="messages" style="padding:20px; color: white"></div>
   </div> 
 </div>
*/