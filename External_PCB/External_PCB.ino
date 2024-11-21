#include "DHT.h"
#include <ESP8266WiFi.h>     // WiFi library for ESP8266
#include <PubSubClient.h>    // MQTT library
#include <ArduinoJson.h>

#define LED D0
#define mq135Pin A0 // Analog pin connected to MQ135 AO pin
#define DHTPIN D3     // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11   // DHT 11
DHT dht(DHTPIN, DHTTYPE);


// WiFi credentials
const char* ssid = "WiFi-EVENT";            // Your WiFi SSID
const char* password = "Sup24@Com25$$";    // Your WiFi Password 

const char* mqtt_server = "4.233.148.168";  // Replace with your cloud MQTT broker address
const int mqtt_port = 1883;                     // Default MQTT port for non-secure connections
const char* mqtt_topic_pub = "sscs/server-form-ext";  // Topic to publish messages to
const char* mqtt_topic_sub = "sscs/ext-esp";  // Topic to subscribe to for incoming messages


// Custom client ID (must be unique for each device)
const char* clientID = "gateway-ext";  // Unique identifier for this MQTT client

WiFiClient espClient;  // Create a WiFi client object
PubSubClient client(espClient);  // Create a PubSubClient object using the WiFi client



// Function to connect to WiFi
void setup_wifi() {
  delay(10);  // Short delay for stability
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);  // Initiate WiFi connection
  while (WiFi.status() != WL_CONNECTED) {  // Wait until WiFi is connected
    delay(500);
    Serial.print(".");  // Print dots while connecting
  }
  Serial.println("WiFi connected");  // Print message when connected
}


// Callback function that runs when an MQTT message arrives
void MQTT_callback(char* topic, byte* payload, unsigned int length) {
  String inputMessage = String((char*)payload).substring(0, length);


  Serial.print("Message arrived [");
  Serial.print(topic);  // Print the topic of the message
  Serial.print("] ");
  Serial.println(inputMessage);

}

// Function to reconnect to MQTT broker
void reconnect() {
  while (!client.connected()) {  // Loop until we're reconnected
    Serial.print("Attempting MQTT connection...");
    if (client.connect(clientID)) {  // Attempt to connect with the custom client ID
      Serial.println("connected");
      client.subscribe(mqtt_topic_sub);  // Subscribe to the incoming topic
      Serial.println("Subscribed to: " + String(mqtt_topic_sub));
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());  // Print the reason for connection failure
      Serial.println(" trying again in 5 seconds");
      delay(5000);  // Wait 5 seconds before retrying
    }
  }
}



void setup() {
  Serial.begin(9600);
  setup_wifi();  // Call function to connect to WiFi

  // MQTT 
  client.setServer(mqtt_server, mqtt_port);  // Set MQTT server and port
  client.setCallback(MQTT_callback);  // Set the callback function for incoming messages

  //Serial.println(F("DHTxx test!"));
  pinMode(LED , OUTPUT);
  pinMode(mq135Pin,INPUT);
  dht.begin();
}

void loop() {
  if (!client.connected()) {
    reconnect();  // Reconnect to MQTT broker if connection is lost
  }
  client.loop();  // Maintain MQTT connection and process incoming messages

  // Wait a few seconds between measurements.
  delay(1000);
  digitalWrite(LED, HIGH);
  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();
  
  int poll = analogRead(mq135Pin); // Read the analog value (0-1023)
  //float voltage = poll* (5.0 / 1023.0); // Convert to voltage (0-5V)

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    //return;
  }
  else{
    Serial.print(F("Humidity: "));
    Serial.print(h);
    Serial.print(F("%  Temperature: "));
    Serial.print(t);
    Serial.println(F("°C "));
    
  }

  Serial.print("polllution: ");
  Serial.print(poll);
  Serial.println(" ppm");


  // Create a JSON object
  StaticJsonDocument<200> doc;
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["ppm"] = poll;

  String output;
  serializeJson(doc, output);
  client.publish(mqtt_topic_pub, output.c_str());  // Publish message to the outgoing topic
  Serial.println("Published to " + String(mqtt_topic_pub) + ": " + output);  // Confirm publication

  delay(1000);
  digitalWrite(LED, LOW);
}
