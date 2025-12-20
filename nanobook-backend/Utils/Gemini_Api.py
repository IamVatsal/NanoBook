import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# --- INITIALIZATION ---
# Load environment variables from a .env file
load_dotenv()

# --- GEMINI API CONFIGURATION ---
try:
    # Configure the Gemini API with the key from environment variables
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables. Please create a .env file and add it.")
    genai.configure(api_key=gemini_api_key)
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    # You might want to exit or handle this more gracefully
    # For this example, we'll let it proceed and fail on the API call

def call_gemini_api(prompt):
    """
    Calls the Gemini API with the given prompt and returns the response.
    """
    try:
        # Initialize the specific Gemini model we want to use
        model = genai.GenerativeModel('gemini-2.0-flash-lite')

        # Start a chat session
        chat_session = model.start_chat()

        # Generate content based on the prompt
        response = chat_session.send_message(prompt)

        return response.text

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# --- MAIN EXECUTION ---
if __name__ == '__main__':
    prompt = """
    How to make a perfect cup of tea?
    """
    response = call_gemini_api(prompt)
    # Load existing responses if the file exists
    responses = []
    prompts = []
    if os.path.exists("gemini_response.json"):
        with open("gemini_response.json", "r") as f:
            try:
                data = json.load(f)
                if isinstance(data.get("response"), list):
                    responses = data["response"]
                elif isinstance(data.get("response"), str):
                    responses = [data["response"]]
                if isinstance(data.get("prompt"), list):
                    prompts = data["prompt"]
                elif isinstance(data.get("prompt"), str):
                    prompts = [data["prompt"]]
            except Exception:
                pass

    # Append the new response and prompt
    responses.append(response)
    prompts.append(prompt)

    # Save all responses and prompts back to the file
    with open("gemini_response.json", "w") as f:
        json.dump({"prompt": prompts, "response": responses}, f, indent=4)
    print("Gemini API Response:")
    print(response)