var turf = require('turf');
var express = require('express');
var router = express.Router(); 

router.use('/', function(req, res, next) {   
    
    var filteredGeometry;
    
    //first check for streamstats services formatted json
    if (req.body.workspaceID) {
        for (index in req.body.featurecollection) {
            if (req.body.featurecollection[index].name == 'globalwatershed') {
                filteredGeometry= req.body.featurecollection[index].feature;
            }
            
        }
    } 
    //otherwise just pass body in
    else filteredGeometry = req.body;

    //assume we now have geoJSON, now get polygon feature
    if (filteredGeometry.type.toLowerCase() == "featurecollection") {
        
        for (index in filteredGeometry.features) {
            //just grab first polygon feauture
            if (filteredGeometry.features[index].geometry.type.toLowerCase() == "polygon") {
                filteredGeometry = filteredGeometry.features[index].geometry;
            }
        }
        
        req.filtered = {}
        req.filtered  = filteredGeometry;
        next();
    }
    else {
        var error = "No valid polygon geometry found";
        var err = new Error(error);
        err.status = 500;
        next(err);
        return; 
        
    }
});

module.exports = router;