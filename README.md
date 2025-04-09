# HC/LO Feedback Viewer

**A platform for pulling, viewing, and summarizing student feedback data from Forum.**

This project requires three pieces of information to work fully:

- `csrftoken` (required)  
- `sessionid` (required)  
- OpenAI API key (optional, for AI summarization of your feedback)

---

## Table of Contents

1. [For Non-CS Majors](#for-non-cs-majors)
   - [How to Download the Code](#how-to-download-the-code)
   - [How to Open a Terminal](#how-to-open-a-terminal)
   - [How to Navigate to the Code](#how-to-navigate-to-the-code)
2. [Project Overview](#project-overview)
3. [Video Demo](#video-demo)
4. [Required Credentials](#required-credentials)
   - [How to Find CSRF Token and Session ID](#how-to-find-csrf-token-and-session-id)
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

## Project Overview

This project pulls feedback data from the Minerva Forum using your credentials, stores it in a local database (`data.db`), and lets you view or summarize that data.

It includes:

- A Python backend for fetching and storing data  
- An optional AI summarization tool using OpenAI  
- A modern web frontend to explore the data visually  

---

## Video Demo

A demo video will go here once it's recorded.

---

## Required Credentials

To run everything, you'll need three things:

- csrftoken  
- sessionid  
- OpenAI API key (only needed for AI summaries)

You only need to find these once, and the setup process will save them in a hidden `.env` file.

---

### How to Find CSRF Token and Session ID

1. Go to https://forum.minerva.edu  
2. Right-click anywhere and click Inspect  
3. Go to the Network tab and refresh the page  
4. Look for the "self" request  
5. Click it, then open the Headers tab  
6. Scroll down to find:  
   - `csrftoken=...`  
   - `sessionid=...`  

Example:  
![gettokens](https://github.com/user-attachments/assets/549df9fd-36ec-45c2-8a70-d42ffc7f0b25)

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

Run this the first time to set everything up:

```bash
python3 setup.py
```

What it does:
- Installs dependencies  
- Prompts you for your credentials  
- Pulls data from the Minerva Forum and stores it in `data.db`  
- Optionally runs AI summarization using OpenAI  

---

## How to Run the Project (`run.py`)

Once everything is set up, run this to start the platform:

```bash
python3 run.py
```

What it does:
- Verifies everything is in place (`data.db`, credentials, etc.)  
- Launches the backend and frontend  

---

## Accessing the Website

Once you’ve run `run.py`, open your browser and go to:

http://localhost:3000

You can now explore your feedback data and, if enabled, view AI-generated summaries.
