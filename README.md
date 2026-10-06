# Voice Task AI

Build a simple modern web application called Voice Task AI, Voice-to-Action Assistant. The application should allow users to speak naturally and convert their voice commands into structured tasks.

Core features:

1. Create a clean responsive dashboard with a microphone button, task list, and pending/completed task sections.

2. Accept voice input and convert it into text.

3. Use AI to extract the task title, date, time, and priority from the spoken sentences. For example when the user says, "Remind me tomorrow at 5 pm to submit my operating systems assignment," extract task: submitting operating systems assignment, date: tomorrow, time: 5 pm, priority: medium.

4. Display the extracted information in a confirm task card before creating the task. Allow the user to confirm, edit, or cancel a task.

5. Allow users to mark tasks as completed and delete them.

6. Display tasks in an organized list with priority badges and due dates.

If AI integration is unavailable provide a working fallback using browser speech recognition and simple task phrasing.

Design requirement: use a premium minimal interface with a light background, purple and blue accents, rounded cards, subtle shadows, and smooth animations. Make the microphone button prominent and the dashboard easy to use on mobile and desktop.

Technical requirements:

- For the frontend keep the code modular and clean.

- Make the main workflow functional rather than creating only a static UI.

- Store tasks in local storage so they remain available after refreshing the page.

- Handle microphone permissions, empty input, and invalid dates gracefully.

Start by building the working MVP. Do not waste time adding unnecessary features. Prioritize voice or input task extraction, confirmation, and task management.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://voice-task-ai-ketan.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/47104231-1c14-5b20-a6b6-ad471884de09).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
