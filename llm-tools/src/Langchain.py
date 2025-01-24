from langchain import OpenAI, LLMChain
from langchain.tools import Tool

# Define una herramienta
def google_search_tool(query: str) -> str:
    # Aquí podrías usar una API real de búsqueda como Google o Bing
    return f"Buscando: {query}"

tool = Tool(
    name="google_search",
    func=google_search_tool,
    description="Usa esta herramienta para buscar en Google"
)

# Configura el modelo
from langchain.llms import LlamaCpp
llm = LlamaCpp(
    model_path="C:\\Users\\user\\.lmstudio\\models\\lmstudio-community\\Qwen2.5-7B-Instruct-Q4_K_M.gguf"
)

# Crea un LLMChain con herramientas
chain = LLMChain(
    llm=llm,
    tools=[tool]
)

# Ejecuta el modelo con herramientas
response = chain.run("Busca información sobre inteligencia artificial.")
print(response)
