# Website Organization Document (WOD)

## Task To Do

### Current Sprint (Finish Home Page)
* Restructure the File System and Push to github

### Back Log Of Sprints
* Finish Projects
* Finish Dreams of Disquiet
* Finish F=MA
* Finish Weighted Arrays Package
* Finish Cats+/MOHA Work
* Finish Dungeon Hacks
* Finish Resume
* Finish About
* Finish Contact
* Sigil Generator
* Web Server and Website Write up

## Goal

### Current Goal


## File System Structure:

We will be using a locality based model for handling the different web pages and there contents. Each Web page will be stored in a a file named after that Page, for example `FMA.html` will be stored in the *FMA* folder, any outside that files that are referenced by `FMA.html` such as pictures, gifs, videos, 3D models, etc will also be stored in the "FMA" File

Their are two exceptions to the following rules:
1. those files that are shared between multiple different web pages (CSS style sheets, home bar buttons, scripts, etc) - Those files will be stored in the *Shared* folder
1. Those files referenced by `index.html` - those files will be stored in the *Home* Folder

*It should be noted that I eventually plan to overhaul this whole file structure and move to a two repo setup. See the [Goal](#goal) section for more details.*