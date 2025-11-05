#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>


LiquidCrystal_I2C lcd(0x27, 16, 2); 
Servo myservo;

#define IR_ENTRY 2
#define IR_EXIT 3
#define SERVO_PIN 9

const String PARKING_LOT_ID = "SAB_MALL_PARKING";
const String PARKING_NAME = "SAB Mall Parking";
const String PARKING_ADDRESS = "313 B E, I Block, Pocket E, Sector 27, Noida, Uttar Pradesh 201301, India";

int totalSlots = 3;  
int availableSlots = 3;
int carEntering = 0;
int carExiting = 0;

unsigned long lastUpdateTime = 0;
const unsigned long UPDATE_INTERVAL = 5000; 

void setup() {
  Serial.begin(9600);
  
  lcd.init();
  lcd.backlight();
  
  pinMode(IR_ENTRY, INPUT);
  pinMode(IR_EXIT, INPUT);
  
  myservo.attach(SERVO_PIN);
  myservo.write(115); 
  
  lcd.setCursor(0, 0);
  lcd.print("  SMART PARKING ");
  lcd.setCursor(0, 1);
  lcd.print("    SYSTEM ON   ");
  delay(2000);
  lcd.clear();
  
  displaySlots();
  
  Serial.println("===== SMART PARKING SYSTEM READY =====");
  Serial.print("Total Slots: ");
  Serial.println(totalSlots);
  Serial.print("Available Slots: ");
  Serial.println(availableSlots);
  Serial.println("======================================");
  
  sendParkingDataSerial();
}

void loop() {
  int entrySensor = digitalRead(IR_ENTRY);
  int exitSensor = digitalRead(IR_EXIT);

  if (entrySensor == LOW && carEntering == 0) {
    Serial.println("ENTRY SENSOR TRIGGERED!");
    if (availableSlots > 0) {
      carEntering = 1;
      Serial.println("Car detected at entry. Opening gate...");
      openGate("Welcome!");
      
      availableSlots--;
      Serial.print("Car Entered | Slots Left: ");
      Serial.println(availableSlots);
      
      displaySlots();
      sendParkingDataSerial(); 
      
      while (digitalRead(IR_ENTRY) == LOW) delay(100);
      delay(1000);
      
      Serial.println("Car cleared entry sensor. Closing gate...");
      closeGate();
      carEntering = 0;
      Serial.println("Gate closed after car entry.\n");
    } else {
      Serial.println("Parking Full! Entry Denied.");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("   SORRY :(     ");
      lcd.setCursor(0, 1);
      lcd.print(" Parking Full!  ");
      delay(2000);
      displaySlots();
    }
  }

  if (exitSensor == LOW && carExiting == 0) {
    Serial.println("EXIT SENSOR TRIGGERED!");
    if (availableSlots < totalSlots) {
      carExiting = 1;
      Serial.println("Car detected at exit. Opening gate...");
      openGate("Thank You!");
      
      availableSlots++;
      Serial.print("Car Exited | Slots Left: ");
      Serial.println(availableSlots);
      
      displaySlots();
      sendParkingDataSerial(); 
      
    
      while (digitalRead(IR_EXIT) == LOW) delay(100);
      delay(1000);
      
      Serial.println("Car cleared exit sensor. Closing gate...");
      closeGate();
      carExiting = 0;
      Serial.println("Gate closed after car exit.\n");
    } else {
      Serial.println("Exit sensor triggered but parking already empty.");
    }
  }

  if (millis() - lastUpdateTime >= UPDATE_INTERVAL) {
    sendParkingDataSerial();
    lastUpdateTime = millis();
  }
}

void openGate(String message) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(message);
  lcd.setCursor(0, 1);
  lcd.print("Gate Opening...");
  Serial.println("Gate Opening...");
  
  for (int pos = 115; pos >= 10; pos -= 5) {
    myservo.write(pos);
    delay(30);
  }
  Serial.println("Gate Fully Open.");
}

void closeGate() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Closing Gate...");
  Serial.println("Closing Gate...");
  
  for (int pos = 10; pos <= 115; pos += 5) {
    myservo.write(pos);
    delay(30);
  }
  Serial.println("Gate Fully Closed.");
  displaySlots();
}

void displaySlots() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("   WELCOME!     ");
  lcd.setCursor(0, 1);
  lcd.print("Slots Left: ");
  lcd.print(availableSlots);
  
  Serial.print("Display Updated | Slots Left: ");
  Serial.println(availableSlots);
}

void sendParkingDataSerial() {
  int occupiedSlots = totalSlots - availableSlots;
  float occupancyRate = (float)occupiedSlots / totalSlots * 100.0;
  

  Serial.println("JSON_START");
  Serial.print("{");
  Serial.print("\"parkingLotId\":\"");
  Serial.print(PARKING_LOT_ID);
  Serial.print("\",");
  Serial.print("\"name\":\"");
  Serial.print(PARKING_NAME);
  Serial.print("\",");
  Serial.print("\"address\":\"");
  Serial.print(PARKING_ADDRESS);
  Serial.print("\",");
  Serial.print("\"totalSlots\":");
  Serial.print(totalSlots);
  Serial.print(",");
  Serial.print("\"availableSlots\":");
  Serial.print(availableSlots);
  Serial.print(",");
  Serial.print("\"occupiedSlots\":");
  Serial.print(occupiedSlots);
  Serial.print(",");
  Serial.print("\"occupancyRate\":");
  Serial.print(occupancyRate, 2);
  Serial.print(",");
  Serial.print("\"timestamp\":");
  Serial.print(millis());
  Serial.println("}");
  Serial.println("JSON_END");
}
