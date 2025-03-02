import sqlite3
import webbrowser
import os

# Function to get all table names in a database
def get_table_names(db_name):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    return tables

# Function to fetch data from a given database and table
def fetch_data(db_name, table_name):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Get column names
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [col[1] for col in cursor.fetchall()]

    # Get table data
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()

    conn.close()
    return columns, rows

# Function to generate an HTML table
def generate_html(columns, rows, table_name):
    html_content = f"""
    <html>
    <head>
        <title>{table_name} Data</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 20px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }}
            th {{
                background-color: #4CAF50;
                color: white;
            }}
            tr:nth-child(even) {{ background-color: #f2f2f2; }}
        </style>
    </head>
    <body>
        <h2>Data from {table_name}</h2>
        <table>
            <tr>{''.join(f'<th>{col}</th>' for col in columns)}</tr>
            {''.join(f"<tr>{''.join(f'<td>{val}</td>' for val in row)}</tr>" for row in rows)}
        </table>
    </body>
    </html>
    """
    return html_content

# Main function to create the visualization
def visualize_database(db_name, table_name):
    columns, rows = fetch_data(db_name, table_name)
    
    if not rows:
        print(f"⚠️ No data found in {table_name}.")
        return

    html_content = generate_html(columns, rows, table_name)

    # Save to an HTML file
    html_file = "db_visualizer.html"
    with open(html_file, "w", encoding="utf-8") as file:
        file.write(html_content)

    # Open the HTML file in a browser
    webbrowser.open("file://" + os.path.abspath(html_file))

# User selection menu
if __name__ == "__main__":
    # Both tables are in 'data.db', so we set this one
    db_name = "data.db"

    # Choose a table
    tables = get_table_names(db_name)
    if not tables:
        print(f"⚠️ No tables found in {db_name}. Exiting...")
        exit()

    print(f"\n📋 Tables in {db_name}:")
    for i, table in enumerate(tables, start=1):
        print(f"{i}. {table}")

    table_choice = input("\nEnter the number of the table you want to visualize: ")
    if not table_choice.isdigit() or int(table_choice) not in range(1, len(tables) + 1):
        print("❌ Invalid choice. Exiting...")
        exit()

    table_name = tables[int(table_choice) - 1]

    # Visualize the selected table
    visualize_database(db_name, table_name)
