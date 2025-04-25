document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const articleInput = document.getElementById('article-input');
    const toneOptions = document.querySelectorAll('.tone-option');
    const lengthOptions = document.querySelectorAll('.length-option');
    const customToneContainer = document.getElementById('custom-tone-container');
    const customToneInput = document.getElementById('custom-tone-input');
    const summarizeBtn = document.getElementById('summarize-btn');
    const resultSection = document.getElementById('result-section');
    const summaryContent = document.getElementById('summary-content');
    const toneLabel = document.getElementById('tone-label');
    const lengthLabel = document.getElementById('length-label');
    const copyBtn = document.getElementById('copy-btn');
    const newSummaryBtn = document.getElementById('new-summary-btn');
    const loadingIndicator = document.getElementById('loading');

    // File upload elements
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const fileInput = document.getElementById('file-input');
    const uploadBox = document.querySelector('.upload-box');
    const filePreview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const removeFileBtn = document.getElementById('remove-file');
    const fileStatusText = document.getElementById('file-status-text');
    const fileProcessing = document.getElementById('file-processing');

    // URL input elements
    const urlInput = document.getElementById('url-input');
    const fetchUrlBtn = document.getElementById('fetch-url-btn');
    const urlPreview = document.getElementById('url-preview');
    const urlTitle = document.getElementById('url-title');
    const removeUrlBtn = document.getElementById('remove-url');
    const urlStatusText = document.getElementById('url-status-text');
    const urlProcessing = document.getElementById('url-processing');

    let selectedTone = '';
    let selectedLength = 'medium'; // Default length
    let uploadedFile = null;
    let extractedUrlContent = null;

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabType = this.getAttribute('data-tab');
            document.getElementById(`${tabType}-input-container`).classList.add('active');
        });
    });

    // File upload handling
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop handling
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadBox.addEventListener(eventName, () => {
            uploadBox.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, () => {
            uploadBox.classList.remove('dragover');
        }, false);
    });

    uploadBox.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleFiles(files[0]);
        }
    }

    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFiles(this.files[0]);
        }
    });

    function handleFiles(file) {
        // Check if file type is supported
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heif'];
        if (!validTypes.includes(file.type)) {
            alert('Unsupported file type. Please upload a PDF, JPG, JPEG, PNG, or HEIF file.');
            return;
        }

        // Store the uploaded file
        uploadedFile = file;

        // Display file information
        fileName.textContent = file.name;
        fileStatusText.textContent = 'Ready to process';
        filePreview.classList.remove('hidden');
    }

    // Remove file button
    removeFileBtn.addEventListener('click', function() {
        uploadedFile = null;
        fileInput.value = '';
        filePreview.classList.add('hidden');
    });

    // URL fetching
    fetchUrlBtn.addEventListener('click', function() {
        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a URL to fetch content from.');
            return;
        }

        // Validate URL format
        try {
            new URL(url); // This will throw an error if the URL is invalid
        } catch (error) {
            alert('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        // Show processing indicators
        urlProcessing.classList.remove('hidden');
        urlStatusText.textContent = 'Fetching content...';
        urlPreview.classList.remove('hidden');

        // Send request to backend API
        fetch('/api/extract-from-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        })
        .then(response => response.json())
        .then(data => {
            urlProcessing.classList.add('hidden');

            if (data.success) {
                extractedUrlContent = data.text;
                urlTitle.textContent = data.title || url;
                urlStatusText.textContent = 'Content fetched successfully';

                // Preview the extracted content in the text area
                articleInput.value = extractedUrlContent.slice(0, 300) + (extractedUrlContent.length > 300 ? '...' : '');
            } else {
                urlStatusText.textContent = 'Failed to fetch content';
                alert('Error fetching content from URL: ' + data.error);
                extractedUrlContent = null;
            }
        })
        .catch(error => {
            urlProcessing.classList.add('hidden');
            urlStatusText.textContent = 'Fetching failed';
            alert('Error connecting to the server: ' + error.message);
            extractedUrlContent = null;
        });
    });

    // Remove URL button
    removeUrlBtn.addEventListener('click', function() {
        urlInput.value = '';
        extractedUrlContent = null;
        urlPreview.classList.add('hidden');
    });

    // Select tone
    toneOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            toneOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            this.classList.add('selected');

            // Store selected tone
            selectedTone = this.getAttribute('data-tone');

            // Show/hide custom tone input
            if (selectedTone === 'custom') {
                customToneContainer.classList.remove('hidden');
            } else {
                customToneContainer.classList.add('hidden');
            }
        });
    });

    // Select length
    lengthOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            lengthOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            this.classList.add('selected');

            // Store selected length
            selectedLength = this.getAttribute('data-length');
        });
    });

    // Format summary content with subtopic markup
    function formatSummaryWithSubtopics(summary) {
        // Replace **subtopic** patterns with styled spans
        return summary.replace(/\*\*(.*?)\*\*/g, '<span class="subtopic">$1</span>');
    }

    // Process file for text extraction
    async function processFile(file) {
        fileStatusText.textContent = 'Processing file...';
        fileProcessing.classList.remove('hidden');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/extract-text', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            fileProcessing.classList.add('hidden');

            if (data.success) {
                fileStatusText.textContent = 'Text extracted successfully';
                return data.text;
            } else {
                fileStatusText.textContent = 'Failed to extract text';
                alert('Error extracting text from file: ' + data.error);
                return null;
            }
        } catch (error) {
            fileProcessing.classList.add('hidden');
            fileStatusText.textContent = 'Processing failed';
            alert('Error processing file: ' + error.message);
            return null;
        }
    }

    // Summarize button click
    summarizeBtn.addEventListener('click', async function() {
        let articleText = '';
        const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');

        // Get text based on active tab
        if (activeTab === 'text') {
            articleText = articleInput.value.trim();
            if (!articleText) {
                alert('Please enter an article to summarize.');
                return;
            }
        } else if (activeTab === 'file') {
            if (!uploadedFile) {
                alert('Please upload a file to summarize.');
                return;
            }

            // Process file to extract text
            articleText = await processFile(uploadedFile);
            if (!articleText) {
                return; // Error already shown
            }
        } else if (activeTab === 'url') {
            if (!extractedUrlContent) {
                alert('Please fetch content from a URL first.');
                return;
            }

            articleText = extractedUrlContent;
        }

        // Validate tone selection
        if (!selectedTone) {
            alert('Please select a tone for the summary.');
            return;
        }

        if (selectedTone === 'custom' && !customToneInput.value.trim()) {
            alert('Please enter a custom tone description.');
            return;
        }

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        resultSection.classList.add('hidden');

        // Prepare the request data
        const requestData = {
            article: articleText,
            tone: selectedTone,
            customTone: customToneInput.value.trim(),
            length: selectedLength
        };

        // Send request to backend API
        fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');

            if (data.success) {
                // Format and show the result with subtopic styling
                summaryContent.innerHTML = formatSummaryWithSubtopics(data.summary);

                // Display the tone label
                let displayTone = data.tone;
                if (selectedTone === 'all') {
                    displayTone = 'Multiple Tones';
                }
                toneLabel.textContent = `(${displayTone})`;

                // Display the length label
                lengthLabel.textContent = ` - ${data.length.charAt(0).toUpperCase() + data.length.slice(1)}`;

                // Show result section
                resultSection.classList.remove('hidden');

                // Scroll to result
                resultSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Error generating summary: ' + data.error);
            }
        })
        .catch(error => {
            loadingIndicator.classList.add('hidden');
            alert('Error connecting to the server: ' + error.message);
        });
    });

    // Copy button click - note we need to handle HTML content differently
    copyBtn.addEventListener('click', function() {
        // Get plain text version (without HTML formatting)
        const summaryText = summaryContent.textContent;
        navigator.clipboard.writeText(summaryText)
            .then(() => {
                // Show success indicator temporarily
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            })
            .catch(err => {
                alert('Failed to copy text: ' + err);
            });
    });

    // New summary button click
    newSummaryBtn.addEventListener('click', function() {
        // Hide result section
        resultSection.classList.add('hidden');

        // Clear inputs
        articleInput.value = '';
        customToneInput.value = '';

        // Clear file upload
        uploadedFile = null;
        fileInput.value = '';
        filePreview.classList.add('hidden');

        // Clear URL input
        urlInput.value = '';
        extractedUrlContent = null;
        urlPreview.classList.add('hidden');

        // Reset tone selection
        toneOptions.forEach(opt => opt.classList.remove('selected'));
        selectedTone = '';

        // Hide custom tone input
        customToneContainer.classList.add('hidden');

        // Switch to text input tab by default
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        document.querySelector('.tab[data-tab="text"]').classList.add('active');
        document.getElementById('text-input-container').classList.add('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});