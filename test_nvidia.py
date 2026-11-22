
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv(override=True)

# Create NVIDIA API client
client = OpenAI(
    base_url=os.getenv("NVIDIA_BASE_URL"),
    api_key=os.getenv("NVIDIA_API_KEY")
)

# Send request to Nemotron
try:
    response = client.chat.completions.create(
        model=os.getenv("NVIDIA_CHAT_MODEL"),
        messages=[
            {
                "role": "user",
                "content": "Hello! Introduce yourself in one sentence."
            }
        ],
        temperature=0.6,
        max_tokens=500,
        extra_body={
            "chat_template_kwargs": {
                "enable_thinking": False
            }
        }
    )

    print("\nAssistant:")
    print(response.choices[0].message.content)

    print("\nFinish reason:")
    print(response.choices[0].finish_reason)

except Exception as e:
    print("API Error:", str(e))
