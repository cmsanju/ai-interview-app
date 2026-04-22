# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Claude AI Local setup 

Local setup claude with ollama:
curl -fsSL https://ollama.com/install.sh | sh

pull model:

ollama pull llama3

claude install:

curl -fsSL https://claude.ai/install.sh | bash

set the path:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc

list models:

ollama ls
ollama pull glm-5.1:cloud

ollama launch claude --model glm-5.1:cloud         working.

Ollama launch claude     → to select models and run in locally

after successful setup use any prompt as per the requirement:

sample prompt:

Create a simple Angetic AI application using Spring Boot and an Angular project to automate healthcare and fitness inquiries for clients. The application should include user signup and login features, utilizing H2 database for database storage. Please provide complete, working code in a zip file, adhering to international best practices, to offer answers to end clients/users. I have a Gemini AI key that should be used for integration in the project, along with the URL containing the key.
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=your gemini / open ai / etc key 


