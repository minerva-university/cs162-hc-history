# HC/LO Feedback Viewer

**A platform for pulling, viewing, and summarizing student feedback data from Forum.**

This project can run fully with just an OpenAI API key (optional, for AI summarization of your feedback). The platform automatically handles login to the Forum using your browser session.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Video Demo](#video-demo)
3. [For Non-CS Majors](#for-non-cs-majors)
   - [How to Download the Code](#how-to-download-the-code)
   - [How to Open a Terminal](#how-to-open-a-terminal)
   - [How to Navigate to the Code](#how-to-navigate-to-the-code)
   - [Create and Activate a Virtual Environment](#create-and-activate-a-virtual-environment-recommended)
   - [Install Node.js](#install-nodejs-required-for-frontend)
   - [Make Sure Python Is Installed](#make-sure-python-is-installed)
4. [Required Credentials](#required-credentials)
   - [How to Get an OpenAI API Key (Optional)](#how-to-get-an-openai-api-key-optional)
5. [How to Set Up the Project (`setup.py`)](#how-to-set-up-the-project-setuppy)
   - [About the Login Process](#about-the-login-process)
6. [How to Run the Project Again (`run.py`)](#how-to-run-the-project-again-runpy)
7. [Accessing the Website](#accessing-the-website)


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

## For Non-CS Majors

### How to Download the Code

1. Click the green `Code` button on the GitHub page.
2. Select "Download ZIP".
3. Unzip the folder somewhere easy to find, like your Desktop.

### How to Open a Terminal

- On Mac: Press `Command + Space`, type "Terminal", and hit `Enter`.
- On Windows: Press `Windows Key`, type "cmd" or "Terminal", and hit `Enter`.

### How to Navigate to the Code

Once in your terminal, use the `cd` command to move into the folder.

Example:
```bash
cd Desktop/cs162-hc-history-main
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

## AI Summary Feature

The AI Summary feature uses OpenAI's GPT models to analyze your feedback and generate natural language summaries. These summaries provide insights into your strengths and areas for improvement for each learning outcome.

### Setting Up the AI Summary Feature

1. **First-Time Setup**
   - When you run `setup.py`, you'll be asked if you want to enable AI summarization
   - If you choose yes, you'll be prompted to enter your OpenAI API key
   - The key will be saved in `.env` file in your project root directory
   - This file is automatically ignored by Git for security

2. **Manual API Key Setup**
   If you want to add or update your API key later:
   - Create or edit the `.env` file in your project root directory
   - Add your API key in this format:
     ```
     OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```
   - Restart the application for changes to take effect

### How AI Summaries Work

The AI summary feature:
1. Analyzes all feedback comments for each learning outcome
2. Generates personalized summaries highlighting:
   - Your strengths and accomplishments
   - Specific areas for improvement
   - Patterns across different courses and terms
3. Updates automatically when new feedback is pulled
4. Displays summaries in an easy-to-read format on the web interface

### Viewing AI Summaries

Once enabled:
1. Navigate to the web interface
2. Click on any learning outcome
3. View the AI-generated summary in the expanded card
4. Use the navigation buttons to cycle through different learning outcomes

> Note: The first time you view summaries for a learning outcome, there might be a brief delay as the summary is generated.

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

### About the Login Process

During setup, a browser window will open for you to log in to Forum:

1. **Sign in with your Minerva credentials** when the browser opens
2. **Important:** You do NOT need to create a new Google profile, even if prompted (especially in incognito mode)
3. After successful login, you may need to return to your terminal:
   - **Important note:** If you are running `setup.py` for the first time, once you enter your email and password for Google Login, **DON'T close the window or navigate anywhere** unless you hit **Enter** in the terminal. Otherwise, the session gets interrupted and it will show an error.
   - If you ran `setup.py` before, but for some reason you ran it again, you won't need to press enter as it will automatically remember your last login.
   - If nothing happens for a minute after login, try pressing Enter in your terminal
  
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

Once you've run `setup.py` or `run.py`, open your browser and go to:

http://localhost:3000

You can now explore your feedback data and, if enabled, view AI-generated summaries.