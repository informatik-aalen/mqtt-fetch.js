/*
 Version 20221123:
 */

class mqtt_fetch {
  constructor(prefix) {
    this.prefix = "mqttfetch/" + prefix + "/";
    this.mqtt_topicIndex = 0;
    this.mqtt_topicMap = new Map();
    this.timeout = 1000;
    this.qos = 2;
    this.with_reject = false;
  }

  init(url, connect_prm) {
    const that = this;
    console.log(url);
    return new Promise((resolve) => {
      that.mqtt_client = mqtt.connect(url, connect_prm);
      that.mqtt_client.on("message", (topic, msg) => {
        that.mqtt_fetch_rx(topic, msg, that);
      });
      that.mqtt_client.on("connect", () => {
        console.log("mqtt-fetch connected!");
        that.mqtt_client.subscribe(
          that.prefix + that.mqtt_client.options.clientId + "/to/+",
          (err, value) => {
            if (!err) {
              console.log("subscription: ", value);
              resolve(value.topic);
            }
          }
        );
      });
    });
  }

  unsubscribe(topic) {
    var that = this;
    console.log("unsubscribing " + topic);
    return new Promise((resolve) => {
      that.mqtt_client.unsubscribe(topic, (err) => {
        if (!err) {
          console.log("mqtt_fetch_unsubscription " + topic + " ok");
          resolve(0);
        } else {
          console.log("mqtt_fetch_unsubscription " + topic + " err");
          resolve(1);
        }
      });
    });
  }

  async delete_callback(index) {
    console.log("deleting callback");

    var rc = 0;
    if (index != parseInt(index, 10)) {
      rc = await this.unsubscribe(index, {});
      console.log("rc = " + rc);
    }
    this.mqtt_topicMap.delete(index);
    return rc;
  }

  subscribe(topic) {
    var that = this;
    console.log("subscribing " + topic);
    return new Promise((resolve) => {
      that.mqtt_client.subscribe(topic, { qos: that.qos }, (err) => {
        if (!err) {
          console.log("mqtt_fetch_subscription " + topic + " ok");
          resolve(0);
        } else {
          console.log("mqtt_fetch_subscription " + topic + " err");
          resolve(1);
        }
      });
    });
  }

  async set_callback(index, f, is_object) {
    var rc = 0;
    if (index != parseInt(index, 10)) {
      rc = await this.subscribe(index, {});
      console.log("rc = " + rc);
    }
	  console.log("set_callback", index, f, is_object == true);
    this.mqtt_topicMap.set(index, [f, undefined, is_object == true]);
    return rc;
  }

  fetch(v, prefix) {
	console.log("prefix = ", prefix);
    var is_object = typeof v === "object";
    if (is_object) v = JSON.stringify(v);
    else if (typeof v === "number") v = v.toString();
    const that = this;
    return new Promise((resolve, reject) => {
      let index = that.mqtt_topicIndex++;
      that.mqtt_topicMap.set(index, [
        resolve,
        reject,
        setTimeout(that.mqtt_fetch_timeout, that.timeout, index, that),
        is_object,
      ]);

      that.mqtt_client.publish(
			that.prefix + that.mqtt_client.options.clientId + "/fr/" + ((prefix != undefined) ? prefix + "/" : "" ) + index, v, { qos: that.qos });
    });
  }

  mqtt_fetch_rx(destinationName, msg, that) {
    var topic = destinationName.split("/");
    msg = msg.toString();
    if (topic[0] == "mqttfetch") {
      let nr = +topic[topic.length - 1];
      if (that.mqtt_topicMap.has(nr)) {
        // mqtt-fetch
        let dummy = that.mqtt_topicMap.get(nr);
        if (nr >= 0) {
          //Request-Response
          clearTimeout(dummy[2]);
          that.mqtt_topicMap.delete(nr);
        }
        dummy[0](dummy[3] == true ? JSON.parse(msg) : msg); // Resolve Promise or Callback function
      } else {
        console.error("Verworfenes Topic " + destinationName + " " + msg);
      }
    } // Other subscription
    else if (that.mqtt_topicMap.has(destinationName)) {
      var r = that.mqtt_topicMap.get(destinationName);
      r[0](r[2] == true ? JSON.parse(msg) : msg, destinationName);
    } else {
      // Error
      console.error("Sollte nie passieren: " + destinationName + " " + msg);
    }
  }

  mqtt_fetch_timeout(nr, that) {
    let dummy = that.mqtt_topicMap.get(nr);
    that.mqtt_topicMap.delete(nr);
    if (that.with_reject)
		dummy[1](nr);
    else
		dummy[0]("timeout " + nr);
    if (that.mqtt_error != undefined) that.mqtt_error(nr);
  }
};
if (typeof module == "object") {
	var mqtt = require("mqtt");
	module.exports = mqtt_fetch;
}
