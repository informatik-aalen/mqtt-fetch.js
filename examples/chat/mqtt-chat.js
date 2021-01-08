/*
 MQTT-Chat.js
*/

var m;
window.onload = async function() {
	m = new mqtt_fetch("chat/client");
	await m.init("localhost",1884);
//	await m.init("www.my-ssl-server.com",8083,"",{useSSL: true, userName: "...", password: "..."});
	m.mqtt_error = function(e) {chatlog("Error " + e);};
	var c = await m.send({action: "get_chats"});
	for (var i = 0; i < c.chats.length; i++) {
		var n = document.createElement("option");
		n.text = n.value = c.chats[i];
		document.getElementById("chat").appendChild(n);
	}
	document.getElementById("send").addEventListener("click", send);
	document.getElementById("chat").addEventListener("change", chat_select);
}

function chat_select() {
	if (this.chat_selected != undefined)
		m.delete_callback("chat/" + this.chat_selected);
	this.chat_selected = document.getElementById("chat").value;
	m.set_callback("chat/" + this.chat_selected, receive, true);
}
			   
function receive(v) {
	chatlog("Beitrag von " + v.nn + ": " + v.text);
}

async function send() {
	var rc = await m.send({
		action: "send",
		nn: document.getElementById("nn").value,
		chat: document.getElementById("chat").value,
		text: document.getElementById("txt").value
	});
	chatlog("Status: " + rc.rc);
}

function chatlog(txt) {
	if (this.nr == undefined)
		this.nr = 0, this.l = document.getElementById("chatlist");
	var n = document.createElement("li");
	n.value = ++this.nr, n.appendChild(document.createTextNode(txt));
	this.l.insertBefore(n, this.l.childNodes[0]);
    while (this.l.childNodes.length > 20)
		this.l.removeChild(this.l.childNodes[20]);
}
