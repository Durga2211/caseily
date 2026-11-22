from dotenv import load_dotenv
import os
load_dotenv()
TRACKCOURIER_API_KEY = os.getenv("TRACKCOURIER_API_KEY") or os.getenv("SHIP24_API_KEY", "YOUR_SHIP24_API_KEY")
SHIP24_API_KEY = TRACKCOURIER_API_KEY