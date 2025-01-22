
### Install 
```shell
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
mkdir build
cd build
cmake .. && cmake --build .
cmake --build . --config Release
```

### Run
```shell
llama-cli -m ./Qwen2.5-7B-Instruct-Q4_K_M.gguf -p "¿Qué es la inteligencia artificial?"
```

```shell
llama-server --port 8088 -m C:\Users\user\.lmstudio\models\lmstudio-community\Qwen2.5-7B-Instruct-GGUF\Qwen2.5-7B-Instruct-Q4_K_M.gguf

# There is not support native for Tool Calls
# version: 4508 (a1649cc1)
# built with MSVC 19.29.30157.0 for x64
# main: server is listening on http://127.0.0.1:8088 - starting the main loop
# srv  update_slots: all slots are idle
# got exception: {"code":500,"message":"Unsupported param: tools","type":"server_error"}
```

## Make
- [CMake](https://cmake.org/download/)
- [MSYS2](https://www.msys2.org/): MSYS2 es una colección de herramientas Unix para Windows. Incluye make y otras utilidades.
    ```batch
    C:\msys64\msys2.exe
        >> pacman -Syu
        >> pacman -Su
        >> pacman -S make
    C:\msys64\usr\bin\make.exe --version
    ```

## References 
- [Running Meta Llama on Windows](https://www.llama.com/docs/llama-everywhere/running-meta-llama-on-windows/)
- [Cómo instalar llama.cpp en Windows y ejecutar en bajos recursos](https://www.youtube.com/watch?v=1dkmKt1PDoI)