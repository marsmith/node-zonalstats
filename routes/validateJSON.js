var turf = require('turf');
var express = require('express');
var router = express.Router(); 

router.use('/', function(req, res, next) {   
    
    var features;
    
    //check for streamstats services formatted json
    if (req.body.workspaceID) {
        for (index in req.body.featurecollection) {
            if (req.body.featurecollection[index].name == 'globalwatershed') {
                features = req.body.featurecollection[index].feature;
            }
            
        }
    } 
    else features = req.body;

    //assume we now have geoJSON
    if (features.type == "FeatureCollection") {
        //make sure there is a polygon geometry by using turf.filter
        var filtered = turf.filter(features, 'geometry', 'polygon')
        console.log('filtered by turf')
        req.filtered = {}
        req.filtered  = filtered;
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