# Push RestAPI/Chat reproduction repo

## Description
This repository is created to reproduce and test the issue with the package. The project includes necessary patches and dependencies to replicate the problem. Please follow the steps below to set up and run the project.

## Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development)

## Getting Started

1. **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/your-repo-name.git
    cd your-repo-name
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Apply patches**
    You can use the `patch-package` library to apply patches if it was not ran automatically:
    ```bash
    npx patch-package
    ```

4. **Run on iOS simulator**
    ```bash
    npx expo run:ios
    ```