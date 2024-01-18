command=""
path="cd /root/MTS/DBH/dbh_det/trainingSrv/"

if [[ $4 == "0" ]]; then
    command=$path" && python dbh_main.py --cmd=export_ckpt --source=$1 --task_master_id=$2 --ckpt=$3 --data_source=1 --type=detect"
elif [[ $4 == "1" ]]; then
    command=$path" && python dbh_main.py --cmd=export_ckpt --source=$1 --task_master_id=$2 --ckpt=$3 --data_source=0 --type=class"
else
    command=$path" && python dbh_main.py --cmd=export_ckpt --source=$1 --task_master_id=$2 --ckpt=$3 --data_source=0 --type=detect"
fi

echo $command
docker exec mira sh -c "$command"

# 压缩
command2="cd /root/MTS/DBH/dbh_det_train/output/$2/$1 && tar -cjvf /tmp/$3.bz2 $3"
docker exec mira sh -c "$command2"

# 下载
docker cp mira:/tmp/$3.bz2 /tmp/$3.bz2