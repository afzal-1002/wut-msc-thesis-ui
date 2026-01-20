# Quick Fix: 409 Conflict Error - For Backend Team

## TL;DR
Your backend always POSTs new comments. Jira returns **409 Conflict** when the comment already exists. Fix: **Check if comment exists FIRST, then UPDATE (PUT) instead of CREATE (POST)**.

---

## The Problem
```
POST /api/wut/jira/comment/RESAI-10
→ Jira: "That comment already exists!"
→ HTTP 409 Conflict ❌
```

## The Solution
```
1. GET /api/wut/jira/issue/RESAI-10/comments
2. Look for comment by author "ai-bot" or marker "[AI Analysis]"
3. IF found:
     PUT /api/wut/jira/comment/RESAI-10/{commentId}  ← Update
4. ELSE:
     POST /api/wut/jira/comment/RESAI-10  ← Create
```

---

## Backend Code Changes Needed

### In `JiraCommentServiceImplementation.java`:

**REPLACE this:**
```java
public void postComment(String issueKey, CommentRequest request) {
    jiraClient.createComment(issueKey, request);  // ❌ Always POST
}
```

**WITH this:**
```java
public void postComment(String issueKey, CommentRequest request) {
    // ✅ Check if AI comment already exists
    List<Comment> existingComments = jiraClient.getIssueComments(issueKey);
    Comment aiComment = existingComments.stream()
        .filter(c -> c.getAuthor().contains("ai") || c.getBody().contains("[AI Analysis]"))
        .findFirst()
        .orElse(null);
    
    if (aiComment != null) {
        // ✅ UPDATE existing
        jiraClient.updateComment(issueKey, aiComment.getId(), request);
    } else {
        // ✅ CREATE new
        jiraClient.createComment(issueKey, request);
    }
}
```

---

## Files to Update
1. `JiraCommentApiController.java` - Add endpoints
2. `JiraCommentServiceImplementation.java` - Add check logic
3. `JiraClient.java` - Ensure PUT method exists

**Frontend has been updated** ✅ to handle 409 errors gracefully while you fix the backend.

---

## Testing
After fix:
1. Click "Get AI Analysis"
2. Click "Update Jira Comment" → ✅ Works
3. Click "Update Jira Comment" again → ✅ Still works (updates, not duplicate)
