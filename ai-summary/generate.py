import openai

def generate_summary_parts(client, outcome_name, outcome_description, all_comments):
    prompt = f"""
You are providing direct, personal feedback to a student about their performance on this learning outcome:

Outcome Name: "{outcome_name}"

Outcome Description: "{outcome_description}"

Based on the following feedback from your instructors:

{all_comments}

Provide feedback in EXACTLY this format, with EXACTLY these section headers:

Strengths:
[First strength point]
[Second strength point]
(Optional third and fourth points if needed)

Areas for Improvement:
[First improvement point]
[Second improvement point]
[Third improvement point]
(Optional fourth point if needed)

Guidelines for each section:
1. First section - Strengths:
- Start each point with "You demonstrated..." or "Your work shows..."
- Focus on specific achievements and concrete examples
- Connect each strength directly to the learning outcome
- Use evidence from the feedback to support each point
- Keep each point focused on one specific strength
- Include at least 2 meaningful strengths

2. Second section - Areas for Improvement:
- Start each point with an action verb (e.g., "Practice...", "Focus on...", "Strengthen...")
- Provide one specific, actionable suggestion per point
- Include concrete examples or techniques to try
- Connect each suggestion to the learning outcome
- Frame feedback constructively and developmentally
- Include at least 3 areas for improvement

Important:
- Use EXACTLY the section headers "Strengths:" and "Areas for Improvement:"
- Always address the student directly as "you" and "your"
- Never use third-person pronouns (they/them/their)
- Keep points concise and focused
- Ensure each point is actionable and specific
- Maintain a constructive, encouraging tone
- Do not use any bullet points or special characters
- Start each point on a new line
"""

    response = client.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": """You are providing direct, personal feedback to a student.
                Always use second-person pronouns (you/your) to address the student directly.
                Never use third-person pronouns (they/them/their).
                Focus on specific, actionable feedback with concrete examples.
                Structure feedback as separate lines without bullet points.
                Use EXACTLY the section headers 'Strengths:' and 'Areas for Improvement:'."""
            },
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=800,
        presence_penalty=0.3,
        frequency_penalty=0.3
    )

    output = response.choices[0].message.content.strip()

    # More robust parsing
    try:
        if "Strengths:" not in output:
            raise ValueError("Missing 'Strengths:' section")
        if "Areas for Improvement:" not in output:
            raise ValueError("Missing 'Areas for Improvement:' section")

        # Split into sections
        parts = output.split("Areas for Improvement:")
        if len(parts) != 2:
            raise ValueError("Incorrect section formatting")

        strengths = parts[0].replace("Strengths:", "").strip()
        improvement = parts[1].strip()

        # Clean and validate points
        def clean_points(text):
            # Split by newlines and clean each point
            points = [p.strip() for p in text.split('\n') if p.strip()]
            # Remove any bullet points or special characters at the start of each point
            points = [p.lstrip('•').lstrip('*').lstrip('-').lstrip('•').strip() for p in points]
            return points

        strengths_points = clean_points(strengths)
        improvement_points = clean_points(improvement)

        if len(strengths_points) < 2:
            raise ValueError(f"Not enough strength points (minimum 2 required)")
        if len(improvement_points) < 3:
            raise ValueError(f"Not enough improvement points (minimum 3 required)")

        # Join points back with newlines
        return '\n'.join(strengths_points), '\n'.join(improvement_points)

    except Exception as e:
        raise ValueError(f"❌ Could not parse response: {str(e)}. Full response: {output}")