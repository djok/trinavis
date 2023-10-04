#!/bin/bash
cd ~/trinavis/gui-app
killall matchbox-keyboard
npm start &
sleep 8
matchbox-keyboard &
sleep 3
wmctrl -r "Keyboard" -b add,above
