browser="${BROWSER:-Chrome}"
name="Captionz_${browser}.zip"

rm -f ${name}

# mv everything to build folder
rm -rf build
mkdir -p build
cp -r src build/src
cp manifest-prod.json build/manifest.json
cd build

echo "pack to ${name}: "
zip -x '*.DS_Store*' -x '*.zip' -x '*.sh' -x '*readme_images/*' -x '*.git*' -x 'test/*' -x 'node_modules/*' -x "bower_components/*" -x "build.*" -r ${name} . 


cd .. 
mv build/${name} ./
echo "packed ${name}!"