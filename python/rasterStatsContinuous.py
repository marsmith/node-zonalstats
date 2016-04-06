import sys
from rasterstats import zonal_stats

#run zonal stats
stats = zonal_stats(sys.argv[1], sys.argv[2], nodata=0, stats=['min', 'max', 'mean', 'median', 'majority', 'sum'])
print stats[0]