---
id: 1_1-setup-hadoop-environment
title: '1-1. Setup Hadoop Environment'
sidebar_label: '1-1. Setup Hadoop Environment'
---

:::caution
This document is still under construction. 
:::

## Condition
*Note that [Apache Hadoop 3.2.1](https://hadoop.apache.org/release/3.2.1.html) is used, which followed the Hadoop version of [emr-6.1.0](https://docs.aws.amazon.com/emr/latest/ReleaseGuide/emr-release-6x.html#emr-610-release)*

In this section, we skipped the following configuration:
* BIOS
* RAID controller
* OS/Filesytem (partially updated, described later)

Before starting building a hadoop cluster, we need to launch an instance (we also skipped the specific steps to run the instance). Please note that you need an additional storage as follows. This storage is going to be used for "data storage".

[image]

## Overview 
We'll do following steps in this section:
1. Configuration on ClientNode
2. Installing `clush` command
3. OS related configuration (for ALL nodes)

Here's the configuration of the EC2 instance just after launching.

```
[ec2-user@ip-172-31-27-219 ~]$ lsblk
NAME          MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
nvme1n1       259:0    0  32G  0 disk
nvme0n1       259:1    0   8G  0 disk
|-nvme0n1p1   259:2    0   8G  0 part /
`-nvme0n1p128 259:3    0   1M  0 part

[ec2-user@ip-172-31-27-219 ~]$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9001 qdisc mq state UP group default qlen 1000
    link/ether 0a:b4:22:73:df:7f brd ff:ff:ff:ff:ff:ff
    inet 172.31.27.219/20 brd 172.31.31.255 scope global dynamic eth0
       valid_lft 2802sec preferred_lft 2802sec
    inet6 fe80::8b4:22ff:fe73:df7f/64 scope link
       valid_lft forever preferred_lft forever
```

## 1. Configuration on ClientNode
In this section, we'll create the 1 + 3nodes-cluster which consists of:
* ClientNode * 1
* MasterNode * 1
* WorkerNode * 2

And, we're using hostnames of each node assigned by AmazonProvidedDNS.

[GitHub - cea-hpc/clustershell: Scalable cluster administration Python framework — Manage node sets, node groups and execute commands on cluster nodes in parallel.](https://github.com/cea-hpc/clustershell)

```
[ec2-user@ip-172-31-27-219 ~]$ sudo amazon-linux-extras install epel -y // epel-release is available in Amazon Linux Extra topic "epel"
[ec2-user@ip-172-31-27-219 ~]$ sudo yum install -y  clustershell
[ec2-user@ip-172-31-27-219 ~]$ clush --version
clush 1.8.3
```

## 2. Installing `clush` command
以下の内容で`/etc/clustershell/groups`を設定する (今回は簡略化のためにデータ用NWと管理用NWに同じものを利用している。本来は分けた方が良い)。

```
[ec2-user@ip-172-31-27-219 ~]$ cat /etc/clustershell/groups
all: ip-172-31-16-27.ec2.internal,ip-172-31-29-73.ec2.internal,ip-172-31-17-244.ec2.internal
cl: ip-172-31-27-219.ec2.internal
nn: ip-172-31-16-27.ec2.internal
dn: ip-172-31-29-73.ec2.internal,ip-172-31-17-244.ec2.internal
```

(e.g) ClientNodeのhostname:

```
[ec2-user@ip-172-31-27-219 etc]$ cat /etc/hostname
ip-172-31-27-219.ec2.internal
```

各Nodeのhostname:
* ClientNode: `ip-172-31-27-219.ec2.internal`
* MasterNode: `ip-172-31-16-27.ec2.internal`
* WorkerNode * 2:
   * 1: `ip-172-31-29-73.ec2.internal`
   * 2: `ip-172-31-17-244.ec2.internal`

`clush`経由で他のNodeにログインできることを確認する (なおClientNodeにSSH経由でログインする際に`-A` optionを忘れないようにする)。`-A`をつけた場合でも`Host key verification failed.`で`clush`コマンドの実行に失敗したら[Failed to access with `clush` with the error: `Host key verification failed.`](#failed-to-access-with-clush-with-the-error-host-key-verification-failed)を参照

```
➜  .ssh ssh -i use1-multi.pem -A ec2-user@xxx.xxx.xxx.xxx
Last login: Mon Oct 26 01:47:06 2020 from ...

       __|  __|_  )
       _|  (     /   Amazon Linux 2 AMI
      ___|\___|___|

https://aws.amazon.com/amazon-linux-2/
No packages needed for security; 2 packages available
Run "sudo yum update" to apply all updates.
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L hostname
ip-172-31-16-27.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-29-73.ec2.internal
```

## 3. OS related configuration (for ALL nodes)
上記ログインを確認した後に、以下のパラメータを設定する (今回は全Node同じ設定としている)
* [`vm.swappiness`](https://ja.wikipedia.org/wiki/Swappiness) (disabled by default)
* [FD](https://wa3.i-3-i.info/word14383.html)のsoftlimit, hardlimit
* [Transparent Hugepages](https://lwn.net/Articles/423584/)の無効化

以下Default (変更前)の設定

```
[ec2-user@ip-172-31-27-219 ~]$ cat /proc/sys/vm/swappiness
60
[ec2-user@ip-172-31-27-219 ~]$ ulimit -Sn
1024
[ec2-user@ip-172-31-27-219 ~]$ ulimit -Hn
4096
```

Following configuration are skipped:
* Firewall
* SELinux
* Time-sync -> DefaultのAmazon Time Sync Serviceを利用している (ref: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/set-time.html)

それぞれ以下のように変更する。

### `vm.swappiness` & FD
ClientNodeで以下の作業を行う。

```
[ec2-user@ip-172-31-27-219 ~]$ echo vm.swappiness=1 | sudo tee -a /etc/sysctl.conf
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L 'echo vm.swappiness=1 | sudo tee -a /etc/sysctl.conf'
ip-172-31-16-27.ec2.internal: vm.swappiness=1
ip-172-31-17-244.ec2.internal: vm.swappiness=1
ip-172-31-29-73.ec2.internal: vm.swappiness=1

[ec2-user@ip-172-31-27-219 ~]$ echo -e '* soft nproc 65536\n* hard nproc 65536' | sudo tee -a /etc/security/limits.d/90-nproc.conf
* soft nproc 65536
* hard nproc 65536
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "echo -e '* soft nproc 65536\n* hard nproc 65536' | sudo tee -a /etc/security/limits.d/90-nproc.conf"
ip-172-31-16-27.ec2.internal: * soft nproc 65536
ip-172-31-16-27.ec2.internal: * hard nproc 65536
ip-172-31-17-244.ec2.internal: * soft nproc 65536
ip-172-31-17-244.ec2.internal: * hard nproc 65536
ip-172-31-29-73.ec2.internal: * soft nproc 65536
ip-172-31-29-73.ec2.internal: * hard nproc 65536

[ec2-user@ip-172-31-27-219 ~]$ echo -e '* soft nofile 65536\n* hard nofile 65536' | sudo tee -a /etc/security/limits.d/91-nofile.conf
* soft nofile 65536
* hard nofile 65536
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "echo -e '* soft nofile 65536\n* hard nofile 65536' | sudo tee -a /etc/security/limits.d/91-nofile.conf"
ip-172-31-16-27.ec2.internal: * soft nofile 65536
ip-172-31-16-27.ec2.internal: * hard nofile 65536
ip-172-31-17-244.ec2.internal: * soft nofile 65536
ip-172-31-17-244.ec2.internal: * hard nofile 65536
ip-172-31-29-73.ec2.internal: * soft nofile 65536
ip-172-31-29-73.ec2.internal: * hard nofile 65536
```

### Transparent Hugepages (THP)
以下のCloudera関連の資料にもあるが、Hadoopを利用する際はTHPの無効化が推奨されている。
* https://community.cloudera.com/t5/Community-Articles/OS-Configurations-for-Better-Hadoop-Performance/ta-p/247300
* https://docs.cloudera.com/cloudera-manager/7.2.1/managing-clusters/topics/cm-disabling-transparent-hugepages.html
> However THP feature is known to perform poorly in Hadoop cluster and results in excessively high CPU utilization.


以下がDefaultの値。

```
[ec2-user@ip-172-31-27-219 ~]$ cat /sys/kernel/mm/transparent_hugepage/defrag
always defer defer+madvise [madvise] never
[ec2-user@ip-172-31-27-219 ~]$ cat /sys/kernel/mm/transparent_hugepage/enabled
always [madvise] never
```

Set `never` for both parameters:

```
[ec2-user@ip-172-31-27-219 rc.d]$ echo 'echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/defrag' | sudo tee -a /etc/rc.d/rc.local
echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/defrag
[ec2-user@ip-172-31-27-219 rc.d]$ echo 'echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/enabled' | sudo tee -a /etc/rc.d/rc.local
echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/enabled

[ec2-user@ip-172-31-27-219 rc.d]$ cat /etc/rc.d/rc.local | tail -2
echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/defrag
echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/enabled

[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "echo 'echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/defrag' | sudo tee -a /etc/rc.d/rc.local"
ip-172-31-16-27.ec2.internal: echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/defrag
ip-172-31-17-244.ec2.internal: echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/defrag
ip-172-31-29-73.ec2.internal: echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/defrag
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "echo 'echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/enabled' | sudo tee -a /etc/rc.d/rc.local"
ip-172-31-16-27.ec2.internal: echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/enabled
ip-172-31-17-244.ec2.internal: echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/enabled
ip-172-31-29-73.ec2.internal: echo never | sudo tee -a /sys/kernel/mm/transparent_hugepage/enabled

[ec2-user@ip-172-31-27-219 ~]$ sudo chmod 755 /etc/rc.d/rc.local
[ec2-user@ip-172-31-27-219 ~]$ ls -l /etc/rc.d/rc.local
-rwxr-xr-x 1 root root 610 Oct 31 22:08 /etc/rc.d/rc.local

[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "sudo chmod 755 /etc/rc.d/rc.local"
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /etc/rc.d/rc.local"
ip-172-31-16-27.ec2.internal: -rwxr-xr-x 1 root root 610 Oct 31 22:10 /etc/rc.d/rc.local
ip-172-31-17-244.ec2.internal: -rwxr-xr-x 1 root root 610 Oct 31 22:10 /etc/rc.d/rc.local
ip-172-31-29-73.ec2.internal: -rwxr-xr-x 1 root root 610 Oct 31 22:10 /etc/rc.d/rc.local
```

### Checking the configuration
上記設定が完了したらrebootする。

```
[ec2-user@ip-172-31-27-219 ~]$ clush -g all "sudo reboot"
ip-172-31-16-27.ec2.internal: Connection to ip-172-31-16-27.ec2.internal closed by remote host.
clush: ip-172-31-16-27.ec2.internal: exited with exit code 255
ip-172-31-17-244.ec2.internal: Connection to ip-172-31-17-244.ec2.internal closed by remote host.
clush: ip-172-31-17-244.ec2.internal: exited with exit code 255
ip-172-31-29-73.ec2.internal: Connection to ip-172-31-29-73.ec2.internal closed by remote host.
clush: ip-172-31-29-73.ec2.internal: exited with exit code 255
[ec2-user@ip-172-31-27-219 ~]$ sudo reboot
Connection to 35.168.169.209 closed by remote host.
Connection to 35.168.169.209 closed.
```

設定をそれぞれ確認する (以下の通り全て反映されていることを確認)。

```
[ec2-user@ip-172-31-27-219 ~]$ cat /proc/sys/vm/swappiness
1
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "cat /proc/sys/vm/swappiness"
ip-172-31-16-27.ec2.internal: 1
ip-172-31-17-244.ec2.internal: 1
ip-172-31-29-73.ec2.internal: 1


[ec2-user@ip-172-31-27-219 ~]$ echo nproc_Su: $(ulimit -Su), nproc_Hu: $(ulimit -Hu), nofile_Su: $(ulimit -Sn), nofile_Hu: $(ulimit -Hn)
nproc_Su: 65536, nproc_Hu: 65536, nofile_Su: 65536, nofile_Hu: 65536
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L "echo nproc_Su: $(ulimit -Su), nproc_Hu: $(ulimit -Hu), nofile_Su: $(ulimit -Sn), nofile_Hu: $(ulimit -Hn)"
ip-172-31-16-27.ec2.internal: nproc_Su: 65536, nproc_Hu: 65536, nofile_Su: 65536, nofile_Hu: 65536
ip-172-31-17-244.ec2.internal: nproc_Su: 65536, nproc_Hu: 65536, nofile_Su: 65536, nofile_Hu: 65536
ip-172-31-29-73.ec2.internal: nproc_Su: 65536, nproc_Hu: 65536, nofile_Su: 65536, nofile_Hu: 65536


[ec2-user@ip-172-31-27-219 ~]$ echo tph_defrag: $(cat /sys/kernel/mm/transparent_hugepage/defrag), tph_enabled: $(cat /sys/kernel/mm/transparent_hugepage/enabled)
tph_defrag: always defer defer+madvise madvise [never], tph_enabled: always madvise [never]
[ec2-user@ip-172-31-27-219 ~]$ clush -g all -L 'echo tph_defrag: $(cat /sys/kernel/mm/transparent_hugepage/defrag), tph_enabled: $(cat /sys/kernel/mm/transparent_hugepage/enabled)'
ip-172-31-16-27.ec2.internal: tph_defrag: always defer defer+madvise madvise [never], tph_enabled: always madvise [never]
ip-172-31-17-244.ec2.internal: tph_defrag: always defer defer+madvise madvise [never], tph_enabled: always madvise [never]
ip-172-31-29-73.ec2.internal: tph_defrag: always defer defer+madvise madvise [never], tph_enabled: always madvise [never]
```