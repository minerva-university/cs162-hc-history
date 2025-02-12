# This file is not complete, and is missing key functionality.
# The intention of this file is to download class videos, extract audio, and transcribe the audio to text.

import requests

# from moviepy.editor import VideoFileClip
import tempfile
from datetime import datetime

# import whisper

from .generic_response import GenericResponse


class ClassEvent(GenericResponse):
    pass


class Class(GenericResponse):
    def get_class_events(self):
        url = f"class_grader/classes/{self.id}/class-events"
        response = self._api.get_http_request(url)
        return [ClassEvent(self._api, d) for d in response]


class Video(GenericResponse):
    def get_video_events(self):
        url = f"class_grader/videos/{self.id}/video-events"
        response = self._api.get_http_request(url)
        return [VideoEvent(self._api, d) for d in response]


model = whisper.load_model("base")
result = model.transcribe(voice_file)

# write to file
with open("result.txt", "w") as f:
    f.write(str(result))

URL = f"https://forum.minerva.edu/api/v1/recording-sessions/{CLASS_ID}/generate_recording_urls"

r = requests.get(URL, headers=HEADERS).json()


def download_mp4(url, file_path):
    """
    Download an MP4 file from a given URL and save it to a specified file path.
    """
    response = requests.get(url)
    if response.status_code == 200:
        with open(file_path, "wb") as file:
            file.write(response.content)
        return True
    else:
        return False


def extract_mp3_from_mp4(mp4_path, mp3_path):
    """
    Extract the MP3 audio from an MP4 file.
    """
    video_clip = VideoFileClip(mp4_path)
    audio_clip = video_clip.audio
    audio_clip.write_audiofile(mp3_path)
    audio_clip.close()
    video_clip.close()


# # Example usage
# url = "your_mp4_url_here"
# mp4_file_path = "/mnt/data/video.mp4"
# mp3_file_path = "/mnt/data/audio.mp3"

# # Download MP4 file
# is_downloaded = download_mp4(url, mp4_file_path)

# # Extract MP3 from MP4
# if is_downloaded:
#     extract_mp3_from_mp4(mp4_file_path, mp3_file_path)
