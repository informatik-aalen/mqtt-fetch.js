#!/usr/bin/env python
# Chat-server
import paho.mqtt.client as mqtt
import json
import ssl


def on_connect(client, userdata, flags, rc):
	print("Connected with result code " + str(rc))
	client.subscribe("mqttfetch/chat/+/fr/+")

def on_subscribe(mosq, obj, mid, granted_qos):
	print("Subscribed: " + str(mid) + " " + str(granted_qos))

def on_message(client, userdata, msg):
	print("msg ", msg.payload)
	client.publish(msg.topic.replace("/fr/","/to/"), "OK")
	client.publish("mqttfetch-chat", msg.payload)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.on_subscribe = on_subscribe
#client.username_pw_set("...", "...")
client.connect("test.mosquitto.org", 1883, 60)
#client.tls_set(tls_version=ssl.PROTOCOL_TLSv1_2) # uncomment line 5
#client.connect("www.my-ssl-server.com", 8883, 60)
client.loop_forever()
