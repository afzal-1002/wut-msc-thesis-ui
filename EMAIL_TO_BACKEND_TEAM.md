# Email Template for Backend Team

---

**Subject:** 🔴 CRITICAL: Jira Comment API - 409 Conflict Bug Fix Required

**To:** Backend Team Lead

**CC:** Project Manager

---

Hi [Backend Team],

We've identified a critical bug in the Jira comment API that's blocking users from updating AI analysis comments.

## The Problem
When users try to update a Jira comment multiple times, they get a **409 Conflict error** on the 2nd+ attempt because the backend always tries to CREATE (POST) instead of checking if the comment already exists and UPDATE (PUT) it.

## Current Behavior ❌
```
Attempt 1: ✅ Comment created
Attempt 2: ❌ 409 Conflict (duplicate resource)
Attempt 3+: ❌ Same error
```

## Expected Behavior ✅
```
Attempt 1: ✅ Comment created
Attempt 2: ✅ Comment updated
Attempt 3+: ✅ All updates work
```

## What Needs to Be Fixed
In `JiraCommentServiceImplementation.java`, the `postOrUpdateComment()` method needs to:

1. **GET** all existing comments for the issue from Jira
2. **Check** if an AI comment already exists (by author or marker)
3. **UPDATE** the existing comment if found (PUT operation)
4. **CREATE** a new comment only if none exists (POST operation)

## Implementation Guide
I've prepared a complete implementation guide with:
- ✅ Full code examples
- ✅ Step-by-step instructions
- ✅ Testing checklist
- ✅ Database consistency guidelines

**See:** `BACKEND_TEAM_ACTION_ITEM.md` (in the repo)

## Impact
- **Affects:** All users trying to update AI analysis comments
- **Severity:** HIGH - Currently blocking this feature
- **Timeline:** Please prioritize this week

## Files Affected
- `JiraCommentApiController.java`
- `JiraCommentServiceImplementation.java`
- `JiraCommentService.java` (interface)

## Questions?
If you need clarification on the Jira API integration or database logic, please reach out.

---

**Prepared by:** Frontend Team  
**Date:** January 20, 2026  
**Status:** Ready for Backend Implementation

---

P.S. The frontend has been updated with proper error handling and will display helpful messages while this backend fix is being implemented.
