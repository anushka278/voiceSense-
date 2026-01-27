# API Setup Guide

## Google Gemini API Key Setup

To enable AI-powered conversations in Sage, you need to add your Google Gemini API key.

### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Add API Key to Your Project

1. In the root directory of your project, create a file named `.env.local`
2. Add the following line to the file:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied.

**Example:**
```
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 3: Restart Your Development Server

After adding the API key:

1. Stop your development server (Ctrl+C or Cmd+C)
2. Start it again with `npm run dev`

The API key will be loaded automatically.

### Important Notes

- **Never commit `.env.local` to git** - It's already in `.gitignore` to protect your API key
- The API key is exposed to the browser (that's why it starts with `NEXT_PUBLIC_`)
- Make sure to set usage limits in Google AI Studio to prevent unexpected charges
- If the API key is not set, the app will use fallback responses

### Troubleshooting

**AI responses not working?**
- Check that `.env.local` exists in the root directory
- Verify the API key is correct (no extra spaces or quotes)
- Restart your development server after adding the key
- Check the browser console for error messages

**API key not loading?**
- Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
- Ensure the variable name is exactly `NEXT_PUBLIC_GEMINI_API_KEY`
- Restart the dev server after creating/modifying `.env.local`

### Features Enabled

Once the API key is configured:
- ✅ Natural AI-powered conversations with Sage
- ✅ Context-aware responses based on conversation history
- ✅ Text-to-speech for Sage's responses
- ✅ Intelligent follow-up questions
