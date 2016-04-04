import subprocess
import sys
import os
import ogr
import json
import fiona

#variables
inputGeom = json.loads(sys.argv[1])
regionID = sys.argv[2]
regionSource = sys.argv[3]
regionLayer = "regions_" + regionID
inputBasin = '../data/inputBasin.geojson'
inputClip = '../data/inputClip.geojson'

#get coordinate system of region layer
with fiona.open(regionSource, layer=regionLayer) as source:
    source_crs = source.crs

#convert input projected geometry string to a temp shapefile
schema = {'geometry': 'Polygon', 'properties': {'regionID' : 'str'}}
with fiona.open(inputBasin,'w',driver='GeoJSON', crs=source_crs,schema= schema) as output:
    prop = {'regionID': regionID}
    output.write({'geometry':inputGeom, 'properties': prop})
   
#get total area 
dataset = ogr.Open(inputBasin)
layer = dataset.GetLayer()

totalArea = ''
for feature in layer:
    geometry = feature.GetGeometryRef()
    area = geometry.GetArea()
    totalArea = area
    
try:
    os.remove(inputClip)
except OSError:
    pass

# Clipping process
subprocess.call(['ogr2ogr', '-f', 'GeoJSON', '-clipsrc', inputBasin, inputClip, regionSource, regionLayer])

#do area percent calculations
output = []
dataset = ogr.Open(inputClip)
layer = dataset.GetLayer()

for feature in layer:
    name = feature.GetField("Name")
    gridcode = feature.GetField("GRIDCODE")
    geometry = feature.GetGeometryRef()
    area = geometry.GetArea()
    output.append({"name":name,"code":gridcode,"percent":(area/totalArea)*100})
    
print json.dumps(output)