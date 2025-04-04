import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np

# Load pre-trained sentiment analysis model
sentiment_tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
sentiment_model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")

# """
# Performs sentiment analysis on a given text using the Cardiff NLP sentiment model.

# Parameters:
#     text (str): The text to analyze.

# Returns:
#     tuple: (Sentiment label, confidence score)
# """

def analyze_sentiment(text):
    inputs = sentiment_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = sentiment_model(**inputs)
    scores = torch.nn.functional.softmax(outputs.logits, dim=1).detach().numpy()[0]

    # Sentiment categories: ['negative', 'neutral', 'positive']
    labels = ["negative", "neutral", "positive"]
    
    # Get all scores for detailed analysis
    sentiment_scores = {
        "negative": round(float(scores[0]) * 100, 2),
        "neutral": round(float(scores[1]) * 100, 2),
        "positive": round(float(scores[2]) * 100, 2)
    }
    
    # Determine which sentiment has the highest score
    dominant_sentiment = labels[np.argmax(scores)]

    return sentiment_scores, dominant_sentiment

# """
# Analyzes sentiment for each category in the segmented reviews and aggregates results.
# Handles cases where each category may contain a list of sentences.

# Parameters:
#     segmented_reviews (dict): A dictionary containing categorized review segments.
#     Format: {
#         "category1": ["sentence1", "sentence2"],
#         "category2": ["sentence3"]
#     }

# Returns:
#     dict: A nested dictionary with detailed sentence-level analysis and category summaries
#     Format: {
#         "detailed": {
#             "category1": {
#                 "s1": {"positive": 20.0, "neutral": 50.0, "negative": 30.0},
#                 "s2": {"positive": 40.0, "neutral": 30.0, "negative": 30.0}
#             },
#             "category2": {...}
#         },
#         "summary": {
#             "category1": {"positive": 66.7, "neutral": 0.0, "negative": 33.3},
#             "category2": {...}
#         },
#         "original_sentences": {
#             "category1": ["sentence1", "sentence2"],
#             "category2": ["sentence3"]
#         }
#     }
# """

def calculate_sentiment(segmented_reviews):
    # For detailed sentence-level analysis
    detailed_results = {}
    
    # For category summary stats
    category_summary = {}
    
    # Store original sentences
    original_sentences = {}
    
    # Handle the case where segmented_reviews is directly a dictionary of categories
    if all(isinstance(value, list) for value in segmented_reviews.values()):
        categories_dict = segmented_reviews
        
        for category, texts in categories_dict.items():
            if category not in detailed_results:
                detailed_results[category] = {}
                category_summary[category] = {"positive": 0, "neutral": 0, "negative": 0, "total": 0}
                original_sentences[category] = texts  # Store original sentences
            
            # Process each text in the list for this category
            for i, text in enumerate(texts):
                sentence_key = f"s{i+1}"
                sentiment_scores, dominant_sentiment = analyze_sentiment(text)
                
                # Store detailed sentence-level scores
                detailed_results[category][sentence_key] = sentiment_scores
                
                # Count dominant sentiment for category summary
                category_summary[category][dominant_sentiment] += 1
                category_summary[category]["total"] += 1
    else:
        # Original format: iterate over reviews and their categorized segments
        for review_id, categories in segmented_reviews.items():
            for category, text_content in categories.items():
                if category not in detailed_results:
                    detailed_results[category] = {}
                    category_summary[category] = {"positive": 0, "neutral": 0, "negative": 0, "total": 0}
                    original_sentences[category] = []
                
                # Handle both string and list of strings
                if isinstance(text_content, list):
                    # Store original sentences
                    original_sentences[category] = text_content
                    
                    # Process each text in the list
                    for i, text_item in enumerate(text_content):
                        sentence_key = f"s{i+1}"
                        sentiment_scores, dominant_sentiment = analyze_sentiment(text_item)
                        
                        # Store detailed sentence-level scores
                        detailed_results[category][sentence_key] = sentiment_scores
                        
                        # Count dominant sentiment for category summary
                        category_summary[category][dominant_sentiment] += 1
                        category_summary[category]["total"] += 1
                else:
                    # Process a single string
                    sentence_key = "s1"
                    sentiment_scores, dominant_sentiment = analyze_sentiment(text_content)
                    
                    # Store the original text
                    original_sentences[category] = [text_content]
                    
                    # Store detailed sentence-level scores
                    detailed_results[category][sentence_key] = sentiment_scores
                    
                    # Count dominant sentiment for category summary
                    category_summary[category][dominant_sentiment] += 1
                    category_summary[category]["total"] += 1

    # Calculate percentage distribution of dominant sentiments per category
    category_percentages = {}
    for category, counts in category_summary.items():
        total = counts.pop("total")
        if total > 0:
            category_percentages[category] = {
                sentiment: round((count / total) * 100, 1) 
                for sentiment, count in counts.items()
            }
        else:
            category_percentages[category] = {
                "positive": 0.0, "neutral": 0.0, "negative": 0.0
            }

    # Return both detailed and summary results, plus original sentences
    return {
        "detailed": detailed_results,
        "summary": category_percentages,
        "original_sentences": original_sentences
    }

