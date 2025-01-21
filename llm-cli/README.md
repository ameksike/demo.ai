

## Python Approach
- FastAPI
    - pip install fastapi
    - python src/FastAPI.py
    - http://localhost:8000/docs

- Langchain
    - pip install langchain
    - python src/Langchain.py

- Transformers
    - pip install transformers torch
    - pip install -r requirements.txt
    - python src/Transformers.py


## Text Generation Webui
- https://github.com/oobabooga/text-generation-webui
- git clone https://github.com/oobabooga/text-generation-webui.git
- cd text-generation-webui
- 

## llama C++
- git clone https://github.com/ggerganov/llama.cpp
- cd llama.cpp
- mkdir build
- cd build
- cmake .. && cmake --build .
- cmake --build . --config Release
- run
    - llama-cli -m ./Qwen2.5-7B-Instruct-Q4_K_M.gguf -p "¿Qué es la inteligencia artificial?"
    - llama-server --port 8088 -m C:\Users\user\.lmstudio\models\lmstudio-community\Qwen2.5-7B-Instruct-GGUF\Qwen2.5-7B-Instruct-Q4_K_M.gguf
        ```
        main: server is listening on http://127.0.0.1:8088 - starting the main loop
        srv  update_slots: all slots are idle
        got exception: {"code":500,"message":"Unsupported param: tools","type":"server_error"}
        ```

## Make
- [CMake](https://cmake.org/download/)
    - 
- [MSYS2](https://www.msys2.org/): MSYS2 es una colección de herramientas Unix para Windows. Incluye make y otras utilidades.
    - C:\msys64\msys2.exe
        - pacman -Syu
        - pacman -Su
        - pacman -S make
    - C:\msys64\usr\bin\make.exe --version

## References
- [Codificador de Qwen 2.5](https://www.datacamp.com/es/tutorial/qwen-coder-2-5?dc_referrer=https%3A%2F%2Fwww.google.com%2F)
- [Running Meta Llama on Windows](https://www.llama.com/docs/llama-everywhere/running-meta-llama-on-windows/)
- [ollama](https://ollama.com/download)
- [Langchain](https://python.langchain.com/docs/integrations/chat/ollama/)
- [Cómo instalar llama.cpp en Windows y ejecutar en bajos recursos](https://www.youtube.com/watch?v=1dkmKt1PDoI)
- [Huggingface](https://huggingface.co/models?sort=modified&search=ggml)