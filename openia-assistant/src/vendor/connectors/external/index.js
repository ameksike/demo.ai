import { default as axios } from 'axios';

/**
 * Tool Call Action
 * @link https://www.npmjs.com/package/axios
 */
export const run = async (options) => {
    try {
        const {
            data = {},
            url = '/',
            method = 'get',
            headers = {}
        } = options;
        const response = await axios({
            url,
            data,
            method,
            headers: { ...headers },
            maxRate: [
                100 * 1024, // 100KB/s upload limit,
                100 * 1024  // 100KB/s download limit
            ]
        });
        console.log({
            src: "Plugin:External:send",
            data: response.data
        });
        return response.data
    } catch (error) {
        console.log({ src: "Plugin:External:send", error });
        return null;
    }
};

/**
 * Tool Call Definiton 
 */
export const definition = {
    "type": "function",
    "function": {
        "name": "external_search",
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