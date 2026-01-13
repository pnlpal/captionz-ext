# Privacy Policy for Captionz Extension

**Last Updated:** January 13, 2026

## Introduction
Captionz Extension is committed to protecting your privacy. This Privacy Policy explains how our browser extension collects, uses, and safeguards your information. The extension is designed to enhance your language learning experience on YouTube by integrating with the Captionz web application.

## Data Collection and Usage

### 1. YouTube Content Interaction
The primary function of the Captionz Extension is to interact with YouTube video pages to provide dual subtitles and advanced player features.
*   **What we access**: We access the text of captions and video metadata (such as title and video ID) from the YouTube videos you visit.
*   **How we use it**: This data is intercepted locally within your browser and passed directly to the Captionz web application (`pnl.dev/captionz`) to display dual subtitles and facilitate A-B repeating. **The subtitles are analyzed and stored on our servers** to improve the dual-subtitle availability for other users and enhance the overall service.

### 2. User Settings
*   **What we store**: We store your extension preferences (e.g., whether to show the "Watch on Captionz" button or Context Menu items).
*   **Where it is stored**: These settings are stored locally on your device or synced across your devices using your browser's built-in storage mechanisms (`chrome.storage`).

### 3. Personal Information
We **do not** collect, sell, or share any personal identification information (PII) such as names, email addresses, or phone numbers through the extension itself.

## Permissions

The extension requests the following permissions for specific functionalities:
*   **`host_permissions` (*://*.youtube.com/*)**: Required to detect video players and retrieve caption data on YouTube.
*   **`scripting`**: Required to inject the helper scripts that display the "Watch on Captionz" button.
*   **`storage`**: Used to save your preferences for the extension.
*   **`contextMenus`**: Used to add the "Watch on Captionz" option to your right-click menu.
*   **`tabs`**: Required to open a new tab with the Captionz player when you choose to watch a video on our platform.

## Third-Party Services
*   **YouTube**: This extension operates on top of YouTube. Please refer to [YouTube's Terms of Service](https://www.youtube.com/t/terms) and [Google's Privacy Policy](https://policies.google.com/privacy).
*   **Captionz Web App (pnl.dev)**: The extension works in conjunction with our web application.

## Changes to This Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## Contact Us
If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at [GitHub Issues](https://github.com/pnlpal/captionz-ext/issues).
