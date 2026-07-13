const projectCodes = {

"Smart LED Control System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define LED 2
void setup(){ pinMode(LED,OUTPUT); }
void loop(){
 digitalWrite(LED,HIGH); delay(1000);
 digitalWrite(LED,LOW); delay(1000);
}`
},

"RGB LED Color Controller":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define R 14
#define G 12
#define B 13
void setup(){
 pinMode(R,OUTPUT); pinMode(G,OUTPUT); pinMode(B,OUTPUT);
}
void loop(){
 analogWrite(R,255); analogWrite(G,0); analogWrite(B,0); delay(1000);
 analogWrite(R,0); analogWrite(G,255); analogWrite(B,0); delay(1000);
}`
},

"WiFi Based Home Automation":{
 libs:["WiFi.h"],
 code:(ssid,pass)=>`
#include <WiFi.h>
const char* ssid="${ssid}";
const char* password="${pass}";
void setup(){
 Serial.begin(115200);
 WiFi.begin(ssid,password);
 while(WiFi.status()!=WL_CONNECTED){delay(500);}
}
void loop(){}
`
},

"Smart Relay Control":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define RELAY 5
void setup(){ pinMode(RELAY,OUTPUT); }
void loop(){
 digitalWrite(RELAY,HIGH); delay(2000);
 digitalWrite(RELAY,LOW); delay(2000);
}`
},

"Motion Based Light System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define PIR 27
#define LED 2
void setup(){ pinMode(PIR,INPUT); pinMode(LED,OUTPUT); }
void loop(){
 digitalWrite(LED,digitalRead(PIR));
}`
},

"Smart Temperature & Humidity Monitor":{
 libs:["DHT.h"],
 code:(ssid,pass)=>`
#include <DHT.h>
#define DHTPIN 4
DHT dht(DHTPIN,DHT11);
void setup(){ Serial.begin(9600); dht.begin(); }
void loop(){
 Serial.println(dht.readTemperature());
 delay(2000);
}`
},

"Weather Monitoring System":{
 libs:["DHT.h"],
 code:(ssid,pass)=>`
#include <DHT.h>
#define DHTPIN 4
DHT dht(DHTPIN,DHT22);
void setup(){ Serial.begin(9600); dht.begin(); }
void loop(){
 Serial.print("T:");Serial.println(dht.readTemperature());
 Serial.print("H:");Serial.println(dht.readHumidity());
 delay(2000);
}`
},

"Smart Fan Controller":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define FAN 5
void setup(){ pinMode(FAN,OUTPUT); }
void loop(){ digitalWrite(FAN,HIGH); }`
},

"Gas Leakage Detection System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define GAS 34
#define BUZZER 25
void setup(){ pinMode(BUZZER,OUTPUT); }
void loop(){
 if(analogRead(GAS)>400) digitalWrite(BUZZER,HIGH);
 else digitalWrite(BUZZER,LOW);
}`
},

"Fire Alarm System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define FLAME 33
#define BUZZER 25
void setup(){ pinMode(FLAME,INPUT); pinMode(BUZZER,OUTPUT); }
void loop(){
 if(digitalRead(FLAME)==LOW) digitalWrite(BUZZER,HIGH);
}`
},

"Smart Security System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define PIR 27
#define BUZZER 25
void setup(){ pinMode(PIR,INPUT); pinMode(BUZZER,OUTPUT); }
void loop(){
 if(digitalRead(PIR)) digitalWrite(BUZZER,HIGH);
 else digitalWrite(BUZZER,LOW);
}`
},

"PIR Motion Detection Alarm":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define PIR 27
#define BUZZER 25
void setup(){ pinMode(PIR,INPUT); pinMode(BUZZER,OUTPUT); }
void loop(){
 digitalWrite(BUZZER,digitalRead(PIR));
}`
},

"Ultrasonic Distance Measurement":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define TRIG 5
#define ECHO 18
void setup(){
 Serial.begin(9600);
 pinMode(TRIG,OUTPUT); pinMode(ECHO,INPUT);
}
void loop(){
 digitalWrite(TRIG,LOW); delayMicroseconds(2);
 digitalWrite(TRIG,HIGH); delayMicroseconds(10);
 digitalWrite(TRIG,LOW);
 long d=pulseIn(ECHO,HIGH)/58;
 Serial.println(d);
}`
},

"Smart Parking System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define TRIG 5
#define ECHO 18
#define LED 2
void setup(){
 pinMode(TRIG,OUTPUT); pinMode(ECHO,INPUT);
 pinMode(LED,OUTPUT);
}
void loop(){
 digitalWrite(TRIG,LOW); delayMicroseconds(2);
 digitalWrite(TRIG,HIGH); delayMicroseconds(10);
 digitalWrite(TRIG,LOW);
 long d=pulseIn(ECHO,HIGH)/58;
 digitalWrite(LED, d<10);
}`
},

"Automatic Water Pump Controller":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define SOIL 34
#define RELAY 5
void setup(){ pinMode(RELAY,OUTPUT); }
void loop(){
 if(analogRead(SOIL)<500) digitalWrite(RELAY,HIGH);
 else digitalWrite(RELAY,LOW);
}`
},

