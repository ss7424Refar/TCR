import os
import sys
import json

def get_directories_in_directory(directory):
    directories = []
    for filename in os.listdir(directory):
        if os.path.isdir(os.path.join(directory, filename)):
            directories.append(filename)
    return directories

if __name__ == '__main__':
    directory_path = sys.argv[1]  # 获取命令行传入的第二个参数，即目录路径
    directories_list = get_directories_in_directory(directory_path)
    print(json.dumps(directories_list))
