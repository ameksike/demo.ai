const express = require("express");
const ksdocs = require("ksdocs");
const iaOpenia = require("./plugin/ia.openia");

const app = express();

ksdocs.inject({
  logger: console,
  cfg: {
    schema: {
      // default: config.docs.schema
    }
  },
  path: {
    ...ksdocs.path,
    root: __dirname + "/docs"
  },
}).init(app, express.static);

app.get("/doc/:lang/:schema/:page/chat", async (req, res, next) => {
  const lang = req.params.lang || "en";
  const schema = req.params.schema || "default";
  const pageid = req.params.page || "main";
  const question = req.query.question || "give me an introduction";

  const context = await ksdocs?.contentService.select({ token: "", account: {}, pageid, schema, lang, query: req.query });

  const answer = await iaOpenia.send({
    stream: false, context, question, lang
  });
  console.log("answer >> ", answer);
  res.end(answer.message.content);
})
app.listen(5555);