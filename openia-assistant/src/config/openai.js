import dotenv from "dotenv";
dotenv.config();

const config = {
    apiKey: process.env.OPENAI_API_KEY,
    basePath: "https://api.openai.com/v1",
    models: {
        "basic": "gpt-3.5-turbo-0125",
        "basic2": "gpt-3.5-turbo",
        "simple": "gpt-4o-mini",
        "average": "gpt-4",
        "advanced": "gpt-4o",
    },
    tools: [
        {
            type: "function",
            function: {
                name: "weather_get",
                description: "Get current temperature for provided coordinates in celsius or for a given location.",
                parameters: {
                    type: "object",
                    properties: {
                        latitude: { type: "number" },
                        longitude: { type: "number" },
                        city: {
                            "type": "string",
                            "description": "City e.g. Bogotá, Barcelona"
                        },
                        country: {
                            "type": "string",
                            "description": "Country e.g. Colombia, Spain"
                        }
                    },
                    required: ["latitude", "longitude", "city", "country"],
                    additionalProperties: false
                },
                strict: true
            }
        },
        /*{
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get current temperature for a given location.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "City and country e.g. Bogotá, Colombia"
                        }
                    },
                    "required": [
                        "location"
                    ],
                    "additionalProperties": false
                },
                "strict": true
            }
        },*/
        {
            "type": "function",
            "function": {
                "name": "email_send",
                "description": "Send an email to a given recipient with a subject and message.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "to": {
                            "type": "string",
                            "description": "The recipient email address."
                        },
                        "subject": {
                            "type": "string",
                            "description": "Email subject line."
                        },
                        "body": {
                            "type": "string",
                            "description": "Body of the email message."
                        }
                    },
                    "required": [
                        "to",
                        "subject",
                        "body"
                    ],
                    "additionalProperties": false
                },
                "strict": true
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_knowledge_base",
                "description": "Query a knowledge base to retrieve relevant info on a topic.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The user question or search query."
                        },
                        "options": {
                            "type": "object",
                            "properties": {
                                "num_results": {
                                    "type": "number",
                                    "description": "Number of top results to return."
                                },
                                "domain_filter": {
                                    "type": [
                                        "string",
                                        "null"
                                    ],
                                    "description": "Optional domain to narrow the search (e.g. 'finance', 'medical'). Pass null if not needed."
                                },
                                "sort_by": {
                                    "type": [
                                        "string",
                                        "null"
                                    ],
                                    "enum": [
                                        "relevance",
                                        "date",
                                        "popularity",
                                        "alphabetical"
                                    ],
                                    "description": "How to sort results. Pass null if not needed."
                                }
                            },
                            "required": [
                                "num_results",
                                "domain_filter",
                                "sort_by"
                            ],
                            "additionalProperties": false
                        }
                    },
                    "required": [
                        "query",
                        "options"
                    ],
                    "additionalProperties": false
                },
                "strict": true
            }
        }
    ],
    defaults: {
        assistant: process.env.OPENAI_ASSISTANT_ID,
        thread: process.env.OPENAI_THREAD_ID,
    },
    assistant: {}
}
export default config;
