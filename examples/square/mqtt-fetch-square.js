var m;
window.onload = async function() {
	m = new mqtt_fetch("client");
	await m.init("localhost",1884,"/");
	m.timeout = 10000;
	m.qos = 0;
	m.mqtt_error = error;
	rc = await m.set_callback(-1, for_me);
	console.log("onload done " + rc);
}

function error(nr) {
	document.getElementById("o").value = "error " + nr;
}

// Version 1: async function with await
async function f1(source,target) {
	document.getElementById(target).value = await m.send(
		 document.getElementById(source).value
	);
	console.log("done");
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

function to_all(msg) {
	document.getElementById("toall").firstChild.nodeValue=msg.payloadString;
}

function for_me(txt) {
	console.log("For me: " + txt);
}

async function f2() {
	for (var i = 1; i <= 1000000; i++) {
		document.getElementById("o").value = await m.send(String(i));
		//setTimeout(async function(n){ document.getElementById("o").value = await m.send(String(n)) }, 0, i)
	}
}

async function f3(v) {
	var rc;
	if (v)
		rc = await m.set_callback("to_all", to_all);
	else
		rc = await m.delete_callback("to_all");
	console.log(rc);
}
