# ai/test_gemini.py
"""
Quick smoke-test for gemini_services.generate_answer().

Run from the project root:
    python -m ai.test_gemini

Or run directly from the ai/ directory:
    python test_gemini.py
"""

import sys
import os

# Allow running directly as `python test_gemini.py` from inside ai/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ai.gemini_services import generate_answer


def run_test(label: str, context: str, question: str) -> None:
    print(f"\n{'='*60}")
    print(f"TEST: {label}")
    print(f"Question : {question}")
    answer = generate_answer(context, question)
    print(f"Answer   : {answer}")


# ------------------------------------------------------------------
# Test 1 – normal case: answer is clearly in the context
# ------------------------------------------------------------------
run_test(
    label="Answer present in context",
    context="""
    The company was established in 1998 in Chennai.
    It initially started with 20 employees.
    The company focuses on software development.
    """,
    question="When was the company established?",
)

# ------------------------------------------------------------------
# Test 2 – fallback case: answer is NOT in the context
# ------------------------------------------------------------------
run_test(
    label="Answer NOT in context (should trigger fallback)",
    context="""
    The company was established in 1998 in Chennai.
    It initially started with 20 employees.
    """,
    question="Who is the current CEO of the company?",
)

# ------------------------------------------------------------------
# Test 3 – edge case: empty context (should short-circuit, no API call)
# ------------------------------------------------------------------
run_test(
    label="Empty context (no API call expected)",
    context="",
    question="What does the document say about revenue?",
)

print(f"\n{'='*60}")
print("All tests completed.")
