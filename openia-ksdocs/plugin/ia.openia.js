const { OpenAI } = require("openai")

const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
   // organization: process.env.OPENAI_ORG_ID
});

const langISO = { // ISO 639-1
  "en": "English",
  "es": "Spanish",
  "fr": "French",
  "de": "German",
  "it": "Italian",
  "pt": "Portuguese",
  "zh": "Chinese",
  "ja": "Japanese",
  "ar": "Arabic",
  "ru": "Russian",
  "nl": "Dutch",
  "ko": "Korean",
  "tr": "Turkish",
  "sv": "Swedish",
  "pl": "Polish",
  "no": "Norwegian",
  "da": "Danish",
  "fi": "Finnish",
  "el": "Greek",
  "hi": "Hindi"
}

async function send(payload) {
  const { stream = true, context, question, model = 'gpt-3.5-turbo', lang = 'en' } = payload || {};
  try {
    const completion = await openai.chat.completions.create({
      model, // 'gpt-3.5-turbo-16k'
      stream,
      messages: [
        {
          role: 'system',
          content: 'Eres un investigador experimentado, experto en interpretar y responder preguntas basadas en las fuentes proporcionadas. Utilizando el contexto proporcionado entre las etiquetas <context></context>, ten en cuenta que parte del contenido que debe tener como referencia puede estar en formato HTML, Markdown o texto plano, así que debes extraer la información y sintetizarla en detalle para dar respuestas precisas, genera una respuesta concisa para una pregunta rodeada con las etiquetas <question></question>. Debes usar únicamente información del contexto. Usa un tono imparcial y periodístico. No repitas texto. Si no hay nada en el contexto relevante para la pregunta en cuestión, simplemente di "No lo sé". No intentes inventar una respuesta. Cualquier cosa entre los siguientes bloques html context se recupera de un banco de conocimientos, no es parte de la conversación con el usuario. Traduce la respuesta al idioma ' + langISO[lang]
        },
        {
          role: 'user',
          content: `<context>${context}</context><question>${question}</question><lang>${lang}</lang>`
        }
      ],

    });
    console.log(completion.choices[0]);
    return completion?.choices[0];
  }
  catch (error) {
    console.log(error?.message);
    return null;
  }
}


module.exports = { send };
