from minerva_api_client import (
    ForumAPI,
    Class,
    LearningOutcomeTree,
)
from textwrap import fill
from string import Template

csrftoken = "XXXXXXX INSERT YOUR CSRF TOKEN HERE XXXXXXX"
sessionid = "XXXXXXX INSERT YOUR SESSION ID HERE XXXXXXX"

# A more secure way to store these credentials would be to use environment variables
# and the os module to access them. For example:
# import os
# csrftoken = os.environ.get("MINERVA_CSRF_TOKEN")
# sessionid = os.environ.get("MINERVA_SESSION_ID")

api = ForumAPI(sessionid, csrftoken)


# Current Course IDs:
cs162 = 3409
sessions = [90990, 90992, 90989, 90988]
classes = [(session, cs162) for session in sessions]


def reflow(txt):
    """Reflow text to 80 columns."""
    return "\n".join([fill(a) for a in txt.splitlines()])


def choose_question(polls):
    questions = [p.question for p in polls]
    for ind, q in enumerate(questions):
        print(f"{ind}: {q}")

    while True:
        try:
            inp = input("Which poll question do you want to see? ")
            inp = int(inp)
        except ValueError:
            print("Please enter a number.")
            continue
        if inp not in range(len(polls)):
            print("Please enter a valid number.")
            continue
        break
    return polls[int(inp)].question


def show_los(course_id, lim=-1):
    lo_tree = LearningOutcomeTree(api, {"course_id": course_id})

    hashtags = lo_tree.get_all_hashtags()

    for hashtag in hashtags[:lim]:
        print(hashtag, lo_tree[hashtag].id)


print("Here are the first 10 LOs:")
show_los(cs162, lim=10)

for session_id, course_id in classes:
    ## First we identify the poll question to grade:
    print(
        "\n\n\nHere are the polls for one of your sessions. Please choose one, and we will show your answer:"
    )
    class_obj = Class(api, {"id": session_id})
    polls = class_obj.get_polls()
    poll_question = choose_question(polls)

    for p in polls:
        if p.question != poll_question:
            continue

        # First we built a string containing all student answers
        student_answers = [
            f"{r.user_id}\n----------\n{r.response}\n" for r in p.responses
        ]

        student_answers = "\n".join(student_answers)
        print(reflow(student_answers))
