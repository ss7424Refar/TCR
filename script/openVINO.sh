command=""
path="cd /root/MTS/DBH/dbh_det/trainingSrv/"

if [[ $4 == "0" ]]; then
    command=$path" && python dbh_main.py --cmd=convert_IR --source=$1 --task_master_id=$2 --ckpt=$3 --type=detect"
elif [[ $4 == "1" ]]; then
    command=$path" && python dbh_main.py --cmd=convert_IR --source=$1 --task_master_id=$2 --ckpt=$3 --type=class"
else
    command=$path" && python dbh_main.py --cmd=convert_IR --source=$1 --task_master_id=$2 --ckpt=$3 --type=detect"
fi

echo $command
docker exec mira sh -c "$command"

# 压缩
command2="cd /root/MTS/DBH/dbh_det_train/bin/$2/$1 && tar -cjvf /tmp/openVINO-$3.bz2 $3"
docker exec mira sh -c "$command2"

# 下载
docker cp mira:/tmp/openVINO-$3.bz2 /tmp/openVINO-$3.bz2