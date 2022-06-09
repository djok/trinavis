#!/bin/bash
cd /home/rosen/Desktop/trinavis
git pull
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.desktop.lockdown disable-lock-screen true
cd /home/rosen/Desktop/trinavis/gui-app
npm start