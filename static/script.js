document.addEventListener('DOMContentLoaded', function() {
    // Helper function to format sentiment results into HTML with pie charts
    function formatSentimentResults(results) {
        let html = '';
        
        // Category summary section with pie charts
        html += '<h4 class="mb-3">Category Sentiment Summary</h4>';
        
        // Create a grid layout for charts
        html += '<div class="row chart-grid mb-4">';
        
        // Prepare chart configuration and structure
        let chartConfigs = [];
        let chartCounter = 0;
        
        // Process summary results for charts
        for (const [category, sentiments] of Object.entries(results.summary)) {
            // Find dominant sentiment for category
            let dominant = 'neutral';
            let maxScore = -1;
            
            for (const [sentiment, score] of Object.entries(sentiments)) {
                if (score > maxScore) {
                    maxScore = score;
                    dominant = sentiment;
                }
            }
            
            // Generate a unique ID for each chart
            const chartId = `chart-${chartCounter++}`;
            
            // Add a column for this chart
            html += `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0">${category}</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="${chartId}" width="100%" height="250"></canvas>
                        <div class="text-center mt-3">
                            <span class="badge ${dominant === 'positive' ? 'bg-success' : dominant === 'negative' ? 'bg-danger' : 'bg-warning text-dark'}">
                                Dominant: ${dominant.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>`;
            
            // Store the chart configuration for later initialization
            chartConfigs.push({
                id: chartId,
                data: {
                    labels: ['Positive', 'Neutral', 'Negative'],
                    datasets: [{
                        data: [
                            sentiments.positive || 0, 
                            sentiments.neutral || 0, 
                            sentiments.negative || 0
                        ],
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.7)', // green for positive
                            'rgba(255, 193, 7, 0.7)', // yellow for neutral
                            'rgba(220, 53, 69, 0.7)'  // red for negative
                        ],
                        borderColor: [
                            'rgba(40, 167, 69, 1)',
                            'rgba(255, 193, 7, 1)',
                            'rgba(220, 53, 69, 1)'
                        ],
                        borderWidth: 1
                    }]
                }
            });
        }
        
        html += '</div>';
        
        // Detailed sentence analysis section
        html += '<h4 class="mb-3">Detailed Sentence Analysis</h4>';
        
        // Create an accordion for detailed results
        html += '<div class="accordion mb-4" id="detailedAnalysisAccordion">';
        
        let accordionIndex = 0;
        
        // Process detailed results
        for (const [category, sentences] of Object.entries(results.detailed)) {
            accordionIndex++;
            
            // Count the number of sentences in this category
            const sentenceCount = Object.keys(sentences).length;
            
            html += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${accordionIndex}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#collapse${accordionIndex}" aria-expanded="false" aria-controls="collapse${accordionIndex}">
                        ${category} (${sentenceCount} ${sentenceCount === 1 ? 'sentence' : 'sentences'})
                    </button>
                </h2>
                <div id="collapse${accordionIndex}" class="accordion-collapse collapse" 
                    aria-labelledby="heading${accordionIndex}" data-bs-parent="#detailedAnalysisAccordion">
                    <div class="accordion-body">`;
            
            // Get the actual sentence texts from the detailed structure
            // We need to get the original text that corresponds to each s1, s2, etc. key
            // First, let's check if we have the original sentences in the response
            if (results.original_sentences && results.original_sentences[category]) {
                const originalSentences = results.original_sentences[category];
                
                // Process each sentence with its original text
                for (const [sentenceKey, sentimentScores] of Object.entries(sentences)) {
                    // Get the original text for this sentence key (e.g., s1 → original text)
                    // Extract the number from the key (e.g., "s1" → 1)
                    const sentenceIndex = parseInt(sentenceKey.substring(1)) - 1;
                    const sentenceText = originalSentences[sentenceIndex] || "Sentence text not available";
                    
                    // Find dominant sentiment
                    let dominant = 'neutral';
                    let maxScore = -1;
                    
                    for (const [sentiment, score] of Object.entries(sentimentScores)) {
                        if (score > maxScore) {
                            maxScore = score;
                            dominant = sentiment;
                        }
                    }
                    
                    // Color coding based on dominant sentiment
                    let cardClass = '';
                    if (dominant === 'positive') {
                        cardClass = 'border-success';
                    } else if (dominant === 'negative') {
                        cardClass = 'border-danger';
                    } else {
                        cardClass = 'border-warning';
                    }
                    
                    html += `
                    <div class="card mb-3 ${cardClass}">
                        <div class="card-body">
                            <p class="card-text">"${sentenceText}"</p>
                            <div class="d-flex justify-content-between mt-3">
                                <span class="sentiment-positive">Positive: ${sentimentScores.positive.toFixed(1)}%</span>
                                <span class="sentiment-neutral">Neutral: ${sentimentScores.neutral.toFixed(1)}%</span>
                                <span class="sentiment-negative">Negative: ${sentimentScores.negative.toFixed(1)}%</span>
                            </div>
                            <div class="text-end mt-2">
                                <span class="badge ${dominant === 'positive' ? 'bg-success' : dominant === 'negative' ? 'bg-danger' : 'bg-warning text-dark'}">
                                    ${dominant.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>`;
                }
            } else {
                // Fallback to using a regular table if original sentences aren't available
                html += `
                <div class="table-responsive">
                    <table class="table table-sm table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>Sentence</th>
                                <th>Positive</th>
                                <th>Neutral</th>
                                <th>Negative</th>
                                <th>Dominant</th>
                            </tr>
                        </thead>
                        <tbody>`;
                
                // Process each sentence
                for (const [sentenceKey, sentimentScores] of Object.entries(sentences)) {
                    // Find dominant sentiment for sentence
                    let dominant = 'neutral';
                    let maxScore = -1;
                    
                    for (const [sentiment, score] of Object.entries(sentimentScores)) {
                        if (score > maxScore) {
                            maxScore = score;
                            dominant = sentiment;
                        }
                    }
                    
                    // Color coding based on dominant sentiment
                    let rowClass = '';
                    if (dominant === 'positive') {
                        rowClass = 'table-success';
                    } else if (dominant === 'negative') {
                        rowClass = 'table-danger';
                    } else {
                        rowClass = 'table-warning';
                    }
                    
                    html += `<tr class="${rowClass}">
                        <td>${sentenceKey}</td>
                        <td>${sentimentScores.positive.toFixed(1)}%</td>
                        <td>${sentimentScores.neutral.toFixed(1)}%</td>
                        <td>${sentimentScores.negative.toFixed(1)}%</td>
                        <td><strong>${dominant.toUpperCase()}</strong></td>
                    </tr>`;
                }
                
                html += `</tbody>
                    </table>
                </div>`;
            }
            
            html += `</div>
                </div>
            </div>`;
        }
        
        html += '</div>';
        
        // Visualization hint/message
        html += `<div class="alert alert-info">
            <p><strong>How to interpret:</strong></p>
            <ul>
                <li>Pie charts show the sentiment distribution for each category.</li>
                <li>Click on a category in the detailed analysis to see the sentiment breakdown for each individual sentence.</li>
                <li>Green = Positive, Yellow = Neutral, Red = Negative</li>
            </ul>
        </div>`;
        
        // Return the HTML and chart configurations
        return {
            html: html,
            chartConfigs: chartConfigs
        };
    }

    // Toggle between input options
    const singleReviewOption = document.getElementById('singleReviewOption');
    const fileUploadOption = document.getElementById('fileUploadOption');
    const singleReviewSection = document.getElementById('singleReviewSection');
    const fileUploadSection = document.getElementById('fileUploadSection');

    function toggleInputOptions() {
        if (singleReviewOption.checked) {
            singleReviewSection.style.display = 'block';
            fileUploadSection.style.display = 'none';
        } else if (fileUploadOption.checked) {
            singleReviewSection.style.display = 'none';
            fileUploadSection.style.display = 'block';
        }
    }

    // Add event listeners for the radio buttons
    singleReviewOption.addEventListener('change', toggleInputOptions);
    fileUploadOption.addEventListener('change', toggleInputOptions);

    // Initialize display based on current selection
    toggleInputOptions();

    // Function to initialize charts
    function initializeCharts(chartConfigs) {
        // Wait for DOM to be ready
        setTimeout(() => {
            chartConfigs.forEach(config => {
                const ctx = document.getElementById(config.id);
                if (ctx) {
                    new Chart(ctx, {
                        type: 'pie',
                        data: config.data,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        font: {
                                            size: 12
                                        }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return `${context.label}: ${context.raw.toFixed(1)}%`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }, 50);
    }

    // Function to animate results card
    function showResultsCard() {
        const resultsCard = document.getElementById('resultsCard');
        resultsCard.style.display = 'block';
        
        // Trigger reflow to ensure animation works
        void resultsCard.offsetWidth;
        
        // Add show class to start animation
        resultsCard.classList.add('show');
    }

    // Single Review Analysis Form
    const singleReviewForm = document.getElementById('singleReviewForm');
    const singleResultDiv = document.getElementById('singleResult');
    const resultsCard = document.getElementById('resultsCard');
    const resultsContent = document.getElementById('resultsContent');

    if (singleReviewForm) {
        singleReviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading indicator
            singleResultDiv.innerHTML = '<div class="alert alert-info">Analyzing review...</div>';
            
            // Reset results card
            resultsCard.classList.remove('show');
            resultsCard.style.display = 'none';
            
            const reviewText = document.getElementById('review').value.trim();
            
            try {
                // Call the analyze_review endpoint
                const response = await fetch('/analyze_review', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ review: reviewText })
                });

                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }

                const data = await response.json();
                
                // Clear loading indicator from the form result area
                singleResultDiv.innerHTML = '';
                
                // Update the main results card with the formatted results
                const formattedResults = formatSentimentResults(data);
                resultsContent.innerHTML = formattedResults.html;
                showResultsCard();
                
                // Initialize charts
                initializeCharts(formattedResults.chartConfigs);
                
                // Scroll to results
                setTimeout(() => {
                    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            } catch (error) {
                console.error('Error analyzing review:', error);
                singleResultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
                // Hide the main results card if there's an error
                resultsCard.classList.remove('show');
                resultsCard.style.display = 'none';
            }
        });
    }

    // File Upload Analysis Form
    const fileUploadForm = document.getElementById('fileUploadForm');
    const fileResultDiv = document.getElementById('fileResult');

    if (fileUploadForm) {
        fileUploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading indicator
            fileResultDiv.innerHTML = '<div class="alert alert-info">Processing file...</div>';
            
            // Reset results card
            resultsCard.classList.remove('show');
            resultsCard.style.display = 'none';
            
            const fileInput = document.getElementById('file');
            const file = fileInput.files[0];
            
            if (!file) {
                fileResultDiv.innerHTML = '<div class="alert alert-warning">Please select a file.</div>';
                return;
            }
            
            try {
                // Create FormData object
                const formData = new FormData();
                formData.append('file', file);
                
                // Call the analyze_reviews_from_file endpoint
                const response = await fetch('/analyze_reviews_from_file', {
                    method: 'POST',
                    body: formData // No need to set Content-Type header, browser will set it with boundary
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server responded with status: ${response.status}. ${errorText}`);
                }
                
                const data = await response.json();
                
                // Clear loading indicator from the form result area
                fileResultDiv.innerHTML = '';
                
                // Update the main results card with the formatted results
                const formattedResults = formatSentimentResults(data);
                resultsContent.innerHTML = formattedResults.html;
                showResultsCard();
                
                // Initialize charts
                initializeCharts(formattedResults.chartConfigs);
                
                // Scroll to results
                setTimeout(() => {
                    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            } catch (error) {
                console.error('Error processing file:', error);
                fileResultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
                // Hide the main results card if there's an error
                resultsCard.classList.remove('show');
                resultsCard.style.display = 'none';
            }
        });
    }
}); 