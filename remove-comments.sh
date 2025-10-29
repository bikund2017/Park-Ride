#!/bin/bash

# Script to remove comments from all code files in the project
# Supports: JavaScript (.js, .jsx), CSS (.css), JSON (// comments only)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 Starting comment removal from code files...${NC}\n"

# Counter for processed files
js_count=0
css_count=0
total_count=0

# Function to remove comments from JavaScript/JSX files
remove_js_comments() {
    local file="$1"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Remove single-line comments (// ...) but preserve URLs
    # Remove multi-line comments (/* ... */)
    # Remove JSDoc comments (/** ... */)
    sed -i -E \
        -e 's|//[^"'\'']*$||g' \
        -e ':a;/\/\*/!b;N;//!ba;s/\/\*.*\*\///g' \
        "$file"
    
    # Remove empty lines created by comment removal
    sed -i '/^[[:space:]]*$/d' "$file"
    
    echo -e "${GREEN}✓${NC} Processed: $file"
    ((total_count++))
}

# Function to remove comments from CSS files
remove_css_comments() {
    local file="$1"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Remove CSS comments (/* ... */)
    sed -i -E ':a;/\/\*/!b;N;//!ba;s/\/\*.*\*\///g' "$file"
    
    # Remove empty lines
    sed -i '/^[[:space:]]*$/d' "$file"
    
    echo -e "${GREEN}✓${NC} Processed: $file"
    ((total_count++))
}

# Process JavaScript and JSX files
echo -e "${YELLOW}📝 Processing JavaScript/JSX files...${NC}"
while IFS= read -r -d '' file; do
    # Skip node_modules, dist, build directories
    if [[ "$file" =~ (node_modules|dist|build|\.next) ]]; then
        continue
    fi
    
    remove_js_comments "$file"
    ((js_count++))
done < <(find . -type f \( -name "*.js" -o -name "*.jsx" \) -print0)

echo ""

# Process CSS files
echo -e "${YELLOW}🎨 Processing CSS files...${NC}"
while IFS= read -r -d '' file; do
    # Skip node_modules, dist, build directories
    if [[ "$file" =~ (node_modules|dist|build|\.next) ]]; then
        continue
    fi
    
    remove_css_comments "$file"
    ((css_count++))
done < <(find . -type f -name "*.css" -print0)

echo ""
echo -e "${GREEN}✅ Comment removal complete!${NC}"
echo -e "   JavaScript/JSX files: $js_count"
echo -e "   CSS files: $css_count"
echo -e "   Total files processed: $total_count"
echo ""
echo -e "${YELLOW}📦 Backup files created with .bak extension${NC}"
echo -e "${YELLOW}💡 To restore: find . -name '*.bak' -exec bash -c 'mv \"\$0\" \"\${0%.bak}\"' {} \\;${NC}"
echo ""
echo -e "${RED}⚠️  Review the changes before committing!${NC}"
