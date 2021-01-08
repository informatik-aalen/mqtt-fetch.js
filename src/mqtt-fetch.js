/*
 Version 20200107
 
 ToDo:
 */
class mqtt_fetch {
	constructor (prefix) {
		this.prefix = prefix + "/";
		this.mqtt_topicIndex = 0;
		this.mqtt_topicMap = new Map;
		this.timeout = 1000;
		this.qos = 0;
		console.log("Ende Konstruktor " )
	}
	
	init(host, port, uri, connect_prm) {
		const that = this;
		if (connect_prm == undefined)
			connect_prm = {};
		if(uri == undefined)
			uri = "";
		return new Promise(function(resolve) {
			connect_prm.onSuccess = function() {
				console.log("mqtt_fetch_onConnect");
				that.subscribe(that.prefix + that.mqtt_client.clientId + "/to/+").then(value => {resolve(value);});
			};
			connect_prm.onFailure = function() {console.log("mqtt_connect_err"); resolve(-1);};
			that.mqtt_client = new Paho.MQTT.Client(host, port, uri, "mqtt-fetch-js-client-" + Math.floor(Math.random() * 1E15).toString());
			that.mqtt_client.onMessageArrived = function(msg) {that.mqtt_fetch_rx(msg, that)};
			that.mqtt_client.onConnectionLost = function () {console.log("mqtt_fetch_onConnectionLost");};
			console.log("Connecting....");
			that.mqtt_client.connect(connect_prm);
			console.log("Done");
		});
	};
	
	
	subscribe(topic) {
		var that = this;
		console.log("subscribing " + topic);
		return new Promise(function(resolve) {
			that.mqtt_client.subscribe(topic, {
				qos: that.qos,
				onSuccess: function () {console.log("mqtt_fetch_subscription " + topic + " ok"); resolve(0);},
				onFailure: function () {console.log("mqtt_fetch_subscription " + topic + " err"); resolve(1);}
			});
		});
	}
	
	unsubscribe(topic) {
		var that = this;
		console.log("unsubscribing " + topic);
		return new Promise(function(resolve) {
			that.mqtt_client.unsubscribe(topic, {
			onSuccess: function () {console.log("mqtt_fetch_unsubscription " + topic + " ok"); resolve(0);},
			onFailure: function () {console.log("mqtt_fetch_unsubscription " + topic + " err"); resolve(1);}
			});
		});
	}
	

	send(v) {
		var is_object = typeof v === "object";
		if (is_object)
			v = JSON.stringify(v);
		const that = this;
		return new Promise(function(resolve) {
			var message = new Paho.MQTT.Message(v);
			message.destinationName = that.prefix + that.mqtt_client.clientId + "/from/" + that.mqtt_topicIndex;
			message.qos = that.qos;
			that.mqtt_topicMap.set(that.mqtt_topicIndex, [resolve,setTimeout(that.mqtt_fetch_error, that.timeout, that.mqtt_topicIndex, that), is_object]);
			that.mqtt_client.send(message);
			that.mqtt_topicIndex++;
		});
	}
	
	mqtt_fetch_rx (msg, that) {
		var topic = msg.destinationName.split("/");
//		 console.log("rx " + msg.destinationName + " " + msg.payloadString);
		if (msg.destinationName.substring(0,that.prefix.length) == that.prefix) {
			var nr=+topic[topic.length - 1], dummy = that.mqtt_topicMap.get(nr);
			if (dummy != undefined) {
				if (nr >= 0) {
					clearTimeout(dummy[1]);
					that.mqtt_topicMap.delete(nr);
				}
				dummy[0]((dummy[2] == true) ? JSON.parse(msg.payloadString) : msg.payloadString); // Promise einloesen oder callback-Fkt.!
			}
			else {
				console.log("Verworfenes Topic " + msg.destinationName + " " + msg.payloadString);
			}
		}
		else if (that.mqtt_topicMap.has(msg.destinationName)) {
			var r = that.mqtt_topicMap.get(msg.destinationName);
			r[0]((r[2] == true) ? JSON.parse(msg.payloadString) : msg);
		}
		else {
			console.log("Sollte nie passieren: " + msg.destinationName + " " + msg.payloadString);
		}
	}
	
	mqtt_fetch_error(nr, that) {
		console.log("error: " + nr);
		if (that.mqtt_topicMap.has(nr))
			that.mqtt_topicMap.delete(nr);
		if (that.mqtt_error != undefined)
			that.mqtt_error(nr);
	}
	
	async set_callback(index, f, is_object) {
		var rc = 0;
		if (index != parseInt(index, 10) ) {
			rc = await this.subscribe(index, {});
			console.log("rc = " + rc);
		}
		this.mqtt_topicMap.set(index, [f, undefined , is_object == true]);
		return rc;
	}
	
	async delete_callback(index) {
		var rc = 0;
		if (index != parseInt(index, 10) ) {
			rc = await this.unsubscribe(index, {});
			console.log("rc = " + rc);
		}
		this.mqtt_topicMap.delete(index);
		return rc;
	}
};
