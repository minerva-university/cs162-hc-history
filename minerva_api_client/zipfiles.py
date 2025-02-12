import os
import shutil
import zipfile
import fnmatch
import requests
import tempfile
import unittest

from collections import deque, defaultdict
from unittest.mock import patch, mock_open, MagicMock

import pdfplumber
import nbformat


class TextExtractor:
    """Abstract class for text extraction strategy."""

    def extract_text(self, file_path):
        """Extract text from the given file."""
        raise NotImplementedError


class PlainTextExtractor(TextExtractor):
    """Extract text from plain text files."""

    def extract_text(self, file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()


class PDFTextExtractor(TextExtractor):
    """Extract text from PDF files."""

    def extract_text(self, file_path):
        text = ""
        with pdfplumber.open(file_path) as pdf:
            extracted_text = [page.extract_text() for page in pdf.pages]

        return "\n\n".join(extracted_text)


class IPynbTextExtractor(TextExtractor):
    """Extract text from Jupyter Notebook files."""

    def extract_text(self, file_path):
        text = ""
        with open(file_path, "r", encoding="utf-8") as f:
            nb = nbformat.read(f, as_version=4)
            for cell in nb.cells:
                if cell.cell_type == "code" or cell.cell_type == "markdown":
                    text += cell.source + "\n"
        return text


class ZipProcessor:
    """
    A class to process zip files from a URL. It downloads the zip, extracts it,
    filters files based on whitelist and blacklist, and concatenates their contents.
    """

    extractor_map = defaultdict(lambda: PlainTextExtractor())
    extractor_map.update(
        {
            ".pdf": PDFTextExtractor(),
            ".ipynb": IPynbTextExtractor(),
        }
    )

    def __init__(self, url, whitelist, blacklist):
        """
        Initialize the ZipProcessor instance.

        :param url: URL of the zip file to be processed.
        :param whitelist: List of patterns to include in file processing.
        :param blacklist: List of patterns to exclude from file processing.
        """
        self.url = url
        self.whitelist = whitelist
        self.blacklist = blacklist
        self.temp_dir = None
        self.zip_path = None

    def __del__(self):
        """
        Destructor to clean up temporary files and directories.
        """
        if self.zip_path and os.path.exists(self.zip_path):
            os.remove(self.zip_path)
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)

    def download_zip(self):
        """
        Download the zip file from the specified URL.

        :return: Path to the downloaded zip file.
        """
        response = requests.get(self.url)
        response.raise_for_status()
        self.zip_path = tempfile.mktemp(suffix=".zip")
        with open(self.zip_path, "wb") as tmp_file:
            tmp_file.write(response.content)
        return self.zip_path

    def extract_zip(self, zip_path):
        """
        Extract the zip file into a temporary directory.

        :param zip_path: Path to the zip file to be extracted.
        :return: Path to the directory where the zip was extracted.
        """
        self.temp_dir = tempfile.mkdtemp()
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(self.temp_dir)
        return self.temp_dir

    def filter_files(self, directory):
        matched_files = []
        for root, dirs, files in os.walk(directory, topdown=True):
            # Eliminate blacklisted directories from search by modifying dirs in place
            dirs[:] = [
                d
                for d in dirs
                if not any(fnmatch.fnmatch(d, pattern) for pattern in self.blacklist)
            ]

            # Check if current directory is blacklisted; if so, skip it
            if any(
                fnmatch.fnmatch(os.path.basename(root), pattern)
                for pattern in self.blacklist
            ):
                continue

            for file in files:
                # Check if file matches any blacklist pattern
                if any(fnmatch.fnmatch(file, pattern) for pattern in self.blacklist):
                    continue
                # Check if file matches any whitelist pattern
                if any(fnmatch.fnmatch(file, pattern) for pattern in self.whitelist):
                    matched_files.append(os.path.join(root, file))

        return matched_files

    def process_files(self, files, separator="\n" + 80 * "-" + "\n"):
        """
        Read the contents of the files, prepend the filename, and concatenate them.

        :param files: List of file paths to process.
        :return: A single string containing all the processed file contents.
        """
        content = ""
        for file_path in files:
            ext = os.path.splitext(file_path)[1].lower()
            extractor = self.extractor_map[ext]
            try:
                file_content = extractor.extract_text(file_path)
                content += (
                    separator
                    + os.path.relpath(file_path, start=os.path.commonpath(files))
                    + separator
                    + file_content
                    + separator
                )
            except UnicodeDecodeError as e:
                print(f"Error reading file {file_path}: {e}")

        return content

    def execute(self):
        """
        Execute the entire process: download, extract, filter, and process files.

        :return: Concatenated string of all processed file contents.
        """
        try:
            zip_path = self.download_zip()
            extraction_dir = self.extract_zip(zip_path)
            matched_files = self.filter_files(extraction_dir)
            return self.process_files(matched_files)
        except zipfile.BadZipFile as e:
            print(f"Error processing zip file: {e}")
            return ""


