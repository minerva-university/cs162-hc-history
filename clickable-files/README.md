this readme file can be moved to the top level if we decide to use these

# HC/LO Feedback Viewer

**A platform for pulling, viewing, and summarizing student feedback data from Forum.**

This project is designed to be easy to use with **just a double-click**, no terminal experience required.

---

## Quick Start (No Terminal Needed)

### 1. Run the Setup
Run this once to install everything and collect your data:

- On **Mac**: double-click `mac.command`
- On **Windows**: double-click `windows.bat`

You'll be asked for:
- Your CSRF token (required)
- Your Session ID (required)
- Your OpenAI API key (optional, for summaries)

The setup process takes about **5 minutes**, or **10 if you enable AI summaries**.

### 2. Launch the Platform
After setup is complete:

- On **Mac**: double-click `mac.command`
- On **Windows**: double-click `windows.bat`

This will:
- Start the backend and frontend
- Open the app automatically in your browser

The website will open at:

```
http://localhost:3000
```

---

## Where Do I Get the Required Info?

### CSRF Token and Session ID (Required)

1. Visit https://forum.minerva.edu
2. Right-click anywhere and choose **Inspect**
3. Go to the **Network** tab and refresh the page
4. Look for a request called `self`
5. Click it, then go to the **Headers** tab
6. Scroll down until you see:
   - `csrftoken=...`
   - `sessionid=...`

Example:  
![gettokens](https://github.com/user-attachments/assets/549df9fd-36ec-45c2-8a70-d42ffc7f0b25)

Copy those values into the prompts during setup.

### OpenAI API Key (Optional, for Summarization)

1. Go to https://platform.openai.com/api-keys
2. Log in and click **Create new secret key**
3. Copy your key (looks like `sk-...`)

**Note:** This only works if you have an active OpenAI plan or free credits. You can check this at:
- https://platform.openai.com/account/usage
- https://platform.openai.com/account/billing

---

## After Setup: Running and Stopping the App

### To Run Again
After you've set up the app once, you can launch it any time by:

- Double-clicking `mac.command` (Mac)
- Double-clicking `windows.bat` (Windows)

### To Stop the App
To shut everything down:

- If you're in a terminal window, press `Control + C`
- If you see a popup like this:

  > Do you want to terminate running processes in this window?

  Just click **Terminate** — it won't break anything.

---

## Having Trouble?
If the clickable files don't work (or you're on Linux):

1. Open a terminal and navigate to the folder:

```bash
cd path/to/cs162-hc-history
```

2. Run the setup or run scripts manually:

```bash
python3 setup.py
python3 run.py
```

3. The app will still open at:

```
http://localhost:3000
```

Let us know if you hit any issues!

