"""
A generic Python class for converting an HTTP response into an object
with attributes based on the dictionary keys.
"""


class GenericResponse:
    """
    A generic Python class for converting a dictionary into an object
    with attributes based on the dictionary keys.
    """

    def __init__(self, api, dictionary):
        """
        Initialize the GenericResponse with a dictionary.

        Args:
            dictionary (dict): A Python dictionary containing key-value pairs.

        Attributes:
            _api_dict (dict): The underlying dictionary used for attribute creation.
        """
        self._api = api
        self._api_dict = dictionary

        for key, value in dictionary.items():
            key = key.replace(" ", "_")
            key = key.replace("-", "_")
            if key.isidentifier():
                setattr(self, key, value)

    def __str__(self):
        """
        Return a human-readable string representation of the object.

        Returns:
            str: A string representation of the object, displaying non-private attributes.
        """
        attributes = [
            f"{key}={value}"
            for key, value in self.__dict__.items()
            if not key.startswith("_")
        ]
        return f"{self.__class__.__name__}({', '.join(attributes)})"

    __repr__ = __str__
