import os
import json
from google import genai
from dotenv import load_dotenv

# --- INITIALIZATION ---
# Load environment variables from a .env file
load_dotenv()

# --- GEMINI API FUNCTION ---
def call_gemini_api(prompt):
    """
    Calls the Gemini API with the given prompt and returns the response
    using the updated google-genai SDK.
    """
    try:
        # 1. Retrieve API Key
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables.")
        
        # 2. Initialize Client
        client = genai.Client(api_key=gemini_api_key)

        # 3. Generate Content
        # Note: 'gemini-2.0-flash-lite' is often a preview model. 
        # If this ID fails, try 'gemini-2.0-flash' or 'gemini-2.0-flash-lite-preview-02-05'
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite', 
            contents=prompt
        )

        # 4. Return text
        return response.text

    except Exception as e:
        print(f"An error occurred calling Gemini API: {e}")
        return None

# --- MAIN EXECUTION ---
if __name__ == '__main__':
    prompt = """
    How to make a perfect cup of tea?
    """
    
    # Call the API
    response_text = call_gemini_api(prompt)

    if response_text:
        # Load existing responses if the file exists
        responses = []
        prompts = []
        file_name = "gemini_response.json"

        if os.path.exists(file_name):
            try:
                with open(file_name, "r") as f:
                    data = json.load(f)
                    
                    # Safely handle potential list/string mismatches from previous runs
                    existing_responses = data.get("response", [])
                    existing_prompts = data.get("prompt", [])

                    responses = existing_responses if isinstance(existing_responses, list) else [existing_responses]
                    prompts = existing_prompts if isinstance(existing_prompts, list) else [existing_prompts]
            except Exception as e:
                print(f"Warning: Could not read existing JSON ({e}). Starting fresh.")

        # Append the new response and prompt
        responses.append(response_text)
        prompts.append(prompt)

        # Save all responses and prompts back to the file
        try:
            with open(file_name, "w") as f:
                json.dump({"prompt": prompts, "response": responses}, f, indent=4)
            print("Successfully saved to gemini_response.json")
        except Exception as e:
            print(f"Error saving JSON file: {e}")

        print("\nGemini API Response:")
        print(response_text)
    else:
        print("Failed to get a response.")