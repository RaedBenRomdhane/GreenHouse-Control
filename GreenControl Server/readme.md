
# 🌐 Green Control Server  

**Green Control Server** is the core of the greenhouse monitoring system. It connects the mobile app to the internal and external PCBs, facilitating real-time data exchange and remote control of greenhouse operations.

---

## 🛠️ Features  

- **Data Aggregation**: Collects and processes data from internal and external PCBs.  
- **Threshold Management**: Syncs threshold adjustments from the mobile app to the PCBs.  
- **Alerts**: Notifies the mobile app of extreme environmental conditions.  
- **Action Dispatch**: Sends control commands to the PCBs based on app inputs or automated decisions.  
- **Energy Optimization**: Ensures minimal energy usage by leveraging external conditions when suitable.  

---

## 🚀 Getting Started  

### Prerequisites  

Ensure you have the following installed:  
- [Docker](https://www.docker.com/)  
- [Docker Compose](https://docs.docker.com/compose/)  

---

### Run the Server  

1. Clone this repository:  

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Build and start the Docker containers:  

   ```bash
   docker-compose up --build
   ```

3. The server will be accessible at `http://localhost:<port>` (replace `<port>` with the specified port in the `docker-compose.yml` file).  

---

## 📂 File Structure  

- **`src/`**: Contains the server source code (APIs, database handlers, etc.).  
- **`Dockerfile`**: Defines the server's Docker image.  
- **`docker-compose.yml`**: Sets up the multi-container application.  

---

## 🐳 Dockerization Details  

- **Base Image**: The server uses `node:lts` for running a Node.js application.  
- **Environment Variables**:  
  - `PCB_INTERNAL_URL`: URL for the internal PCB communication.  
  - `PCB_EXTERNAL_URL`: URL for the external PCB communication.  
  - `MOBILE_APP_URL`: URL for the mobile app communication.  
- **Volume Mounts**: Mounts the source code directory for live updates during development.  

---

## 🌱 Server Workflow  

1. **Data Flow**:  
   - The internal PCB sends greenhouse data (e.g., temperature, humidity, soil moisture) to the server.  
   - The external PCB sends outdoor environmental data (e.g., temperature, humidity, air quality).  
   - The server processes and compares these data points to determine optimal actions.  

2. **Mobile App Integration**:  
   - Users can adjust thresholds and monitor conditions via the app.  
   - The server syncs changes between the app and the PCBs.  

3. **Control Commands**:  
   - Based on thresholds and conditions, the server sends commands to the internal PCB to activate ventilation, heating, cooling, or irrigation.  
