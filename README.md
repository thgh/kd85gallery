kd85gallery
===========

Gallery for showing of pictures.
No server side scripting needed after setup.

Includes a tagging tool.
Includes a gallery with all pictures
Includes an Angular directive that transforms a <gallery> tag to a gallery with thumbnails

## Setup

Setup LAP stack

```
sudo apt-get install php5 apache2 libapache2-mod-php5
```

Clone repo in your localhost project

```
cd /var/www/<projectname>
git clone https://github.com/thgh/kd85gallery.git
```

Tag editor in .

Stuff to copy to server in public/

## Troubleshooting

You might want to set these permissions on a Debian/Ubuntu system:

```
sudo chgrp -R www-data /var/www
sudo chmod -R g+x /var/www
```
