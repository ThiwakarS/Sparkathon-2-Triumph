from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import groq
import os
import tempfile
from werkzeug.utils import secure_filename
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__, static_url_path='/static')
CORS(app)  # Enable CORS for all routes

# Configure the upload folder and allowed extensions
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'heif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit uploads to 16MB

client = groq.Groq(
    api_key='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',
)


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def home():
    return render_template('index.html')  # this serves index.html from templates


@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    # Check if a file was uploaded
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No file part in the request'
        }), 400

    file = request.files['file']

    # Check if file is empty
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected'
        }), 400

    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'error': 'File type not allowed'
        }), 400

    try:
        # Save the file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Extract text based on file type
        file_extension = filename.rsplit('.', 1)[1].lower()
        extracted_text = ""

        if file_extension == 'pdf':
            # Convert PDF to images and extract text
            images = convert_from_path(filepath)
            for image in images:
                # Extract text from each page
                page_text = pytesseract.image_to_string(image)
                extracted_text += page_text + "\n\n"
        else:
            # For image files
            image = Image.open(filepath)
            extracted_text = pytesseract.image_to_string(image)

        # Clean up the temporary file
        os.remove(filepath)

        # Return the extracted text
        return jsonify({
            'success': True,
            'text': extracted_text
        })

    except Exception as e:
        # Clean up if an error occurred
        if os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/extract-from-url', methods=['POST'])
def extract_from_url():
    data = request.json
    url = data.get('url', '')

    if not url:
        return jsonify({
            'success': False,
            'error': 'No URL provided'
        }), 400

    try:
        # Set headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # Get the webpage content
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses

        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove script and style elements
        for script_or_style in soup(['script', 'style', 'header', 'footer', 'nav', 'aside']):
            script_or_style.decompose()

        # Get the main content
        # First try to find main content containers
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(
            r'content|article|post|main', re.I))

        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
        else:
            # If no main content container found, get all text from body
            text = soup.get_text(separator=' ', strip=True)

        # Clean up the text
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        # Handle common web text artifacts
        text = re.sub(r'(©|\(c\)|copyright).*?(\d{4}).*?(\.|$)', '', text, flags=re.I)

        # Return the extracted text
        return jsonify({
            'success': True,
            'text': text,
            'title': soup.title.string if soup.title else url
        })

    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f"Failed to fetch URL: {str(e)}"
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Error extracting content: {str(e)}"
        }), 500


@app.route('/api/summarize', methods=['POST'])
def summarize():
    data = request.json
    article_text = data.get('article', '')
    tone = data.get('tone', 'academic')
    custom_tone = data.get('customTone', '')
    summary_length = data.get('length', 'medium')  # New parameter for summary length

    # Use custom tone if provided and tone is "custom"
    if tone == "custom" and custom_tone:
        tone = custom_tone

    # Determine length instruction based on summary_length
    length_instruction = ""
    if summary_length == "short":
        length_instruction = "Create a very concise summary that is about 20% of the original length. Focus only on the most critical points."
    elif summary_length == "medium":
        length_instruction = "Create a summary that is about one third of the original length. Include main points and supporting details."
    elif summary_length == "detailed":
        length_instruction = "Create a comprehensive summary that is about 60% of the original length. Include major points, supporting details, and maintain key context."

    # Create the prompt
    prompt = f"""
        You are an assistant that creates high-quality summaries, in a third person perspective.

        Summarize the following article in a concise and meaningful way using a {tone} tone.
        {length_instruction}
        - Preserve important facts, ideas, and context without losing meaning.
        - use simple language whenever possible
        - If the article is in a language **other than English**, keep it in the original language **only if it's clearly written and easy to follow**.
        - Otherwise, **translate it to English** for better clarity.
        - Try to give the output in multiple small paragraphs and in points.
        - Format the subtopics by enclosing them in **subtopic** tags.

        Article to summarize:
        \"\"\"
        {article_text}
        \"\"\"
    """

    try:
        # Send request to Groq
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-70b-8192",
        )

        # Extract the summary
        summary = chat_completion.choices[0].message.content

        return jsonify({
            'success': True,
            'summary': summary,
            'tone': tone,
            'length': summary_length
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)