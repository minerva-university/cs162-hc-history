from setuptools import setup, find_packages

# Package metadata
name = "minerva_api_client"
version = "0.1.0"
description = "A Python client for accessing Minerva's API"
author = "Philip Sterne"
author_email = "psterne@minerva.edu"
url = "https://github.com/minerva-universiy/ProfBotCollective"
license = "MIT"  # Use an appropriate open-source license

# Define package dependencies
install_requires = [
    "requests>=2.32",  # You'll likely need the requests library to make API requests
    "pdfplumber>=0.11.4",
    "pytz==2025.1",
    "nbformat==5.10.4",
]

# Use find_packages to automatically discover and include all subpackages
packages = find_packages()

# Package classifiers (optional)
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.7",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
]

# Package entry points, if any (e.g., console scripts)
entry_points = {
    "console_scripts": [
        # Define any command-line scripts here, if applicable
    ],
}

# Call setup() with the defined parameters
setup(
    name=name,
    version=version,
    description=description,
    author=author,
    author_email=author_email,
    url=url,
    license=license,
    install_requires=install_requires,
    packages=packages,
    classifiers=classifiers,
    entry_points=entry_points,
)
