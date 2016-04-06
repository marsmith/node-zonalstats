var express = require('express');
var router = express.Router();
var gdal = require("gdal");
var validateJSON = require('./validateJSON')

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
    var regionSource = "input/SS_regionPolys.gdb"
    
    //make sure we have a valid input
    var polygonDriver = polygon.driver;
    console.log('\nPolygon Driver: ' + polygonDriver.description);
    
    var region = gdal.open(regionSource);
    console.log("WorkspaceID: ", req.body.workspaceID)
    
    var output = [];
    
    region.layers.forEach(function(layer, i) {
        var regionID = req.body.workspaceID.substring(0,2);
        if (layer.name.split('_')[1] == regionID) {

            var regionDriver = region.driver;
            var polygonDriver_metadata = polygonDriver.getMetadata();
            console.log('\nregion driver: ' + regionDriver.description);
            
            var regionLayer = layer;

            regionLayer.features.forEach(function(regionFeature, i) { 
                var regionGeom = regionFeature.getGeometry();
                name = regionFeature.fields.get("Name")
                gridcode = regionFeature.fields.get("GRIDCODE")
                
                var inputLayer = polygon.layers.get(0);
                inputLayer.features.forEach(function(inputFeature, i) {
                    var inputGeom = inputFeature.getGeometry();
                    
                    //project input geometry
                    inputGeom.transformTo(regionLayer.srs);
                    
                    if (inputGeom.intersects(regionGeom)) {
                        console.log('Found an intersection: ', name)
                        
                        var intersection = inputGeom.intersection(regionGeom)
                        var intersectArea = intersection.getArea();
                        var totalArea = inputGeom.getArea();
                        console.log('[intersectArea,totalArea]: ', intersectArea,totalArea)
                        output.push({"name":name,"code":gridcode,"percent":(intersectArea/totalArea)*100})
                    }
                })
            });
        }
    })
    
    //send output
    res.json(output)    
});

module.exports = router;