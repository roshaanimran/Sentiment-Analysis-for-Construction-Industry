from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename
from segmentor import process_multiple_reviews, process_review
from sentiment_analyzer import calculate_sentiment
import pandas as pd

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'txt', 'csv', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')


    """
    API endpoint to analyze a single review by segmenting it into categories 
    and performing sentiment analysis on each segment.
    
    Expected input:
    {
        "review": "The construction went well, however there are errors in the wiring and plastering."
    }
    
    Returns:
    {
        "electrical": {"positive": 0.0, "neutral": 0.0, "negative": 100.0},
        "plastering": {"positive": 0.0, "neutral": 0.0, "negative": 100.0},
        "overall": {"positive": 90.0, "neutral": 0.0, "negative": 10.0}
    }
    """

@app.route('/analyze_review', methods=['POST'])
def analyze_review():
    data = request.json
    review = data.get("review", "")

    if not review:
        return jsonify({"error": "No review text provided."}), 400

    # Step 1: Segment the review into categories
    segmented_review = process_review(review)

    # Step 2: Perform sentiment analysis
    sentiment_results = calculate_sentiment(segmented_review)

    return jsonify(sentiment_results)

    """
    API endpoint to analyze **multiple reviews** from an uploaded XLSX file.

    Expected input: An XLSX file with a column named 'review'.
    """

@app.route('/analyze_reviews_from_file', methods=['POST'])
def analyze_reviews_from_file():

    if 'file' not in request.files:
        return jsonify({"error": "No file provided."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected."}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": f"File format not allowed. Please use one of: {', '.join(ALLOWED_EXTENSIONS)}"}), 400
    
    try:
        df = pd.read_excel(file)
    except Exception as e:
        return jsonify({"error": f"Error reading file: {str(e)}"}), 400
    if 'review' not in df.columns:
        return jsonify({"error": "Missing 'review' column in the file."}), 400
    reviews = df['review'].dropna().tolist()
    if not reviews:
        return jsonify({"error": "No valid reviews found in the file."}), 400
    
    # Process multiple reviews
    segmented_reviews = process_multiple_reviews(reviews)
    # Perform sentiment analysis
    sentiment_results = calculate_sentiment(segmented_reviews)
    return jsonify(sentiment_results)

if __name__ == '__main__':
    app.run(debug=True)
