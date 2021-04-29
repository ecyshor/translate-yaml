# translate-yaml

Translate yaml files automatically using google translate

## Usages

Support mutliple languages easily in your app by automatically translating yaml files used for i18n

## Setup

### Inputs


| Input key      |                                                                                                      Description                                                                                                      |
| -------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| key            |                                                                                               Google Translate API key                                                                                                |
| sourceLanguage |                                     The language code sent to google translate as the `from` language. This is the language for which the translations string are provided by you                                     |
| sourcePath     |                                                                    The repository path to the `yaml` file containing your `sourceLanguage` strings                                                                    |
| targetLanguage |                                                                  The language code to translate to. It will be sent to google as the `to` parameter.                                                                  |
| targetPath     | The path where to write the newly translated file. It will be overwritten each time. If you want to have some override you can add another file with any overrides you want and merge them as a follow up build step. |


### Output

The step will create/update the file at `targetPath` with the translated strings. 
To have this committed you should add a follow up step which does the commit, as presented in the job example below.

### Token setup

To use the action you need a google api token authorized to use the translation api.

For this you need a GCloud project.
Then you can easily generate a token here `https://console.cloud.google.com/apis/credentials`, which you can restrict to access Google Translate API only. 

It's recommended to configure the token as a repository secret and not set it up directly in the repo.

### Job setup

This example assumes you have an `intl` folder in the root of your project, which contains an `en.yaml` file with the strings to be translated.
This configuration generated `de.yaml` and `ro.yaml` with translations in German and Romanian.

Features that might be supported in the future:

- Caching to avoid translating same string over and over
- Manual intervention, you can manually modify a translated string and it will not be overwritten unless the source string changes (currently we override everything during each run)

```yaml

on: push
jobs:
  translate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ecyshor/translate-yaml@main
        with:
          key: ${{ secrets.GOOGLE_TRANSLATE_TOKEN }}
          sourceLanguage: "en"
          sourcePath: "./intl/en.yaml"
          targetLanguage: "de"
          targetPath: "./intl/de.yaml"
      - uses: ecyshor/translate-yaml@main
        with:
          key: ${{ secrets.GOOGLE_TRANSLATE_TOKEN }}
          sourceLanguage: "en"
          sourcePath: "./intl/en.yaml"
          targetLanguage: "ro"
          targetPath: "./intl/ro.yaml"
      - run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add .
          git diff-index --quiet HEAD || git commit -m "Update translations"
          git push
```
