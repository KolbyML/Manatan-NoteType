"""Validate the generated release package, including its card identities."""

import json
from contextlib import closing
from pathlib import Path
import sqlite3
import tempfile
import zipfile


def verify_package(path: Path) -> None:
    with zipfile.ZipFile(path) as archive, tempfile.TemporaryDirectory() as work:
        database = Path(work) / "collection.anki2"
        database.write_bytes(archive.read("collection.anki2"))
        source = json.loads(archive.read("note-type-update.json"))
        with closing(sqlite3.connect(database)) as connection:
            models = json.loads(connection.execute("SELECT models FROM col").fetchone()[0])
            model = models[str(source["modelId"])]
            if (source["modelId"] != 1204923107 or model["name"] != "Manatan-NoteType"
                    or source["title"] != model["name"]):
                raise ValueError("The release must retain the existing Manatan model identity")
            templates = model["tmpls"]
            if len(templates) != 1 or templates[0]["name"] != "Mining" or templates[0]["ord"] != 0:
                raise ValueError("Manatan-NoteType must contain exactly one Mining card template")
            invalid = connection.execute(
                "SELECT n.id FROM notes n LEFT JOIN cards c ON c.nid=n.id "
                "WHERE n.mid=? GROUP BY n.id "
                "HAVING COUNT(c.id)<>1 OR MIN(c.ord)<>0 OR MAX(c.ord)<>0",
                (source["modelId"],),
            ).fetchall()
            if invalid:
                raise ValueError("Each Manatan note must generate exactly one Mining card")
