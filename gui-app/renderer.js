const { resolve } = require('path');
const { readdir } = require('fs').promises;

const asset_path = "assets0f8m3quovf"
const path = require('path')

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


var myPng = []
var keyEscape = false
var bufEscape = ""
var keyStar = false
var bufStar = ""

async function readMp3Files() {
  var mySongs = {}
  for await (const f of getFiles(`./${asset_path}`)) {
    // const myArray = f.split("assets0f8m3quovf")[1];
    // let word = myArray[1];
    var fn = f.split(`${path.sep}${asset_path}${path.sep}`)[1]
    var plist = fn.split(path.sep)[0]
    var songId = fn.split(path.sep)[1].split(".")[0]
    var songName = fn.split(path.sep)[1].split(".")[1]
    var extType = fn.split(path.sep)[1].split(".")[2]
    var mySongs = {}
    switch (extType) {
      case "mp3":
        if (mySongs[`${plist}/${songId}`] === undefined) {
          mySongs[`${plist}/${songId}`] = {}
        };
        mySongs[`${plist}/${songId}`] = {
          name: `${songName}`,
          artist: `Unknown`,
          album: `${plist}`,
          url: `${f}`,
          cover_art_url: ''
        }
        break;
      case "png":
        // if (myPng[`${plist}`] === undefined) {
        //   myPng[`${plist}`] = {}
        // };
        myPng[plist] = f
        break;
    }

    // console.log(f, plist, songId, songName);
  }
  return mySongs
}

readMp3Files().then(files => {
  console.log(myPng["star"])
  Amplitude.init({
    songs: [
      {
        name: '',
        artist: '',
        album: '',
        url: '',
        cover_art_url: `${mySongs.png_star}`
      }
    ]
  });
})
// initPlaylist("star")
// var startBg = mySongs.png_star


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
      playNow(1, 1)
      break;
  }
}

function playNow(plist, songId) {
  if (mySongs[`${plist}/${songId}`] === undefined) {
    return;
  }
  song = mySongs[`${plist}/${songId}`]
  song.cover_art_url = mySongs[`${plist}/png`]
  Amplitude.playNow(song)
}

function initPlaylist(plist) {
  var zerosong = {
    name: '',
    artist: '',
    album: '',
    url: '',
    cover_art_url: ''
  }
  zerosong.cover_art_url = mySongs[`${plist}/png`]

  console.log("BG:", mySongs);

  Amplitude.init({ songs: [zerosong] });
}

window.addEventListener('keyup', handleKeyPress, true)
