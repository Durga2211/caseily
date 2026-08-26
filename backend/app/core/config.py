from dotenv import load_dotenv
import os
load_dotenv()
SHIP24_API_KEY = os.getenv("SHIP24_API_KEY", "YOUR_SHIP24_API_KEY")