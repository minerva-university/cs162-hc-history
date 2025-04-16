import openai

def generate_summary_parts(client, outcome_name, outcome_description, all_comments):
    prompt = f"""
You are analyzing student feedback for the following learning outcome:

Outcome Name: "{outcome_name}"

Outcome Description: "{outcome_description}"

Based on the following student comments:

{all_comments}

Write two separate bullet-point summaries evaluating student performance specifically *relative* to this learning outcome.

1. Strengths — where students did well, aligned with the intended outcome.
2. Areas for Improvement — where students struggled or fell short relative to the outcome expectations.

Return only the bullet points, clearly labeled with 'Strengths:' and 'Areas for Improvement:'.
Ensure the language is appropriate for a college-level course and refers to an individual student as 'you' or 'your'.
"""

    response = client.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert educational feedback summarizer."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=600
    )

    output = response.choices[0].message.content.strip()

    if "Strengths:" in output and "Areas for Improvement:" in output:
        parts = output.split("Areas for Improvement:")
        strengths = parts[0].replace("Strengths:", "").strip()
        improvement = parts[1].strip()
    else:
        raise ValueError("❌ Could not parse response into two sections.")

    return strengths, improvement