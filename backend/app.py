from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from Transcribe import Transcribe
import pickle 
import re
import nltk
import os
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()


# client=os.path.join(os.getcwd(),"..","app","dist")


app = Flask(__name__)
CORS(app)


def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    tokens = [lemmatizer.lemmatize(word) for word in text.split() if word not in stop_words]
    return ' '.join(tokens)


# @app.route("/",defaults={"filename":""})
# @app.route("/<path:filename>")
# def index(filename):
#     if not filename:
#         filename="index.html"
#     return send_from_directory(client,filename)

@app.post('/predict')
def predict():
    with open('svm_model.pkl', 'rb') as model_file:
        model = pickle.load(model_file)
    with open('tfidf_vectorizer.pkl', 'rb') as vectorizer_file:
        tfidf = pickle.load(vectorizer_file)
        
    input_text = request.json.get("input")
    if not input_text:
        return jsonify({"error": "No input text provided"}), 400
    
    processed_text = preprocess_text(input_text)
    vectorized_text = tfidf.transform([processed_text])
    prediction = model.predict(vectorized_text)
    return jsonify({"prediction": prediction[0]})

@app.post('/audio/convert')
def audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    audiofile = request.files['audio']
    audiopath = './audios/' + audiofile.filename
    audiofile.save(audiopath)
    return {"text": Transcribe(audiopath)}

@app.get('/test')
def test():
    return "hi"


if __name__ == "__main__":
    app.run(debug=True)