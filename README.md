# TaskBingo Discord Bot

TaskBingo is a discord bot developed with discord.js that allows for the creation and assignment of bingo boards to users. It is used for the BostonHacks discord to keep track and mark different hackers' tasks as done.

## Installation
The bot can be installed with this [link](https://discord.com/oauth2/authorize?client_id=1298116609642070047).

## Commands
- auto-assign (value)
    - Sets the auto-assign config to *value*
    - When auto assign is on, TaskBingo automatically sends out the bingo board to users when they recieve a role
    - When auto assign is off, use /assign-board to send out the bingo board to users
    - Requires Administrator privilege
- assign-board (board-name, role, resend)
    - Assigns a board with *board-name* to a role *role*
    - Only one board can be assigned to a role at once
    - When auto assign is off, this command will also send out bingo boards to users
    - *resend* resends the bingo board to the users in the role who haven't recieved the specified bingo board of name *bingo-name*
    - Requires Administrator privilege
- bingo-status (user)
    - Shows a user *user*'s current bingo status
- board-list 
    - Shows a list of the current created bingo boards in the database
    - Requires Administrator privilege
- collect (user, item)
    - Adds an *item* to a *user*'s list of collected items
    - Requires Administrator privilege
- collect-list (user)
    - Shows the list of a *user*'s current collected items 
- create (name, image, grid-size)
    - Creates a bingo board with *name*, a cooresponding bingo image *image*, and a grid size *grid-size*. *grid-size* must be an odd integer that cooresponds with an nxn table.
    - Requires Administrator privilege
- mark (user, cell-numbers)
    - Completes a user *user*'s assigned bingo board task at position(s) *cell-numbers*
    - cell-number starts at 1 and counts row first left to right
    > - Multiple cell numbers (separated by commas) can be entered to mark multiple cells simultainously 
    - Requires Administrator privilege
- mark-many (users, cell-number)
    - Complete users *users*' assigned bingo board task at position *cell-number*
    - *users* is a comma separated string consisting of discord usernames (without the values including and after the #)
    - Requires Administrator privilege
- unassign-board (board-name, role)
    - Unassigns a board with *board-name* from a role *role*
    - Requires Administrator privilege
- uncollect (user, item)
    - Removes a collected *item* from the *user*'s collcted list
    - Requires Administrator privilege
- update (user, cell-number, value)
    - Updates a user *user*'s assigned bingo board task at position *cell-number* to be either completed or false (true/false) at *value*
    - cell-number starts at 1 and counts row first left to right
    - Requires Administrator privilege
- update-many (users, cell-number, value)
    - Updates users *users*' assigned bingo board task at position *cell-number* to be either completed or false (true/false) at *value*
    - *users* is a comma separated string consisting of discord usernames (without the values including and after the #)
    - Requires Administrator privilege

Please contact declanyg@bu.edu for bugs and fixes


