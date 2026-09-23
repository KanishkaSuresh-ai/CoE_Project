# ai/gemini_services.py
import os
import logging

from dotenv import load_dotenv
import google.generativeai as genai

# ----------------------------------------------------------------------
# Setup – load .env, configure SDK, configure logger
# ----------------------------------------------------------------------

# Load .env from the ai/ directory itself
_env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in the .env file")

# Configure the SDK globally once per process
genai.configure(api_key=api_key)

logger = logging.getLogger(__name__)


# ----------------------------------------------------------------------
# Prompt template – strict, clearly delimited, includes fallback text
# ----------------------------------------------------------------------
PROMPT_TEMPLATE = """You are a strict document-question-answering assistant.
Only use the information that appears in the excerpts below.
If the answer cannot be derived from the excerpts, reply with exactly:
"I could not find the answer in the document."

--- CONTEXT -------------------------------------------------------------
{context}
--- END CONTEXT ---------------------------------------------------------

Question: {question}
Answer:"""


# ----------------------------------------------------------------------
# Public API
# ----------------------------------------------------------------------
def generate_answer(
    context: str,
    question: str,
    *,
    model: str = "gemini-1.5-flash",
    temperature: float = 0.0,
) -> str:
    """
    Generate an answer using Gemini.

    Parameters
    ----------
    context : str
        The concatenated excerpts retrieved from the vector store.
        If empty, the function returns the fallback sentence.
    question : str
        The user-asked question.
    model : str, optional
        Gemini model name – defaults to gemini-1.5-flash.
    temperature : float, optional
        Controls randomness (0 = deterministic).

    Returns
    -------
    str
        The answer text returned by Gemini, or a friendly fallback message
        if the API call fails.
    """
    # Guard: empty context → skip API call entirely
    if not context.strip():
        logger.warning("generate_answer called with empty context")
        return "I could not find the answer in the document."

    # Build the final prompt
    prompt = PROMPT_TEMPLATE.format(context=context, question=question)

    try:
        gemini_model = genai.GenerativeModel(model_name=model)

        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
        )

        response = gemini_model.generate_content(
            prompt,
            generation_config=generation_config,
        )

        return response.text

    except Exception as exc:
        logger.exception("Gemini API request failed: %s", exc)
        return "I couldn't reach the AI service right now. Please try again later."