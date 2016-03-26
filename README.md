# node-zonalstats

* proof of concept for creating a REST API endpoint for submitting geoJSON and calculating raster stats against a server-based raster
* initially all node-gdal based but gdal.rasterize() not available in node-gdal so had to find another option

install dependencies
```
npm install
```


for now depends on python rasterstats/linux

```
sudo apt-get install python-numpy libgdal1h gdal-bin libgdal-dev
pip install rasterstats
```
