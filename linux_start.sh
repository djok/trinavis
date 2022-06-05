#!/bin/bash
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.desktop.lockdown disable-lock-screen true
gsettings set org.gnome.desktop.background picture-options 'centered'
gsettings set org.gnome.desktop.background picture-options 'scaled'
gsettings set org.gnome.desktop.background picture-uri file:////home/rosen/Desktop/trinavis/gui-app/assets0f8m3quovf/star/bg.bulgaria.png
cd /home/rosen/Desktop/trinavis/gui-app
npm start