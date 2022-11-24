var m;
window.onload = async function() {
	m = new mqtt_fetch("squareserver");
	await m.init("ws://test.mosquitto.org:8080");
	m.timeout = 10000;
	m.mqtt_error = error;
}

function error(nr) {
	document.getElementById("o").value = "error " + nr;
}

// Version 1: async function with await
async function f1(source,target) {
	var result = await m.fetch(document.getElementById(source).value);
	document.getElementById(target).value = result;
}

/*
// Version 2: "normal" (not async) function with .then
 async function f1(source,target) {
	var v = document.getElementById("v").value;
	mqtt_fetch_tx(v).then(value => {
		document.getElementById("o").value = value;
	});
}
*/

async function f2() {
	for (var i = 1; i <= 1000; i++) {
		document.getElementById("o").value = await m.fetch(String(i));
	}
}
