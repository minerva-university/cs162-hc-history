from datetime import datetime
from .generic_response import GenericResponse

import pytz

from .apis import BaseAPI

utc = pytz.timezone("UTC")


class Class(GenericResponse):
    def __init__(self, api, dictionary):
        super().__init__(api, dictionary)

    def get_polls(self):
        """
        Retrieves a list of polls associated with the class.

        Returns:
            list: A list of Poll objects representing polls associated with the class.
        """
        url = f"class_grader/classes/{self.id}/polls"
        response = self._api.get_http_request(url)
        return [Poll(self._api, d) for d in response]


class Poll(GenericResponse):
    def __init__(self, api, dictionary):
        super().__init__(api, dictionary)
        # For some reason the sessions are wrapped in a list :shrug:
        sessions = dictionary.get("poll-sessions", [])
        if len(sessions) == 0:
            self.responses = []
            return

        self.responses = []
        # If a poll is run multiple times, we will grade all of them.
        for session in sessions:
            self.responses.extend(
                [PollResponse(self._api, d) for d in session.get("poll-responses", [])]
            )


class PollResponse(GenericResponse):
    def __init__(self, api, dictionary):
        super().__init__(api, dictionary)

    def comment(self, txt, klass_id=None):
        """
        Adds a comment to the submission.

        Args:
            txt (str): The text of the comment to add.
        """
        return self.score(txt, klass_id=klass_id)

    def score(
        self, txt, value=None, hc_id=None, hc_item_id=None, lo_id=None, klass_id=None
    ):
        """
        Adds a score to the submission.
        """
        if (hc_id is None) and (lo_id is None) and (value is not None):
            raise ValueError("When scoring must specify either hc_id or lo_id")

        if value is not None:
            assert type(value) == int
            assert value > 0
            assert value <= 5

        # Get the current date and time
        current_datetime = datetime.now()

        # Specify the desired time zone (GMT+02:00)

        # Convert the current datetime to the desired time zone
        current_datetime_with_utc = current_datetime.astimezone(utc)
        formatted_dt = current_datetime_with_utc.strftime(
            "%a %b %d %Y %H:%M:%S GMT%z (%Z)"
        )

        url = f"outcome-assessments"
        json = {
            "type": "poll",
            "created_on": formatted_dt,
            "draft": True,
            "unsaved": True,
            "hc_item_id": hc_item_id,
            "hc_id": hc_id,
            "learning_outcome": lo_id,
            "score": value,
            "comment": txt,
            "klass_id": klass_id,
            "poll_session_id": self.poll_session_id,
            "target_user_id": self.user_id,
        }
        response = self._api.post_http_request(url, json)
        return response
