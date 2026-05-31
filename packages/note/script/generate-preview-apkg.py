#!/usr/bin/env python3

from pathlib import Path

try:
    import genanki
except ImportError as err:
    raise SystemExit(
        "genanki is required to generate the preview .apkg. "
        "Install it with: python3 -m pip install -r packages/note/script/requirements-apkg.txt"
    ) from err

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / ".anki-build"
RELEASE = ROOT / ".release"
OUT = RELEASE / "Manatan-NoteType.apkg"
KIKU_MEDIA_DIR = ROOT / "preview" / "kiku-v1.10.2-media"
KIKU_MEDIA_NAMES = [
    "_manatan_note_type_font_hina-mincho.woff2",
    "_manatan_note_type_font_klee-one.woff2",
    "_manatan_note_type_font_ibm-plex-sans-jp.woff2",
    "yomichan_audio_おそれる_恐れる_2023-08-10-12-28-47.mp3",
    "SubsPlease Maou-jou de Oyasumi - 11 (1080p) 28DCA1EF.mkv_830704.7710000001_834832.7710000001.mp3",
    "subsplease maou-jou de oyasumi - 11 (1080p) 28dca1ef.mkv_833529.webp",
    "yomichan_audio_こうけん_貢献_2023-08-16-14-22-22.mp3",
    "Anime_Time_Solo_Leveli_925842_K4AlcB99.mp3",
    "SubsPlease Tate no Yuusha no Nariagari S3 - 10 (1080p) BCA53DD5.mkv_118779-a512c7dd2b6572854ecfd7760d9f297cea529b66.mp3",
    "CBT Gochuumon wa Usagi Desuka S01E09 BDrip 1920x1080 x264 FLAC 9092049A.mkv_955687.289_958481.289.mp3",
    "Anime_Time_Solo_Leveli_928960_pzThqpQf.jpeg",
    "SubsPlease Tate no Yuusha no Nariagari S3 - 10 (1080p) BCA53DD5.mkv_1190221.jpeg",
    "cbt gochuumon wa usagi desuka s01e09 bdrip 1920x1080 x264 flac 9092049a.mkv_957803.webp",
]

DECK_ID = 1204923108
MODEL_ID = 1204923107

FIELD_NAMES = [
    "Expression",
    "ExpressionFurigana",
    "ExpressionReading",
    "ExpressionAudio",
    "SelectionText",
    "MainDefinition",
    "DefinitionPicture",
    "Sentence",
    "SentenceFurigana",
    "SentenceAudio",
    "Picture",
    "Glossary",
    "Hint",
    "IsWordAndSentenceCard",
    "IsClickCard",
    "IsSentenceCard",
    "IsAudioCard",
    "PitchPosition",
    "PitchCategories",
    "Frequency",
    "FreqSort",
    "MiscInfo",
    "Tags",
    "CardID",
]

