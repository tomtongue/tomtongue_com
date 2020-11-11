---
id: 1_2-installing-hadoop
title: '1-2. Installing Apache Hadoop3'
sidebar_label: '1-2. Installing Apache Hadoop3'
---

:::caution
This document is still under construction. 
:::

## Overview 
We'll do following steps in this section:
1. Installing Java (OpenJDK, Java8)
2. Creating a group and adding user for running Hadoop
3. Configuration of environmental varaibles
4. Formatting disks for WorkerNode
5. `/etc/fstab` configuration for automatic-mount of `/dev/sdb1`
6. Creating the HDFS directory & Install Hadoop3


### 2-1. Installing Java (OpenJDK, Java8)

```
[ec2-user@ip-172-31-27-219 ~]$ sudo yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel
[ec2-user@ip-172-31-27-219 ~]$ java -version
openjdk version "1.8.0_265"
OpenJDK Runtime Environment (build 1.8.0_265-b01)
OpenJDK 64-Bit Server VM (build 25.265-b01, mixed mode)
[ec2-user@ip-172-31-27-219 ~]$ which java
/usr/bin/java

[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "sudo yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel"
```



### 2-2. Creating a group and adding user for running Hadoop
以下のように`hadoop` groupとそれに属するuserを作成する (誤って別のgroup作成してしまった場合は`sudo groupdel <wrong_user>`で削除)。なお全NodeでUIDとGIDを一致させる必要があるので注意する。

```
[ec2-user@ip-172-31-27-219 ~]$ sudo groupadd -g 5000 hadoop
[ec2-user@ip-172-31-27-219 ~]$ sudo useradd -g hadoop -u 5000 tomtan
[ec2-user@ip-172-31-27-219 ~]$ sudo useradd -g hadoop -u 6001 yarn
[ec2-user@ip-172-31-27-219 ~]$ sudo useradd -g hadoop -u 6002 hdfs
[ec2-user@ip-172-31-27-219 ~]$ sudo useradd -g hadoop -u 6003 mapred

[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "sudo groupadd -g 5000 hadoop"
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "sudo useradd -g hadoop -u 5000 tomtan"
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "sudo useradd -g hadoop -u 6001 yarn"
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "sudo useradd -g hadoop -u 6002 hdfs"
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "sudo useradd -g hadoop -u 6003 mapred"
```

この後以下のようなdirectoryが作成される。

```
[ec2-user@ip-172-31-27-219 home]$ ls -a
.  ..  ec2-user  hdfs  mapred  tomtan  yarn
```

`tomtan` userに対しては以下のpassword; `hadoop1234`を設定した。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g all "echo 'hadoop1234' | sudo passwd tomtan --stdin"
ip-172-31-29-73.ec2.internal: Changing password for user tomtan.
ip-172-31-29-73.ec2.internal: passwd: all authentication tokens updated successfully.
ip-172-31-17-244.ec2.internal: Changing password for user tomtan.
ip-172-31-17-244.ec2.internal: passwd: all authentication tokens updated successfully.
ip-172-31-16-27.ec2.internal: Changing password for user tomtan.
ip-172-31-16-27.ec2.internal: passwd: all authentication tokens updated successfully.
```

### 2-3. Configuration of environmental varaibles
Add the following configuration to `.bash_profile` on the ClientNode:

```
[ec2-user@ip-172-31-27-219 ~]$ cat .bash_profile
# .bash_profile

# Get the aliases and functions
if [ -f ~/.bashrc ]; then
	. ~/.bashrc
fi

# User specific environment and startup programs

PATH=$PATH:$HOME/.local/bin:$HOME/bin

export PATH

# == Adding the following part ==
# export http_proxy=http://<proxy_url>:8080
# export https_proxy=https://<proxy_url>:8080
export LANG=en_US.utf8
export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.265.b01-1.amzn2.0.1.x86_64/jre
export HADOOP_HOME=/opt/hadoop-3.2.1 # Followed the hadoop version of emr-6.1.0
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export HADOOP_YARN_HOME=$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export HADOOP_OPTS="-Djava.library.path=$HADOOP_COMMON_LIB_NATIVE_DIR"
export JAVA_LIBRARY_PATH=$HADOOP_HOME/lib/native:$JAVA_LIBRARY_PATH
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$HADOOP_HOME/lib/native
export PATH=$HADOOP_HOME/sbin:$HADOOP_HOME/bin:$PATH
```

Please note that the `JAVA_HOME` in the above configuration is based on the following path:

```
[ec2-user@ip-172-31-27-219 ~]$ which java
/usr/bin/java

