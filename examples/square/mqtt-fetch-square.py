#!/usr/bin/env python
# Quadrieren-server
import paho.mqtt.client as mqtt
import time
import os

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("mqttfetch/squareserver/+/fr/+")

def on_message(client, userdata, msg):
	print(msg.topic + " '" + str(msg.payload) + "'")
	try:
		response = int(msg.payload)
		#time.sleep(response)
		response = str(response * response);
	except ValueError:
		response = "Square-Error"
	client.publish(msg.topic.replace("/fr/","/to/"), "pid " + str(os.getpid()) + ": " + response)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect("test.mosquitto.org", 1883, 60)
client.loop_forever()
