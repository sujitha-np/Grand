# Android Back Button Fix - Implementation Guide

## Problem
The Android hardware back button was not working throughout the entire application.

## Root Causes Identified
1. **Missing react-native-screens initialization** - Not calling `enableScreens()` in App.tsx
2. **Missing gesture-handler import** - Not importing 'react-native-gesture-handler' at the top of index.js  
3. **Missing MainActivity.kt configuration** - Not overriding `onCreate()` with `super.onCreate(null)`
4. **Auth screen navigation stack** - Back button from Login/Register showing previous auth screen instead of Entry

## Solutions Implemented

### 1. Fixed MainActivity.kt (Android Native Code)
**File:** `/android/app/src/main/java/com/grandcentralbackery/MainActivity.kt`

Added:
```kotlin
import android.os.Bundle

override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(null)
}
```

**Why:** This is required for react-native-screens to work properly on Android and handle back button events correctly.

### 2. Enabled react-native-screens in App.tsx  
**File:** `App.tsx`

Added:
```tsx
import { enableScreens } from 'react-native-screens';

// Enable react-native-screens for better performance and proper back button handling
enableScreens();
```

**Why:** Enables native screen optimization which is crucial for React Navigation to work correctly on Android.

###3. Added gesture-handler to index.js
**File:** `index.js`

Added at the very top:
```javascript
import 'react-native-gesture-handler';
```

**Why:** Must be imported before anything else for gesture handling to work properly on Android.

### 4. Fixed Auth Navigation Stack
**Files:** 
- `EntryScreen.tsx`
- `LoginScreen.tsx`
- `RegisterScreen.tsx`

#### EntryScreen.tsx
Changed navigation from simple `navigate()` to `CommonActions.reset()`:
```tsx
import { CommonActions } from '@react-navigation/native';

const handleLogin = () => {
  navigation.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [
        { name: 'Entry' },
        { name: 'Login' },
      ],
    })
  );
};
```

**Why:** Ensures Entry screen is always in the navigation stack, so back button returns to Entry instead of the previous auth screen.

#### LoginScreen.tsx & RegisterScreen.tsx
Added hardware back button handling:
```tsx
import { BackHandler } from 'react-native';

useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    navigation.navigate('Entry');
    return true; // Prevent default behavior
  });

  return () => backHandler.remove();
}, [navigation]);
```

**Why:** Intercepts the hardware back button press and navigates to Entry screen instead of using default back behavior.

## Testing Checklist

After implementing these changes, you MUST:

1. ✅ **Rebuild the Android app** (changes to MainActivity.kt require full rebuild)
   ```bash
   cd android && ./gradlew clean
   cd .. && npm run android
   ```

2. ✅ **Test Entry → Login → Back** (should go to Entry)
3. ✅ **Test Entry → Register → Back** (should go to Entry)  
4. ✅ **Test Entry → Register → Login → Back** (should go to Entry, not Register)
5. ✅ **Test hardware back button on all screens** (should work throughout app)
6. ✅ **Test on-screen back buttons** (should match hardware button behavior)

## Important Notes

- **Android only**: iOS doesn't have a hardware back button
- **Clean build required**: Changes to MainActivity.kt require cleaning and rebuilding
- **Order matters**: `import 'react-native-gesture-handler'` MUST be first in index.js
- **Navigation stack**: The reset approach ensures consistent back button behavior

## Troubleshooting

If back button still doesn't work:

1. Verify you did a full rebuild after changing MainActivity.kt
2. Check React Native version compatibility with react-native-screens
3. Ensure no other BackHandler listeners are conflicting
4. Check if react-native-screens is properly linked in android/settings.gradle
5. Try running: `cd android && ./gradlew clean && cd .. && npm run android`

## References

- [React Navigation Hardware Back Button Docs](https://reactnavigation.org/docs/custom-android-back-button-handling/)
- [react-native-screens Installation](https://github.com/software-mansion/react-native-screens)
- [react-native-gesture-handler Installation](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/)
