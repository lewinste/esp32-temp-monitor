# WiFi Configuration
WIFI_SSID = "YOUR_WIFI_SSID"
WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"

# DS18B20 Sensor Configuration
SENSOR_PIN = 22  # GPIO pin connected to DS18B20 data line (GPIO 4 is used by OLED on Heltec V2)

# Reading interval in seconds
READ_INTERVAL = 10

# History duration in seconds (1 day = 86400 seconds)
HISTORY_DURATION = 86400

# Maximum number of readings to store (86400 / 10 = 8640)
MAX_READINGS = HISTORY_DURATION // READ_INTERVAL

# Web server port
WEB_PORT = 80
