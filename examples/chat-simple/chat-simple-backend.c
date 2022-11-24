/*
 This is a chat-simple-backend as a plugin for mosquitto Version >= 2
 gcc -Wall  -shared -fPIC chat-simple-backend.c -o chat-simple-backend.so
 */
#include <stdio.h>
#include <string.h>
#include <mosquitto_broker.h>
#include <mosquitto_plugin.h>
#include <mosquitto.h>

static mosquitto_plugin_id_t *mosq_pid = NULL;

static int callback_message(int event, void *event_data, void *userdata)
{
	struct mosquitto_evt_message * ed = (struct mosquitto_evt_message *) event_data;
	char * t_resp = strdup(ed->topic);
	memcpy(t_resp + 15 + strlen(mosquitto_client_id(ed->client)), "/to/", 4);
//	mosquitto_log_printf(MOSQ_LOG_INFO, "MOSQ_EVT_MESSAGE client %s\n", t_resp);
	mosquitto_broker_publish_copy(NULL, t_resp, 2, "OK", 0, 0, NULL);
	mosquitto_broker_publish_copy(NULL,"mqttfetch-chat", ed->payloadlen, ed->payload, 0, 0, NULL);
	return MOSQ_ERR_SUCCESS;
}

int mosquitto_plugin_version(int n, const int * v)
{
	int i = -1;;
	while(++i < n && v[i] != 5);
	return (i < n) ? 5 : -1;
}

int mosquitto_plugin_init(mosquitto_plugin_id_t * pid, void **user_data, struct mosquitto_opt *opts, int opt_count)
{
	mosq_pid = pid;
	mosquitto_log_printf(MOSQ_LOG_INFO, "chat-simple-plugin started");
	return mosquitto_callback_register(mosq_pid, MOSQ_EVT_MESSAGE, callback_message, NULL, *user_data);
}

int mosquitto_plugin_cleanup(void *user_data, struct mosquitto_opt *opts, int opt_count)
{
	printf("Init\n");
	return mosquitto_callback_unregister(mosq_pid, MOSQ_EVT_MESSAGE, callback_message, NULL);
}
