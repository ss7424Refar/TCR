#!/bin/bash

# 查询PID名为train的所有进程
pids=$(pgrep -f "train")

# 循环杀死每个进程
for pid in $pids
do
    kill $pid
done

if [ -f /tmp/train.log ]; then
    rm /tmp/train.log
fi