[ec2-user@ip-172-31-27-219 ~]$ ls -l /usr/bin/java
lrwxrwxrwx 1 root root 22 Oct 31 23:01 /usr/bin/java -> /etc/alternatives/java

[ec2-user@ip-172-31-27-219 ~]$ ls -l /etc/alternatives/java
lrwxrwxrwx 1 root root 77 Oct 31 23:01 /etc/alternatives/java -> /usr/lib/jvm/java-1.8.0-openjdk-1.8.0.265.b01-1.amzn2.0.1.x86_64/jre/bin/java
```

上記で作成した`.bash_profile`を全Nodeにcopyし、かつ、`tomtan/`配下にも配置する。最後に正しく反映されているか確認している。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -c .bash_profile --dest=/home/ec2-user
[ec2-user@ip-172-31-27-219 ~]$ clush -g all "sudo cp /home/ec2-user/.bash_profile /home/tomtan"

[ec2-user@ip-172-31-27-219 ~]$ clush -g all "sudo cat /home/tomtan/.bash_profile | tail -2"
ip-172-31-16-27.ec2.internal: export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$HADOOP_HOME/lib/native
ip-172-31-16-27.ec2.internal: export PATH=$HADOOP_HOME/sbin:$HADOOP_HOME/bin:$PATH
ip-172-31-29-73.ec2.internal: export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$HADOOP_HOME/lib/native
ip-172-31-29-73.ec2.internal: export PATH=$HADOOP_HOME/sbin:$HADOOP_HOME/bin:$PATH
ip-172-31-17-244.ec2.internal: export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$HADOOP_HOME/lib/native
ip-172-31-17-244.ec2.internal: export PATH=$HADOOP_HOME/sbin:$HADOOP_HOME/bin:$PATH
```

ファイルの権限関連を確認する。必要に応じて`chown tomtan:hadoop ...`を実行する (今回は以下のように設定されており問題ない)。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g all "sudo ls -l /home/tomtan/.bash_profile"
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1 tomtan hadoop 1024 Nov  2 02:04 /home/tomtan/.bash_profile
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1 tomtan hadoop 1024 Nov  2 02:04 /home/tomtan/.bash_profile
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1 tomtan hadoop 1024 Nov  2 02:04 /home/tomtan/.bash_profile
```

これで環境設定は完了。

### 2-4. Formatting disks for WorkerNode


EBSの場合は以下の通り、Partition Tableが未設定の状態で表示される。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L 'sudo  parted /dev/sdb p'
ip-172-31-17-244.ec2.internal: Error: /dev/nvme1n1: unrecognised disk label
ip-172-31-17-244.ec2.internal: Model: NVMe Device (nvme)
ip-172-31-17-244.ec2.internal: Disk /dev/nvme1n1: 34.4GB
ip-172-31-17-244.ec2.internal: Sector size (logical/physical): 512B/512B
ip-172-31-17-244.ec2.internal: Partition Table: unknown
ip-172-31-17-244.ec2.internal: Disk Flags:
ip-172-31-17-244.ec2.internal:
ip-172-31-29-73.ec2.internal: Error: /dev/nvme1n1: unrecognised disk label
ip-172-31-29-73.ec2.internal: Model: NVMe Device (nvme)
ip-172-31-29-73.ec2.internal: Disk /dev/nvme1n1: 34.4GB
ip-172-31-29-73.ec2.internal: Sector size (logical/physical): 512B/512B
ip-172-31-29-73.ec2.internal: Partition Table: unknown
ip-172-31-29-73.ec2.internal: Disk Flags:
ip-172-31-29-73.ec2.internal:
```

WorkerNodeに対し、Partition tableとしてGPT partition labelを作成する。その後XFS用のPrimary partitionを作成する。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L 'sudo parted -s /dev/sdb mklabel gpt'
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L 'sudo parted -s /dev/sdb -- mkpart primary xfs 1 -1'

