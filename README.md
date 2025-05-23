# AI-Based Construction Review Sentiment Analysis

A web-based application that uses NLP and transformer-based models to analyze sentiment in construction reviews, categorize feedback, and visualize results with interactive charts.

![Sentiment Analysis Dashboard](https://via.placeholder.com/800x400?text=Construction+Review+Sentiment+Analysis)

## Features

- **Multi-level Sentiment Analysis**: Analyzes sentiment at both category and sentence level
- **Interactive Visualizations**: Presents sentiment distribution using interactive pie charts
- **Detailed Sentence Breakdown**: Shows sentiment scores for each sentence with original text
- **Multiple Input Options**: Accepts both single reviews and bulk analysis via Excel files
- **Categorized Feedback**: Automatically extracts and categorizes feedback into relevant construction domains
- **Responsive Design**: Works seamlessly across devices of all sizes

## How It Works

The application performs sentiment analysis on construction reviews through several steps:

1. **Text Segmentation**: Reviews are processed using GPT-4 to extract and categorize specific feedback segments
2. **Sentiment Classification**: Each segment is analyzed using a RoBERTa-based sentiment model
3. **Category Aggregation**: Results are aggregated at the category level
4. **Visualization**: Interactive charts display sentiment distribution across categories
5. **Detailed Analysis**: Accordion displays provide sentence-level sentiment breakdown

## Installation

### Prerequisites

- Python 3.8+
- Flask
- PyTorch
- Transformers
- OpenAI API key (for segmentation)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Ai-Based-Sentiment-Analysis.git
   cd Ai-Based-Sentiment-Analysis
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env.local` file in the project root with your OpenAI API key:
   ```
   OPENAI-API-KEY=your_api_key_here
   ```

5. Run the application:
   ```bash
   flask run --debug
   ```

6. Open your browser and navigate to `http://localhost:5000`

## Usage

### Single Review Analysis

1. Select the "Single Review" option
2. Enter a construction review in the text box
3. Click "Analyze"
4. View results in the interactive dashboard

### Batch Analysis via Excel

1. Select the "Upload Excel File" option
2. Prepare an Excel file with a column named 'review'
3. Upload the file
4. Click "Analyze File"
5. View aggregated results in the dashboard

## Interpreting Results

### Category Sentiment Summary

The pie charts show the sentiment distribution for each construction category:
- **Green** segments represent positive sentiment
- **Yellow** segments represent neutral sentiment
- **Red** segments represent negative sentiment

The dominant sentiment for each category is displayed beneath the chart.

### Detailed Sentence Analysis

Click on any category in the accordion to see detailed sentiment analysis for each sentence:
- Each sentence is displayed with its exact text
- Sentiment scores (positive, neutral, negative) are shown as percentages
- Color-coded borders indicate the dominant sentiment
- A badge in the bottom-right shows the dominant sentiment

## Technical Architecture

The application consists of three main components:

1. **Segmentation Module (`segmentor.py`)**:
   - Uses OpenAI GPT models to identify and categorize construction feedback
   - Processes single reviews or batches of reviews
   - Extracts exact phrases related to specific construction categories

2. **Sentiment Analysis Module (`sentiment_analyzer.py`)**:
   - Leverages RoBERTa-based models to analyze sentiment
   - Calculates positive, neutral, and negative sentiment scores
   - Aggregates results by category
   - Preserves original sentences for detailed analysis

3. **Web Interface**:
   - Flask-based backend API
   - Responsive Bootstrap frontend
   - Interactive Chart.js visualizations
   - Accordion-based detailed results

## Customization

### Modifying the Prompt

The segmentation prompt can be customized in `segmentor.py` by editing the `PROMPT` variable.

### Styling

Customize the appearance by modifying `static/style.css`.

## API Endpoints

The application exposes two main API endpoints:

1. `/analyze_review` (POST): Analyzes a single review
   - Request body: `{"review": "Your review text here"}`
   - Returns: Sentiment analysis results

2. `/analyze_reviews_from_file` (POST): Analyzes reviews from a file
   - Request body: FormData with a file field
   - Returns: Aggregated sentiment analysis results

## Troubleshooting

### API Quota Issues

If you encounter OpenAI API quota issues, consider:
- Checking your billing status
- Using a different API key
- Reducing the frequency of requests

### Model Loading Errors

If the sentiment model fails to load:
- Ensure PyTorch is properly installed
- Check for sufficient disk space
- Verify internet connectivity for downloading models

## License

[MIT License](LICENSE)

## Acknowledgements

- Hugging Face for transformer models
- OpenAI for GPT API
- Chart.js for interactive visualizations
- Bootstrap for responsive UI components
