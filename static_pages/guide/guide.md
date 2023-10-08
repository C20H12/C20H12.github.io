# Complete Guide on How to Set Up a ShadowSocks Server
## For the purposes of bypassing firewall restrictions - author: C20H12untitled
## Preface
I am sure that you had this frustration before: when you are connected to the school's internet and you want to browse a certain website, this content filter thing pops out from nowhere and starts yelling at you that the website is somehow "insecure". Or when you are using a certain social media app, it would be unable to connect to its servers, rendering it useless.  

The conventional method of getting around this is obviously using mobile data. However, that solution does not cover the use of a labtop or tablet. It is also expensive since mobile data is not a plentiful resource for everyone. Another way would be to use those free VPN apps, but those are always unstable and full of scam ads.  

With the intention to find the most well-rounded solution in mind, I went on a search. The most conspicuous method is to make a VPN server with OpenVPN. To my surprise, the firewall in place is actually super strong with deep packet inspection (suspected but not proven). It will block outgoing OpenVPN connections. So that is a miss.  

Now, there is a way to connect any device (maybe other than IOS but I will cover it later), even school PCs (other than those crappy chromebooks), to the uncensored internet. And that involves the use of this amazing open source tool, ShadowSocks. Apparently it is better at disguising itself as normal HTTP traffic, so it can get around the firewall easily. It has been well tested by myself over a number of months.

## Part1 - Setting up a server
To provide a service across the internet, you need a server.  

More precisely, a VPS (virtual private server). There are many that are out there and are basically the same. I haved used Linode and DigitalOcean. Most of them all offer a pretty cheap basic tier, which is more than enough for our use case. But DigitalOcean has a $200 credit available for users with Github Education Benefits, so I am going to use that for this example.   

Here I selected the one with the least of everything. It also depends on the region you picked. Choosing a closer datacenter is always a plus. I recommend Toronto or San Frasisco.

![vps tiers](./images/Screenshot%202023-10-08%20003824.png)

Then you need to select an OS. I chose Ubuntu because it is the easiest to navigate. **If you are using Ubuntu, note that you should use the 20.04LTS version. Newer versions have the newer version of python which causes issues.**   

![vps os](./images/Screenshot%202023-10-08%20003924.png)

Then, simply press create and wait for the VM to boot up. Once it is online, use your shell/client of preference to ssh into the VM using your root password or public key.  
Notice here we are just using the root user to do everything. If you don't like that, then create a separate user and log into that for a bit of additional security.   
```
$ ssh root@123.456.78.90
```
![ssh](./images/Screenshot%202023-10-08%20004019.png)

The first step for setting up most VPS systems is to update the packages. This takes a while to run.  
```
sudo apt-get update && sudo apt-get upgrade -y
```

If it shows a graphical prompt, just use <kbg>tab</kbg> to select the 'OK' button and continue.

![prompt](./images/Screenshot%202023-10-08%20004220.png)


## Part 2 - Installing necessary packages
The command to run python on linux is `python3`, which causes problems with some of the scripts that the proxy runs. So we need to link the command `python` to `python3` with this package.
```
apt install python-is-python3
```
![pkg](./images/Screenshot%202023-10-08%20004256.png)

Wait for this to finish, then test it by entering the command `python`. The python interpreter REPL should run and the version should be 3.8. Then exit it with `exit()`.

![py](./images/Screenshot%202023-10-08%20004308.png)

We also need to install the C compiler package which is required for compiling libsodium when installing the proxy. Use Y to continue the installation.
```
apt install build-essential
```
![build](./images/Screenshot%202023-10-08%20004322.png)


## Part 3 - Running the installation script

Because the actual setup of shadowsocks is complicated, we will use the crystalization of existing work, AKA scripts. Fetch it from Github with wget.
```
wget –no-check-certificate https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocksR.sh
```
![get script](./images/Screenshot%202023-10-08%20004525.png)
![got script](./images/Screenshot%202023-10-08%20004547.png)

We need to give ourselves permission in order to run this script. (sounds like the whole theme of this guide is to give yourself permission)
```
chmod +x shadowsocksR.sh
```

Then, actually run the script.
```
./shadowsocksR.sh
```

Now, you will be presented with a lot of inputs.  
- First, set a password.  
- Next, set a port. 443 and 80, which handles HTTP and HTTPS traffic respectively, are recommended. The other ports will be blocked by a strong firewall.  
- Next, choose an algorithm to encrypt the traffic with. `chacha20` works pretty well.  
- Next, choose a protocol for authentication. `origin`, which is just string comparision of passwords, works pretty well.   
- Finally, choose a obfuscation method. This makes the traffic more disguised as HTTP traffic and prevents packet inspectors to tell that it is a proxy. `hhtp_simple_compatible` works pretty well.

![scripts input](./images/Screenshot%202023-10-08%20004828.png)
![script inputs](./images/Screenshot%202023-10-08%20004811.png)

Press any key to start the installation. This takes a while. When it has finished, a success page will show up.

![done](./images/Screenshot%202023-10-08%20004900.png)

At this point, you are basically done. You can skip to [setting up the client](#part-5---client-setup).

## Part 4 - Additional setups
Open up the config file for shadowsocks with your text editor of choice. It should look like this.
```
vim /etc/shadowsocks.json
```
![config](./images/Screenshot%202023-10-08%20004941.png)

Multiple devices can use the same port, however, to boost performance, you can setup additional ports. They can be used by different devices or shared with different people.  
Remove the `server_port` and `password` lines in the json file, then add a `port_password` object, containing ports each mapped to a password string.   

Another thing is to remove the logging of connection sessions. The log file gets very big after some time of use and will clogg up a lot of memory. It also reduces the privacy somewhat. So set `log-file` to the null device to discard it.  

The modified file should look like this.  
![added config](./images/Screenshot%202023-10-08%20005025.png)

Finally, restart the proxy to apply the changes.
```
/etc/init.d/shadowsocks restart
```
![restart](./images/Screenshot%202023-10-08%20005041.png)

## Part 5 - Client setup

[**Download the Windows client**](https://github.com/shadowsocksrr/shadowsocksr-csharp/releases)   
[**Download the Android client**](https://github.com/shadowsocksrr/shadowsocksr-android/releases)

I will show the process for windows. Android follows pretty much the same steps.   
For IOS, there are lots of such Shadowsocks clients on the app store, but I have never tested those. Though there was an article recommending Shadowrocket.

After downloading the release in a zip, unzip the contents and launch `ShadowsocksR-dotnet4.0.exe`. The interface looks like this.  
Then enter the IP, port, password, encryption, and protocol exactly as how you set up the server. The obfs can be kept as plain or http whatever.  
After Setup, press OK.

![client](./images/Screenshot%202023-10-08%20005143.png)

Then, goto your system tray and right click on the paper airplane icon. Select `Proxy rule` and disable the bypass. This will route all traffic through the proxy.

![tray](./images/Screenshot%202023-10-08%20005208.png)

To test it, go to whatever website that shows your IP. If it shows the IP of the VPS, that means the proxy has been successfully set up.  

![test](./images/Screenshot%202023-10-08%20005242.png)

**TIP** – Make sure you remember to disable the proxy client before you shut down your computer. Otherwise, you will find that you have no internet at all because the proxy settings are still there but the client is not running. To solve this problem, just open the shadowsocks client and quit the proxy again or turn off proxy in windows settings.  

![quit](./images/Screenshot%202023-10-08%20005326.png)