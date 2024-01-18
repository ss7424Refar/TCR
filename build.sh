rm -r dist
export PKG_CACHE_PATH=/opt/node/pkg_cache_path
pkg . --out-path=dist/ --targets=linux
cp -r script dist
cp starter.sh dist

# scp -r dist root@192.168.100.162:/home/skr/
scp -r dist root@192.168.11.222:/home/mira-training/