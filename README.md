![image](https://github.com/user-attachments/assets/5aafa7b5-efd7-4cdb-8899-b80b5037a81d)# 🧠 AI Article Summarizer

An intelligent web application that transforms lengthy articles, essays, or documents into concise, easy-to-understand summaries with customizable tone and length options.

![Article Summarizer](![image](https://github.com/user-attachments/assets/23a2fb69-fc0f-4481-a68b-8be87b8f4eb0)
)

## ✨ Overview

The Article Summarizer is a powerful web tool designed to help users quickly extract key information from lengthy text content. Whether you're a student, researcher, professional, or casual reader, this tool allows you to save time and improve comprehension by generating well-formatted summaries tailored to your preferences.

## 🚀 Features

- 🔤 **Multiple Input Methods**
  - Text Input: Simply paste your article text
  - File Upload: Support for PDF, JPG, JPEG, PNG, and HEIF files with OCR capability
  - URL Import: Extract and summarize content directly from web articles

- 🧑‍🎓 **Tone Customization**
  - Academic: Formal and scholarly tone
  - Funny: Light-hearted and entertaining summaries
  - Child-Friendly: Simplified language for younger readers
  - Combined: Generate summaries with multiple tones
  - Custom: Define your own specific tone

- 📏 **Flexible Summary Length**
  - Short: Very concise summary focusing on key points (~20% of original)
  - Medium: Balanced summary with important details (~33% of original)
  - Detailed: Comprehensive summary with context (~60% of original)

- 🔍 **Structured Output**
  - Well-formatted summaries with subtopics
  - Clean paragraph breaks for improved readability
  - Bullet points for key information

- 💾 **User Convenience**
  - One-click copy functionality
  - Quick reset for new summaries
  - Responsive design works on all devices

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| LLM Integration | Groq API with Llama3-70B-8192 |
| Document Processing | PyTesseract, PDF2Image, PIL |
| Web Scraping | BeautifulSoup4, Requests |

## 🏗️ System Architecture

The application follows a client-server architecture:

1. **Frontend**: User interface built with HTML, CSS, and JavaScript that handles:
   - User input collection (text, file, URL)
   - Tone and length selection
   - Result display and formatting

2. **Backend**: Flask server that handles:
   - File processing and text extraction using OCR
   - Web content scraping from URLs
   - Communication with the Groq API for summary generation
   - Response formatting

3. **LLM Integration**: Article summarization powered by Llama3-70B-8192 through Groq

## 🚀 Getting Started

### Prerequisites

- Python 3.7+
- pip package manager
- Tesseract OCR installed on your system
- Groq API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/article-summarizer.git
cd article-summarizer
```

2. Install the required Python packages:
```bash
pip install -r requirements.txt
```

3. Set up your Groq API key:
```bash
export GROQ_API_KEY=your_api_key_here
```

4. Run the application:
```bash
python summarizer_ver_3.py
```

5. Open your browser and navigate to:
```
http://localhost:5000
```

## 💻 Usage

1. **Select Input Method**
   - Paste article text directly
   - Upload a PDF or image containing text
   - Enter a URL to an article

2. **Choose Tone**
   - Select from predefined tones or create a custom tone

3. **Select Summary Length**
   - Choose short, medium, or detailed summary

4. **Generate Summary**
   - Click the "Summarize" button and wait for the result

5. **Copy or Create New Summary**
   - Use the copy button to save the summary to clipboard
   - Create a new summary with different parameters

## 🧩 Code Structure

- `index.html` - Main application interface
- `static/styles.css` - CSS styling for the application
- `static/script.js` - Frontend JavaScript functionality
- `summarizer_ver_3.py` - Flask backend server with API endpoints

### API Endpoints

- `/api/extract-text` - Extracts text from uploaded files using OCR
- `/api/extract-from-url` - Scrapes and extracts content from provided URLs
- `/api/summarize` - Processes text and generates summaries with specified parameters

## 🔍 How It Works

1. **Text Extraction**:
   - For file uploads, the application uses Tesseract OCR via PyTesseract to extract text
   - For URLs, BeautifulSoup is used to scrape and clean the content

2. **Text Processing**:
   - The extracted text is cleaned and prepared for summarization

3. **Summary Generation**:
   - A structured prompt is created based on the user's tone and length preferences
   - The prompt is sent to the Llama3-70B-8192 model via Groq API
   - The model generates a concise summary with appropriate formatting

4. **Result Formatting**:
   - The summary is processed to highlight subtopics and improve readability
   - The formatted result is displayed to the user

## 🙌 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Future Enhancements

- Multi-language support
- Summary comparison between different tones
- User accounts to save summaries
- Advanced formatting options
- Browser extension integration

## 👨‍💻 Author

- **Thiwakar S** - *Mirai Enzan Sparkathon 2025*

## 🙏 Acknowledgments

- Thanks to the Groq team for providing the LLM API
- Special thanks to the open-source libraries used in this project
