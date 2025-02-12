from .generic_response import GenericResponse


class LearningOutcome(GenericResponse):
    pass


class LearningOutcomeTree(GenericResponse):
    """
    A class representing a Learning Outcome Tree.

    LearningOutcomes are tied to a course, so to construct one you need to pass
    in a course id, like so:
        lo_tree = LearningOutcomeTree(api, {"course_id":1234})

    Note: in the current implementation, there is not a tree, but rather a flat
    dictionary of LearningOutcomes. This is because the tree is not actually
    used in the UI, and it is easier to work with a flat dictionary.
    """

    def __init__(self, api, dictionary):
        super().__init__(api, dictionary)

        url = f"courses/{self.course_id}/trees"
        response = self._api.get_http_request(url)
        los = []
        cos = response["lo-tree"]["course-objectives"]
        for co in cos:
            los += co["learning-outcomes"]

        # Convert to LearningOutcome objects
        los = [LearningOutcome(self._api, d) for d in los]
        self.lookup_dict = {lo.hashtag: lo for lo in los}

    def get_all_hashtags(self, is_gradable=True, deprecated=False):
        lookup_dict = self.lookup_dict

        if is_gradable is not None:
            # Filter out non-gradable LOs
            lookup_dict = {
                k: v for k, v in lookup_dict.items() if v.is_gradable == is_gradable
            }
        if deprecated is not None:
            # Filter out deprecated LOs
            lookup_dict = {
                k: v for k, v in lookup_dict.items() if v.deprecated == deprecated
            }

        return list(lookup_dict.keys())

    def __getitem__(self, hashtag):
        return self.lookup_dict[hashtag]
