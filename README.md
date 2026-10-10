# SMHS Young Knights Frosh: Fall 2026 stats

Interactive season dashboard for the Young Knights freshman basketball team.

- **Team:** record, scoring, the four factors, and per-game comparison with opponents
- **Games:** trends by game, results, and a box score for any game
- **Players:** sortable season stats, shot volume vs. efficiency, and game-by-game numbers for each player

Stats come from the GameChanger box score for each game. The data lives in `data/`:

- `data/games.csv`: one row per game, with both teams' totals
- `data/game_log.csv`: one row per player per game

To add a game, append its rows to both files. The dashboard recalculates everything from them.
