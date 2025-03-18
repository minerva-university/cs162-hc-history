from dotenv import load_dotenv
import os
import openai

def test_openai_key():
    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("❌ No OpenAI API key found in .env file")
        return
    
    try:
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say hello!"}]
        )
        print("✅ OpenAI API key is valid and working!")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ Error testing OpenAI API key: {str(e)}")

if __name__ == "__main__":
    test_openai_key() 