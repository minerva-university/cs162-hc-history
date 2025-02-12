"""
Provides classes for interacting with the Minerva Forum and CourseBuilder APIs.
"""

import requests

from .assignments import Section


class BaseAPI:
    """
    Base class for making HTTP requests to a remote API using the requests library.

    Attributes:
        session_id (str): The session ID used for authentication.
        csrf_token (str): The CSRF token used for authentication.
        base_url (str): The base URL of the remote API.

    Methods:
        get_http_request(url, params=None):
            Sends an HTTP GET request to the specified URL with optional query parameters.

        post_http_request(url, json, params=None):
            Sends an HTTP POST request to the specified URL with JSON data and optional query parameters.

        patch_http_request(url, json, params=None):
            Sends an HTTP PATCH request to the specified URL with JSON data and optional query parameters.

        delete_http_request(url, body=None):
            Sends an HTTP DELETE request to the specified URL with an optional request body.

    Example Usage:
        api = BaseAPI(session_id='your_session_id', csrf_token='your_csrf_token', base_url='https://api.example.com')
        data = api.get_http_request('/endpoint')
        result = api.post_http_request('/endpoint', json_data)
    """

    def __init__(self, session_id, csrf_token, base_url):
        """
        Initializes the BaseAPI instance with authentication information and the base URL.

        Args:
            session_id (str): The session ID used for authentication.
            csrf_token (str): The CSRF token used for authentication.
            base_url (str): The base URL of the remote API.
        """
        self.session_id = session_id
        self.csrf_token = csrf_token
        self.base_url = base_url

        self.HEADERS = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
            "Cookie": f"csrftoken={csrf_token}; sessionid={session_id}",
            "Dnt": "1",
            "Referer": "https://forum.minerva.edu/app/grading/sections",
            "Sec-Ch-Ua": '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"macOS"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
            "X-Csrftoken": csrf_token,
            "X-Requested-With": "XMLHttpRequest",
        }

    def get_http_request(self, url, params=None):
        """
        Sends an HTTP GET request to the specified URL with optional query parameters.

        Args:
            url (str): The endpoint URL to send the GET request to.
            params (dict, optional): Query parameters to include in the request.

        Returns:
            dict: The JSON response data if the request is successful; an empty dictionary otherwise.
        """
        response = requests.get(
            self.base_url + url, params=params, headers=self.HEADERS
        )

        # Check the response status code
        if 200 <= response.status_code <= 299:
            return response.json()
        else:
            print("Request failed with status code:", response.status_code)
            return {}

    def post_http_request(self, url, json, params=None):
        """
        Sends an HTTP POST request to the specified URL with JSON data and optional query parameters.

        Args:
            url (str): The endpoint URL to send the POST request to.
            json_data (dict): JSON data to include in the request body.
            params (dict, optional): Query parameters to include in the request.

        Returns:
            dict: The JSON response data if the request is successful; an empty dictionary otherwise.
        """
        response = requests.post(
            self.base_url + url, json=json, params=params, headers=self.HEADERS
        )

        # Check the response status code
        if 200 <= response.status_code <= 299:
            return response.json()
        else:
            print("Request failed with status code:", response.status_code)
            return {}

    def patch_http_request(self, url, json, params=None):
        """
        Sends an HTTP PATCH request to the specified URL with JSON data and optional query parameters.

        Args:
            url (str): The endpoint URL to send the PATCH request to.
            json_data (dict): JSON data to include in the request body.
            params (dict, optional): Query parameters to include in the request.

        Returns:
            dict: The JSON response data if the request is successful; an empty dictionary otherwise.
        """
        response = requests.patch(
            self.base_url + url, json=json, params=params, headers=self.HEADERS
        )
        print(json)

        # Check the response status code
        if 200 <= response.status_code <= 299:
            return response.json()
        else:
            print("Request failed with status code:", response.status_code)
            return {}

    def delete_http_request(self, url, body=None):
        """
        Sends an HTTP DELETE request to the specified URL with an optional request body.

        Args:
            url (str): The endpoint URL to send the DELETE request to.
            body (str, optional): The request body to include in the DELETE request.

        Returns:
            dict: The JSON response data if the request is successful; an empty dictionary otherwise.
        """
        response = requests.delete(self.base_url + url, data=body, headers=self.HEADERS)

        # Check the response status code
        if 200 <= response.status_code <= 299:
            return response.json()
        else:
            print("Request failed with status code:", response.status_code)
            return {}


class ForumAPI(BaseAPI):
    def __init__(self, session_id, csrf_token):
        super().__init__(session_id, csrf_token, "https://forum.minerva.edu/api/v1/")
        # 31 --> Fall 2023
        # 30 --> Spring 2024
        self.term_id = 31

    def signed_url(self, resource_id):
        """
        Retrieves a signed URL for accessing a resource associated with a submission.

        Args:
            resource_id (str): The ID of the resource to generate a signed URL for.

        Returns:
            str: The signed URL for accessing the resource.
        """
        url = f"resources/{resource_id}/signed_url"
        params = {
            "content-disposition": "inline",
        }
        response = self.get_http_request(url, params=params)
        return response

    def sections_gradable(self):
        """
        Retrieves a list of sections that are gradable for the specified academic term.

        Returns:
            list: A list of Section objects representing gradable sections.
        """
        url = f"sections"
        params = {
            "capability": "can view grades",
            "state": "all",
            "term-id": self.term_id,
            "hide_defaults": True,
        }
        response = self.get_http_request(url, params=params)
        return [Section(self, d) for d in response]


class CourseBuilderAPI(BaseAPI):
    def __init__(self, session_id, csrf_token):
        super().__init__(
            session_id, csrf_token, "https://coursebuilder.minerva.edu/api/v2/"
        )
