package main

import (
	"fmt"
	"image"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/faiface/beep"
	"github.com/faiface/beep/effects"
	"github.com/faiface/beep/mp3"
	"github.com/faiface/beep/speaker"

	"github.com/MarinX/keylogger"
	"github.com/blackspace/gofb/framebuffer"
	"github.com/disintegration/imaging"
	"github.com/fogleman/gg"
	term "github.com/nsf/termbox-go"

	"net/http"
	_ "net/http/pprof"
)

type command struct {
	cmd string
	fn  string
}

type display struct {
	fb *framebuffer.Framebuffer
}

type audioStatus string

const (
	startPlaying  audioStatus = "start_playing"
	playing       audioStatus = "playing"
	paused        audioStatus = "paused"
	muted         audioStatus = "muted"
	stopPlaying   audioStatus = "stop_playing"
	cancelPlaying audioStatus = "cancel_playing"
)

type backgroundMusicController struct {
	c          chan command
	statusChan chan audioStatus
	stop       chan struct{}
	idle       chan struct{}
	timeout    *time.Ticker
}

func (b *backgroundMusicController) Start() {
	go b.run()
}

func (b *backgroundMusicController) Stop() {
	b.stop <- struct{}{}
}

func (b *backgroundMusicController) run() {
	var stopC chan bool
	for {
		select {
		case st := <-b.statusChan:
			// fmt.Println("status changed: ", st)
			switch st {
			case startPlaying, playing:
				// fmt.Println("cancel background job")
				if stopC != nil {
					stopC <- true
					close(stopC)
					stopC = nil
				}
			case stopPlaying, cancelPlaying:
				if stopC != nil {
					stopC <- true
					close(stopC)
				}
				//				stopC = startBackgroundMusicTicker(b.c)
			}
		case <-b.stop:
			// fmt.Println("stopping")
			return
		}
	}
}

//func startBackgroundMusicTicker(c chan command) chan bool {
//	ticker := time.NewTicker(120 * time.Second)

//	stopChan := make(chan bool)
//	go func(ticker *time.Ticker) {
//		defer ticker.Stop()

//		for {
//			select {
//			case <-ticker.C:
//fmt.Println("22.4kHz")
//				fileName := getFileName(path + "/" + "star" + "/99")
//				c <- command{cmd: "play", fn: fileName}
//			case stop := <-stopChan:
//				if stop {
//					// fmt.Println("Ticker2 Stop")
//					return
//				}
//			}
//		}
//	}(ticker)
//
//	return stopChan
//}

func (d *display) Init() {
	fb := framebuffer.NewFramebuffer()
	fb.Init()

	d.fb = fb
}

func (d *display) ShowImage(fn string) {
	screenWidth := d.fb.Xres
	screenHeight := d.fb.Yres

	dc := gg.NewContext(screenWidth, screenHeight)
	dc.DrawRectangle(0, 0, float64(screenWidth), float64(screenHeight))
	dc.SetRGB(255, 255, 255)
	dc.Fill()

	if !fileExists(fn) {
		fn = path + "/star/bulgaria.png"
	}
	f, err := os.Open(fn)
	if err != nil {
		panic(err.Error())
	}

	srcImage, _, err := image.Decode(f)
	if err != nil {
		panic(err.Error())
	}

	imageWidth := srcImage.Bounds().Size().X
	imageHeight := srcImage.Bounds().Size().Y

	scaleWidth := screenWidth
	scaleHeight := imageHeight * screenWidth / imageWidth

	if scaleHeight > screenHeight {
		scaleWidth = imageHeight * screenHeight / imageHeight
		scaleHeight = screenHeight
	}

	dstImage := imaging.Resize(srcImage, scaleWidth, scaleHeight, imaging.Lanczos)

	center := (screenWidth - scaleWidth) / 2
	dc.DrawImage(dstImage, center, 0)
	d.fb.DrawImage(0, 0, dc.Image())
}

func (d *display) Release() {
	d.fb.Release()
}

