
Please open the README to understand how to use the ai-summary branch: https://github.com/minerva-university/cs162-hc-history/tree/ai-summary/ai-summary

# HC/LO Feedback Platform
Please open ``pulling_data/`` for the backend code
A visualization platform for HC/LO feedback data.

## Project Structure

- **`frontend/`**: Next.js-based frontend application with data visualization
- **`pulling_data/`**: Flask backend API and database utilities

## Quick Start

1. **Set up the backend**
   ```bash
   cd pulling_data
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

2. **Prepare your database**
   
   Either use your own database or create a sample one:
   ```bash
   cd pulling_data
   sqlite3 data.db < schema.sql
   sqlite3 data.db < sample_data.sql #if you create a sample one
   ```

3. **Start the Flask backend**
   ```bash
   python app.py
   ```

4. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Detailed Documentation

For more detailed setup instructions and database configuration, see:
- (pulling_data/README.md)


## Data Privacy

This application is designed to work with your own database. The repository does not include any actual feedback data. When you clone the repository, you'll need to set up your own database using the provided schema and sample data, or connect it to your existing database.

