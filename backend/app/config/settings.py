from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    APP_NAME = "AI Restaurant Assistant"

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    SUPABASE_URL = os.getenv("SUPABASE_URL")

    SUPABASE_SERVICE_ROLE_KEY = os.getenv(
        "SUPABASE_SERVICE_ROLE_KEY"
    )

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000"
    )


settings = Settings()