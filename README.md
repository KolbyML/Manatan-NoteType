# Manatan-NoteType

Manatan-NoteType is a static Anki note template for Japanese mining cards.

The card is just front HTML, back HTML, and CSS. There is no bundled app runtime, worker, live Anki integration, mobile API bridge, plugin loader, exported notes cache, or generated kanji database.

## Benefits Over Kiku

- More stable across Anki desktop, AnkiMobile, AnkiDroid, and AnkiWeb because it relies on Anki's built-in template rendering instead of a hydrated JavaScript app.
- Less fragile during Anki version updates because there are no runtime hooks into Anki internals or local HTTP APIs.
- Easier to debug because the rendered card is plain HTML and CSS.
- Smaller and simpler to install because Manatan-NoteType only needs the note template files.
- Better fit for mobile review because it avoids extra workers, cached data files, settings panels, and platform-specific control bridges.

## Files

- `packages/note/template/front.html`
- `packages/note/template/back.html`
- `packages/note/template/style.css`

Run `pnpm --filter @repo/manatan-note-type build` to write the generated Anki files into `packages/note/.anki-build/`.

Text fields determine their direction independently. Arabic and other right-to-left text can appear alongside English definitions or Japanese ruby without changing the direction of the card controls.

Generated files:

- `_manatan_note_type_front.html`
- `_manatan_note_type_back.html`
- `_manatan_note_type_style.css`

Run `python3 -m pip install -r packages/note/script/requirements-apkg.txt` once, then `pnpm preview:apkg` to generate a local sample deck at `packages/note/.release/Manatan-NoteType.apkg`.

The sample deck uses the Kiku v1.10.2 sample screenshots and audio stored in `packages/note/preview/kiku-v1.10.2-media/`.

## Supported Fields

Manatan-NoteType keeps Kiku-style field names so existing mining notes can move over without reshaping every card.

- `Expression`: target word or phrase.
- `ExpressionFurigana`: target expression with Anki furigana markup.
- `ExpressionReading`: kana reading used when furigana is not present.
- `ExpressionAudio`: target audio.
- `SelectionText`: selected source text shown as its own definition page.
- `MainDefinition`: compact primary definition.
- `DefinitionPicture`: picture shown above the definition pages.
- `Sentence`: example sentence.
- `SentenceFurigana`: example sentence with Anki furigana markup.
- `SentenceTranslation`: optional secondary subtitle or translation, displayed below the sentence on the back. Map this field to **Secondary Subtitle** in Manatan to save the existing secondary track.
- `SentenceAudio`: sentence audio.
- `Picture`: main card image.
- `Glossary`: full dictionary or Yomitan glossary HTML.
- `Hint`: optional front-side hint.
- `IsWordAndSentenceCard`: shows expression plus sentence hint on the front.
- `IsClickCard`: lets the front switch from expression to sentence by tapping/clicking.
- `IsSentenceCard`: shows the sentence on the front.
- `IsAudioCard`: shows the sentence and plays audio on the front. If the audio field contains grouped clips, the front shows all their sentence contexts in a list for Anki's playback queue.
- `PitchPosition`: numeric pitch accent position, used to draw the static pitch graph.
- `PitchCategories`: kept for compatibility.
- `Frequency`: frequency details.
- `FreqSort`: compact frequency rank shown in the card header.
- `MiscInfo`: optional expandable notes.
- `Tags`: shown in the footer.
- `CardID`: kept for compatibility.

## Design Goals

- Keep review cards stable across Anki desktop, AnkiMobile, AnkiDroid, and AnkiWeb.
- Avoid version-sensitive APIs and live Anki integrations.
- Prefer field-rendered HTML and CSS over a hydrated JavaScript app.
- Keep the template easy to edit by hand.

## Browser Regression Tests

Run `pnpm --filter @repo/manatan-note-type exec playwright install chromium` once. Start a dedicated disposable Manatan Flashcards backend, then run:

```sh
MANATAN_SRS_TEST_URL=http://127.0.0.1:4567/api/v1/srs pnpm --filter @repo/manatan-note-type test:browser
```

Use a separate test backend, since the suite creates and deletes a test collection. It builds the current templates, installs them through the real Flashcards API, creates cards, and tests their rendered pages in a browser. Set `MANATAN_BROWSER=webkit` to test WebKit after installing that browser. Optional `MANATAN_SCREENSHOT_DIR` saves screenshots; `BROWSER_EXECUTABLE_PATH` selects an already-installed browser executable.

## Credits

- [youyoumu/kiku](https://github.com/youyoumu/kiku), the original project Manatan-NoteType was simplified from.
