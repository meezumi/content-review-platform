from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Model Loading ---
# This is done once when the app starts.
# Using smaller, efficient models to keep resource usage low.
try:
    logger.info("Loading summarization model...")
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-6-6")
    logger.info("Summarization model loaded successfully.")

    logger.info("Loading sentiment analysis model...")
    sentiment_analyzer = pipeline(
        "sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english"
    )
    logger.info("Sentiment analysis model loaded successfully.")
except Exception as e:
    logger.error(f"Error loading models: {e}")
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


@app.post("/summarize")
async def get_summary(payload: TextToProcess):
    if not summarizer:
        return {"error": "Summarization model not available."}
    try:
        logger.info(f"Summarizing text of length {len(payload.text)}")
        # max_length is important to control output size. min_length ensures it's not too short.
        summary = summarizer(
            payload.text, max_length=100, min_length=30, do_sample=False
        )
        logger.info("Summarization complete.")
        return {"summary": summary[0]["summary_text"]}
    except Exception as e:
        logger.error(f"Error during summarization: {e}")
        return {"error": str(e)}


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
