import os
import zipfile
import tempfile
import unittest

from collections import deque


def get_by_id(lst, id):
    """
    Retrieves an item from a list by matching its 'id' attribute with a specified 'id' value.

    Args:
        lst (list): A list of objects or items to search through.
        id: The 'id' value to search for.

    Returns:
        object or None: The first item in the list with a matching 'id' attribute,
        or None if no matching item is found.

    Example Usage:
        item_list = [obj1, obj2, obj3]
        result = get_by_id(item_list, target_id)
        if result is not None:
            # Process the found item
        else:
            # Handle the case where no matching item is found
    """
    for item in lst:
        if item.id == id:
            return item
    return None


def split_text_and_numeric(input_str, default_value=0):
    """
    This function accepts a string and returns all text except for the last non-empty numeric line.

    :param input_str: The input string to process.
    :return: The modified string.
    """
    modified_lines = deque(input_str.splitlines())
    modified_lines.reverse()

    last_non_empty_line = ""
    while not last_non_empty_line.strip():
        last_non_empty_line = modified_lines.popleft()

    # Reverse the lines back to their original order
    modified_lines.reverse()

    # Remove all non-numeric characters
    numeric_part = "".join(filter(str.isdigit, last_non_empty_line))
    ans = "\n".join(modified_lines)

    try:
        numeric_part = int(numeric_part)
    except ValueError:
        ans = input_str
        numeric_part = default_value

    return ans, numeric_part


def concatenate_files_in_zip(zip_file_name, file_patterns, depth=0):
    """
    Unzips a zip file and concatenates files matching specified patterns into a single string up to a specified depth.
    The file name of each file is included at the beginning and underlined.

    :param zip_file_name: The name of the zip file to process.
    :param file_patterns: A list of patterns to match files (e.g., ['.txt', '.md', '.py']).
    :param depth: The depth of directories to traverse (default is 0).
    :return: A single string with the concatenated contents of all matching files.
    """
    concatenated_content = ""

    with zipfile.ZipFile(zip_file_name, "r") as zip_ref:
        # Extract all the contents into a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            zip_ref.extractall(temp_dir)

            # Traverse the directory to the specified depth
            for root, dirs, files in os.walk(temp_dir):
                current_depth = root.count(os.sep) - temp_dir.count(os.sep)
                if current_depth > depth:
                    continue

                for file in files:
                    file_lower = file.lower()
                    if any(file_lower.endswith(pattern) for pattern in file_patterns):
                        # Prepare the file name and underline
                        file_title = f"{file}\n" + "-" * len(file) + "\n"
                        concatenated_content += file_title

                        # Read and append the file content
                        with open(os.path.join(root, file), "r") as f:
                            concatenated_content += f.read() + "\n\n"

    return concatenated_content


class TestSplitTextAndNumeric(unittest.TestCase):
    def test_empty_input(self):
        with self.assertRaises(IndexError):
            (split_text_and_numeric(""), ("", 0))

    def test_all_lines_empty(self):
        with self.assertRaises(IndexError):
            split_text_and_numeric("\n\n\n"), ("\n\n\n", 0)

    def test_no_numeric_line(self):
        self.assertEqual(
            split_text_and_numeric("Hello\nWorld\nabc"), ("Hello\nWorld\nabc", 0)
        )

    def test_normal_case_with_numeric_last_line(self):
        self.assertEqual(
            split_text_and_numeric("Hello\nWorld\n123"), ("Hello\nWorld", 123)
        )

    def test_last_line_non_numeric(self):
        self.assertEqual(
            split_text_and_numeric("Hello\nWorld\nabc123"), ("Hello\nWorld", 123)
        )

    def test_only_numeric_lines(self):
        self.assertEqual(split_text_and_numeric("123\n456\n789"), ("123\n456", 789))


class TestConcatenateFilesInZip(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create a temporary zip file for testing
        cls.temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
        with zipfile.ZipFile(cls.temp_zip.name, "w") as zipf:
            # Create some files and directories
            zipf.writestr("test1.txt", "This is test1.")
            zipf.writestr("dir1/test2.txt", "This is test2.")
            zipf.writestr("dir1/dir2/test3.txt", "This is test3.")
            zipf.writestr("test4.md", "This is test4.")

        cls.zip_file_name = cls.temp_zip.name

    @classmethod
    def tearDownClass(cls):
        # Clean up the temporary file
        os.remove(cls.temp_zip.name)

    def test_single_depth_single_pattern(self):
        result = concatenate_files_in_zip(self.zip_file_name, [".txt"], depth=0)
        self.assertIn("test1.txt", result)
        self.assertIn("This is test1.", result)
        self.assertNotIn("test2.txt", result)
        self.assertNotIn("This is test2.", result)

    def test_double_depth_single_pattern(self):
        result = concatenate_files_in_zip(self.zip_file_name, [".txt"], depth=1)
        self.assertIn("test1.txt", result)
        self.assertIn("This is test1.", result)
        self.assertIn("test2.txt", result)
        self.assertIn("This is test2.", result)
        self.assertNotIn("test3.txt", result)
        self.assertNotIn("This is test3.", result)

    def test_double_depth_multiple_patterns(self):
        result = concatenate_files_in_zip(self.zip_file_name, [".txt", ".md"], depth=1)
        self.assertIn("test1.txt", result)
        self.assertIn("This is test1.", result)
        self.assertIn("test2.txt", result)
        self.assertIn("This is test2.", result)
        self.assertIn("test4.md", result)
        self.assertIn("This is test4.", result)


if __name__ == "__main__":
    unittest.main()
