#!/usr/bin/env python3
import re

with open('public/static/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove backslash before backticks and dollar signs in template literals
content = content.replace('\\`', '`')
content = content.replace('\\$', '$')

with open('public/static/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed!")
