import os
from openai import OpenAI
from dotenv import load_dotenv
import json
from collections import defaultdict

# Load environment variables
load_dotenv(".env")

client = OpenAI(api_key=os.getenv("OPENAI-API-KEY"))
PROMPT = "Your task is to extract specific feedback segments from construction reviews and categorize them precisely.\nGuidelines:\n1. Analyze each review thoroughly to identify all relevant construction categories mentioned\n2. Extract complete phrases or sentences that relate to each category\n3. Be precise - only include text that directly relates to the category\n4. Maintain original wording - don't paraphrase or summarize\n5. If a comment relates to multiple categories, duplicate it for each relevant category\n6. For general comments that don't fit specific categories, include them under 'overall' \n7. Never invent information - only extract what's explicitly stated or clearly implied\n\nConstruction Knowledge:\n- Understand technical terms for all trades (electrical, plumbing, HVAC, etc.)\n- Recognize quality indicators (workmanship, materials, compliance)\n- Identify project management aspects (timeliness, budgeting, communication)\n- Spot safety and cleanliness observations\n\nOutput Requirements:\n- Respond with perfect JSON matching the provided schema\n- Use only the categories provided in the schema\n- Include all relevant text segments\n- Never return empty categories"

def process_review(review_text):
    """Process a single review using the new API format with JSON schema"""
    
    try:
        # Fixed API call format to use the correct parameters
        response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            { "role": "system", "content": [{"text": PROMPT, "type": "text"}]},
            {"role": "user","content": [{"text": review_text, "type": "text"}]}
        ],
        response_format={"type": "text"},
        temperature=1,
        max_completion_tokens=2048,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        store=True
        )
        result = json.loads(response.choices[0].message.content)
        return(result)
        
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        return {"overall": review_text}
    


BATCH_PROMPT = """Your task is to analyze multiple construction reviews and extract specific feedback segments for each review.
For each review, categorize the feedback into appropriate construction categories.

Guidelines:
1. Process each review independently
2. Extract complete phrases or sentences that relate to each category
3. Be precise - only include text that directly relates to the category
4. Maintain original wording - don't paraphrase or summarize
5. If a comment relates to multiple categories, duplicate it for each relevant category
6. For general comments that don't fit specific categories, include them under 'overall'
7. Never invent information - only extract what's explicitly stated or clearly implied

Construction Knowledge:
- Understand technical terms for all trades (electrical, plumbing, HVAC, etc.)
- Recognize quality indicators (workmanship, materials, compliance)
- Identify project management aspects (timeliness, budgeting, communication)
- Spot safety and cleanliness observations

Output Requirements:
- Respond with perfect JSON matching the provided schema
- Use only the categories provided in the schema
- Include all relevant text segments
- Never return empty categories

Please analyze each review and provide categorized feedback in the following JSON format:
{{
    "review_1": {{
        "category1": ["phrase1", "phrase2"],
        "category2": ["phrase3"],
        "overall": ["general comment"]
    }},
    "review_2": {{
        ...
    }}
}}"""

"""
Process multiple reviews in a single API call
Returns dict with categories as keys and lists of phrases as values
"""

def process_multiple_reviews(reviews):
    try:
        # Format reviews for the prompt
        formatted_reviews = "\n\n".join([f"Review {i+1}:\n{review}" for i, review in enumerate(reviews)])
        # Make a single API call with all reviews
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": [{"text": BATCH_PROMPT, "type": "text"}]},
                {"role": "user", "content": [{"text": formatted_reviews, "type": "text"}]}
            ],
            response_format={"type": "text"}, temperature=1, max_completion_tokens=4096, top_p=1, frequency_penalty=0, presence_penalty=0, store=True
        )
        
        # Parse the response
        result = json.loads(response.choices[0].message.content)
        
        # Aggregate results across all reviews
        aggregated_results = defaultdict(list)
        
        # Process each review's results
        for review_key, categories in result.items():
            for category, phrases in categories.items():
                if isinstance(phrases, str):
                    aggregated_results[category].append(phrases)
                elif isinstance(phrases, list):
                    aggregated_results[category].extend(phrases)
                else:
                    print(f"Warning: Unexpected type for category {category} in {review_key}: {type(phrases)}")
                    continue
        
        return dict(aggregated_results)
        
    except Exception as e:
        print(f"Error processing reviews: {str(e)}")
        # Fallback: if batch processing fails, process reviews individually
        aggregated_results = defaultdict(list)
        for review in reviews:
            try:
                segments = process_review(review)
                for category, phrases in segments.items():
                    if isinstance(phrases, str):
                        aggregated_results[category].append(phrases)
                    else:
                        aggregated_results[category].extend(phrases)
            except Exception as e:
                print(f"Error processing review: {str(e)}")
                aggregated_results["overall"].append(review)
        return dict(aggregated_results)