# Text fields mirror the Kiku v1.10.2 sample notes, with local media from the
# matching release package.
SAMPLE_NOTES = [
    {
        "Expression": "恐れる",
        "ExpressionFurigana": "恐[おそ]れる",
        "ExpressionReading": "おそれる",
        "ExpressionAudio": "[sound:yomichan_audio_おそれる_恐れる_2023-08-10-12-28-47.mp3]",
        "SelectionText": '<ol><li data-details="JMdict"><span class="dict-group__tag-list"><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">v1</span></span><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">vt</span></span><span class="dict-group__tag dict-group__tag--dict"><span class="dict-group__tag-inner">JMdict</span></span></span><span class="dict-group__glossary"><span><ul data-sc-content="glossary" lang="en" style="list-style-type: circle;"><li>to fear</li><li>to be afraid of</li></ul><ul data-sc-content="examples" lang="ja" style="list-style-type: square;"><li>大人はしばしば変化を恐れる。</li><li lang="en" style="font-size: 60%; list-style-type: none;">Older people often fear change.</li></ul></span></span></li><li data-details="JMdict"><span class="dict-group__tag-list"><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">forms</span></span><span class="dict-group__tag dict-group__tag--dict"><span class="dict-group__tag-inner">JMdict</span></span></span><span class="dict-group__glossary">恐れる（★） | 怖れる | 畏れる | 懼れる | 惧れる（⛬）</span></li></ol>',
        "MainDefinition": "&nbsp;",
        "DefinitionPicture": "",
        "Sentence": "それは 死を<b>恐れない</b>ことだよ",
        "SentenceFurigana": "",
        "SentenceAudio": "[sound:SubsPlease Maou-jou de Oyasumi - 11 (1080p) 28DCA1EF.mkv_830704.7710000001_834832.7710000001.mp3]",
        "Picture": '<div><img src="subsplease maou-jou de oyasumi - 11 (1080p) 28dca1ef.mkv_833529.webp"></div>',
        "Glossary": "",
        "Hint": "",
        "IsWordAndSentenceCard": "",
        "IsClickCard": "",
        "IsSentenceCard": "",
        "IsAudioCard": "",
        "PitchPosition": '<div class="pa-positions__group" data-details="アクセント辞典"><div class="pa-positions__dictionary"><div class="pa-positions__dictionary-inner">アクセント辞典</div></div><ol><li><span style="display:inline;"><span>[</span><span>3</span><span>]</span></span></li></ol></div>',
        "PitchCategories": "",
        "Frequency": "",
        "FreqSort": "1778",
        "MiscInfo": "",
        "Tags": "yomichan",
        "CardID": "kiku-sample-おそれる",
    },
    {
        "Expression": "貢献",
        "ExpressionFurigana": "貢献[こうけん]",
        "ExpressionReading": "こうけん",
        "ExpressionAudio": "[sound:yomichan_audio_こうけん_貢献_2023-08-16-14-22-22.mp3]",
        "SelectionText": '<ol><li data-details="JMdict"><span class="dict-group__tag-list"><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">1</span></span><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">n</span></span><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">vi</span></span><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">vs</span></span><span class="dict-group__tag dict-group__tag--dict"><span class="dict-group__tag-inner">JMdict</span></span></span><span class="dict-group__glossary"><span><ul data-sc-content="glossary" lang="en" style="list-style-type: circle;"><li>contribution (furthering a goal or cause)</li><li>services (to a cause)</li></ul><ul data-sc-content="examples" lang="ja" style="list-style-type: square;"><li>彼は国への貢献を認められてナイト爵位を与えられた。</li><li lang="en" style="font-size: 60%; list-style-type: none;">He was awarded a knighthood in acknowledgement of his services to the nation.</li></ul></span></span></li><li data-details="JMdict"><span class="dict-group__tag-list"><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">2</span></span><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">n</span></span><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">vs</span></span><span class="dict-group__tag dict-group__tag--name"><span class="dict-group__tag-inner">hist</span></span><span class="dict-group__tag dict-group__tag--dict"><span class="dict-group__tag-inner">JMdict</span></span></span><span class="dict-group__glossary">paying tribute | tribute</span></li></ol>',
        "MainDefinition": "",
        "DefinitionPicture": "",
        "Sentence": '<span data-group-id="11">これで 少しは<br>世の中に<b>貢献</b>できるかな</span><span data-group-id="10">どうせ勇者の捕縛に<b>貢献</b>すれば➡</span>このお店に<b>貢献</b>するために―',
        "SentenceFurigana": "",
        "SentenceAudio": '<span data-group-id="11">[sound:Anime_Time_Solo_Leveli_925842_K4AlcB99.mp3]</span><span data-group-id="10">[sound:SubsPlease Tate no Yuusha no Nariagari S3 - 10 (1080p) BCA53DD5.mkv_118779-a512c7dd2b6572854ecfd7760d9f297cea529b66.mp3]</span><span data-group-id="0">[sound:CBT Gochuumon wa Usagi Desuka S01E09 BDrip 1920x1080 x264 FLAC 9092049A.mkv_955687.289_958481.289.mp3]</span>',
        "Picture": '<img data-group-id="11" src="Anime_Time_Solo_Leveli_928960_pzThqpQf.jpeg"><img data-group-id="10" src="SubsPlease Tate no Yuusha no Nariagari S3 - 10 (1080p) BCA53DD5.mkv_1190221.jpeg"><div><img src="cbt gochuumon wa usagi desuka s01e09 bdrip 1920x1080 x264 flac 9092049a.mkv_957803.webp"></div>',
        "Glossary": "",
        "Hint": "",
        "IsWordAndSentenceCard": "",
        "IsClickCard": "",
        "IsSentenceCard": "",
        "IsAudioCard": "",
        "PitchPosition": '<div class="pa-positions__group" data-details="アクセント辞典"><div class="pa-positions__dictionary"><div class="pa-positions__dictionary-inner">アクセント辞典</div></div><ol><li><span style="display:inline;"><span>[</span><span>0</span><span>]</span></span></li></ol></div>',
        "PitchCategories": "",
        "Frequency": "",
        "FreqSort": "4509",
        "MiscInfo": "",
        "Tags": "yomichan",
        "CardID": "kiku-sample-こうけん",
    },
]


def read_template(name):
    path = BUILD / name
    if not path.exists():
        raise SystemExit(f"Missing {path}. Run pnpm --filter @repo/note build first.")
    return path.read_text(encoding="utf-8")


def make_model():
    return genanki.Model(
        MODEL_ID,
        "Manatan-NoteType",
        fields=[{"name": name} for name in FIELD_NAMES],
        templates=[
            {
                "name": "Mining",
                "qfmt": read_template("_manatan_note_type_front.html"),
                "afmt": read_template("_manatan_note_type_back.html"),
            }
        ],
        css=read_template("_manatan_note_type_style.css"),
    )


def kiku_media_files():
    media_paths = []
    for name in KIKU_MEDIA_NAMES:
        path = KIKU_MEDIA_DIR / name
        if not path.exists():
            raise SystemExit(f"Missing local Kiku preview media: {path}")
        media_paths.append(path)
    return media_paths


def write_apkg():
    RELEASE.mkdir(parents=True, exist_ok=True)
    media_files = kiku_media_files()

    deck = genanki.Deck(DECK_ID, "Manatan-NoteType")
    model = make_model()
    for sample in SAMPLE_NOTES:
        note = genanki.Note(
            model=model,
            fields=[sample[name] for name in FIELD_NAMES],
            tags=sample["Tags"].split(),
            guid=sample["CardID"],
        )
        deck.add_note(note)

    package = genanki.Package(deck)
    package.media_files = [str(path) for path in media_files]
    package.write_to_file(str(OUT))
    print(f"✅ Generated {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    write_apkg()
