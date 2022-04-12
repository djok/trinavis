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

files = readMp3Files()
// readMp3Files().then(files => {
Amplitude.init({ songs: [initPlaylist("star", files)] });
window.addEventListener('keyup', handleKeyPress, true)
// })

function handleKeyPress(event) {
  console.log(`You pressed ${event.key}`)
  switch (event.key) {
    case 'Enter':
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
      break;
    case "+":
      document.getElementById("amplitude-volume-up").click()
      break;
    case "1":
      playNow(1, 1, files)
      break;
  }
}

function playNow(plist, songId, mySongs) {
  if (mySongs[`${plist}/${songId}`] === undefined) {
    return;
  }
  song = mySongs[`${plist}:${songId}`]
  song.cover_art_url = mySongs[`${plist}:png`]
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

