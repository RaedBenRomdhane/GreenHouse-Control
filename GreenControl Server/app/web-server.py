from http.server import HTTPServer, BaseHTTPRequestHandler
import json


SHARED_FOLDER = './shared'


def get_recent_data(namef, num_values=100):
    try:
        with open(f'{SHARED_FOLDER}/data-{namef}.json', 'r') as file:
            data = json.load(file)
        
        # Extract the last 'num_values' for each key
        recent_data = {
            'temperatures': [0]+data['temperatures'][-num_values:],
            'humidity': [0]+data['humidity'][-num_values:],
            'ppm': [0]+data['ppm'][-num_values:],
            'time': ["00:00"]+data['time'][-num_values:]
        }
        if namef == "int":
            recent_data = {
                'temperatures': [0]+data['temperatures'][-num_values:],
                'humidity': [0]+data['humidity'][-num_values:],
                'ppm': [0]+data['ppm'][-num_values:],
                'moisture': [0]+data['moisture'][-num_values:],
                'time': ["00:00"]+data['time'][-num_values:]
            }
            
        return recent_data
    
    except FileNotFoundError:
        print("Error: 'data.json' file not found.")
        if namef == "int":
            return {
                    'temperatures':[0],
                    'humidity': [0],
                    'ppm': [0],
                    'moisture': [0],
                    'time': ["00:00"]
                    }
        return {
            'temperatures': [0],
            'humidity': [0],
            'ppm': [0],
            'time': ["00:00"]
        }
    except json.JSONDecodeError:
        print("Error: Invalid JSON file.")
        if namef == "int":
            return {
                    'temperatures':[0],
                    'humidity': [0],
                    'ppm': [0],
                    'moisture': [0],
                    'time': ["00:00"]
                    }
        return {
            'temperatures': [0],
            'humidity': [0],
            'ppm': [0],
            'time': ["00:00"]
        }



class CustomHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Step 1: Get content length from headers
        content_length = int(self.headers.get('Content-Length', 0))
        
        # Step 2: Read the body of the request
        body = self.rfile.read(content_length)
        
        try:
            # Step 3: Parse the JSON data
            data = json.loads(body)
            
            # Step 4: Validate the JSON keys
            required_keys = {"tempmoy", "hummoy", "pollmax", "moistmin"}
            if not required_keys.issubset(data.keys()):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing required keys"}).encode("utf-8"))
                return
            
            # Step 5: Save data to "threshold.json"
            with open(f"{SHARED_FOLDER}/threshold.json", "w") as json_file:
                json.dump(data, json_file, indent=4)
            
            # Step 6: Send a success response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Data saved successfully"}).encode("utf-8"))
        
        except json.JSONDecodeError:
            # Handle JSON parsing errors
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JSON format"}).encode("utf-8"))


    def do_GET(self):
        if self.path.split("?")[0] == '/get_ext_data':
            try:
                
                # Send successful JSON response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(get_recent_data("ext")).encode())
            
            except FileNotFoundError:
                # Handle missing data file
                self.send_error(404, 'Data file not found')
            except json.JSONDecodeError:
                # Handle invalid JSON
                self.send_error(500, 'Error parsing data file')
        
        elif self.path.split("?")[0] == '/get_int_data':
            try:
                # Send successful JSON response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(get_recent_data("int")).encode())
            
            except FileNotFoundError:
                # Handle missing data file
                self.send_error(404, 'Data file not found')
            except json.JSONDecodeError:
                # Handle invalid JSON
                self.send_error(500, 'Error parsing data file')
        
        else:
            # Default 404 for other paths
            self.send_error(404, 'Endpoint not found')

def run_server(port=80):
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, CustomHandler)
    print(f"Server running on port {port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()