[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L 'sudo  parted /dev/sdb p' // confirm the creation of the partition
ip-172-31-17-244.ec2.internal: Model: NVMe Device (nvme)
ip-172-31-17-244.ec2.internal: Disk /dev/nvme1n1: 34.4GB
ip-172-31-17-244.ec2.internal: Sector size (logical/physical): 512B/512B
ip-172-31-17-244.ec2.internal: Partition Table: gpt
ip-172-31-17-244.ec2.internal: Disk Flags:
ip-172-31-17-244.ec2.internal:
ip-172-31-17-244.ec2.internal: Number  Start   End     Size    File system  Name     Flags
ip-172-31-17-244.ec2.internal:  1      1049kB  34.4GB  34.4GB               primary
ip-172-31-17-244.ec2.internal:
ip-172-31-29-73.ec2.internal: Model: NVMe Device (nvme)
ip-172-31-29-73.ec2.internal: Disk /dev/nvme1n1: 34.4GB
ip-172-31-29-73.ec2.internal: Sector size (logical/physical): 512B/512B
ip-172-31-29-73.ec2.internal: Partition Table: gpt
ip-172-31-29-73.ec2.internal: Disk Flags:
ip-172-31-29-73.ec2.internal:
ip-172-31-29-73.ec2.internal: Number  Start   End     Size    File system  Name     Flags
ip-172-31-29-73.ec2.internal:  1      1049kB  34.4GB  34.4GB               primary
ip-172-31-29-73.ec2.internal:
```

WorkerNodeの`/dev/sdb`に作成したpartition; `/dev/sdb1`をXFSでformatする。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L 'sudo mkfs -t xfs -f -i size=512 /dev/sdb1'
ip-172-31-17-244.ec2.internal: meta-data=/dev/sdb1              isize=512    agcount=4, agsize=2097024 blks
ip-172-31-17-244.ec2.internal:          =                       sectsz=512   attr=2, projid32bit=1
ip-172-31-17-244.ec2.internal:          =                       crc=1        finobt=1, sparse=0
ip-172-31-17-244.ec2.internal: data     =                       bsize=4096   blocks=8388096, imaxpct=25
ip-172-31-17-244.ec2.internal:          =                       sunit=0      swidth=0 blks
ip-172-31-17-244.ec2.internal: naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
ip-172-31-17-244.ec2.internal: log      =internal log           bsize=4096   blocks=4095, version=2
ip-172-31-17-244.ec2.internal:          =                       sectsz=512   sunit=0 blks, lazy-count=1
ip-172-31-17-244.ec2.internal: realtime =none                   extsz=4096   blocks=0, rtextents=0
ip-172-31-29-73.ec2.internal: meta-data=/dev/sdb1              isize=512    agcount=4, agsize=2097024 blks
ip-172-31-29-73.ec2.internal:          =                       sectsz=512   attr=2, projid32bit=1
ip-172-31-29-73.ec2.internal:          =                       crc=1        finobt=1, sparse=0
ip-172-31-29-73.ec2.internal: data     =                       bsize=4096   blocks=8388096, imaxpct=25
ip-172-31-29-73.ec2.internal:          =                       sunit=0      swidth=0 blks
ip-172-31-29-73.ec2.internal: naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
ip-172-31-29-73.ec2.internal: log      =internal log           bsize=4096   blocks=4095, version=2
ip-172-31-29-73.ec2.internal:          =                       sectsz=512   sunit=0 blks, lazy-count=1
ip-172-31-29-73.ec2.internal: realtime =none                   extsz=4096   blocks=0, rtextents=0

[ec2-user@ip-172-31-27-219 ~]$ clush -g dn 'sudo  parted /dev/sdb p' // Confirm formatting with xfs
ip-172-31-17-244.ec2.internal: Model: NVMe Device (nvme)
ip-172-31-17-244.ec2.internal: Disk /dev/nvme1n1: 34.4GB
ip-172-31-17-244.ec2.internal: Sector size (logical/physical): 512B/512B
ip-172-31-17-244.ec2.internal: Partition Table: gpt
ip-172-31-17-244.ec2.internal: Disk Flags:
ip-172-31-17-244.ec2.internal:
ip-172-31-17-244.ec2.internal: Number  Start   End     Size    File system  Name     Flags
ip-172-31-17-244.ec2.internal:  1      1049kB  34.4GB  34.4GB  xfs          primary
ip-172-31-17-244.ec2.internal:
ip-172-31-29-73.ec2.internal: Model: NVMe Device (nvme)
ip-172-31-29-73.ec2.internal: Disk /dev/nvme1n1: 34.4GB
ip-172-31-29-73.ec2.internal: Sector size (logical/physical): 512B/512B
ip-172-31-29-73.ec2.internal: Partition Table: gpt
ip-172-31-29-73.ec2.internal: Disk Flags:
ip-172-31-29-73.ec2.internal:
ip-172-31-29-73.ec2.internal: Number  Start   End     Size    File system  Name     Flags
ip-172-31-29-73.ec2.internal:  1      1049kB  34.4GB  34.4GB  xfs          primary
ip-172-31-29-73.ec2.internal:
```

### 2-5. `/etc/fstab` configuration for automatic-mount of `/dev/sdb1`
WorkerNodeのOS起動時に`/dev/sdb1`が自動的に`/data`にmountされるよう`/etc/fstab`ファイルを記述する (`sudo`で書き込んでいるが、`hdfs` owner/`hadoop` groupに権限を変更する)。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L "sudo mkdir /data"
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L "echo '/dev/sdb1 /data xfs defaults 0 0' | sudo tee -a /etc/fstab"
ip-172-31-17-244.ec2.internal: /dev/sdb1 /data xfs defaults 0 0
ip-172-31-29-73.ec2.internal: /dev/sdb1 /data xfs defaults 0 0
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L "grep /dev/sdb /etc/fstab"
ip-172-31-17-244.ec2.internal: /dev/sdb1 /data xfs defaults 0 0
ip-172-31-29-73.ec2.internal: /dev/sdb1 /data xfs defaults 0 0
```

WorkerNodeの`/data`をmountする。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn "sudo mount /data"
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L "df -HT | grep /data"
ip-172-31-17-244.ec2.internal: /dev/nvme1n1p1 xfs        35G   69M   35G   1% /data
ip-172-31-29-73.ec2.internal: /dev/nvme1n1p1 xfs        35G   69M   35G   1% /data
```

これでWorkerNodeを再起動し、`/data`が自動でmountされているか確認する。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L "sudo reboot"
[ec2-user@ip-172-31-27-219 ~]$ clush -g dn -L "df -HT | grep /data"
ip-172-31-17-244.ec2.internal: /dev/nvme1n1p1 xfs        35G   69M   35G   1% /data
ip-172-31-29-73.ec2.internal: /dev/nvme1n1p1 xfs        35G   69M   35G   1% /data
```

### 2-6. Creating the HDFS directory & Install Hadoop3
Master/WorkerNodeに`/data/hadoop/hdfs` dirを作成し、ownerを`hdfs`, groupを`hadoop`に変更し、`775`に権限を変更する。


```
[ec2-user@ip-172-31-27-219 ~]$ clush -g nn,dn "sudo mkdir -p /data/hadoop/hdfs"
[ec2-user@ip-172-31-27-219 ~]$ clush -g nn,dn "sudo chown hdfs:hadoop /data/hadoop/hdfs"
[ec2-user@ip-172-31-27-219 ~]$ clush -g nn,dn "sudo chmod 775 /data/hadoop/hdfs"

[ec2-user@ip-172-31-27-219 ~]$ clush -g nn,dn -L "ls -ld /data/hadoop/hdfs"
ip-172-31-16-27.ec2.internal: drwxrwxr-x 2 hdfs hadoop 6 Nov 10 22:41 /data/hadoop/hdfs
ip-172-31-17-244.ec2.internal: drwxrwxr-x 2 hdfs hadoop 6 Nov 10 22:41 /data/hadoop/hdfs
ip-172-31-29-73.ec2.internal: drwxrwxr-x 2 hdfs hadoop 6 Nov 10 22:41 /data/hadoop/hdfs
```

Download the tar fille of Hadoop3 from https://archive.apache.org/dist/hadoop/core/hadoop-3.2.1/. Note that you need to unarchive the tarball at `/opt` to follow `HADOOP_HOME=/opt/hadoop-3.2.1` configuration which was specified before.

```
[ec2-user@ip-172-31-27-219 ~]$ pwd
/home/ec2-user
[ec2-user@ip-172-31-27-219 ~]$ wget https://archive.apache.org/dist/hadoop/core/hadoop-3.2.1/hadoop-3.2.1.tar.gz
--2020-11-10 22:52:17--  https://archive.apache.org/dist/hadoop/core/hadoop-3.2.1/hadoop-3.2.1.tar.gz
Resolving archive.apache.org (archive.apache.org)... 138.201.131.134, 2a01:4f8:172:2ec5::2
...// It depends on, but downloading takes around 10 mins.

[ec2-user@ip-172-31-27-219 ~]$ clush -g all -c ./hadoop-3.2.1.tar.gz --dest=~

[ec2-user@ip-172-31-27-219 ~]$ sudo tar xzf hadoop-3.2.1.tar.gz -C /opt/
[ec2-user@ip-172-31-27-219 ~]$ clush -g all "sudo tar xzf /home/ec2-user/hadoop-3.2.1.tar.gz -C /opt/"
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "ls -a /opt/ | grep hadoop"
ip-172-31-16-27.ec2.internal: hadoop-3.2.1
ip-172-31-17-244.ec2.internal: hadoop-3.2.1
ip-172-31-29-73.ec2.internal: hadoop-3.2.1
```
