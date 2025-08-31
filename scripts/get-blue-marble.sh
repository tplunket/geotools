#!/usr/bin/env bash

# Download the Blue Marble images from NASA:
# https://visibleearth.nasa.gov/collection/1484/blue-marble

outputdir=/tmp/input
mkdir -p "$outputdir"
lftpscript=${outputdir}/lftp.script

baseimageurl=https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x21600x21600
baseimageurl=https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74167/world.200410.3x21600x21600
baseimageurl=https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73826/world.topo.bathy.200410.3x21600x21600

echo "set cmd:parallel 8" > $lftpscript
for name in {A,B,C,D}{1,2};
do
    echo "get -c $baseimageurl.$name.png" >> $lftpscript
done

pushd $outputdir > /dev/null
lftp -f $lftpscript
if [[ $? -eq 0 ]]
then
    rm $lftpscript
else
    echo "Failed to complete task, try 'lftp -f $(basename $lftpscript)' again manually in $(pwd)."
fi
popd > /dev/null
