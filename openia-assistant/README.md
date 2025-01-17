
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

1. Install Required Libraries:

- npm init -y
- npm install openai googleapis nodemailer dotenv axios

2. Setup Environment Variables: 
```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
```