func playAudio(c chan command, audioStatusChan chan audioStatus) {
	sr := beep.SampleRate(44100)
	speaker.Init(sr, sr.N(time.Second*4))

	var streamer beep.Streamer
	var ctrl = &beep.Ctrl{Streamer: streamer, Paused: false}
	var mix = &effects.Volume{
		Streamer: ctrl,
		Base:     2,
		Volume:   0,
		Silent:   false,
	}

	speaker.Play(mix)

	for {
		switch msg := <-c; msg.cmd {
		case "play":
			audioStatusChan <- startPlaying
			//fmt.Println("start play",msg.fn)
			f, err := os.Open(msg.fn)
			if err != nil {
				fmt.Println(err)
				continue
			}

			streamer, format, err := mp3.Decode(f)
			if err != nil {
				fmt.Println(err)
				continue
			}

			speaker.Init(format.SampleRate, format.SampleRate.N(time.Second/8))
			ctrl = &beep.Ctrl{Streamer: streamer, Paused: false}
			mix = &effects.Volume{
				Streamer: ctrl,
				Base:     2,
				Volume:   0,
				Silent:   false,
			}
			time.Sleep(500 * time.Millisecond)

			speaker.Play(beep.Seq(mix, beep.Callback(func() {
				audioStatusChan <- stopPlaying
			})))

			//speaker.Lock()
			//ctrl.Paused = !ctrl.Paused
			//speaker.Unlock()
			//time.Sleep(500 * time.Millisecond)
			//speaker.Lock()
			//ctrl.Paused = !ctrl.Paused
			//speaker.Unlock()
			//fmt.Println("done play")
		case "stop":
			audioStatusChan <- stopPlaying
			// fmt.Println("clear")
			speaker.Clear()

		case "pause":
			//Fade Down Volume before Pause
			if !ctrl.Paused {
				for a := 0; a < 10; a++ {
					speaker.Lock()
					mix.Volume += -0.5
					speaker.Unlock()
					time.Sleep(200 * time.Millisecond)
				}
			}
			//fmt.Println(ctrl.Paused)
			speaker.Lock()
			ctrl.Paused = !ctrl.Paused
			speaker.Unlock()
			// fmt.Println(ctrl.Paused)
			if ctrl.Paused {
				audioStatusChan <- stopPlaying
			} else {
				audioStatusChan <- startPlaying
			}
			//Fade Up Volume after UnPause
			if !ctrl.Paused {
				for a := 0; a < 10; a++ {
					speaker.Lock()
					mix.Volume += 0.5
					speaker.Unlock()
					time.Sleep(200 * time.Millisecond)
				}
			}
		case "volUp":
			speaker.Lock()
			mix.Volume += 0.5
			speaker.Unlock()
			if mix.Volume > -10 {
				audioStatusChan <- startPlaying
			}
			// fmt.Println(mix.Volume)
			//
			// fmt.Println(mix.Silent)
			// fmt.Println(mix.Volume)
		case "volDown":
			speaker.Lock()
			mix.Volume += -0.5
			speaker.Unlock()

			if mix.Volume < -9.5 {
				audioStatusChan <- stopPlaying
			}
			// fmt.Println(mix.Volume)
			// fmt.Println(mix.Silent)
		}
	}
}

