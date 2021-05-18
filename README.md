# BeaterList

This project is inspired by BeatList, an electronJS based playlist manager for BeatSaber. I wanted to add in a drag-and-drop feature for the tool, but couldn't get it to work on the `beatlist` project, hence I just decided to write my own tool.

## Features

1. Drag and drop songs between playlists
1. Import existing `.bplist` or `.json` playlist files, exported from `Playlist Editor Pro` or just from the BeatSaber playlist folder
1. Create new playlists from scratch, and add songs to them by key
1. Drag songs from the internal BeatSaver browser to the playlists directly
1. Export the playlists as `.bplist` files, to be imported to BeatSaber via ModAssistant.

## Architecture

This site is hosted on Github Pages, and uses React w/ MobX, and the Evergreen-UI GUI library.
All the data is persisted on localStorage. The tool relies on Beat-Saver APIs to retrieve song data in order to flesh out the playlists.
