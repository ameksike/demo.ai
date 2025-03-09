from pymongo import MongoClient
import requests

database_uri = "mongodb+srv://adm:-@cluster0.b4znk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
embbeding_key = "-"
embbeding_url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"

client = MongoClient(database_uri)

def generate_embedding(text: str) -> list[float]:
    try:
        response = requests.post(embbeding_url, headers={"Authorization": f"Bearer {embbeding_key}"}, json={"inputs": text})	
        
        if response.status_code != 200:
            raise Exception("The request failed with status code: ", response.status_code)

        return response.json()

    except Exception as e:
        raise Exception("Error: ", e)
    
def train_model(movies):
    # Generate an embedding for a given text
    for doc in movies.find({ "plot": { "$exists": True } }).limit(50):	
        doc["plot_embedding_hf"] = generate_embedding(doc["plot"])
        movies.replace_one({"_id": doc["_id"]}, doc)

try:
    database = client.get_database("sample_mflix")
    movies = database.get_collection("movies")

    # Generate an embedding for a given text
    train_model(movies)

    # Query for a movie that has the title 'Back to the Future'
    query = {"title": "Back to the Future"}
    movie = movies.find_one(query)
    print(movie)

    # Close the connection
    client.close()

except Exception as e:
    raise Exception("Unable to find the document due to the following error: ", e)
