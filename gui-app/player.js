const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const { resolve } = require('path');
const { readdir } = require('fs').promises;
const child_process = require('child_process');
const { ipcRenderer } = require('electron');
// const dialog = app.dialog;

const asset_path = "assets0f8m3quovf"
const path = require('path')

function run_script(command, args, callback) {
  var child = child_process.spawn(command, args, {
      encoding: 'utf8',
      shell: true
  });
  // You can also use a variable to save the output for when the script closes later
  child.on('error', (error) => {
      // dialog.showMessageBox({
      //     title: 'Title',
      //     type: 'warning',
      //     message: 'Error occured.\r\n' + error
      // });
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
      //Here is the output
      data=data.toString();   
      console.log("git pull: "+data);      
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (data) => {
      // Return some data to the renderer process with the mainprocess-response ID
      // mainWindow.webContents.send('mainprocess-response', data);
      //Here is the output from the command
      console.log("git pull: "+data);  
  });

  child.on('close', (code) => {
      //Here you can get the exit code of the script  
      switch (code) {
          case 0:
              // dialog.showMessageBox({
              //     title: 'Title',
              //     type: 'info',
              //     message: 'End process.\r\n'
              // });
              break;
      }

  });
  if (typeof callback === 'function')
      callback();
}

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
          // cover_art_url: ''
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
  // window.addEventListener('keydown', (e) => {console.log(e)})
})

function newKeyPressHandler(mp3Files,conf) {
  return function (event) {
    console.log("Before event status")
    console.log(conf)
    console.log(event)
    switch (event.key) {
      case 'Enter':
      case 'NumpadEnter':
        if (conf.keyEscape) {
          console.log(conf.bufEscape);
          conf.keyEscape = !conf.keyEscape
          newPlaylist = conf.bufEscape
          conf.bufEscape = ""
          if (mp3Files[`${newPlaylist}:png`]) {
            // console.log(Amplitude.getDefaultAlbumArt());
            Amplitude.stop()
            Amplitude.init({ songs: [initPlaylist(newPlaylist, mp3Files)] });    
            conf.playlist = newPlaylist         
          }
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
      case "1": //End
      case "End":
        var key = "1"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
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
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
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
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
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
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
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
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
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
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
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
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
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
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
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
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
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
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
        }
        break;
      case ".":
        var key = "00"
        if (conf.keyStar) {
          conf.bufStar = conf.bufStar + key;
          if (conf.bufStar.length == 2) {
            conf.keyStar = !conf.keyStar
            songId = conf.bufStar
            conf.bufStar = ""
            playNow("star", songId, mp3Files, Amplitude)
          }
        } else {
          if (conf.keyEscape) {
            conf.bufEscape = conf.bufEscape + key
          } else { 
            playNow(conf.playlist, key, mp3Files, Amplitude) 
          }
        }
        break;
      case "*":
        conf.keyStar = !conf.keyStar
        conf.bufStar = ""
        conf.keyEscape = false
        break;
      case "Backspace":
        conf.keyStar = false
        conf.bufStar = ""
        conf.keyEscape = false
        conf.bufEscape = ""
        break;
      case "NumLock":
        break;
      case "/":
      case "NumpadDivide":
      case "Escape":
        conf.keyEscape = !conf.keyEscape
        conf.bufStar = ""
        conf.bufEscape = ""
        conf.keyStar = false
        break;
      case "+": //AudioVolumeUp
      // case "Shift":
        // run_script("amixer", ["set Master -- 10%+"], null)
        var volume = Amplitude.getVolume() + 10
        if (volume > 100) volume = 100
        Amplitude.setVolume(volume)
        break;
      case "-": //AudioVolumeDown
        // run_script("amixer", ["set Master -- 10%-"], null)
        var volume = Amplitude.getVolume() - 10
        if (volume < 2) volume = 2
        Amplitude.setVolume(volume)
        break;
    }
    console.log("After event status")
    console.log(conf)
  }
}


function playNow(plist, songId, mp3Files, a) {
  if ((plist == "star") && (songId == "98")) {
    run_script("git", ["pull"], null)
  }
  if ((plist == "star") && (songId == "99")) {
    run_script("killall", ["matchbox-keyboard"], null)
    ipcRenderer.send('terminate-app');
}
  if (mp3Files[`${plist}:${songId}`] === undefined) {
    console.log("Song not found");
    return;
  }
  song = mp3Files[`${plist}:${songId}`]
  console.log(mp3Files[`${plist}:png`]);
  if (plist == "star") {
    song.cover_art_url = mp3Files[`${conf.playlist}:png`]
  } else {
    song.cover_art_url = mp3Files[`${plist}:png`]
  }
  // song.cover_art_url = mp3Files[`${plist}:png`]
  a.stop()
  a.setVolume(60)
  a.playNow(song)
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

