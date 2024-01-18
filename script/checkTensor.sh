#!/bin/bash

# 查询PID名为tensorboard的所有进程
pids=$(pgrep -f "tensorboard")

# 循环杀死每个进程
for pid in $pids
do
    kill $pid
done

# 开启 first second
tensorboard --logdir=/root/MTS/DBH/dbh_det_train/train/$2/$1 > /dev/null