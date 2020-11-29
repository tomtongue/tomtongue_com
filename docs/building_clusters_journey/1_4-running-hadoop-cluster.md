---
id: 1_4-running-hadoop-cluster
title: '1-4. Running Hadoop Cluster'
sidebar_label: '1-4. Running Hadoop Cluster'
---

## 1. Running HDFS related processes and YARN
As the last step, we start HDFS, YARN and JobHistoryServer processes. In addition to these operations, we'll try running a YARN application and look into how to stop each process.

1. Formatting HDFS on MasterNode
2. Launching NameNode & DataNode services
3. Launching ResourceManager, NodeManager & JobHistory services
4. Checking the running status of HDFS

### 1-1. Formatting HDFS on MasterNode
We format HDFS with `hdfs` command on MasterNode as following steps (If you skip this step, running namenode will fail).

```
// 1. Check if `hdfs` command works on MasterNode
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo su -c '. $HOME/.bash_profile; which hdfs'"
ip-172-31-16-27.ec2.internal: /opt/hadoop-3.2.1/bin/hdfs

// 2. Formatting HDFS
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo su -c '. $HOME/.bash_profile; hdfs namenode -format -force'"
ip-172-31-16-27.ec2.internal: 2020-11-23 04:02:12,545 INFO namenode.NameNode: STARTUP_MSG:
ip-172-31-16-27.ec2.internal: /************************************************************
ip-172-31-16-27.ec2.internal: STARTUP_MSG: Starting NameNode
ip-172-31-16-27.ec2.internal: STARTUP_MSG:   host = ip-172-31-16-27.ec2.internal/172.31.16.27
ip-172-31-16-27.ec2.internal: STARTUP_MSG:   args = [-format, -force]
ip-172-31-16-27.ec2.internal: STARTUP_MSG:   version = 3.2.1
ip-172-31-16-27.ec2.internal: STARTUP_MSG:   classpath = /opt/hadoop-3.2.1...
...
ip-172-31-16-27.ec2.internal: 2020-11-23 04:02:13,285 INFO common.Storage: Storage directory /data/hadoop/hdfs/nn has been successfully formatted. // <= This message means formatting was successful.
...
ip-172-31-16-27.ec2.internal: 2020-11-23 04:02:13,398 INFO namenode.NNStorageRetentionManager: Going to retain 1 images with txid >= 0
ip-172-31-16-27.ec2.internal: 2020-11-23 04:02:13,401 INFO namenode.FSImage: FSImageSaver clean checkpoint: txid=0 when meet shutdown.
ip-172-31-16-27.ec2.internal: 2020-11-23 04:02:13,401 INFO namenode.NameNode: SHUTDOWN_MSG:
ip-172-31-16-27.ec2.internal: /************************************************************
ip-172-31-16-27.ec2.internal: SHUTDOWN_MSG: Shutting down NameNode at ip-172-31-16-27.ec2.internal/172.31.16.27
ip-172-31-16-27.ec2.internal: ************************************************************/
```

### 1-2. Launching NameNode & DataNode services
Let's start running NameNode and DataNode processes.

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo su -c '. $HOME/.bash_profile; hdfs --daemon start namenode'"
[tomtan@ip-172-31-27-219 ~]$ clush -g dn "sudo su -c '. $HOME/.bash_profile; hdfs --daemon start datanode'"
ip-172-31-29-73.ec2.internal: WARNING: /opt/hadoop-3.2.1/logs does not exist. Creating.
ip-172-31-17-244.ec2.internal: WARNING: /opt/hadoop-3.2.1/logs does not exist. Creating.
```

You can check each process with `jps` command:

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo jps | grep -vi jps"
p-172-31-16-27.ec2.internal: 31468 NameNode
[tomtan@ip-172-31-27-219 ~]$ clush -g dn "sudo jps | grep -vi jps"
ip-172-31-17-244.ec2.internal: 14734 DataNode
ip-172-31-29-73.ec2.internal: 7960 DataNode
```

