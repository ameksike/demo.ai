

## Project Structure
```
openia-assistant/
├── src/
│   ├── config/
│   │   └── openaiConfig.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── calendarService.js
│   │   └── externalTaskExecutor.js
│   ├── utils/
│   │   └── apiClient.js
│   ├── training/
│   │   └── documents.js
│   └── main.js
├── package.json
├── .env
└── README.md
```

## Install & Configure
1. Install Required Libraries:
    - npm init -y
    - npm install openai googleapis nodemailer dotenv axios ws

2. Setup Environment Variables: 
    ```
    OPENAI_API_KEY=your_openai_api_key
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_REFRESH_TOKEN=your_google_refresh_token
    EMAIL_USER=your_email@example.com
    EMAIL_PASSWORD=your_email_password
    ```

## Tools 
- [OpenAI Usage](https://platform.openai.com/settings/organization/usage)
- [OpenAI Billing](https://platform.openai.com/settings/organization/billing/overview)

## References 
- OpenAI
    - [Function calling](https://platform.openai.com/docs/guides/function-calling?lang=node.js&example=search-knowledge-base)
    - [Embeddings](https://platform.openai.com/docs/guides/embeddings)

- Google 
    - 