class TestZipProcessor(unittest.TestCase):
    def setUp(self):
        self.url = "https://example.com/somefile.zip"
        self.whitelist = ["*.py", "*.js"]
        self.blacklist = ["venv", "node_modules"]
        self.processor = ZipProcessor(self.url, self.whitelist, self.blacklist)

    @patch("requests.get")
    def test_download_zip(self, mock_get):
        mock_get.return_value.ok = True
        mock_get.return_value.content = b"Test content"
        zip_path = self.processor.download_zip()
        self.assertTrue(zip_path.endswith(".zip"))
        self.assertTrue(os.path.exists(zip_path))
        os.remove(zip_path)

    @patch("zipfile.ZipFile")
    def test_extract_zip(self, mock_zipfile):
        mock_zip = MagicMock()
        mock_zipfile.return_value.__enter__.return_value = mock_zip

        with patch("tempfile.mkdtemp") as mock_mkdtemp:
            mock_mkdtemp.return_value = "/path/to/tempdir"
            zip_path = "path/to/zipfile.zip"
            extraction_path = self.processor.extract_zip(zip_path)
            self.assertEqual(extraction_path, "/path/to/tempdir")
            mock_zip.extractall.assert_called_once_with("/path/to/tempdir")

    def test_filter_files(self):
        with patch("os.walk") as mock_walk:
            mock_walk.return_value = [
                ("/path/to/dir1", ("subdir",), ("file1.py", "file2.txt")),
                ("/path/to/dir2", (), ("file3.js", "file4.html")),
            ]
            files = self.processor.filter_files("/path/to")
            expected_files = ["/path/to/dir1/file1.py", "/path/to/dir2/file3.js"]
            self.assertEqual(files, expected_files)

    @patch("os.walk")
    def test_blacklist_deep_directory_structure(self, mock_walk):
        # Mocking the os.walk to simulate the directory structure and files
        mock_walk.return_value = [
            ("dir1", ["subdir"], []),
            ("dir1/subdir", ["subsubdir"], []),
            ("dir1/subdir/subsubdir", ["venv"], []),
            ("dir1/subdir/subsubdir/venv", [], ["bad.py"]),
            ("dir1/subdir/subsubdir/venv", [], ["good.py"]),
        ]

        filtered_files = self.processor.filter_files("dir1")
        expected_files = []  # Expect no files since 'venv' is in the blacklist

        self.assertEqual(filtered_files, expected_files)

    @patch("os.walk")
    def test_whitelist_deep_directory_structure(self, mock_walk):
        # Mocking the os.walk to simulate the directory structure and files
        mock_walk.return_value = [
            ("dir1", ["subdir"], []),
            ("dir1/subdir", ["subsubdir"], []),
            ("dir1/subdir/subsubdir", ["component"], []),
            ("dir1/subdir/subsubdir/component", [], ["good.js"]),
        ]

        filtered_files = self.processor.filter_files("dir1")
        expected_files = [
            "dir1/subdir/subsubdir/component/good.js",
        ]  # Expected file that matches the whitelist

        self.assertEqual(sorted(filtered_files), sorted(expected_files))

    @patch("builtins.open", new_callable=mock_open, read_data="file content")
    def test_process_files(self, mock_file):
        files = ["/path/to/dir1/file1.py", "/path/to/dir2/file3.js"]
        content = self.processor.process_files(files, separator="*")
        expected_content = "*dir1/file1.py*file content**dir2/file3.js*file content*"
        self.assertEqual(content, expected_content)

    def test_execute(self):
        with patch.object(
            self.processor, "download_zip"
        ) as mock_download, patch.object(
            self.processor, "extract_zip"
        ) as mock_extract, patch.object(
            self.processor, "filter_files"
        ) as mock_filter, patch.object(
            self.processor, "process_files", return_value="processed content"
        ) as mock_process:
            mock_download.return_value = "path/to/zipfile.zip"
            mock_extract.return_value = "/path/to/tempdir"
            mock_filter.return_value = ["file1.py", "file2.js"]
            result = self.processor.execute()
            self.assertEqual(result, "processed content")


if __name__ == "__main__":
    unittest.main()
