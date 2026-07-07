# CineRoll Setup

## Private Data Files

Raw film-data pipeline files are private project assets and are not included in
the repository. They come from the project owner and should stay outside git.

- `backend/data/` is local-only working data for Excel inputs, generated master
  files, recall files, exports, and backups.
- `backend/film-data/` is also private and ignored by git.
- A fresh clone should contain no raw data files under `backend/data/`.
