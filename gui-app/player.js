const { resolve } = require('path');
const { readdir } = require('fs').promises;

const asset_path = "assets0f8m3quovf"
const path = require('path')

var keyEscape = false
var bufEscape = ""
var keyStar = false
var bufStar = ""

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

async function readMp3Files() {
  var mySongs = {};

  for await (const f of getFiles(`./${asset_path}`)) {
    var fn = f.split(`${path.sep}${asset_path}${path.sep}`)[1]
    var plist = fn.split(path.sep)[0]
    var songId = fn.split(path.sep)[1].split(".")[0]
    var songName = fn.split(path.sep)[1].split(".")[1]
    var extType = fn.split(path.sep)[1].split(".")[2]
    switch (extType) {
      case "mp3":
        mySongs[`${plist}:${songId}`] =
        {
          name: `${songName}`,
          artist: `Unknown`,
          album: `${plist}`,
          url: `${f}`,
          cover_art_url: ''
        }
        break;
      case "png":
        mySongs[`${plist}:png`] = `${f}`
        break;
    }
  }
  return mySongs
}

readMp3Files().then(mp3files => {
  Amplitude.init({ songs: [initPlaylist("star", mp3files)] });
  conf = {
    playlist: "star",
    keyEscape: false,
    bufEscape: "",
    keyStar: false,
    bufStar: ""
  }
  window.addEventListener('keyup', newKeyPressHandler(mp3files,conf), true)
})

function newKeyPressHandler(mp3Files,conf) {
  return function (event) {
    console.log(conf);
    console.log(`You pressed ${event.key}`)
    switch (event.key) {
      case 'Backspace':
        break;
      case 'Enter':
        if (conf.keyEscape) {

        } else {
          console.log(Amplitude.getPlayerState())
          switch (Amplitude.getPlayerState()) {
            case "playing":
              Amplitude.pause()
              console.log("PLAY>PAUSE")
              break;
            case "stopped":
              Amplitude.play()
              console.log("STOP>PLAY")
              break;
            case "paused":
              Amplitude.play()
              console.log("PAUSE>PLAY")
              break;
          }
        }
        break;
      case "+":
        document.getElementById("amplitude-volume-up").click()
        break;
      case "1": //End
      case "End":
        var key = "1"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "2": //ArrowDown
      case "ArrowDown":
        var key = "2"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "3": //PageDown
      case "PageDown":
        var key = "3"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "4": //ArrowLeft
      case "ArrowLeft":
        var key = "4"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "5": //Clear
      case "Clear":
        var key = "5"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "6": //ArrowRight
      case "ArrowRight":
        var key = "6"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "7": //Home
      case "Home":
        var key = "7"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "8": //ArrowUp
      case "ArrowUp":
        var key = "8"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "9": //PageUp
      case "PageUp":
        var key = "9"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "0": //Insert
      case "Insert":
        var key = "0"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          }
          playNow(conf.playlist, key, mp3Files)
        }
        break;
      case "*":
        conf.keyStar = !conf.keyStar
        conf.bufStar = ""
        break;
      case "Escape":
        conf.keyEscape = !conf.keyEscape
        conf.bufStar = ""
        break;
    }
  }
}


function playNow(plist, songId, mp3Files) {
  if (mp3Files[`${plist}:${songId}`] === undefined) {
    console.log("Song not found");
    return;
  }
  song = mp3Files[`${plist}:${songId}`]
  if (plist != "star") {song.cover_art_url = mp3Files[`${plist}:png`]}
  // song.cover_art_url = mp3Files[`${plist}:png`]
  Amplitude.playNow(song)
}

function initPlaylist(plist, myList) {
  var zerosong = {
    name: '',
    artist: '',
    album: '',
    url: '',
    cover_art_url: ''
  }
  zerosong.cover_art_url = myList[`${plist}:png`]
  return zerosong
}

