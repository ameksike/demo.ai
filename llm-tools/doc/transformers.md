
## Transformers Python 

```shell
pip install transformers torch
pip install -r requirements.txt
python src/Transformers.py
```

From transformers import pipeline

```py
# Allocate a pipeline for sentiment-analysis
pipe = pipeline('sentiment-analysis')

out = pipe('I love transformers!')
# [{'label': 'POSITIVE', 'score': 0.999806941}]
```

Create a REST API with FastAPI

```shell
pip install fastapi
python src/FastAPI.py
wget http://localhost:8000/docs
```

## Transformers.js

Run 🤗 Transformers directly in your browser, with no need for a server!

HuggingFace Transformers.js is a JavaScript library that lets you run pretrained models locally on your machine. The library uses onnxruntime to leverage the CPU/GPU capabilities of your hardware.

Transformers.js is designed to be functionally equivalent to Hugging Face’s transformers python library, meaning you can run the same pretrained models using a very similar API. These models support common tasks in different modalities, such as:

- 📝 Natural Language Processing: text classification, named entity recognition, question answering, language modeling, summarization, translation, multiple choice, and text generation.
- 🖼️ Computer Vision: image classification, object detection, segmentation, and depth estimation.
- 🗣️ Audio: automatic speech recognition, audio classification, and text-to-speech.
- 🐙 Multimodal: embeddings, zero-shot audio classification, zero-shot image classification, and zero-shot object detection.

Transformers.js uses ONNX Runtime to run models in the browser. The best part about it, is that you can easily convert your pretrained PyTorch, TensorFlow, or JAX models to ONNX using 🤗 Optimum.

```shell
npm i @huggingface/transformers
```

## References 
- [Huggingface Transformers](https://huggingface.co/docs/transformers/index)
- [Transformers.js Docs](https://huggingface.co/docs/transformers.js/index)
- [Transformers Guides](https://microsoft.github.io/genaiscript/guides/transformers-js/)