# TaskBingo Discord Bot

TaskBingo is a discord bot developed with discord.js that allows for the creation and assignment of bingo boards to users. It is used for the BostonHacks discord to keep track and mark different hackers' tasks as done.

## Commands
- assign-board (board-name, role)
    - Assigns a board with *board-name* to a role *role*
    - Only one board can be assigned to a role at once
    - Requires Administrator privilege
- bingo-status (user)
    - Shows a user *user*'s current bingo status
- create (name, image, grid-size)
    - Creates a bingo board with *name*, a cooresponding bingo image *image*, and a grid size *grid-size*. *grid-size* must be an odd integer that cooresponds with an nxn table.
    - Requires Administrator privilege
- list 
    - Shows a list of the current created bingo boards in the database
    - Requires Administrator privilege
- unassign-board (board-name, role)
    - Unassigns a board with *board-name* from a role *role*
    - Requires Administrator privilege
- update (user, cell-number, value)
    - Updates a user *user*'s assigned bingo board at position *cell-number* to be either completed or false (true/false) at *value*
    - cell-number starts at 1 and counts row first left to right
    - Requires Administrator privilege
- update-many (users, cell-number, value)
    - Updates users *users*' assigned bingo board at position *cell-number* to be either completed or false (true/false) at *value*
    - *users* is a comma separated string consisting of discord usernames (without the values including and after the #)
    - Requires Administrator privilege

Please contact declanyg@bu.edu for bugs and fixes


