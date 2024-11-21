#include <DHT.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>


const char* ssid = "WiFi-EVENT";
const char* password = "Sup24@Com25$$";  

const char* mqtt_server = "4.233.148.168";
const int mqtt_port = 1883;
const char* mqtt_topic_pub = "sscs/server-form-int";
const char* mqtt_topic_sub = "sscs/int-esp"; 

const char* clientID = "gateway-int";

WiFiClient espClient;
PubSubClient client(espClient);  

LiquidCrystal_I2C lcd(0x27,20,4);

#define DHT11_PIN 23
#define MQ135_PIN 32
#define M 33

#define DHTTYPE DHT11//DHT11
DHT dht(DHT11_PIN, DHTTYPE);

#define b_up 26
#define b_down 25
#define b_temp 2 // to change for ADC 2 
#define b_hum 4 // to change for ADC 2 
#define b_poll 35
#define b_ss 34

#define fan_in_out 13 //LED4
#define valve 12 //LED5
#define heater 14 //LED2
#define cooler 27 //LED3
#define humidifier 15 //LED1



float temp, hum;
int pollu;
int moist;

float ext_temp=25 ;
float ext_hum=20 ;
int ext_poll=80 ;

int temp_moy=25;//must be defined
int temp_tol=10;
int hum_moy=50;//must be defined
int hum_tol=20;
int poll_max=50;//must be defined

int moist_min=200;

bool s_up=0;
bool s_down=0;
bool s_temp=0;
bool s_hum=0;
bool s_poll=0;
bool s_ss=0;

bool ps_up=0;
bool ps_down=0;
bool ps_ss=0;
int i=1;
int Nmax=1;//10000;


bool heating=0;
bool cooling=0;
bool humid=0;
bool uhumid=0;
bool ventilate=0;
bool water=0;

void setup() {
  Serial.begin(115200);
  dht.begin();

  lcd.init();
  lcd.backlight();
  
  setup_wifi();


  pinMode(b_up ,INPUT);
  pinMode(b_down ,INPUT);
  pinMode(b_temp ,INPUT);
  pinMode(b_hum ,INPUT);
  pinMode(b_poll ,INPUT);
  pinMode(b_ss ,INPUT);

  pinMode(fan_in_out ,OUTPUT);
  pinMode(valve ,OUTPUT);
  pinMode(heater ,OUTPUT);
  pinMode(cooler ,OUTPUT);
  pinMode(humidifier ,OUTPUT);
  
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(MQTT_callback); 
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  temp = dht.readTemperature();
  hum = dht.readHumidity();

  pollu=analogRead(MQ135_PIN);
  moist=analogRead(M);
  Serial.println(pollu);
  Serial.println(moist);

  
  // Read buttens (state)
  s_up=digitalRead(b_up) ;
  s_down=digitalRead(b_down); 
  s_temp=digitalRead(b_temp); 
  s_hum=digitalRead(b_hum); 
  s_poll=digitalRead(b_poll);
  s_ss=digitalRead(b_ss);

  i++;
  if(i==2*Nmax){i=1;}
  
  updateSetupsKeyPad();
  display();
  updateDemands();
  actions();

  ps_up=s_up;
  ps_down=s_down;
  ps_ss=s_ss;
  delay(100);

  // Create a JSON object
  StaticJsonDocument<200> doc;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["ppm"] = pollu;
  doc["moisture"] = moist;

  String output;
  serializeJson(doc, output);
  client.publish(mqtt_topic_pub, output.c_str());  // Publish message to the outgoing topic
  Serial.println("Published to " + String(mqtt_topic_pub) + ": " + output);  // Confirm publication
}


void display(){
  if(s_ss==0){
    if (ps_ss==1){
      lcd.clear();
    }
    //firs column
    lcd.setCursor(0, 0);
    lcd.print("Values ");
    lcd.setCursor(0,1); //next lcd.setCursor(0,7);
    lcd.print('%');
    lcd.print(hum);
    lcd.setCursor(0,2);
    lcd.print('c');
    lcd.print(temp);
    lcd.setCursor(0,3);
    lcd.print("ppm");
    lcd.print(pollu);
    //second column
    lcd.setCursor(7, 0);
    lcd.print("ExtVal");
    lcd.setCursor(7,1); //next lcd.setCursor(0,7);
    lcd.print('%');
    lcd.print(ext_hum);
    lcd.setCursor(7,2);
    lcd.print('c');
    lcd.print(ext_temp);
    lcd.setCursor(7,3);
    lcd.print("ppm");
    lcd.print(ext_poll);
    
    //therd column
    lcd.setCursor(14, 0);
    lcd.print("Setup ");
    if(s_hum==1 && (1<=i<=Nmax)){//hum modif blinker
      lcd.setCursor(14,1);
      lcd.print("        ");
      
    }
    lcd.setCursor(14,1);
    lcd.print('%');
    lcd.print(hum_moy);
    
    if(s_temp==1 && (1<=i<=Nmax)){//temp modif blinker
      lcd.setCursor(14,2);
      lcd.print("        ");
      
    }
    lcd.setCursor(14,2);
    lcd.print('c');
    lcd.print(temp_moy);
    
    if(s_poll==1 && (1<=i<=Nmax)){//poll modif blinker
      lcd.setCursor(14,3);
      lcd.print("        ");
      
    }
    lcd.setCursor(14,3);
    lcd.print("ppm");
    lcd.print(poll_max);
  }
  else{
    if (ps_ss==0){
      lcd.clear();
    }
    //first column
    lcd.setCursor(0, 0);
    lcd.print("moist");
    lcd.setCursor(0,1); //next lcd.setCursor(0,7);
    lcd.print('U');
    lcd.print(moist);
    //second column
    lcd.setCursor(7,0);
    lcd.print("moist_min");
    lcd.setCursor(7,1);
    lcd.print(moist_min);
  }
  
}

