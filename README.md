# node-zonalstats

* proof of concept for creating a REST API endpoint for submitting geoJSON and calculating raster stats against a server-based raster
* initially all node-gdal based but gdal.rasterize() not available in node-gdal so had to find another option

for now depends on python rasterstats

```
sudo apt-get install python-numpy python-gdal
sudo apt-get install python-numpy libgdal1h gdal-bin libgdal-dev
sudo pip install rasterstats
```
