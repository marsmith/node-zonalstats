var turf = require('turf');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var gdal = require("gdal");
var PythonShell = require('python-shell');
var validateJSON = require('./validateJSON')
var router = express.Router();

router.post('/', validateJSON, function(req, res, next) {
    
    //first make sure we have a workspaceID
    if (!req.body.workspaceID) {
        var error = "No worksaceID found";
        var err = new Error(error);
        err.status = 500;
        next(err);
        return; 
    }
    
    //filtered is already verified by using express bodyParser
    var polygon = gdal.open(JSON.stringify(req.filtered))
    var regionSource = "../data/SS_regionPolys.gdb"
    
    //make sure we have a valid input
    var polygonDriver = polygon.driver;
    var polygonDriver_metadata = polygonDriver.getMetadata();
    if (polygonDriver_metadata['DCAP_VECTOR'] !== 'YES') {
        console.error('Source file is not a vector');
        return;
    }
    console.log('\nPolygon Driver: ' + polygonDriver.description);
    
    var region = gdal.open(regionSource);
    console.log("WorkspaceID: ", req.body.workspaceID)
    
    region.layers.forEach(function(layer, i) {
        var regionID = req.body.workspaceID.substring(0,2);
        if (layer.name.split('_')[1] == regionID) {
                
            var regionLayer = layer;
                
            //console.log('\nCoordinate System of region is: ', layer.srs.toPrettyWKT());
            //make sure we have a region
            var regionDriver = region.driver;

            console.log('\nregion driver: ' + regionDriver.description);
            
            var layer = polygon.layers.get(0);
            var feature = layer.features.next();
            var geom = feature.getGeometry();
            var input = geom.transformTo(regionLayer.srs);
            input = geom.toJSON();
            //console.log('projected input geom: ',input);
        
            //var regionLayerFeature = regionLayer.features.next();
            //var regionLayerGeom = regionLayerFeature.getGeometry();
            //var wgs84 = gdal.SpatialReference.fromEPSG(4326);
            //regionLayerGeom.transformTo(wgs84);
            //console.log(regionLayerGeom.toJSON())
            //regionLayerGeom = regionLayerGeom.toJSON();
            
            //var intersection = geom.intersection(regionLayerGeom)           
            //var intersection = turf.intersect(geom.toJSON(),regionLayerGeom.toJSON());
            
            //var result = intersection.toJSON();
            //console.log(JSON.stringify(result));
            
            var options = {
            args: [input, regionID, regionSource]
            };

            PythonShell.run('python/percentOverlay.py', options, function (err, results) {

                if (err) {
                    console.log(JSON.stringify(err.stack))
                    res.send(err.stack)

                }
                
                console.log('results: ',results)
                res.json(results)

            });
        }
    })
         

});

module.exports = router;
