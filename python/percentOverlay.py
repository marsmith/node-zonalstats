import subprocess

# The features used to clip the input features.
clipping_shp = "US_States_STATE_NAME__Oregon.shp"
# The feature class to be created.
output_shp = "output1.shp"  
# The features to be clipped.
input_shp = "broadcast_national_ALL.shp"

# Clipping process
subprocess.call(["ogr2ogr", "-f", "ESRI Shapefile", "-clipsrc", clipping_shp, output_shp, input_shp], shell=True)

#convert geoJSON string to shapefile


#loop over output shapefile to get areas


#send result back


#working command
 ogr2ogr -clipsrc GlobalWatershed.shp test1.shp SS_regionPolys.gdb regions_NY