You can also check if the MasterNode has metadata files of HDFS.

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo ls -a /data/hadoop/hdfs/nn/current"
ip-172-31-16-27.ec2.internal: .
ip-172-31-16-27.ec2.internal: ..
ip-172-31-16-27.ec2.internal: edits_inprogress_0000000000000000001
ip-172-31-16-27.ec2.internal: fsimage_0000000000000000000
ip-172-31-16-27.ec2.internal: fsimage_0000000000000000000.md5
ip-172-31-16-27.ec2.internal: seen_txid
ip-172-31-16-27.ec2.internal: VERSION
```

### 1-3. Launching ResourceManager, NodeManager & JobHistory services
Then, start running ResourceManager, NodeManager and JobHistory-server processes.

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo su -c '. $HOME/.bash_profile; yarn --daemon start resourcemanager'"
[tomtan@ip-172-31-27-219 ~]$ clush -g dn "sudo su -c '. $HOME/.bash_profile; yarn --daemon start nodemanager'"
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo su -c '. $HOME/.bash_profile; mapred --daemon start historyserver'"
```

You can check those processes:

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo jps | grep -vi jps"
ip-172-31-16-27.ec2.internal: 32358 ResourceManager
ip-172-31-16-27.ec2.internal: 31468 NameNode
ip-172-31-16-27.ec2.internal: 32669 JobHistoryServer

[tomtan@ip-172-31-27-219 ~]$ clush -g dn "sudo jps | grep -vi jps"
ip-172-31-17-244.ec2.internal: 14734 DataNode
ip-172-31-17-244.ec2.internal: 14990 NodeManager
ip-172-31-29-73.ec2.internal: 7960 DataNode
ip-172-31-29-73.ec2.internal: 8174 NodeManager
```

### 1-4. Checking the status of HDFS (on ClientNode)
You can check the running status of HDFS as follows:

```
[root@ip-172-31-27-219 ~]# hdfs dfsadmin -report
Configured Capacity: 68681736192 (63.96 GB)
Present Capacity: 68545429504 (63.84 GB)
DFS Remaining: 68545421312 (63.84 GB)
DFS Used: 8192 (8 KB)
DFS Used%: 0.00%
Replicated Blocks:
	Under replicated blocks: 0
	Blocks with corrupt replicas: 0
	Missing blocks: 0
	Missing blocks (with replication factor 1): 0
	Low redundancy blocks with highest priority to recover: 0
	Pending deletion blocks: 0
Erasure Coded Block Groups:
	Low redundancy block groups: 0
	Block groups with corrupt internal blocks: 0
	Missing block groups: 0
	Low redundancy blocks with highest priority to recover: 0
	Pending deletion blocks: 0

-------------------------------------------------
Live datanodes (2):

Name: 172.31.17.244:9866 (ip-172-31-17-244.ec2.internal)
Hostname: ip-172-31-17-244.ec2.internal
Decommission Status : Normal
Configured Capacity: 34340868096 (31.98 GB)
DFS Used: 4096 (4 KB)
Non DFS Used: 68153344 (65.00 MB)
DFS Remaining: 34272710656 (31.92 GB)
DFS Used%: 0.00%
DFS Remaining%: 99.80%
Configured Cache Capacity: 0 (0 B)
Cache Used: 0 (0 B)
Cache Remaining: 0 (0 B)
Cache Used%: 100.00%
Cache Remaining%: 0.00%
Xceivers: 1
Last contact: Sun Nov 29 01:35:58 UTC 2020
Last Block Report: Sun Nov 29 01:27:22 UTC 2020
Num of Blocks: 0


Name: 172.31.29.73:9866 (ip-172-31-29-73.ec2.internal)
Hostname: ip-172-31-29-73.ec2.internal
Decommission Status : Normal
Configured Capacity: 34340868096 (31.98 GB)
DFS Used: 4096 (4 KB)
Non DFS Used: 68153344 (65.00 MB)
DFS Remaining: 34272710656 (31.92 GB)
DFS Used%: 0.00%
DFS Remaining%: 99.80%
Configured Cache Capacity: 0 (0 B)
Cache Used: 0 (0 B)
Cache Remaining: 0 (0 B)
Cache Used%: 100.00%
Cache Remaining%: 0.00%
Xceivers: 1
Last contact: Sun Nov 29 01:35:58 UTC 2020
Last Block Report: Sun Nov 29 01:27:22 UTC 2020
Num of Blocks: 0
```

And, you can check the permisson for `/tmp` on HDFS. This directory is used by YARN applications. You can do this from the client node, not only from Master node.

```
[root@ip-172-31-27-219 ~]# hdfs dfs -chmod -R 1777 /tmp
[root@ip-172-31-27-219 ~]# hdfs dfs -ls /
Found 1 items
drwxrwxrwt   - root supergroup          0 2020-11-29 01:29 /tmp
```

Additionally, you can check the space of HDFS from the cleit node.

```
[root@ip-172-31-27-219 ~]# hdfs dfs -df -h
Filesystem                                  Size  Used  Available  Use%
hdfs://ip-172-31-16-27.ec2.internal:9000  64.0 G  16 K     63.8 G    0%
```

Finally, let's test if you can copy a file on HDFS.

```
[root@ip-172-31-27-219 ~]# dd if=/dev/zero of=~/file01 bs=1024k count=10
10+0 records in
10+0 records out
10485760 bytes (10 MB) copied, 0.00449019 s, 2.3 GB/s

