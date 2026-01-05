# RTL (Arabic) Language Support - Fix Guide

## What Was Fixed

### 1. **Global I18n Configuration** (`src/i18n/index.ts`)

- Added `I18nManager.allowRTL(true)` to enable RTL support globally
- Added `I18nManager.forceRTL()` to switch RTL mode based on selected language
- Created `changeLanguage()` function that handles RTL mode switching
- Returns `true` when app restart is needed for RTL changes to take effect

### 2. **Input Component** (`src/components/common/Input.tsx`)

- Added `flexDirection: 'row-reverse'` for RTL mode
- Icons automatically swap positions in RTL:
  - **LTR (English)**: [leftIcon] TextInput [rightIcon]
  - **RTL (Arabic)**: [rightIcon] TextInput [leftIcon]
- Text alignment automatically adjusts based on `I18nManager.isRTL`

### 3. **Language Selection** (`src/features/Auth/screens/LanguageSelectScreen.tsx`)

- Updated to use the new `changeLanguage()` function
- Shows alert when app restart is required for RTL changes

## How to Test

### **Step 1: Clean Build (IMPORTANT!)**

```bash
# Stop Metro bundler
# Close the app completely

# Clean everything
cd /Users/ginger/Documents/PRO/grand-app/grand-central-backery-and-kitchen
rm -rf node_modules/.cache
watchman watch-del-all

# Android
cd android && ./gradlew clean && cd ..

# Rebuild and run
npm start -- --reset-cache

# In another terminal:
npx react-native run-android
```

### **Step 2: Test Language Switching**

1. **Start with English**:

   - App starts → Language Selection Screen
   - Click "English" button
   - Navigate to Register screen
   - **Verify**: Icons are on the LEFT side ✅

2. **Switch to Arabic**:
   - Go back to Language Selection (or restart app)
   - Click "العربية" button
   - You'll see an alert "Restart Required"
   - **Close the app completely** (swipe away from recent apps)
   - **Reopen the app**
   - **Verify**:
     - Icons should now be on the RIGHT side ✅
     - Text should align right ✅
     - Dropdown arrows should be on the left ✅

### **Step 3: Verify Each Field**

**Arabic (RTL) - Expected Layout:**

```
____________الاسم [ProfileIcon]
____رقم الهاتف [PhoneIcon]
البريد الإلكتروني [MailIcon]
[DropdownIcon] ذكر [MaleIcon]
تاريخ الميلاد [CalendarIcon]
```

**English (LTR) - Expected Layout:**

```
[ProfileIcon] Name____________
[PhoneIcon] Phone Number____
[MailIcon] mail____________
[MaleIcon] Male [DropdownIcon]
[CalendarIcon] DOB___________
```

## Why App Restart is Required

React Native's `I18nManager.forceRTL()` changes the **entire app's layout direction** at a native level. This requires:

- Android: Rebuild native views
- iOS: Restart to apply layout changes

The change **cannot** be hot-reloaded or reflected without a full app restart.

## Troubleshooting

### Icons Still on Wrong Side?

1. Make sure you **completely closed** the app (not just backgrounded)
2. Clear app data: Settings → Apps → Your App → Clear Data
3. Uninstall and reinstall the app
4. Run `npm start -- --reset-cache` again

### Text Not Aligning Right in Arabic?

- The Input component uses `I18nManager.isRTL` which only updates after app restart
- Make sure to close and reopen after language change

### Still Having Issues?

Run this debug check in your code:

```typescript
console.log('I18nManager.isRTL:', I18nManager.isRTL);
console.log('Current Language:', i18n.language);
```

Expected output:

- **English**: `isRTL: false`, `language: 'en'`
- **Arabic**: `isRTL: true`, `language: 'ar'`

## Summary

✅ **Global RTL support** enabled via I18nManager  
✅ **Input component** automatically handles icon positioning for RTL/LTR  
✅ **Language switching** properly forces RTL mode  
✅ **App restart alert** informs users when restart is needed  
✅ **All text inputs** respect RTL text direction

**Key Point**: Always **restart the app** after switching languages for RTL changes to take full effect!
