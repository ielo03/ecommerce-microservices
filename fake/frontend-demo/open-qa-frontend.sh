#!/bin/bash

# Script to open the frontend demo HTML file in the default browser

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Path to the HTML file
HTML_FILE="$SCRIPT_DIR/index.html"

# Check if the file exists
if [ ! -f "$HTML_FILE" ]; then
    echo "Error: HTML file not found at $HTML_FILE"
    exit 1
fi

# Open the HTML file in the default browser
echo "Opening frontend demo for QA environment..."

# Detect the operating system and use the appropriate command
case "$(uname -s)" in
    Darwin*)    # macOS
        open "$HTML_FILE"
        ;;
    Linux*)     # Linux
        if command -v xdg-open > /dev/null; then
            xdg-open "$HTML_FILE"
        elif command -v gnome-open > /dev/null; then
            gnome-open "$HTML_FILE"
        else
            echo "Could not detect the web browser to use."
            echo "Please open the file manually: $HTML_FILE"
        fi
        ;;
    CYGWIN*|MINGW*|MSYS*)  # Windows
        start "$HTML_FILE"
        ;;
    *)
        echo "Unsupported operating system. Please open the file manually: $HTML_FILE"
        ;;
esac

echo "Frontend demo is now accessible at: $HTML_FILE"
echo "It is configured to connect to the QA environment API Gateway at:"
echo "http://a66d7a4e770c648488eb7ceedaed5de3-1091165914.us-west-2.elb.amazonaws.com"