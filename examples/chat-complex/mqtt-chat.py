#!/usr/bin/env python
# Chat-server
import paho.mqtt.client as mqtt
import json
import ssl

chats = ["politik","mode","computer"]

def on_connect(client, userdata, flags, rc):
	print("Connected with result code " + str(rc))
	client.subscribe("mqttfetch/chat/+/fr/+")
	#client.subscribe("#")

def on_subscribe(mosq, obj, mid, granted_qos):
	print("Subscribed: " + str(mid) + " " + str(granted_qos))

def on_message(client, userdata, msg):
	o = json.loads(msg.payload)
	print("msg ",o)
	if o["action"] == "get_chats":
		response = {"rc": "OK", "chats": chats}
	elif o["action"] == "send":
		if o["chat"] != "" and o["text"] != "" and o["nn"] != "":
			response = {"rc": "OK"}
			client.publish("mqttfetch-chat/" + o["chat"], json.dumps({"nn": o["nn"], "text": o["text"]}))
		else:
			response = {"rc": "at least one parameter not set"}
	client.publish(msg.topic.replace("/fr/","/to/"), json.dumps(response))

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.on_subscribe = on_subscribe
#client.username_pw_set("...", "...")
client.connect("test.mosquitto.org", 1883, 60)
#client.tls_set(tls_version=ssl.PROTOCOL_TLSv1_2) # uncomment line 5
#client.connect("www.my-ssl-server.com", 8883, 60)
client.loop_forever()
