from gemini_services import generate_answer


context = """
The company was established in 1998 in Chennai.
It initially started with 20 employees.
The company focuses on software development.
"""

question = "When was the company established?"

answer = generate_answer(context, question)

print("Question:", question)
print("Answer:", answer)