[root@ip-172-31-27-219 ~]# hdfs dfs -mkdir /testdir1
[root@ip-172-31-27-219 ~]# hdfs dfs -put ~/file01 /testdir1
2020-11-29 01:40:52,955 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false
[root@ip-172-31-27-219 ~]# hdfs dfs -ls /testdir1
Found 1 items
-rw-r--r--   3 root supergroup   10485760 2020-11-29 01:40 /testdir1/file01

// Check if the file uses the HDFS space, compared with the previous result.
[root@ip-172-31-27-219 ~]# hdfs dfs -df -h
Filesystem                                  Size    Used  Available  Use%
hdfs://ip-172-31-16-27.ec2.internal:9000  64.0 G  20.2 M     63.8 G    0%
```

Of course you can access HDFS from the client node as follows:

```
[root@ip-172-31-16-27 ~]# source /home/tomtan/.bash_profile
[root@ip-172-31-16-27 ~]# hdfs dfs -ls /
Found 2 items
drwxr-xr-x   - root supergroup          0 2020-11-29 01:40 /testdir1
drwxrwxrwt   - root supergroup          0 2020-11-29 01:29 /tmp

[root@ip-172-31-16-27 ~]# hdfs dfs -df -h
Filesystem                                  Size    Used  Available  Use%
hdfs://ip-172-31-16-27.ec2.internal:9000  64.0 G  20.2 M     63.8 G    0%
```

#### Access from a new user
If you create a new user, and you want to access to the cluster from the new user, you need to add the permission to the user. Specifically, you need to do as follows:

```
[root@ip-172-31-27-219 ~]# hdfs dfs -mkdir -p /user/tomtan
[root@ip-172-31-27-219 ~]# hdfs dfs -chown tomtan:supergroup /user/tomtan
[root@ip-172-31-27-219 ~]# hdfs dfs -chmod 700 /user/tomtan

[root@ip-172-31-27-219 ~]# hdfs dfs -ls /user/
Found 1 items
drwx------   - tomtan supergroup          0 2020-11-29 01:46 /user/tomtan
```

You can confirm that you can access to the directory and files at the directory.

```
[tomtan@ip-172-31-27-219 ~]$ dd if=/dev/zero of=~/tomtan01 bs=1024k count=10
10+0 records in
10+0 records out
10485760 bytes (10 MB) copied, 0.00454551 s, 2.3 GB/s

