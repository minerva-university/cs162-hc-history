import sqlite3
import webbrowser
import os

# Update the database path to be absolute
db_name = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.db")

# Function to get all table and view names in a database
def get_table_names(db_name):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    # Get tables
    cursor.execute("SELECT name, 'Table' FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    # Get views
    cursor.execute("SELECT name, 'View' FROM sqlite_master WHERE type='view';")
    views = cursor.fetchall()

    conn.close()

    # Combine and return labeled list
    return tables + views

# Function to fetch data from a given database and table/view
def fetch_data(db_name, table_name):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Get column names
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [col[1] for col in cursor.fetchall()]

    # Get table/view data
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

            tr:nth-child(even) {{ 
                background-color: #f2f2f2; 
            }}

            .hidden {{
                display: none;
            }}

            .toggle-buttons {{
                margin-bottom: 10px;
            }}

            /* Styling for buttons */
            button {{
                padding: 8px 16px;
                font-size: 14px;
                border: 2px solid #4CAF50;
                background-color: white;
                color: #4CAF50;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-right: 5px;
                margin-bottom: 5px;
            }}

            /* Hover and focus states */
            button:hover {{
                background-color: #4CAF50;
                color: white;
                outline: none;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
            }}
        </style>
    </head>
    <body>
        <h2>Data from {table_name}</h2>
        
        <!-- Buttons to toggle column visibility -->
        <div class="toggle-buttons">
            <p>Click to toggle columns:</p>
            {''.join(f'<button onclick="toggleColumn({i})">Toggle {col}</button>' for i, col in enumerate(columns))}
        </div>
        
        <!-- Table to display the data -->
        <table id="data-table">
            <thead>
                <tr>{''.join(f'<th>{col}</th>' for col in columns)}</tr>
            </thead>
            <tbody>
                {''.join(f"<tr>{''.join(f'<td>{val}</td>' for val in row)}</tr>" for row in rows)}
            </tbody>
        </table>

        <script>
            // Function to toggle column visibility
            function toggleColumn(index) {{
                var table = document.getElementById("data-table");
                var rows = table.getElementsByTagName("tr");
                
                // Loop through rows and toggle visibility of the column
                for (var i = 0; i < rows.length; i++) {{
                    var cells = rows[i].getElementsByTagName("td");
                    if (cells.length > 0) {{
                        // Toggle visibility for each row
                        cells[index].classList.toggle("hidden");
                    }}
                }}
                // Toggle the header column as well
                var headers = table.getElementsByTagName("th");
                headers[index].classList.toggle("hidden");
            }}
        </script>
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
    # Get tables and views
    tables = get_table_names(db_name)
    if not tables:
        print(f"⚠️ No tables or views found in {db_name}. Exiting...")
        exit()

    print(f"\n📋 Tables and Views in {db_name}:")
    for i, (table_name, table_type) in enumerate(tables, start=1):
        print(f"{i}. {table_name} ({table_type})")

    table_choice = input("\nEnter the number of the table/view you want to visualize: ")
    if not table_choice.isdigit() or int(table_choice) not in range(1, len(tables) + 1):
        print("❌ Invalid choice. Exiting...")
        exit()

    table_name = tables[int(table_choice) - 1][0]

    # Visualize the selected table/view
    visualize_database(db_name, table_name)
