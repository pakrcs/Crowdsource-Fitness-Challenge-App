# Crowd-sourced Fitness Challenge App 👋

The Fitness Challenge App is a cross-platform mobile app that allows users to create and join fitness challenges, track progress, earns badges, and engage with others in the community.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## App Features

- User registration and login
- Create and participate in user-sourced fitness challenges
- Earn badges for completing challenges
- Chat with other users in the community
- Upload progress photos

## Tech Stack

- Frontend: React Native with Expo
- Backend: Flask
- Database: PostgreSQL
- Auth: Firebase for user account authentication

## Getting started

1. Clone the repository

2. Install dependencies

   ```bash
   npm install
   ```

3. Setup the .env files

   ```bash
   DATABASE_URL=postgresql://fitness_challenge_db_user:Yt0HRgmMsvRtKIYn2TboWZot72vAYqIW@dpg-d09ftf0gjchc738urqtg-a.oregon-postgres.render.com/fitness_challenge_db
   ```

4. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).
