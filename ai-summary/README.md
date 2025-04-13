# 📚 AI Summary Tool for Student Feedback

This project uses OpenAI's GPT models to generate natural language summaries from student feedback data stored in the `assignment_scores` view of a SQLite database. The summaries are saved into structured tables to support analysis, reporting, or visualization.

---

## ⚙️ Setup Instructions

### 1️⃣ Install Python Dependencies

From the `ai-summary/` directory:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2️⃣ Set Up OpenAI API Key

You have two options to set up your OpenAI API key:

#### Option 1: Using the Setup Script (Recommended)
Run the setup script and follow the prompts:
```bash
python setup.py
```
This will:
- Ask if you want to enable AI summarization
- Guide you through getting an OpenAI API key
- Automatically save your key to the .env file

#### Option 2: Manual Setup
Create a `.env` file inside the `ai-summary/` directory and paste:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> 🔒 Do **not** share or commit your API key. The .env file is automatically ignored by Git.

### 3️⃣ Initialize Database Schema

Initialize the database and set up OpenAI:

```bash
python init_db.py
```

This creates the following tables:
- `ai_summaries`
- `assignment_summaries`
- `outcome_summaries`

### 4️⃣ Verify Setup

Test that your OpenAI key is working:
```bash
python test_openai.py
```

---

## 🚀 How to Use the Script

Run the main summarization tool:

```bash
python ai_summary.py [OPTIONS]
```

### 🔢 Modes of Operation

| Mode (`--mode`)            | Description                                                                 | Output Table              |
|----------------------------|-----------------------------------------------------------------------------|---------------------------|
| `assignment_outcome`       | Summarizes each feedback individually by assignment + outcome               | `ai_summaries`            |
| `outcome`                  | Groups all comments by outcome and summarizes each group                   | `outcome_summaries`       |
| `assignment`               | Groups all comments by assignment and summarizes each group                | `assignment_summaries`    |

---

### ✅ Example Commands

**Summarize individual feedbacks (default):**

```bash
python ai_summary.py --mode assignment_outcome --limit 10 --debug
```

**Summarize by outcome group:**

```bash
python ai_summary.py --mode outcome --group-limit 5 --debug
```

**Summarize by assignment group:**

```bash
python ai_summary.py --mode assignment --group-limit 3 --debug
```

---

## ⚙️ Optional Command-Line Arguments

| Argument            | Description                                                                 |
|---------------------|------------------------------------------------------------------------------|
| `--mode`             | One of `assignment_outcome`, `outcome`, `assignment`                        |
| `--limit`            | Max number of rows to summarize (only for `assignment_outcome`)             |
| `--group-limit`      | Max number of groups to summarize (only for `outcome` or `assignment` modes)|
| `--debug`            | Enables verbose logs and debug information                                  |

---

## 📊 Visualization Options

You can explore the database contents using:

1. [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Built-in HTML visualizer (`db_visualizer.html`)
   - Open it in your browser after summaries are generated.
   - You can also run backend/db_visualizer.py

---

## 💡 How It Works (Behind the Scenes)

1. **Fetch comments** from the `assignment_scores` view.
2. **Send prompts** to OpenAI GPT (`gpt-3.5-turbo`).
3. **Store summaries** in the corresponding table.
4. **Skip/validate** comments that are empty or exceed context length.
5. **Support retry/overwrite** if summaries are updated later.
