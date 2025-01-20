
## Run
- python src/server.py
- http://localhost:8000/docs

- llama-cli -m ./Qwen2.5-7B-Instruct-Q4_K_M.gguf -p "¿Qué es la inteligencia artificial?"
- llama-server --port 8088 -m C:\Users\user\.lmstudio\models\lmstudio-community\Qwen2.5-7B-Instruct-GGUF\Qwen2.5-7B-Instruct-Q4_K_M.gguf

## llama.cpp
- git clone https://github.com/ggerganov/llama.cpp
- cd llama.cpp
- mkdir build
- cd build
- cmake .. && cmake --build .
- cmake --build . --config Release

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