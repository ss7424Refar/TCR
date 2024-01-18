export NODE_ENV=production
chmod -R 757 script

mkdir -p /opt/tcrpy
cp -r script/* /opt/tcrpy

docker exec mira sh -c 'mkdir -p /opt/tcrpy'
docker cp script/. mira:/opt/tcrpy

./tcr


