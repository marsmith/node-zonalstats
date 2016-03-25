/* some links
http://stackoverflow.com/questions/23365344/parsing-json-post-requests-in-node-js-with-express-4
http://stackoverflow.com/questions/10005939/how-to-consume-json-post-data-in-an-express-application
https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters#sample-app-to-test
https://erichonorez.wordpress.com/2013/02/10/how-create-a-rest-api-with-node-js-and-express/


http://gis.stackexchange.com/questions/77993/issue-trying-to-create-zonal-statistics-using-gdal-and-python

http://pcjericks.github.io/py-gdalogr-cookbook/raster_layers.html#calculate-zonal-statistics
https://github.com/perrygeo/python-rasterstats
https://github.com/naturalatlas/node-gdal

*/

var turf = require('turf');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var gdal = require("gdal");

/*
//set up express
var app = express();

// parse application/json
app.use(bodyParser.json());

app.post('/', function(request, response){
  var convexHull = turf.convex(request.body);
  console.log(JSON.stringify(convexHull));      // display on console
  response.send(convexHull);    // echo the result back
});

app.listen(3000);
*/



var raster = gdal.open("input/test.tif");

//make sure we have a raster
var rasterDriver = raster.driver;
var rasterDriver_metadata = rasterDriver.getMetadata();
if (rasterDriver_metadata['DCAP_RASTER'] !== 'YES') {
	console.error('Source file is not a raster');
	return;
}
console.log('\nRaster driver: ' + rasterDriver.description);
console.log(raster)
//get raster georeference info
var numbands = raster.bands.count();
var transform = raster.geoTransform;
var xOrigin = transform[0];
var yOrigin = transform[3];
var pixelWidth = transform[1];
var pixelHeight = transform[5];

//if input is geoJSON use wgs84
var wgs84 = gdal.SpatialReference.fromEPSG(4326);
var coordTrans = new gdal.CoordinateTransformation(wgs84, raster.srs);

//console.log('Coordinate System of Raster is: ', raster.srs.toPrettyWKT());

//var polygon = gdal.open("input/basin.geojson")
var polygon = gdal.open("input/GlobalWatershed.shp")


//make sure we have a valid input
var polygonDriver = polygon.driver;
var polygonDriver_metadata = polygonDriver.getMetadata();
if (polygonDriver_metadata['DCAP_VECTOR'] !== 'YES') {
	console.error('Source file is not a vector');
	return;
}

console.log('\nPolygon Driver: ' + polygonDriver.description);


var layer = polygon.layers.get(0);

/*console.log("number of features: " + layer.features.count());
console.log("fields: " + layer.fields.getNames());
console.log("extent: " + JSON.stringify(layer.extent));
console.log("srs: " + (layer.srs ? layer.srs.toWKT() : 'null'));*/


var feature = layer.features.next();
var geom = feature.getGeometry();
//console.log(geom.toJSON())

console.log('\nenvelope before: ',geom.getEnvelope())

geom.transformTo(raster.srs);

var envelope = geom.getEnvelope();
console.log('\nenvelope after: ',envelope)

var xmin = envelope.minX;
var xmax = envelope.maxX;
var ymin = envelope.minY;
var ymax = envelope.maxY

var ring = geom.rings.get(0);
var numpoints = ring.points.count();
console.log("\mNumber of points: ", numpoints)

// Specify offset and rows and columns to read
var xoff = parseInt((xmin - xOrigin)/pixelWidth)
var yoff = parseInt((yOrigin - ymax)/pixelWidth)
var xcount = parseInt((xmax - xmin)/pixelWidth)+1
var ycount = parseInt((ymax - ymin)/pixelWidth)+1
console.log(xoff,yoff,xcount,ycount);

//create memory target raster
var target_ds = gdal.drivers.get('MEM');
target_ds.create('', xcount, ycount, numbands, gdal.GDT_Byte);
target_ds.geoTransform = [xmin, pixelWidth, 0, ymax, 0, pixelHeight];
target_ds.srs = raster.srs;
console.log("\ntarget raster: ", target_ds)

// rasterize zone polygon to raster
gdal.rasterizelayer(target_ds, [1], layer, burn_values=[1])

/* 

    # rasterize zone polygon to raster
    gdal.RasterizeLayer(target_ds, [1], lyr, burn_values=[1])

    # read raster as arrays
    banddataraster = raster.GetRasterBand(1)
    dataraster = banddataraster.ReadAsArray(xoff, yoff, xcount, ycount).astype(numpy.float)

    bandmask = target_ds.GetRasterBand(1)
    datamask = bandmask.ReadAsArray(0, 0, xcount, ycount).astype(numpy.float)

    # mask zone of raster
    zoneraster = numpy.ma.masked_array(dataraster,  numpy.logical_not(datamask))

    # calculate mean of zonal raster
    return numpy.mean(zoneraster) 
*/