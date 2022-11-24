/*
 MQTT-Chat.js
*/

var m, l;
window.onload = async function() {
	l = document.getElementById("chatlist");
	m = new mqtt_fetch("chat");
	await m.init("ws://test.mosquitto.org:8080");
	m.mqtt_error = function(e) {chatlog("Error " + e);};
	document.getElementById("send").addEventListener("click", send);
	m.set_callback("mqttfetch-chat", chatlog);
}

async function send() {
	var rc = await m.fetch(document.getElementById("txt").value);
	chatlog("Status: " + rc);
}

function chatlog(txt) {
	var n = document.createElement("li");
	n.appendChild(document.createTextNode(txt));
	l.insertBefore(n, l.childNodes[0]);
    while (l.childNodes.length > 20)
		l.removeChild(l.childNodes[20]);
}