"Smart Irrigation System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define SOIL 34
#define PUMP 5
void setup(){ pinMode(PUMP,OUTPUT); }
void loop(){
 digitalWrite(PUMP, analogRead(SOIL)<500);
}`
},

"Soil Moisture Monitoring System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define SOIL 34
void setup(){ Serial.begin(9600); }
void loop(){
 Serial.println(analogRead(SOIL));
 delay(1000);
}`
},

"Rain Detection & Alert System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define RAIN 32
#define BUZZER 25
void setup(){ pinMode(RAIN,INPUT); pinMode(BUZZER,OUTPUT); }
void loop(){
 digitalWrite(BUZZER, digitalRead(RAIN)==LOW);
}`
},

"Sound Level Monitoring System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define SOUND 35
void setup(){ Serial.begin(9600); }
void loop(){
 Serial.println(analogRead(SOUND));
 delay(500);
}`
},

"Smart Door Lock System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define LOCK 5
void setup(){ pinMode(LOCK,OUTPUT); }
void loop(){ digitalWrite(LOCK,HIGH); }`
},

"OLED Based Sensor Dashboard":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
void setup(){ Serial.begin(9600); }
void loop(){ Serial.println("OLED Dashboard"); delay(1000); }`
},

"LCD Based Monitoring System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
void setup(){ Serial.begin(9600); }
void loop(){ Serial.println("LCD Monitor"); delay(1000); }`
},

"Energy Monitoring System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define V 34
#define I 35
void setup(){ Serial.begin(9600); }
void loop(){
 Serial.print("V:");Serial.print(analogRead(V));
 Serial.print(" I:");Serial.println(analogRead(I));
 delay(1000);
}`
},

"Voltage & Current Monitoring System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define V 34
#define I 35
void setup(){ Serial.begin(9600); }
void loop(){
 Serial.print(analogRead(V));
 Serial.print(",");
 Serial.println(analogRead(I));
 delay(1000);
}`
},

"Smart Motor Speed Controller":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define MOTOR 5
void setup(){ pinMode(MOTOR,OUTPUT); }
void loop(){ analogWrite(MOTOR,150); }`
},

"Servo Motor Angle Controller":{
 libs:["Servo.h"],
 code:(ssid,pass)=>`
#include <Servo.h>
Servo s;
void setup(){ s.attach(5); }
void loop(){ s.write(90); }`
},

"Stepper Motor Control System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
void setup(){}
void loop(){}
`
},

"Bluetooth Based Device Control":{
 libs:["BluetoothSerial.h"],
 code:(ssid,pass)=>`
#include "BluetoothSerial.h"
BluetoothSerial bt;
void setup(){ bt.begin("ESP32"); }
void loop(){}
`
},

"GSM Based Alert System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
void setup(){ Serial.begin(9600); }
void loop(){ Serial.println("GSM Alert"); delay(2000); }`
},

"GPS Tracking System":{
 libs:["TinyGPS++.h"],
 code:(ssid,pass)=>`
#include <TinyGPS++.h>
TinyGPSPlus gps;
void setup(){ Serial.begin(9600); }
void loop(){}
`
},

"Smart Attendance System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
void setup(){ Serial.begin(9600); }
void loop(){ Serial.println("Attendance"); delay(1000); }`
},

"SD Card Data Logger":{
 libs:["SD.h"],
 code:(ssid,pass)=>`
#include <SD.h>
void setup(){ Serial.begin(9600); }
void loop(){}
`
},

"RTC Based Digital Clock":{
 libs:["RTClib.h"],
 code:(ssid,pass)=>`
#include <RTClib.h>
RTC_DS3231 rtc;
void setup(){ rtc.begin(); }
void loop(){}
`
},

"Touch Sensor Control System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define TOUCH 4
#define LED 2
void setup(){ pinMode(LED,OUTPUT); }
void loop(){
 digitalWrite(LED, touchRead(TOUCH)<30);
}`
},

"Keypad Based Security System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
void setup(){ Serial.begin(9600); }
void loop(){}
`
},

"Smart Fan & Light Automation":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define FAN 5
#define LED 2
void setup(){ pinMode(FAN,OUTPUT); pinMode(LED,OUTPUT); }
void loop(){ digitalWrite(FAN,HIGH); digitalWrite(LED,HIGH); }`
},

"Air Quality Monitoring System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define MQ 34
void setup(){ Serial.begin(9600); }
void loop(){ Serial.println(analogRead(MQ)); delay(1000); }`
},

"Smart Water Level Monitoring System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
#define TRIG 5
#define ECHO 18
void setup(){ pinMode(TRIG,OUTPUT); pinMode(ECHO,INPUT); }
void loop(){}
`
},

"Smart Home Safety System":{
 libs:["Arduino.h"],
 code:(ssid,pass)=>`
void setup(){}
void loop(){}
`
},

"IoT Based Smart Farming System":{
 libs:["WiFi.h","DHT.h"],
 code:(ssid,pass)=>`
#include <WiFi.h>
#include <DHT.h>
#define DHTPIN 4
DHT dht(DHTPIN,DHT22);
const char* ssid="${ssid}";
const char* password="${pass}";
void setup(){
 WiFi.begin(ssid,password);
 dht.begin();
}
void loop(){
 Serial.println(dht.readTemperature());
 delay(2000);
}`
}

};
