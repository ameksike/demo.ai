
## Install Linux

```shell
## download tje installer 
wget https://ollama.ai/install.sh

## provide execution permissions
chmod +x install.sh

## run the installer
./install.sh

## check the service
systemctl status ollama

```

```shell
cat /etc/systemd/system/ollama.service.d/override.conf 
```
```
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
```

## Common options 

```shell
## list all models 
ollama list

## download qwen-2.5-7b model
ollama pull qwen-2.5-7b

## download and run model: aispin/qwen2.5-7b-instruct-abliterated-v2.q4_k_s.gguf
ollama run aispin/qwen2.5-7b-instruct-abliterated-v2.q4_k_s.gguf
ollama run llama3.1

## run the http server 
ollama serve # --port 8080
```

### Server management
```shell
# Detener el servicio
sudo systemctl stop ollama
# Iniciar el servicio
sudo systemctl start ollama
# Ver los logs
journalctl -u ollama
```

### Models Path
- `C:\Users\<USER>\.ollama\models`

## References
- [ollama](https://ollama.com/download)
- [Tool support](https://ollama.com/blog/tool-support)
- 