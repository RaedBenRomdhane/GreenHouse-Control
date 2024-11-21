import paho.mqtt.client as mqtt
import json
from datetime import datetime

SHARED_FOLDER = './shared'

TOPIC_EXT = "sscs/ext-esp"
TOPIC_INT = "sscs/int-esp"

TOPICS = [("sscs/server-form-ext", 0), ("sscs/server-form-int", 0)]


def read_threshold_data():
    try:
        # Step 1: Open the "threshold.json" file
        with open(f"{SHARED_FOLDER}/threshold.json", "r") as json_file:
            data = json.load(json_file)
        
        # Step 2: Extract values
        tempmoy = data.get("tempmoy")
        hummoy = data.get("hummoy")
        pollmax = data.get("pollmax")
        moistmin = data.get("moistmin")
        
        # Step 3: Return the values
        return tempmoy, hummoy, pollmax, moistmin
    
    except FileNotFoundError:
        print("Error: 'threshold.json' file not found.")
        return None, None, None, None
    except json.JSONDecodeError:
        print("Error: 'threshold.json' file contains invalid JSON.")
        return None, None, None, None



def log_sensor_data_ext(new_temperature, new_humidity, new_ppm):
    # Read existing data
    try:
        with open(f"{SHARED_FOLDER}/data-ext.json", 'r') as file:
            data = json.load(file)
    except FileNotFoundError:
        # Initialize data structure if file doesn't exist
        data = {
            'temperatures': [],
            'humidity': [],
            'ppm': [],
            'time': []
        }

    current_time = datetime.now().strftime('%H:%M')

    # Add new data to existing dataset
    data['temperatures'].append(new_temperature)
    data['humidity'].append(new_humidity)
    data['ppm'].append(new_ppm)
    data['time'].append(current_time)

    # Write updated data back to file
    with open(f"{SHARED_FOLDER}/data-ext.json", 'w') as file:
        json.dump(data, file, indent=2)

    print(f"Logged new data - Temp: {new_temperature}°C, Humidity: {new_humidity}%, PPM: {new_ppm}, Time: {current_time}")


def log_sensor_data_int(new_temperature, new_humidity, new_ppm, moisturenew_ppm):
    # Read existing data
    try:
        with open(f"{SHARED_FOLDER}/data-int.json", 'r') as file:
            data = json.load(file)
    except FileNotFoundError:
        # Initialize data structure if file doesn't exist
        data = {
            'temperatures': [],
            'humidity': [],
            'ppm': [],
            'moisture': [],
            'time': []
        }

    current_time = datetime.now().strftime('%H:%M')

    # Add new data to existing dataset
    data['temperatures'].append(new_temperature)
    data['humidity'].append(new_humidity)
    data['ppm'].append(new_ppm)
    data['moisture'].append(moisturenew_ppm)
    data['time'].append(current_time)

    # Write updated data back to file
    with open(f"{SHARED_FOLDER}/data-int.json", 'w') as file:
        json.dump(data, file, indent=2)

    print(f"Logged new data - Temp: {new_temperature}°C, Humidity: {new_humidity}%, PPM: {new_ppm}, Moisture: {moisturenew_ppm}, Time: {current_time}")



# Define the callback function for when a message is received
def on_message(client, userdata, message):
    data = str(message.payload.decode("utf-8"))
    print(f"user [{userdata}:{message.topic}]: {data}")
    json_data = json.loads(data)

    try:
        new_temperature = json_data["temperature"]
        new_humidity = json_data["humidity"]
        new_ppm =  json_data["ppm"]

        if message.topic == 'sscs/server-form-ext':
            tempmoy, hummoy, pollmax, moistmin = read_threshold_data()

            if tempmoy is not None:
                json_data.update({
                    "tempmoy": tempmoy,
                    "hummoy": hummoy,
                    "pollmax": pollmax,
                    "moistmin": moistmin
                })
            else:
                json_data.update({
                    "tempmoy": 37,
                    "hummoy": 50,
                    "pollmax": 75,
                    "moistmin": 30
                })

            data2 = json.dumps(json_data)


            result = client.publish(TOPIC_INT, data2)
            # Check the result of the publish
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"Message sent to topic '{TOPIC_INT}': {data}")
            else:
                print("Failed to send message.")
            log_sensor_data_ext(new_temperature, new_humidity, new_ppm)
        else:
            moisturenew_ppm =  json_data["moisture"]
            log_sensor_data_int(new_temperature, new_humidity, new_ppm, moisturenew_ppm)
    except Exception as e:
        print(e)

# Callback function for successful connection
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"user [{userdata}] Connected to MQTT broker!")
        # Subscribe to multiple topics
        client.subscribe(TOPICS)
        print(f"Subscribed to topics: {[topic[0] for topic in TOPICS]}")
    else:
        print("Failed to connect, return code:", rc)






# Create an MQTT client instance
client = mqtt.Client()

# Set the callback functions
client.on_connect = on_connect
client.on_message = on_message

# Connect to the MQTT broker running on the same server
client.connect("mosquitto", 1883, 60)

# Start the loop to process network traffic and dispatch callbacks
client.loop_forever()