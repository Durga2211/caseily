from dotenv import load_dotenv
import os
load_dotenv()
SEVENTEEN_TRACK_API_KEY = os.getenv("SEVENTEEN_TRACK_API_KEY")
SEVENTEEN_TRACK_BASE_URL = os.getenv("SEVENTEEN_TRACK_BASE_URL")