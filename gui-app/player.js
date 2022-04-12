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


async function readMp3Files() {
  var mySongs = {};

  for await (const f of getFiles(`./${asset_path}`)) {
    // const myArray = f.split("assets0f8m3quovf")[1];
    // let word = myArray[1];
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

    console.log(f, plist, songId, songName);
  }
  return mySongs
}

readMp3Files().then(files => {
  console.log('files: ', files)

  Amplitude.init({
    songs: [
      {
        name: 'Equilibrium I (Cello version)',
        artist: 'David Hilowitz',
        album: 'Equilibrium I (Cello version)',
        url: './music/David_Hilowitz_-_Equilibrium_I_Cello_version.mp3',
        cover_art_url: `.${path.sep}${asset_path}${path.sep}star${path.sep}bulgaria.png`
      }
    ]
  });
})


