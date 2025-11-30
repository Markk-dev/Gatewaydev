# Smart Text Highlighting Guide

## How It Works

The chatbot automatically highlights important words in AI responses using different styles based on the type of content.

## Highlighting Rules

### 1. **Names** (Highlight - Pink)
- **Pattern**: Multiple capitalized words together
- **Examples**: "Alan Turing", "Charles Babbage", "John von Neumann"
- **Style**: Pink highlight background
- **Use**: Person names, company names

### 2. **Technical Terms/Acronyms** (Box - Blue)
- **Pattern**: 2-5 capital letters
- **Examples**: "AI", "CPU", "RAM", "HTTP", "API"
- **Style**: Blue box around text
- **Use**: Acronyms, technical abbreviations

### 3. **Years/Dates** (Circle - Orange)
- **Pattern**: Years (1000-2099), century markers
- **Examples**: "1940", "2024", "19th", "20th", "21st"
- **Style**: Orange circle around text
- **Use**: Historical dates, time periods

### 4. **Proper Nouns** (Underline - Green)
- **Pattern**: Single capitalized words (3+ letters)
- **Examples**: "Turing", "Paris", "Python", "Microsoft"
- **Style**: Green underline
- **Use**: Places, single names, technologies

## Priority System

When words overlap, the system uses priority:
1. Names (highest priority)
2. Technical terms
3. Years/dates
4. Proper nouns (lowest priority)

## Example Output

**Input**: "Alan Turing invented the Turing machine in 1936 for AI research."

**Output**:
- "Alan Turing" → Pink highlight (name)
- "Turing" → Green underline (proper noun)
- "1936" → Orange circle (year)
- "AI" → Blue box (acronym)

## Customization

Edit `lib/text-highlighter.tsx` to:
- Add new patterns
- Change colors
- Adjust priorities
- Add more annotation styles

## Available Styles

From `components/ui/highlighter.tsx`:
- `highlight` - Background highlight
- `underline` - Underline text
- `box` - Box around text
- `circle` - Circle around text
- `strike-through` - Strike through text
- `crossed-off` - Cross off text
- `bracket` - Bracket notation
