from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Model Loading ---
# This is done once when the app starts.
# Using better models for improved summarization quality.
try:
    logger.info("Loading summarization model...")
    # Using a better model for document summarization
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    logger.info("Summarization model loaded successfully.")

    logger.info("Loading sentiment analysis model...")
    sentiment_analyzer = pipeline(
        "sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english"
    )
    logger.info("Sentiment analysis model loaded successfully.")
except Exception as e:
    logger.error(f"Error loading models: {e}")
    # Fallback to smaller models if the larger ones fail
    try:
        logger.info("Falling back to smaller summarization model...")
        summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-6-6")
        logger.info("Fallback summarization model loaded successfully.")
    except Exception as fallback_e:
        logger.error(f"Error loading fallback models: {fallback_e}")
        summarizer = None
        sentiment_analyzer = None

# --- FastAPI App Initialization ---
app = FastAPI()


# --- Pydantic Models for Request Bodies ---
# This ensures data passed to endpoints is in the correct format.
class TextToProcess(BaseModel):
    text: str


class CommentList(BaseModel):
    comments: list[str]


# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"status": "AI service is running"}


def preprocess_text(text: str) -> str:
    """Clean and prepare text for better summarization"""
    # Remove excessive whitespace and normalize
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove very short lines that might be noise
    lines = text.split('\n')
    lines = [line.strip() for line in lines if len(line.strip()) > 10]
    text = ' '.join(lines)
    
    # Truncate to manageable length for the model (BART can handle up to 1024 tokens)
    # Roughly 3000 characters ≈ 1024 tokens
    if len(text) > 3000:
        text = text[:3000] + "..."
    
    return text

@app.post("/summarize")
async def get_summary(payload: TextToProcess):
    if not summarizer:
        raise HTTPException(status_code=503, detail="Summarization model not available")
    
    if not payload.text or len(payload.text.strip()) < 50:
        return {"summary": "Document too short to generate a meaningful summary."}
    
    try:
        logger.info(f"Summarizing text of length {len(payload.text)}")
        
        # Preprocess the text
        processed_text = preprocess_text(payload.text)
        
        if len(processed_text) < 50:
            return {"summary": "Not enough content to generate a summary."}
        
        # Use better parameters for document summarization
        summary = summarizer(
            processed_text, 
            max_length=150,  # Increased for more detailed summaries
            min_length=40,   # Ensure minimum length
            do_sample=False,
            truncation=True
        )
        
        summary_text = summary[0]["summary_text"]
        logger.info("Summarization complete.")
        
        return {"summary": summary_text}
    except Exception as e:
        logger.error(f"Error during summarization: {e}")
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@app.post("/sentiment")
async def get_sentiment(payload: CommentList):
    if not sentiment_analyzer:
        return {"error": "Sentiment analysis model not available."}
    if not payload.comments:
        return {"positive": 0, "negative": 0, "neutral": 0, "overall": "NEUTRAL"}
    try:
        logger.info(f"Analyzing sentiment for {len(payload.comments)} comments.")
        results = sentiment_analyzer(payload.comments)

        positive_count = sum(1 for r in results if r["label"] == "POSITIVE")
        negative_count = sum(1 for r in results if r["label"] == "NEGATIVE")

        total = len(results)
        positive_percent = round((positive_count / total) * 100)
        negative_percent = round((negative_count / total) * 100)

        logger.info("Sentiment analysis complete.")
        return {
            "positive": positive_percent,
            "negative": negative_percent,
            "overall": (
                "POSITIVE" if positive_percent > negative_percent else "NEGATIVE"
            ),
        }
    except Exception as e:
        logger.error(f"Error during sentiment analysis: {e}")
        return {"error": str(e)}
