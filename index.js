const core = require("@actions/core");
const github = require("@actions/github");
const { Translate } = require("@google-cloud/translate").v2;
const jsYaml = require("js-yaml");

const fs = require("fs");
async function translate() {
  try {
    const translator = new Translate({ key: core.getInput("key") });
    const sourcePath = core.getInput("sourcePath");
    const messages = jsYaml.load(
      fs.readFileSync(sourcePath, {
        encoding: "utf-8",
      })
    );
    const sourceLanguage = core.getInput("sourceLanguage");
    const targetLanguage = core.getInput("targetLanguage");
    console.log(
      `Starting translation for file ${sourcePath} from ${sourceLanguage} to ${targetLanguage}`
    );
    const translate = async (input) => {
      if (typeof input === "string") {
        return translator.translate(input, {
          from: sourceLanguage,
          to: targetLanguage,
        });
      }
      if (typeof input === "object") {
        for (let key of Object.keys(input)) {
          input[key] = await translate(input[key]);
        }
        return input;
      }
      if (Array.isArray(input)) {
        return Promise.all(
          input.map((subInput) => {
            return translate(subInput);
          })
        );
      }
      return input;
    };
    const translated = await translate(messages);
    const targetPath = core.getInput("targetPath");
    console.log(`Writing translated file to ${targetPath}`);
    fs.writeFileSync(targetPath, jsYaml.dump(translated));
  } catch (error) {
    core.setFailed(error.message);
  }
}
translate();
