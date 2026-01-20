# 🚀 AI Analysis Comment - Quick ADF Format Reference

## ✅ Minimum Working Format

```json
{
  "body": {
    "type": "doc",
    "version": 1,
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Your AI analysis content here"
          }
        ]
      }
    ]
  }
}
```

---

## 📝 AI Analysis Full Format

```json
{
  "body": {
    "type": "doc",
    "version": 1,
    "content": [
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "AI Analysis Results"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "Brief description"}
        ]
      },
      {
        "type": "heading",
        "attrs": {"level": 3},
        "content": [{"type": "text", "text": "Root Causes"}]
      },
      {
        "type": "bulletList",
        "content": [
          {
            "type": "listItem",
            "content": [
              {"type": "paragraph", "content": [
                {"type": "text", "text": "Point 1"}
              ]}
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 🎨 Common Formatting

| Need | Format |
|------|--------|
| **Bold** | `"marks": [{"type": "strong"}]` |
| *Italic* | `"marks": [{"type": "em"}]` |
| `Code` | `"marks": [{"type": "code"}]` |
| Heading | `"type": "heading", "attrs": {"level": 2}` |
| Bullet | `"type": "bulletList"` |
| Numbers | `"type": "orderedList"` |

---

## ✨ Your Frontend Already Does This!

The AI Analysis component automatically converts:
```
# Heading → ADF heading
- Bullet → ADF bullet list
**Bold** → ADF strong text
```

**Just use markdown in the UI!** ✅

---

## 📤 To Update a Comment

Same body format for:
- **POST** `/api/wut/jira/comment/{issueKey}` (create)
- **PUT** `/api/wut/jira/comment/{issueKey}/{commentId}` (update)

The only difference is the endpoint! 🎯
