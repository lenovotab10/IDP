from flask import Flask, request, jsonify
import pickle 
from flask_cors import CORS
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from Transcribe import Transcribe

app = Flask(__name__)
CORS(app)


with open('svm_model.pkl', 'rb') as model_file:
    model = pickle.load(model_file)
with open('tfidf_vectorizer.pkl', 'rb') as vectorizer_file:
    tfidf = pickle.load(vectorizer_file)

nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    tokens = [lemmatizer.lemmatize(word) for word in text.split() if word not in stop_words]
    return ' '.join(tokens)

@app.post('/predict')
def predict():
    input_text = request.json.get("input")

    if not input_text:
        return jsonify({"error": "No input text provided"}), 400
    
    processed_text = preprocess_text(input_text)
    vectorized_text = tfidf.transform([processed_text])
    prediction = model.predict(vectorized_text)
    # print(f"Input Text: {input_text}\nProcessed Text: {processed_text}\nPrediction: {prediction}")
    return jsonify({"prediction": prediction[0]})

@app.get("/audio/convert")
def test():
    return jsonify({"message": "Hello, World!"})

@app.post('/audio/convert')
def audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    audiofile = request.files['audio']
    audiopath = './audios/' + audiofile.filename
    audiofile.save(audiopath)
    return {"text": Transcribe(audiopath)}
    # return jsonify({"text": "hello"})

if __name__ == "__main__":
    app.run(debug=True,port=5000)