void setup_wifi() {
  delay(10);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void MQTT_callback(char* topic, byte* payload, unsigned int length) {
  String inputMessage = String((char*)payload).substring(0, length);

  // Declare a StaticJsonDocument with sufficient size
  StaticJsonDocument<200> doc;

  // Deserialize the JSON string into the StaticJsonDocument
  DeserializationError error = deserializeJson(doc, inputMessage);

  // Check for errors in deserialization
  if (error) {
    Serial.print("Failed to parse JSON: ");
    Serial.println(error.c_str());
    return;
  }

  // Access values from the JSON document
  ext_temp = doc["temperature"];
  ext_hum = doc["humidity"];
  ext_poll = doc["ppm"];


  temp_moy= doc["tempmoy"];
  hum_moy= doc["hummoy"];
  poll_max= doc["pollmax"];
  moist_min= doc["moistmin"];

  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.println(inputMessage);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(clientID)) {
      Serial.println("connected");
      client.subscribe(mqtt_topic_sub);
      Serial.println("Subscribed to: " + String(mqtt_topic_sub));
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" trying again in 5 seconds");
      delay(5000);
    }
  }
}

void updateSetupsKeyPad(){
  if(s_hum==1){//hum modif blinker
    if(s_up==0 && ps_up==1){hum_moy=hum_moy+1;}
    if(s_down==0 && ps_down==1){hum_moy=hum_moy-1;}
  }
  if(s_temp==1){//temp modif blinker
    if(s_up==0 && ps_up==1){temp_moy=temp_moy+1;}
    if(s_down==0 && ps_down==1){temp_moy=temp_moy-1;}
  }
  if(s_poll==1){//poll modif blinker
    if(s_up==0 && ps_up==1){poll_max=poll_max+1;}
    if(s_down==0 && ps_down==1){poll_max=poll_max-1;}
  }
}

void updateDemands(){
  //set demandes
  //set temp
  if( temp < temp_moy-temp_tol ){
    heating=1;
  }
  if( temp_moy+temp_tol < temp ){
    cooling=1;
  }
  if( temp_moy-temp_tol<=temp <= temp_moy+temp_tol ){
    cooling=0;
    heating=0;
  }
  //set hum
  if (hum < hum_moy-hum_tol) {
      humid=1;
  }
  if (hum_moy+hum_tol <hum ) {
      uhumid=1;
  }
  if (hum_moy-hum_tol <=hum <= hum_moy+hum_tol) {
      humid=0;
      uhumid=0;
  }
  //set poll
  if (poll_max <pollu ) {
      ventilate=1;
  }
  else{
    ventilate=0;
  }
  if (moist <moist_min ) {
      water=1;
  }
  else{
    water=0;
  }
}

void actions() {
  // Control ventilation
  if (ventilate == 1) {
    digitalWrite(fan_in_out, HIGH);
  } else if (humid == 1 && ext_hum > hum) {
    digitalWrite(fan_in_out, HIGH);
  } else if (uhumid == 1 && ext_hum < hum) {
    digitalWrite(fan_in_out, HIGH);
  } else if (heating == 1 && ext_temp > temp) {
    digitalWrite(fan_in_out, HIGH);
  } else if (cooling == 1 && ext_temp < temp) {
    digitalWrite(fan_in_out, HIGH);
  } else {
    digitalWrite(fan_in_out, LOW);
  }

  if (humid == 1 && ext_hum < hum) {
    digitalWrite(humidifier, HIGH);
  } else {
    digitalWrite(humidifier, LOW);
  }

  if (heating == 1 && ext_temp < temp) {
    digitalWrite(heater, HIGH);
  } else {
    digitalWrite(heater, LOW);
  }

  if (cooling == 1 && ext_temp > temp) {
    digitalWrite(cooler, HIGH);
  } else {
    digitalWrite(cooler, LOW);
  }

  if (moist==1){
    digitalWrite(valve, HIGH);
  }else {
    digitalWrite(valve, LOW);
  }
}
