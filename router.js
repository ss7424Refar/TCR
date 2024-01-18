const express = require("express");
const router = express.Router();

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec, execSync } = require("child_process");

const dockerCommand = "docker exec mira ";
const dataSetPath = "/root/MTS/DBH/Dateset/";
const logPath = '/tmp/train.log';
const commandPath = "sh -c 'cd /root/MTS/DBH/dbh_det/trainingSrv/ && "

function getFolderNamesInDockerContainer(directory) {
  const command = dockerCommand + "python /opt/tcrpy/getListFolderName.py " + directory;
  console.log(command)
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing the command: ${error}`);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });

}

// 定义上传文件的存储方式
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir); // 指定文件存储的目录
  },
  filename: function (req, file, cb) {
    // 自动生成一个唯一的文件名，防止文件名冲突
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
      "-" +
      uniqueSuffix +
      "." +
      file.originalname.split(".").pop()
    ); // 指定文件的保存名称
  },
});

const upload = multer({ storage });

const config = require("./config/config");
const AdmZip = require("adm-zip");
const { stderr } = require("process");

// process.stdout.setEncoding("utf-8");

router.post("/upload", upload.single("file"), (req, res) => {
  // 处理上传的文件
  const file = req.file;

  // 解压到指定临时目录之后
  // 指定 ZIP 文件路径
  const zipFilePath = "./uploads/" + file.filename;

  // 创建一个新的 Zip 实例
  const zip = new AdmZip(zipFilePath);
  // 解压文件
  const myDate = Date.now();
  zip.extractAllTo(config.unzipPath + "/" + myDate, true);
  console.log(file.filename + " unzip success");

  // 通过命令docker cp拷贝
  // 替换命令中的占位符
  const uploadCommand = config.uploadCommand.replace("$UZIP_PATH", myDate);

  console.log("uploadCommand - " + uploadCommand);

  // 执行命令
  exec(uploadCommand, (error, stdout, stderr) => {
    if (error) {
      // 处理错误信息
      console.error(`error: ${error}`);
      return;
    }
  });

  // 返回响应
  res.send("ok");
});

router.get("/getList1", (req, res) => {
  getFolderNamesInDockerContainer(dataSetPath)
    .then((stdout) => {
      res.send(stdout);
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    });
});

router.get("/getList2", (req, res) => {
  const second = req.query.first;
  if ("undifined" === second) {
    second = "";
  }

  getFolderNamesInDockerContainer(dataSetPath + second)
  .then((stdout) => {
    res.send(stdout);
  })
  .catch((error) => {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  });

});

router.get('/showTraining', (req, res) => {
   // 检查logPath是否存在
   if (!fs.existsSync(logPath)) {
    res.status(200).send('no running job ...');
    return;
  }

  const stream = fs.createReadStream(logPath); // 创建可读流

  stream.on('data', (chunk) => {
    // 处理每个数据块
    res.write(chunk); // 将数据块写入响应中
  });

  stream.on('end', () => {
    res.end(); // 结束响应
  });

  stream.on('error', (error) => {
    console.error(error);
    res.status(500).end(); // 发生错误时返回500状态码
  });
});

router.get("/stopTrain", (req, res) => {
  command = "sh /opt/tcrpy/kill.sh"
  console.log("stopTrain command - " + command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      // 处理错误信息
      console.error(`error: ${error}`);
      res.send("ng");
      return;
    }
    res.send("ok");
  });
})

router.get("/clearTrain", (req, res) => {
  let first = req.query.first;
  let second = req.query.second;
  command = dockerCommand + "sh -c 'rm -r /root/MTS/DBH/dbh_det_train/train/" + first + "/" + second + "'"
  console.log("clearTrain command - " + command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      // 处理错误信息
      console.error(`error: ${error}`);
      res.send("ng");
      return;
    }
    res.send("ok");
  });
})

router.get("/checkTensor", (req, res) => {
  let first = req.query.first;
  let second = req.query.second;

  command = dockerCommand + "sh /opt/tcrpy/checkTensor.sh " + second + " " + first + " &"
  console.log("checkTensor command - " + command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      // 处理错误信息
      console.error(`error: ${error}`);
      // res.send("ng");
      return;
    }
  });
  res.send("ok");
})

router.get("/startTraining", (req, res) => {
  let first = req.query.first;
  let second = req.query.second;
  let gpu = req.query.gpu;
  let type = req.query.type;
  let steps = req.query.steps;

  let command = null;

  let logPath = "' > /tmp/train.log 2>&1 &"

  if (type == 0) {
    command = dockerCommand + commandPath + "python dbh_main.py --cmd=train --source=" + second + " --task_master_id=" + first + " --data_source=1 --gpu_index=" +
      gpu + " --type=detect --train_step=" + steps + logPath;
  } else if (type == 1) {
    command = dockerCommand + commandPath + "python dbh_main.py --cmd=train --source=" + second + " --task_master_id=" + first + " --data_source=0 --gpu_index=" +
      gpu + " --type=class --train_step=" + steps + logPath;
  } else if (type == 2) {
    command = dockerCommand + commandPath + "python dbh_main.py --cmd=train --source=" + second + " --task_master_id=" + first + " --data_source=0 --gpu_index=" +
      gpu + " --type=detect --train_step=" + steps + logPath;
  }

  console.log("startTrain command - " + command);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      // 处理错误信息
      console.error(`error: ${error}`);
      // res.send("ng");
      // return;
    }
    res.send("ok");
  });
});

router.get("/getCKPoints", (req, res) => {
  let first = req.query.first;
  let second = req.query.second;

  let command = null;
  command = dockerCommand + commandPath + "python dbh_main.py --cmd=list_ckpt --source=" + second + " --task_master_id=" + first + "'";

  console.log("export command - " + command);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      // 处理错误信息
      console.error(`error: ${error}`);
      res.send("ng");
      return;
    }
    res.send(stderr);
  });
});

router.get("/startExport", (req, res) => {
  let first = req.query.first;
  let second = req.query.second;
  let ck = req.query.ck;
  let type = req.query.type;

  // 这个脚本需要在docker外部执行
  let command = "sh /opt/tcrpy/exportCK.sh " + second + ' ' + first + ' ' + ck + ' ' + type;
  console.log("start export command - " + command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      // 处理错误信息
      console.error(`error: ${error}`);
      res.send("ng");
      return;
    }

    // 执行成功
    console.log("done");
    res.send("ok");
  });

});

router.get("/openVINO", (req, res) => {
  let first = req.query.first;
  let second = req.query.second;
  let ck = req.query.ck;
  let type = req.query.type;

  // 这个脚本需要在docker外部执行
  let command = "sh /opt/tcrpy/openVINO.sh " + second + ' ' + first + ' ' + ck + ' ' + type;
  console.log("start openVINO command - " + command);

  exec(command, (error, stdout, stderr) => {

    if (error) {
      // 处理错误信息
      console.error(`error: ${error}`);
      res.send("ng");
      return;
    }

    // 执行成功
    console.log("done");
    res.send("ok");
  });

});

router.get("/downloadExport", (req, res) => {
  const filePath = "/tmp/" + req.query.ck + '.bz2';
  console.log('downloading ...' + filePath)

  const fileName = `checkpoints-${Date.now()}.bz2`; // 生成随机时间戳作为文件名

  res.setHeader("Content-Type", "application/octet-stream"); // 告诉浏览器文件类型
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`); // 告诉浏览器下载文件名字
  const fileStream = fs.createReadStream(filePath); // 创建可读流
  fileStream.pipe(res); // 将可读流导向响应，即进行文件下载

});

router.get("/downloadOpen", (req, res) => {
  const filePath = "/tmp/openVINO-" + req.query.ck + '.bz2';
  console.log('downloading ...' + filePath)

  const fileName = `openvino-${Date.now()}.bz2`; // 生成随机时间戳作为文件名

  res.setHeader("Content-Type", "application/octet-stream"); // 告诉浏览器文件类型
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`); // 告诉浏览器下载文件名字
  const fileStream = fs.createReadStream(filePath); // 创建可读流
  fileStream.pipe(res); // 将可读流导向响应，即进行文件下载

});

























































module.exports = router;
