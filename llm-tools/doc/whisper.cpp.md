
## Quick start
```shell
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
# build the project
cmake -B build
cmake --build build --config Release
```

# transcribe an audio file
```shell
./build/bin/whisper-cli -f samples/jfk.wav  
```

## References 
- [Convertir de voz a texto con Whisper.cpp. En local y sin necesidad de tener una GPU](https://www.youtube.com/watch?v=uQEJHkezHwA)
- [Github Whisper.cpp](https://github.com/ggerganov/whisper.cpp)