[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -put tomtan01 /user/tomtan
2020-11-29 01:51:14,767 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false

[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -ls /user/tomtan
Found 1 items
-rw-r--r--   3 tomtan supergroup   10485760 2020-11-29 01:51 /user/tomtan/tomtan01

// However, fail to put the object on the other user's directory
[root@ip-172-31-27-219 tomtan]# hdfs dfs -mkdir /user/root

[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -ls /user/
Found 2 items
drwxr-xr-x   - root   supergroup          0 2020-11-29 01:53 /user/root
drwx------   - tomtan supergroup          0 2020-11-29 01:51 /user/tomtan

[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -put tomtan01 /user/root
put: Permission denied: user=tomtan, access=WRITE, inode="/user/root":root:supergroup:drwxr-xr-x
```

## 2. Running a YARN application
We check whether a yarn application runs fine. Firstly we check the [HDFS safemode](https://hadoop.apache.org/docs/r3.2.1/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html#Safemode) as follows (If needed, you check if the NTP server works fine).

```
[root@ip-172-31-27-219 ~]# hdfs dfsadmin -safemode get
Safe mode is OFF
```

Then, let's run a yarn application by the user `tomtan`; [Monte Carlo simulation](https://en.wikipedia.org/wiki/Monte_Carlo_method).

```
[tomtan@ip-172-31-27-219 mapreduce]$ pwd
/opt/hadoop-3.2.1/share/hadoop/mapreduce
[tomtan@ip-172-31-27-219 mapreduce]$ hadoop jar hadoop-mapreduce-examples-3.2.1.jar
An example program must be given as the first argument.
Valid program names are:
  aggregatewordcount: An Aggregate based map/reduce program that counts the words in the input files.
  aggregatewordhist: An Aggregate based map/reduce program that computes the histogram of the words in the input files.
  bbp: A map/reduce program that uses Bailey-Borwein-Plouffe to compute exact digits of Pi.
  dbcount: An example job that count the pageview counts from a database.
  distbbp: A map/reduce program that uses a BBP-type formula to compute exact bits of Pi.
  grep: A map/reduce program that counts the matches of a regex in the input.
  join: A job that effects a join over sorted, equally partitioned datasets
  multifilewc: A job that counts words from several files.
  pentomino: A map/reduce tile laying program to find solutions to pentomino problems.
  pi: A map/reduce program that estimates Pi using a quasi-Monte Carlo method.
  randomtextwriter: A map/reduce program that writes 10GB of random textual data per node.
  randomwriter: A map/reduce program that writes 10GB of random data per node.
  secondarysort: An example defining a secondary sort to the reduce.
  sort: A map/reduce program that sorts the data written by the random writer.
  sudoku: A sudoku solver.
  teragen: Generate data for the terasort
  terasort: Run the terasort
  teravalidate: Checking results of terasort
  wordcount: A map/reduce program that counts the words in the input files.
  wordmean: A map/reduce program that counts the average length of the words in the input files.
  wordmedian: A map/reduce program that counts the median length of the words in the input files.
  wordstandarddeviation: A map/reduce program that counts the standard deviation of the length of the words in the input files.

// Run the pi example
[tomtan@ip-172-31-27-219 mapreduce]$ hadoop jar hadoop-mapreduce-examples-3.2.1.jar pi 10 100
Number of Maps  = 10
Samples per Map = 100
...
2020-11-29 01:58:29,977 INFO mapreduce.Job: Running job: job_1606613378226_0001
2020-11-29 01:58:37,073 INFO mapreduce.Job: Job job_1606613378226_0001 running in uber mode : false
2020-11-29 01:58:37,074 INFO mapreduce.Job:  map 0% reduce 0%
2020-11-29 01:58:41,112 INFO mapreduce.Job:  map 10% reduce 0%
2020-11-29 01:58:42,117 INFO mapreduce.Job:  map 30% reduce 0%
2020-11-29 01:58:44,126 INFO mapreduce.Job:  map 40% reduce 0%
2020-11-29 01:58:45,131 INFO mapreduce.Job:  map 60% reduce 0%
2020-11-29 01:58:48,141 INFO mapreduce.Job:  map 80% reduce 0%
2020-11-29 01:58:51,152 INFO mapreduce.Job:  map 100% reduce 0%
2020-11-29 01:58:52,155 INFO mapreduce.Job:  map 100% reduce 100%
...
2020-11-29 01:58:52,265 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false
Estimated value of Pi is 3.14800000000000000000

```

You've done the cluster configuration successfully! Using this cluster, we'll deploy yarn-based cluster such as Spark, Hive etc from the next chapter.


## 3. (Additional) Stopping the cluster
When you stop the cluster, you follow the below steps.

1. HDFS: Master -> Worker
2. YARN: Worker -> Master
3. History server

Speicifically, you run the following commands.

```
$ clush -g nn "sudo su -c '. $HOME/.bash_profile; hdfs --daemon stop namenode'"
$ clush -g dn "sudo su -c '. $HOME/.bash_profile; hdfs --daemon stop datanode'"
$ clush -g dn "sudo su -c '. $HOME/.bash_profile; yarn --daemon stopnodemanager'"
$ clush -g nn "sudo su -c '. $HOME/.bash_profile; yarn --daemon stop resourcemanager'"
$ clush -g nn "sudo su -c '. $HOME/.bash_profile; mapred --daemon stop historyserver'"
$ clush -g all sudo jps // => Check whether there are the running processes
```

If you have a secondary NameNode, 

1. Stop DataNode
2. Stop the secondary NameNode

And, if you have HA cluster using ZooKeeper, 

1. Stop DataNode
2. Stop the secondary NameNode
3. Stop the quorum jornal node
4. Stop ZooKeeper service