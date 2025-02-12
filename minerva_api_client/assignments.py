import os
import requests
import tempfile
from datetime import datetime
import pdfplumber

from .generic_response import GenericResponse


class Section(GenericResponse):
    def list_all_assignments(self):
        url = f"grading/sections/{self.id}/assignment_list"
        response = self._api.get_http_request(url)
        return [SectionAssignment(self._api, d) for d in response]


class SectionAssignment(GenericResponse):
    def _nested_for_grader(self):
        url = f"assignments/{self.id}/nested_for_grader"
        response = self._api.get_http_request(url)
        return response

    def list_all_submissions(self):
        """
        Retrieves a list of all submissions for this assignment.

        Returns:
            list: A list of Submission objects representing all submissions.
        """
        response = self._nested_for_grader()
        all_submissions = response["assignment-submissions"]
        return [Submission(self._api, d) for d in all_submissions]

    def list_newest_submissions(self):
        """
        Retrieves a list of the newest submissions for this assignment.

        Returns:
            list: A list of Submission objects representing the newest submissions.
        """
        response = self._nested_for_grader()
        all_submissions = response["assignment-submissions"]
        unique = {}
        for s in all_submissions:
            if s["user-id"] not in unique:
                unique[s["user-id"]] = s
            else:
                if s["updated-on"] > unique[s["user-id"]]["updated-on"]:
                    unique[s["user-id"]] = s

        return [Submission(self._api, d) for d in unique.values()]

    def get_section_id(self):
        response = self._nested_for_grader()
        return response["section-id"]


class Submission(GenericResponse):
    def get_resources(self, filters=None):
        """
        Retrieves resources associated with the submission based on optional filters.

        Args:
            filters (dict, optional): Filters to apply when retrieving resources.

        Returns:
            list: A list of SubmissionResource objects that match the specified filters.
        """
        if filters == None:
            filters = {}
        ans = []
        for r in self.assignment_submission_resources:
            if all([r[k] == v for k, v in filters.items()]):
                ans.append(SubmissionResource(self._api, r))
        return ans

    def comment(self, txt):
        """
        Adds a comment to the submission.

        Args:
            txt (str): The text of the comment to add.
        """
        return self.score(txt)

    def score(self, txt, value=None, hc_id=None, hc_item_id=None, lo_id=None):
        """
        Adds a score to the submission.

        Args:
            txt (str): The text of the comment to add.
            value (int): The score to add.
            hc_id (str, optional): The ID of the HC to score.
            lo_id (str, optional): The ID of the learning outcome to score.
        """
        if (hc_id is None) and (lo_id is None) and (value is not None):
            raise ValueError("When scoring must specify either hc_id or lo_id")
        if value is not None:
            assert type(value) == int
            assert value > 0
            assert value <= 5

        url = f"outcome-assessments"
        json = {
            "type": "assignment",
            "metadata": '{"type":"general","sortKey":0}',
            "scoring-category": None,
            "hc-id": hc_id,
            "hc-item-id": hc_item_id,
            "learning-outcome": lo_id,
            "score": value,
            "graded_blindly": False,
            "comment": txt,
            "assignment_id": self.assignment_id,
            "target-user-id": self.user_id,
            "assignment-submission-id": self.id,
        }
        response = self._api.post_http_request(url, json)
        return response


class SubmissionResource(GenericResponse):
    def __init__(self, api, dictionary):
        super().__init__(api, dictionary)
        self.filename = None
        self._delete = True
        self._pdf_text = None

    def __del__(self):
        if self.filename is not None and self._delete:
            os.remove(self.filename)

    @property
    def pdf_text(self):
        if self._pdf_text is None:
            self._pdf_text = self._parse_pdf_text()
        return self._pdf_text

    def secure_url(self):
        """
        Retrieves a secure URL for the submission resource.

        Returns:
            str: The secure URL for accessing the resource.
        """
        response = self._api.signed_url(self.resource_id)
        return response["url"]

    def download(self, filename=None):
        """
        Downloads the submission resource to a specified file.

        Args:
            filename (str, optional): The name of the file to save the resource to.
                If not specified, the resource will be saved to a temporary file.

        Returns:
            str: The name of the file that the resource was saved to.
        """
        if filename is None:
            if self.filename is not None:
                filename = self.filename
            else:
                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    filename = temp_file.name
        self.filename = filename

        url = self.secure_url()
        response = requests.get(url)
        response.raise_for_status()
        with open(filename, "wb") as temp_file:
            temp_file.write(response.content)

        return filename

    def _parse_pdf_text(self, filename=None):
        """
        Downloads the submission resource to a specified file, extracts text from it,
        and returns the extracted text.

        Args:
            filename (str, optional): The name of the file to save the resource to.
                If not specified, the resource will be saved to a temporary file.

        Returns:
            str: The extracted text content from the PDF file.

        Raises:
            requests.exceptions.RequestException: If there's an issue with downloading the PDF file.
            pdfplumber.PDFSyntaxError: If the PDF file has syntax errors or is not valid.
            pdfplumber.PageObjectError: If there's an issue extracting text from PDF pages.
        """
        if self._pdf_text is not None:
            return self._pdf_text

        if filename is None:
            if self.filename is not None:
                filename = self.filename
            else:
                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    filename = temp_file.name
            self.download(filename)

        with pdfplumber.open(filename) as pdf:
            extracted_text = [page.extract_text() for page in pdf.pages]

        self._pdf_text = "\n\n".join(extracted_text)
        return self._pdf_text
