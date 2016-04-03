# node-zonalstats

* proof of concept for creating a REST API endpoint for submitting geoJSON and calculating raster stats against a server-based raster
* initially all node-gdal based but gdal.rasterize() not available in node-gdal so had to find another option

http://www.sarasafavi.com/installing-gdalogr-on-ubuntu.html
need newer version of gdal than the one that comes with ubuntu 14.04 repository
```
sudo add-apt-repository ppa:ubuntugis/ubuntugis-unstable && sudo apt-get update
sudo apt-get install python-numpy libgdal1h gdal-bin libgdal-dev nodejs-legacy
```

depends on python rasterstats/linux
```
sudo apt-get install python-pip python-dev
sudo pip install rasterstats
```


clone repo
```
git clone https://github.com/marsmith/node-zonalstats.git
cd node-zonalstats
npm install
```
