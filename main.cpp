#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// ─── Pin Definitions ───
#define RELAY1_PIN  26
#define RELAY2_PIN  27
#define DHT_PIN     4
#define PIR_PIN     13
#define BUZZER_PIN  14

// OLED I2C Pins (Default on ESP32: SDA 21, SCL 22)
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ─── DHT Settings ───
#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

void setup() {
  Serial.begin(115200);

  // Initialize GPIO
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Default states
  digitalWrite(RELAY1_PIN, HIGH); // Relays active LOW
  digitalWrite(RELAY2_PIN, HIGH);
  digitalWrite(BUZZER_PIN, LOW);

  // Initialize DHT
  dht.begin();

  // Initialize OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); 
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println(F("Smart Home OS"));
  display.println(F("System Online"));
  display.display();
  delay(2000);
}

void loop() {
  int motionState = digitalRead(PIR_PIN);
  
  display.clearDisplay();
  display.setCursor(0, 0);
  
  if (motionState == HIGH) {
    digitalWrite(BUZZER_PIN, HIGH);
    
    display.setTextSize(2);
    display.println(F("MOTION"));
    display.println(F("DETECTED!"));
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    
    display.setTextSize(1);
    display.println(F("System Idle\n"));
    
    if (isnan(h) || isnan(t)) {
      display.println(F("DHT Error"));
    } else {
      display.print(F("Temp: "));
      display.print(t);
      display.println(F(" C"));
      
      display.print(F("Hum:  "));
      display.print(h);
      display.println(F(" %"));
    }
  }
  
  display.display();
  delay(100);
}
