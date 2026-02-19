# Bible Verse Input Component

This React Native component allows users to input multiple Bible verse references, fetch their full text from a Bible API, generate discussion questions using OpenAI, and save them to Firestore.

## Features

- ✅ Input Bible verse references (e.g., "John 3:16", "Jeremiah 1:26")
- ✅ Fetch full verse text from bible-api.com
- ✅ Generate 3 thoughtful discussion questions using OpenAI
- ✅ Display verses in a clean, card-based layout
- ✅ Display discussion questions in styled cards
- ✅ Remove individual verses from the list
- ✅ Submit all verses and questions to Firestore under the current user's week
- ✅ Loading states and error handling
- ✅ Responsive design with dark/light mode support
- ✅ Keyboard-aware layout

## Setup

### 1. OpenAI API Configuration

Create a `.env` file in the root directory and add your OpenAI API key:

```bash
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

To get an OpenAI API key:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 2. Firebase Configuration

Update the Firebase configuration in `lib/firebase.ts` with your actual Firebase project details:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Firestore Security Rules

Ensure your Firestore security rules allow authenticated users to write to the `weeks` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weeks/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4. Authentication

The component assumes the user is already authenticated. Make sure you have Firebase Authentication set up in your app.

## Usage

The component is already integrated into the app as a new tab called "Bible Verses". You can also use it in other screens:

```typescript
import BibleVerseInput from '@/components/BibleVerseInput';

export default function MyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BibleVerseInput />
    </SafeAreaView>
  );
}
```

## API Integration

### Bible API
The component uses the free [bible-api.com](https://bible-api.com/) service to fetch verse text. The API supports various Bible translations and formatting options.

### OpenAI API
The component uses OpenAI's GPT-3.5-turbo model to generate discussion questions. The prompt is formatted as:

```
"Based on these verses: [verse1, verse2, verse3], generate 3 thoughtful discussion questions for a couple. Format your response as a JSON array of strings, like: ["Question 1", "Question 2", "Question 3"]"
```

### Example API Responses

**Bible API Response:**
```json
{
  "reference": "John 3:16",
  "text": "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
  "translation_name": "World English Bible",
  "translation_id": "web"
}
```

**OpenAI API Response:**
```json
[
  "How does this verse challenge your understanding of God's love?",
  "What does it mean to 'believe' in Jesus in the context of your relationship?",
  "How can you apply the principle of sacrificial love in your daily interactions?"
]
```

## Data Structure

When verses and questions are submitted to Firestore, they are stored in the following structure:

```typescript
interface WeekData {
  userId: string;
  verses: Array<{
    reference: string;
    text: string;
  }>;
  discussionQuestions: string[];
  createdAt: Timestamp;
  weekStart: Date;
}
```

## Component Interface

```typescript
interface BibleVerse {
  id: string;
  reference: string;
  text: string;
  isLoading?: boolean;
}

interface DiscussionQuestion {
  id: string;
  question: string;
}
```

## Styling

The component uses the app's existing theme system and automatically adapts to light/dark mode. It includes:

- Rounded cards with subtle shadows
- Consistent spacing and typography
- Loading indicators
- Error states
- Responsive button states
- Styled discussion question cards with italic text

## Error Handling

The component handles various error scenarios:

- Invalid verse references
- Network errors when fetching verse text
- OpenAI API errors and rate limits
- JSON parsing errors for OpenAI responses
- Firebase authentication errors
- Firestore write errors

## Customization

You can customize the component by:

1. **Changing the Bible API**: Modify the `fetchVerseText` function to use a different Bible API
2. **Modifying OpenAI prompts**: Update the prompt in `generateDiscussionQuestions` function
3. **Adding translations**: Update the API call to include specific Bible translations
4. **Changing the AI model**: Switch to GPT-4 or other OpenAI models
5. **Modifying the data structure**: Change how verses and questions are stored in Firestore
6. **Styling**: Update the StyleSheet to match your app's design system

## Dependencies

The component uses these dependencies (already included in the project):

- `react-native` - Core React Native components
- `firebase` - Firebase SDK for Firestore and Auth
- `@/components/ThemedText` - Themed text component
- `@/components/ThemedView` - Themed view component
- `@/constants/Colors` - Color scheme constants
- `@/hooks/useColorScheme` - Color scheme hook

## Testing

To test the component:

1. Start the development server: `npx expo start`
2. Navigate to the "Bible Verses" tab
3. Try adding various verse references like:
   - "John 3:16"
   - "Jeremiah 1:26"
   - "Psalm 23:1"
   - "Matthew 28:19-20"
4. Test the "Generate Discussion Questions" button
5. Test removing verses
6. Test submitting to Firestore (requires authentication)

## Troubleshooting

### Verse not loading
- Check your internet connection
- Verify the verse reference format
- Check the browser console for API errors

### OpenAI questions not generating
- Ensure your OpenAI API key is correctly set in `.env`
- Check that you have sufficient OpenAI credits
- Verify the API key has the correct permissions
- Check the browser console for API errors

### Firebase errors
- Ensure Firebase is properly configured
- Check that the user is authenticated
- Verify Firestore security rules
- Check the Firebase console for any quota limits

### Styling issues
- Ensure all theme components are properly imported
- Check that the Colors constant is accessible
- Verify the useColorScheme hook is working

## Cost Considerations

- **Bible API**: Free (bible-api.com)
- **OpenAI API**: Pay-per-use based on token consumption
  - GPT-3.5-turbo: ~$0.002 per 1K tokens
  - Typical cost per question generation: ~$0.01-0.05
- **Firebase**: Free tier available, then pay-per-use 