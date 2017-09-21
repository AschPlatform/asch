#! /bin/bash
# bash ./test/multi-nodes/multiNodes.sh

pwd
a3=../asch-4097
a4=../asch-4098
a5=../asch-4099

/bin/cp ./test/multi-nodes/config-multi-nodes.json ./config.json
/bin/cp ./test/multi-nodes/index.js ./test/index.js

cp -r ../asch $a3
cp -r ../asch $a4
cp -r ../asch $a5

sed -i '2s/4096/4097/' $a3/config.json
sed -i '2s/4096/4098/' $a4/config.json
sed -i '2s/4096/4099/' $a5/config.json

sed -i '42,121d' ./config.json
sed -i '41s/,//' ./config.json

sed -i '21,41d'  $a3/config.json
sed -i '42,100d' $a3/config.json
sed -i '41s/,//' $a3/config.json

sed -i '21,62d' $a4/config.json
sed -i '42,79d' $a4/config.json
sed -i '41s/,//' $a4/config.json

sed -i '21,83d' $a5/config.json

for i in $(ls -d ../asch*)
do
  node $i/app.js --base $i --daemon
  sleep 3
done

sleep 10
ps aux | grep app.js

npm test
ps aux | grep app.js | grep -v grep | awk '{print $2}' | xargs kill
