
# Green Control System (ESP32) - README

## Overview

This project is part of the **Green Control System**, designed to optimize conditions in greenhouses. It features two PCBs:
1. **Internal PCB**: Measures temperature, humidity, pollution levels, and soil moisture inside the greenhouse.
2. **External PCB**: Monitors external environmental conditions and provides comparative data.

The ESP32 microcontroller acts as the bridge between the hardware sensors and the mobile app. It collects data, determines actions, and communicates with the server for remote monitoring and control.

## Features

- **Sensor Integration**:
  - Measures internal temperature, humidity, air quality (PPM), and soil moisture.
  - Monitors external conditions: temperature, humidity, and air quality.

- **Action Control**:
  - Automatically regulates:
    - Heating
    - Cooling
    - Ventilation
    - Humidification
    - Watering

- **Communication**:
  - Publishes and subscribes to MQTT topics for real-time data exchange.
  - Interfaces with the mobile app to set thresholds and receive alerts.

- **User Interaction**:
  - Displays real-time data on an LCD.
  - Configurable thresholds using push buttons.

## Components

### Hardware
- **ESP32 microcontroller**
- **DHT11 sensor**: For temperature and humidity.
- **MQ135 sensor**: For air quality (PPM).
- **Soil moisture sensor**
- **LCD (I2C)**
- Actuators:
  - Heater
  - Cooler
  - Fan
  - Humidifier
  - Valve (for watering)

### Software
- **Arduino IDE**
- Libraries:
  - DHT: For reading temperature and humidity.
  - LiquidCrystal_I2C: For LCD control.
  - WiFi: For network connectivity.
  - PubSubClient: For MQTT communication.
  - ArduinoJson: For JSON parsing and serialization.

## Setup

### Prerequisites
- Install the **Arduino IDE** and required libraries:
  - `DHT`
  - `LiquidCrystal_I2C`
  - `WiFi`
  - `PubSubClient`
  - `ArduinoJson`

### Wiring
Connect the sensors and actuators to the ESP32 pins as follows:

| Component            | ESP32 Pin |
|----------------------|-----------|
| DHT11               | GPIO 23   |
| MQ135               | GPIO 32   |
| Soil Moisture       | GPIO 33   |
| Heater              | GPIO 14   |
| Cooler              | GPIO 27   |
| Fan                 | GPIO 13   |
| Humidifier          | GPIO 15   |
| Valve               | GPIO 12   |
| Buttons (Up/Down)   | GPIO 26/25|
| Buttons (Temp/Hum)  | GPIO 2/4  |
| Buttons (Poll/SS)   | GPIO 35/34|

### Configuration
1. Set your WiFi credentials in the Arduino sketch:
   ```cpp
   const char* ssid = "Your_WiFi_Name";
   const char* password = "Your_WiFi_Password";
   ```

2. Set the MQTT server details:
   ```cpp
   const char* mqtt_server = "Your_MQTT_Server_IP";
   const int mqtt_port = 1883;
   const char* mqtt_topic_pub = "Your_Publish_Topic";
   const char* mqtt_topic_sub = "Your_Subscribe_Topic";
   ```

3. Upload the code to the ESP32 using the Arduino IDE.

### Running the System
1. Power on the ESP32 and ensure it connects to the configured WiFi network.
2. The system will:
   - Start monitoring internal and external conditions.
   - Publish data to the server via MQTT.
   - Display current values on the LCD.
   - Respond to button inputs for threshold adjustments.

### Monitoring and Control
- Use the **Green Control mobile app** to:
  - View live greenhouse data.
  - Adjust thresholds for temperature, humidity, and air quality.
  - Receive alerts for extreme conditions.

---

Enjoy maintaining optimal greenhouse conditions with minimal energy usage! 🌱
