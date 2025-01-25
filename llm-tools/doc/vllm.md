### Install from pip

```shell
# Install vLLM from pip:
pip install vllm

# verify the installation location and version.
pip show vllm

# Load and run the model:
vllm serve "Manel/Llama-2-13b-chat-hf-Q4_K_M-GGUF"

# Call the server using curl:
curl -X POST "http://localhost:8000/v1/completions" \
    -H "Content-Type: application/json" \
    --data '{
        "model": "Manel/Llama-2-13b-chat-hf-Q4_K_M-GGUF",
        "prompt": "Once upon a time,",
        "max_tokens": 512,
        "temperature": 0.5
    }'
```

### Install 

```shell
## This approach modifies the execution policy 
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

## This approach allows you to run the script once without permanently modifying the system-wide policy.
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser -Force ./install.ps1

## Run the FILE
./install.ps1


powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Use Docker images

```shell
# Deploy with docker on Linux:
docker run --runtime nvidia --gpus all \
	--name my_vllm_container \
	-v ~/.cache/huggingface:/root/.cache/huggingface \
 	--env "HUGGING_FACE_HUB_TOKEN=<secret>" \
	-p 8000:8000 \
	--ipc=host \
	vllm/vllm-openai:latest \
	--model Manel/Llama-2-13b-chat-hf-Q4_K_M-GGUF

# Load and run the model:
docker exec -it my_vllm_container bash -c "vllm serve Manel/Llama-2-13b-chat-hf-Q4_K_M-GGUF"

# Call the server using curl:
curl -X POST "http://localhost:8000/v1/completions" \
	-H "Content-Type: application/json" \
	--data '{
		"model": "Manel/Llama-2-13b-chat-hf-Q4_K_M-GGUF",
		"prompt": "Once upon a time,",
		"max_tokens": 512,
		"temperature": 0.5
	}'
```

Start the server with tool calling enabled. This example uses Meta’s Llama 3.1 8B model, so we need to use the llama3 tool calling chat template from the vLLM examples directory:



```shell
vllm serve meta-llama/Llama-3.1-8B-Instruct \
    --enable-auto-tool-choice \
    --tool-call-parser llama3_json \
    --chat-template examples/tool_chat_template_llama3.1_json.jinja
```

Next, make a request to the model that should result in it using the available tools:

```python
from openai import OpenAI
import json

client = OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")

def get_weather(location: str, unit: str):
    return f"Getting the weather for {location} in {unit}..."
tool_functions = {"get_weather": get_weather}

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string", "description": "City and state, e.g., 'San Francisco, CA'"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["location", "unit"]
        }
    }
}]

response = client.chat.completions.create(
    model=client.models.list().data[0].id,
    messages=[{"role": "user", "content": "What's the weather like in San Francisco?"}],
    tools=tools,
    tool_choice="auto"
)

tool_call = response.choices[0].message.tool_calls[0].function
print(f"Function called: {tool_call.name}")
print(f"Arguments: {tool_call.arguments}")
print(f"Result: {get_weather(**json.loads(tool_call.arguments))}")
```

## References 
- [vLLM documentation](https://docs.vllm.ai/en/latest/)
- [Huggingface](https://huggingface.co/Manel/Llama-2-13b-chat-hf-Q4_K_M-GGUF?local-app=vllm)
- [UV: An extremely fast Python package and project manager, written in Rust.](https://docs.astral.sh/uv/)