import sys
import os

path = r'C:\Users\wance\.gemini\antigravity\workout_tracker\gymlog-ultimate.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# The subagent identified the note input in the LIFT modal is missing value/onChange
# I need to find the React block for the personBlock inside renderLogSet
old_react_input = '''                    <input 
                      placeholder={`Note for ${person}...`}
                      style={{ ...s.input, fontSize: 11, padding: "6px 12px", background: "#050505", border: "1px solid #1a1a1a", color: "#888" }}
                      value={input.note || ""}
                      onChange={e => updateLogInput(key, "note", e.target.value)}
                    />'''

# Wait, if I already have value/onChange in my code, why is it failing?
# Let me double check the ACTUAL file content. Maybe my previous write failed to apply to the LIFT section.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
