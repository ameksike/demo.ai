
### Install 
```shell
- git clone https://github.com/oobabooga/text-generation-webui.git
- cd text-generation-webui
- start_windows.bat
- start_linux.sh
```

### Download Model 
```shell
# python download-model.py organization/model
python download-model.py Manel/Llama-2-13b-chat-hf-Q4_K_M-GGUF
```

### Model Path
```
text-generation-webui
└── models
    └── llama-2-13b-chat.Q4_K_M.gguf
```

### Run 
- `http://localhost:7860`
- `http://127.0.0.1:7860/v1/models`


## References 
- [Github Project](https://github.com/oobabooga/text-generation-webui)