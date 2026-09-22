import os

from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

def main():
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "Missing API key. Set GOOGLE_API_KEY or GEMINI_API_KEY in your environment or .env file."
        )

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    response = model.generate_content("Say hello in one short sentence.")
    print(response.text)

if __name__ == "__main__":
    main()
