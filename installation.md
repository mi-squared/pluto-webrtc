# Installation


 !!! hostname !!!
http://devwebrtc.careconnectors.net:8081/VideoConference.html

## Install ```node``` and utilities

```
$ sudo apt-get update
$ sudo apt-get install nodejs npm zip unzip
$ sudo ln -s /usr/bin/nodejs /usr/bin/node  # To fix "/usr/bin/env: node: No such file or directory"
$ sudo npm install -g forever
```

## Install TURN/STUN server
### Install

``` 
$ sudo apt-get install rfc5766-turn-server
```

### Set auto start
Edit following file

```
$ sudo nano /etc/default/rfc5766-turn-server
```
Uncomment following line

```
TURNSERVER_ENABLED=1
```

### Configure server

```
$ sudo nano /etc/turnserver.conf

```
Add or uncomment following lines:

```
listening-ip=192.168.232.24

external-ip=216.195.78.24

fingerprint

lt-cred-mech

user=demo:testing

realm=216.195.78.24
```

Comment on UDP ports range:

```
# Lower and upper bounds of the UDP relay endpoints:
# (default values are 49152 and 65535)
#
#min-port=49152
#max-port=65535
```

## Install sources

### Commands to execute at local machine
Copy sources zip to the server (run from local machine)

```
$ scp -r -p22 source_* ccm@216.195.78.24:~ 
```

### Connect to remote server

```
$ ssh ccm@216.195.78.24
```

### Commands to execute at remote server
Unzip sources

```
$ mkdir -p ~/archive
$ unzip source_*
$ mv source_* archive
```

Install ```npm``` dependencies

```
$ cd ~/source/server
$ sudo npm install
```

Configure the application

```
$ nano ~/source/public/common/app_config.js
```

Uncomment 

```
...
  HOSTNAME   : '216.195.78.24',       HTTP_PORT: 8081, HTTPS_PORT: 8081,  // CareConnect
...
  TURN : {
    SERVERS : [ {
      ...
        hostname  : '216.195.78.24',                           
      ... 
      }, {
      ... 
        hostname  : '216.195.78.24',
      ...
    }],                                   
```

Test run from console

```
$ node app
```

Test run with ```forever```

```
$ cd /home/ccm/source/server/; /usr/local/bin/forever start ./app.js
```

## Run on server startup
Edit following file 

```
$ sudo nano /etc/rc.local
```
Add following line:

```
su ccm -c "cd /home/ccm/source/server/; /usr/local/bin/forever start ./app.js"
```

## Reboot

Reboot to check

```
$ sudo reboot
```

# Troubleshooting

### Check all the services are running

```
$ ps ax|grep forever
 1241 ?        Ssl    0:00 /usr/bin/nodejs /usr/local/lib/node_modules/forever/bin/monitor ./app.js
...
$ ps ax|grep node
 1241 ?        Ssl    0:00 /usr/bin/nodejs /usr/local/lib/node_modules/forever/bin/monitor ./app.js
 1254 ?        Sl     0:00 /usr/bin/nodejs /home/ccm/source/server/app.js
...
$ ps ax|grep turn
 1072 ?        Ssl    0:00 /usr/bin/turnserver -c /etc/turnserver.conf -o -v
...
```

### Check ```forever``` status

```
$ forever list
info:    Forever processes running
data:        uid  command         script forever pid  id logfile                     uptime       
data:    [0] ikMH /usr/bin/nodejs app.js 1241    1254    /home/ccm/.forever/ikMH.log 0:0:2:14.908 
```

### Application logs 

Log filename can be determined by ```forever list``` command.

```
$ forever list
info:    Forever processes running
data:        uid  command         script forever pid  id logfile                     uptime       
data:    [0] ikMH /usr/bin/nodejs app.js 1241    1254    /home/ccm/.forever/ikMH.log 0:0:2:14.908 

$ ls /home/ccm/.forever/
EAHy.log  config.json  ikMH.log  pids  sock

$ tail -f 
...
```

### Restart scripts

```
  $ sudo -I forever restartall
```


## TURN 
### Restart TURN

```
$ sudo service rfc5766-turn-server status
$ sudo service rfc5766-turn-server restart
```

### Turn on debug in verbose mode for TURN 

```
sudo nano /etc/turnserver.conf 
```

Uncomment:
 
```
verbose
```

Then restart.

### TURN logs

```
$ ls /var/log/turn_*
```

Then ```tail -f``` latest file.

### Ensure TURN is ok

This test allows to prove that TURN is properly configured and all specific procedures works ok.

Before this test we need to be sure that all other video conference is ok and can be established 
at least between two tabs of the same browser window within the same PC (as it is within same network, no need in STUN/TURN).

Only if we are sure that basic functionality is ok, we may proceed with this step. 

#### Edit application config file

```
$ nano ~/source/public/common/app_config.js
```

Uncomment 

```
     DEBUG : {
      BLOCK: [
...
//      'host', 'srflx', 'prflx'          // Uncomment to block all except TURN (to check if TURN is OK)
      'host', 'srflx', 'prflx'          // Uncomment to block all except TURN (to check if TURN is OK)
...
      ]
    }

```

#### Test the application in test mode

Restart the application and make a test video conference. 
If video stream was established, that means, the TURN is ok.

Otherwise, we have problems with TURN (if before this test video conf between two tabs in the same browser worked ok). 

#### Turn off TURN test mode

Comment out this line again, restart the app and try the video conf again .

