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
- `SentenceAudio`: sentence audio.
- `Picture`: main card image.
- `Glossary`: full dictionary or Yomitan glossary HTML.
- `Hint`: optional front-side hint.
- `IsWordAndSentenceCard`: shows expression plus sentence hint on the front.
- `IsClickCard`: lets the front switch from expression to sentence by tapping/clicking.
- `IsSentenceCard`: shows the sentence on the front.
- `IsAudioCard`: shows the sentence and plays audio on the front.
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

## Credits

- [youyoumu/kiku](https://github.com/youyoumu/kiku), the original project Manatan-NoteType was simplified from.
