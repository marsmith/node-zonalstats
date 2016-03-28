var turf = require('turf');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var gdal = require("gdal");
var PythonShell = require('python-shell');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
    
    var parsed = req.body;
    var geogeom = JSON.stringify(parsed.featurecollection[1].feature.features[0].geometry);
    var polygon = gdal.open(geogeom)
    
    var rasterSource = "../data/nlcd2001lu/nlcd_2011_landcover_2011_edition_2014_10_10.img"
    
    //make sure we have a valid input
    var polygonDriver = polygon.driver;
    var polygonDriver_metadata = polygonDriver.getMetadata();
    if (polygonDriver_metadata['DCAP_VECTOR'] !== 'YES') {
        console.error('Source file is not a vector');
        return;
    }
    console.log('\nPolygon Driver: ' + polygonDriver.description);
    
    //var raster = gdal.open("input/test.tif");
    var raster = gdal.open(rasterSource);
    //console.log('\nCoordinate System of Raster is: ', raster.srs.toPrettyWKT());
    //make sure we have a raster
    var rasterDriver = raster.driver;
    var rasterDriver_metadata = rasterDriver.getMetadata();
    if (rasterDriver_metadata['DCAP_RASTER'] !== 'YES') {
        console.error('Source file is not a raster');
        return;
    }
    console.log('\nRaster driver: ' + rasterDriver.description);

    var layer = polygon.layers.get(0);
    var feature = layer.features.next();
    var geom = feature.getGeometry();
    var input = geom.transformTo(raster.srs);
    input = geom.toJSON();

    var options = {
    args: [input, rasterSource]
    };

    PythonShell.run('rasterStatsCategorical.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during executionmat result
        var data = results[0].replace(/'/g, '').replace(/[{}]/g, "");
        var count = data.split('count: ')[1].split(',')[0]
        var cats = data.split(',')
        for (i = 0; i < cats.length; i++) {
            var luCode = cats[i].split(':')
            console.log('NLCD 2011 land use category ' + luCode[0].trim() + ' is ' + (luCode[1]/count*100).toFixed(2) + ' percent')
        }
        
        res.json(results[0]);    // echo the result back
    });
});

module.exports = router;
