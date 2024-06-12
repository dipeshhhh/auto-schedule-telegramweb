# Telegram Web Schedule Message Automation Bookmarklet

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [Current Limitations](#current-limitations)
5. [Future Features](#future-features)
6. [Contributions](#contributions)
7. [License](#license)

## Overview
### Problem
Manually entering messages and times for scheduling a bulk of similar messages daily is a boring and time-consuming task.

### Solution
This project provides a bookmarklet for quickly automating the bulk scheduling of messages on Telegram Web.
- You can now create a JSON dataset for your messages and timings in the following format:
#### JSON file example.
```json
[
  {"hh":"01", "mm":"00", "msg":"Good Morning, it is currently 1:00AM 🕐"},
  {"hh":"12", "mm":"00", "msg":"Good Afternoon, it is currently 12:00PM 🕛"},
  {"hh":"17", "mm":"00", "msg":"Good Evening, it is currently 5:00PM 🕔"},
  {"hh":"22", "mm":"00", "msg":"Good Night, it is currently 10:00PM 🕙"}
]
```
```js
//... Add more accordingly
```
- Then use this dataset in the Auto Schedule Telegram bookmarklet. Follow the steps for [Installation](#installation) and [Execution](#execution).

## Features
- Automatically schedules messages based on the provided dataset.
- Press <b>ALT+X</b> to stop the execution at any time.
- Flexible time input options.
- Start scheduling from any given time/row (hh,mm) in your dataset.
- Edit message set before scheduling.

## Getting Started
### Preparation
1. Create a JSON file containing your message data set in the format shown [above](#json-file-example).
2. Minify the code using any js minifier. 

### Installation
1. First [prepare your code (follow steps given in preparation)](#preparation).
2. Create a new bookmark in your browser.
3. Edit the bookmark and replace the URL in the following format:
<pre>javascript:<i><b>your_minified_code_here</b></i></pre>
4. Save the bookmark with any name of your choice.

### Execution
1. Open scheduled messages section of any telegram web chat.
2. Click on your saved bookmark.
3. Upload your JSON file by selecting 'Upload new set' in 'Select message set'.
4. Adjust 'From' time input according to your needs.
5. Preview/Edit your dataset.
6. Click confirm.
- <pre><i>Press</i> <b>ALT+X</b> <i>to stop the execution at any time.</i></pre>

## Current limitations
- Only works for K version of telegram web.
- Only works for Desktops/Laptops.
- Can schedule messages for current day only, i.e. cannot change the date.
- Code relies on a sleep function.
- Scheduling is limited by your Telegram account's scheduled message quota (default 100 messages per chat at a time).

## Future features
- Remote dataset support.
- Spreadsheet dataset support.

## Contributions
Contributions and bug reports are welcome! If you have suggestions for improvements or have found a bug, please create an issue or pull request on this repository.

## License
This project is licensed under the [MIT License](LICENSE).
