Vosk is a speech recognition toolkit. The best things in Vosk are:

1. Supports 20+ languages and dialects - English, Indian English, German, French, Spanish, Portuguese, Chinese, Russian, Turkish, Vietnamese, Italian, Dutch, Catalan, Arabic, Greek, Farsi, Filipino, Ukrainian, Kazakh, Swedish, Japanese, Esperanto, Hindi, Czech, Polish, Uzbek, Korean, Breton, Gujarati, Tajik, Telugu. More to come.
2. Works offline, even on lightweight devices - Raspberry Pi, Android, iOS
3. Installs with simple pip3 install vosk
4. Portable per-language models are only 50Mb each, but there are much bigger server models available.
5. Provides streaming API for the best user experience (unlike popular 6. speech-recognition python packages)
6. There are bindings for different programming languages, too - java/csharp/javascript etc.
8. Allows quick reconfiguration of vocabulary for best accuracy.
Supports speaker identification beside simple speech recognition.

## Quick start

```shell
npm install vosk
```

## Server & Docker 
```shell
docker run -d -p 2700:2700 alphacep/kaldi-en:latest
```

You can also run the docker with your own model
```shell
docker run -d -p 2700:2700 -v /opt/model:/opt/vosk-model-en/model alphacep/kaldi-en:latest
```

To test the server run the example script:

```shell
git clone https://github.com/alphacep/vosk-server
cd vosk-server/websocket
./test.py test.wav
```

## Reference
- [Vosk Install](https://alphacephei.com/vosk/install) 
- [How to use vosk to do offline speech recognition with python](https://www.youtube.com/watch?v=Itic1lFc4Gg&feature=youtu.be)