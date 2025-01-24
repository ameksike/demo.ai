from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("ruta/a/Qwen2.5-7B-Instruct")
tokenizer = AutoTokenizer.from_pretrained("ruta/a/Qwen2.5-7B-Instruct")

def generate(prompt):
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs)
    return tokenizer.decode(outputs[0])
