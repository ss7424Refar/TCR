## 说明
> 调用训练脚本Training Command Remote, 使用nodejs-express编写的后端

## 注意事项
1. 打包之后的exe需要传入环境变量 `set NODE_ENV=production`


## 额外脚本
- 为了开发效率，暂定在容器中放入python/shell脚本，用docker直接调用它，
- 目录为`/opt/tcrpy`
- 所以要把脚本拷贝到容器中后，并赋予权限
- 容器外也需要拷贝一份目录`/opt/tcrpy`

1. 获取容器目录下所有的文件夹名称

## 启动
- 执行`./starter.sh` .