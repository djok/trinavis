# trinavis
Trinavis Linux Player



## Setup Alsa
```sudo apt install alsa-base libasound2-dev```

## Setup Auto login on tty1
```sudo systemctl edit getty@tty1.servicesudo systemctl edit getty@tty1.service```

```
[Service]
ExecStart=
ExecStart=-/sbin/agetty --noissue --autologin MY_USERNAME %I $TERM
Type=idle
```
### gnome
```
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.desktop.lockdown disable-lock-screen true
gsettings set org.gnome.desktop.background picture-options 'centered'
gsettings set org.gnome.desktop.background picture-options 'scaled'
gsettings set org.gnome.desktop.background picture-uri file:////home/rosen/trinavis/gui-app/assets0f8m3quovf/star/bg.bulgaria.png
sudo apt install gnome-startup-applications
```
