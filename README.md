# Jobs Watcher

Daemon script using my task manager and my web scraper (based on PhantomJS) for collect new freelance jobs across several freelance platforms.

## Build (for dev)
```
git clone https://Cooya@bitbucket.org/Cooya/jobswatcher.git
cd jobswatcher
npm install // it will also install the development dependencies
wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 // PhantomJS need to be accessible globally
bzip2 -dk phantomjs-2.1.1-linux-x86_64.tar.bz2
tar xvf phantomjs-2.1.1-linux-x86_64.tar
cp phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/bin
rm -rf phantomjs* // delete archives
```