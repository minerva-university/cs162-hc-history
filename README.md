# HC/LO Feedback Viewer

**A platform for pulling, viewing, and summarizing student feedback data from Forum.**

This project can run fully with just an OpenAI API key (optional, for AI summarization of your feedback). The platform automatically handles login to the Forum using your browser session.

---

## Table of Contents

1. [For Non-CS Majors](#for-non-cs-majors)
   - [How to Download the Code](#how-to-download-the-code)
   - [How to Open a Terminal](#how-to-open-a-terminal)
   - [How to Navigate to the Code](#how-to-navigate-to-the-code)
2. [Project Overview](#project-overview)
3. [Video Demo](#video-demo)
4. [Required Credentials](#required-credentials)
   - [How to Get an OpenAI API Key (Optional)](#how-to-get-an-openai-api-key-optional)
5. [How to Set Up the Project (`setup.py`)](#how-to-set-up-the-project-setuppy)
6. [How to Run the Project (`run.py`)](#how-to-run-the-project-runpy)
7. [Accessing the Website](#accessing-the-website)

---

## For Non-CS Majors

### How to Download the Code

1. Click the green `Code` button on the GitHub page.
2. Select "Download ZIP".
3. Unzip the folder somewhere easy to find, like your Desktop.

### How to Open a Terminal

- On Mac: Press `Command + Space`, type “Terminal”, and hit `Enter`.
- On Windows: Press `Windows Key`, type “cmd” or “Terminal”, and hit `Enter`.

### How to Navigate to the Code

Once in your terminal, use the `cd` command to move into the folder.

Example:
```bash
cd Desktop/cs162-hc-history
```

Then, to confirm you're in the right place:
```bash
ls  # Mac/Linux
dir # Windows
```

You should see something like this:
```arduino
README.md            frontend          ai-summary
requirements.txt     setup.py          backend
run.py
```

---

### Install Node.js (Required for Frontend)

The frontend uses Next.js, which requires Node.js and npm. Follow these steps to install them:

1. Go to the official Node.js website: [https://nodejs.org/en/download](https://nodejs.org/en/download)
2. Download the **LTS (Long-Term Support)** version for your operating system.
3. Run the installer and follow the instructions. Make sure to check the box that says **"Add to PATH"** if prompted.

To confirm the installation worked, open your terminal and run:

```bash
node -v
npm -v
```

---

### Make Sure Python Is Installed

Once you're in the project folder, check if Python is installed by copying this into your terminal:

```bash
python3 --version
```

If that doesn't work, try:

```bash
python --version
```

You should see a version like:

```
Python 3.x.x
```

If you see an error or it says Python 2.x, follow the instructions below to install Python 3.

<details>
<summary><strong>Install Python 3 on macOS</strong></summary>

1. Visit [python.org/downloads/mac-osx](https://www.python.org/downloads/mac-osx/)
2. Download the latest version of Python 3.
3. Run the installer and follow the steps.
4. After installation, reopen your terminal and run:

```bash
python3 --version
```

You should now see a version like `Python 3.x.x`.

> Optional: If you're comfortable with Homebrew, you can also run:

```bash
brew install python
```

</details>

<details>
<summary><strong>Install Python 3 on Windows</strong></summary>

1. Visit [python.org/downloads/windows](https://www.python.org/downloads/windows/)
2. Download the latest version of Python 3.
3. When installing:
   - **Check the box** that says "Add Python to PATH"
   - Click "Install Now"
4. After installation, open a new terminal and run:

```bash
python --version
```

You should see a version like `Python 3.x.x`.

</details>

---

### Create and Activate a Virtual Environment (Recommended)

Before installing Python packages, create and activate a virtual environment:

#### On Mac/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

#### On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

---

## Project Overview

This project pulls feedback data from Forum using your active browser session, stores it in a local database (`data.db`), and lets you view or summarize that data.

It includes:

- A Python backend for fetching and storing data  
- An optional AI summarization tool using OpenAI  
- A modern web frontend to explore the data visually  

---

## Video Demo

A demo video will go here once it's recorded.

---

## Required Credentials

To run everything, you only need an OpenAI API key if you want to use AI summaries. The system will handle your login session through an interactive browser.

---

### How to Get an OpenAI API Key (Optional)

1. Go to https://platform.openai.com/api-keys  
2. Sign in with your OpenAI account  
3. Click "Create new secret key"  
4. Copy the key — it will look like `sk-abc123...`

**Important:**  
To use this key, you must either:
- Be on a paid OpenAI plan (Pay-as-you-go)
- Or have free credits available in your account

You can check your usage and billing status at:  
https://platform.openai.com/account/usage  
https://platform.openai.com/account/billing

---

## How to Set Up the Project (`setup.py`)

Run this the first time to set everything up. This will automatically run the project as well:

```bash
python3 setup.py
```

What it does:
- Installs dependencies  
- Authenticates using your browser session  
- Pulls data from Forum and stores it in `data.db`  
- Optionally runs AI summarization using OpenAI  
- Runs the website

---

## How to Run the Project Again (`run.py`)

Once everything is set up, run this to start the platform again:

```bash
python3 run.py
```

What it does:
- Verifies everything is in place (`data.db`, `.env`, etc.)  
- Launches the backend and frontend  

---

## Accessing the Website

Once you’ve run `setup.py` or `run.py`, open your browser and go to:

http://localhost:3000

You can now explore your feedback data and, if enabled, view AI-generated summaries.
