# ScrollView vs FlatList

## Use FlatList when:

-Performance is critical: FlatList only renders items currently visible on screen, saving memory and improving performance.

- Long list of data: When rendering potentially large sets of data (feeds, search results, message lists).
- Unknown content length: When you dont know in advance how many items youll need to display
- Same kind of content: When displaying many items with the same structure.

## Use ScrollView when:

- All content fits in memory: When youre displaying a small, fixed amount of content that wont cause performance issues.
- Static content: for screens with predetermined, limited content like forms, profile pages, or detail views.
- Mixed content types: When you need to display different UI component in a specific layout that doesnt follow a list pattern.
- Horizontal carousel-like elements Small horizontal scrolling components like image carousel with limited items.

# React Native Directory

- We can find hundreds of other third-party libraries at: https://reactnative.directory

# React Native Gesture Handler

- Gestures are a great way to provide an intuitive user experience in an app
- The React Native Gesture Handler library provides built-in native components that can handle gestures.
- It recognizes pan, tab, rotation and other gestures using the platform native touch handling system
- Learn more: https://docs.swmansion.com/react-native-gesture-handler/docs/

# React Native Reanimated

- Create smooth animations with an excellent developer experience.
- Learn more: https://docs.swmansion.com/react-native-reanimated/

# Building and Publishing

- You can build your app for production with Expo Application Service (EAS)
- If you want to submit it to Google Play Store / App Store youll need a developer account
- It would take couple of days/week till your app get accepted and go live
- https://docs.expo.dev/deploy/build-project/
- https://docs.expo.dev/deploy/submit-to-app-stores/
- Building your app with EAS is free, but submitting it to the app stores will cost you money

## Steps

- Visit expo.dev and sign up
- npm i -g eas-cli
- eas login
- eas init & Itll ask you to create a project, just say yes
- eas build -- platform android => build for android => will give you APK file
- eas build -- platform ios => builds for ios => will give you IPA file
- Then youd take those files and submit to play store or app store
