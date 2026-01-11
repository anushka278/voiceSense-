# Clear All Sage Data

## Method 1: Browser Console (Quickest)

1. Open your browser's Developer Tools (F12 or Cmd+Option+I on Mac)
2. Go to the **Console** tab
3. Paste and run this command:

```javascript
localStorage.removeItem('sage-users');
localStorage.removeItem('sage-storage');
console.log('✅ All Sage data cleared!');
```

## Method 2: Using the HTML Utility

1. Open the file `clear-all-data.html` in your browser
2. Click "Delete All Accounts & Data"
3. Confirm the action

## Method 3: Browser Settings

1. Open browser Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → your domain
4. Delete the following keys:
   - `sage-users`
   - `sage-storage`

## What Gets Deleted

- All user accounts (usernames and passwords)
- All user data (speech analyses, game results, insights)
- All biographies and health journal entries
- All family members and memories
- All cognitive profiles and settings

**⚠️ Warning: This action cannot be undone!**