func keyboardLoop(keyboard string, display *display, c chan command) {
	k, err := keylogger.New(keyboard)
	if err != nil {
		fmt.Println(err)
	}
	defer k.Close()

	events := k.Read()

	var keyMode = ""
	var keyCmd = ""
	var degree = ""

	// range of events
	for e := range events {
		switch e.Type {
		case keylogger.EvKey:
			if e.KeyPress() {
				keyStr := e.KeyString()
				log.Println(keyStr)
				switch keyStr {
				// case "NUM_LOCK":
				case "ESC":
					if keyMode != "degree" {
						keyMode = "degree"
						keyCmd = ""
					} else {
						keyCmd = ""
					}
				case "Del":
					cmd := exec.Command("rclone", "--config=/home/trinavis/rclone.conf", "sync", "trinavis:/Apps/trinavis", "/home/trinavis/data")
					if err := cmd.Run(); err != nil {
						fmt.Println("Dropbox Sync - Error: ", err)
					} else {
						fmt.Println("Dropbox Sync - Done")
					}
					// go displayImage(path+"/star/bulgaria.png")
				case "*":
					if keyMode != "star" {
						keyMode = "star"
						keyCmd = ""
					} else {
						keyCmd = ""
					}
				case "BS":
					switch keyMode {
					case "":
						c <- command{cmd: "stop"}
					default:
						keyCmd = ""
						keyMode = ""
					}
				case "HOME": //7
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/7")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "7"
					}
				case "UP_8": //8
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/8")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "8"
					}
				case "PGUP_9": //9
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/9")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "9"
					}
				case "-":
					c <- command{cmd: "volDown"}
				case "LEFT_4": //4
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/4")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "4"
					}
				case "5": //5
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/5")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "5"
					}
				case "RT_ARROW_6": //6
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/6")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "6"
					}
				case "+":
					c <- command{cmd: "volUp"}
				case "END_1": //1
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/1")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "1"
					}
				case "DOWN": //2
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/2")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "2"
					}
				case "PGDN_3": //3
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/3")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "3"
					}
				case "R_ENTER":
					switch keyMode {
					case "":
						c <- command{cmd: "pause"}
					case "*":
					case "/":
					case "star":
						filePattern := path + "/star/" + keyCmd
						fileName := getFileName(filePattern)
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
						keyMode = ""
						break
					case "degree":
						filePattern := path + "/" + keyCmd + "/*"
						fileName := getFileName(filePattern)

						if fileName != "" {
							degree = keyCmd
							imagePath := path + "/" + degree + "/bg." + degree + ".png"
							go display.ShowImage(imagePath)
						}
						keyMode = ""
						keyCmd = ""
					}
				case "INS": //0
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/0")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "0"
					}
				case "DEL": //.
					switch keyMode {
					case "":
						fileName := getFileName(path + "/" + degree + "/00")
						if fileName != "" {
							c <- command{cmd: "play", fn: fileName}
						}
					default:
						keyCmd += "00"
					}
				case "TAB": //TAB
					c <- command{cmd: "play", fn: path + "/star/background.mp3"}
					c <- command{cmd: "volDown"}
					c <- command{cmd: "volDown"}
					c <- command{cmd: "volDown"}
					c <- command{cmd: "volDown"}
					c <- command{cmd: "volDown"}
					c <- command{cmd: "volDown"}
					c <- command{cmd: "volDown"}
					c <- command{cmd: "volDown"}
					c <- command{cmd: "volDown"}
				default:
					// fmt.Println("?press key", e.KeyString())
				}
				// fmt.Println("2k:"+e.KeyString()+" m:"+keyMode+" c:"+keyCmd+" d:"+degree)
			}
			// fmt.Println("3k:"+e.KeyString()+" m:"+keyMode+" c:"+keyCmd+" d:"+degree)
		}
		// fmt.Println("4k:"+e.KeyString()+" m:"+keyMode+" c:"+keyCmd+" d:"+degree)
	}
	// fmt.Println("??????")

}

func getFileName(startWith string) string {
	matches, err := filepath.Glob(startWith + ".*.mp3")

	if err != nil {
		return ""
	}
	if matches != nil {
		return matches[0]
	}

	return ""
}

const path = "/home/trinavis/data"

func reset() {
	term.Sync() // cosmestic purpose
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func main() {

	go func() {
		fmt.Println(http.ListenAndServe(":6060", nil))
	}()

	audioStatusChan := make(chan audioStatus, 50)
	c := make(chan command)

	ctrl := backgroundMusicController{
		c:          c,
		statusChan: audioStatusChan,
		stop:       make(chan struct{}),
	}

	go playAudio(c, audioStatusChan)
	ctrl.Start()

	// dev_file := C.CString("/dev/fb0")
	// fd, err := C.OpenFrameBuffer(dev_file)
	// C.free(unsafe.Pointer(dev_file))

	// if err != nil {
	// 	panic(errors.New("Open the framebuffer failed"))
	// }

	display := &display{}
	display.Init()

	err := term.Init()
	if err != nil {
		panic(err)
	}

	defer term.Close()

	//Setup Audio
	// c := make(chan command)
	// go playAudio(c)

	display.ShowImage(path + "/star/bulgaria.png")
	// c <- command{cmd: "play", fn: path + "/star/init.mp3"}

	//Setup keyboard
	keyboard := os.Getenv("KEYBOARD_DEVICE")
	if keyboard == "" {
		// keyboard = keylogger.FindKeyboardDevice()
		keyboard = "/dev/input/event0"
	}
	// check if we found a path to keyboard
	if len(keyboard) <= 0 {
		panic("No keyboard found...you will need to provide manual input path")
	}

	go keyboardLoop(keyboard, display, c)

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)

	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigs
		fmt.Println(sig)
		done <- true
	}()

	<-done

	ctrl.Stop()

	fmt.Println("Exiting")
}
