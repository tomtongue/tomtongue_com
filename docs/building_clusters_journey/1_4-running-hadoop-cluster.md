---
id: 1_4-running-hadoop-cluster
title: '1-4. Running Hadoop Cluster'
sidebar_label: '1-4. Running Hadoop Cluster'
---

:::caution
This document is still under construction. 
:::

## 1. Running HDFS related processes and YARN
In this section, we'll do as follows:

1. Formatting HDFS on MasterNode
2. Launching NameNode & DataNode services
3. Launching ResourceManager, NodeManager & JobHistory services
4. Checking the running status of HDFS

### 1-1. Formatting HDFS on MasterNode
We format HDFS with `hdfs` command on MasterNode as following steps (If you skip this step, running namenode will fail).

```
// 1. Check if `hdfs` command works on MasterNode
[tomtan@ip-172-31-27-219 ~]$ clush -g nn ". $HOME/.bash_profile; which hdfs"
ip-172-31-16-27.ec2.internal: /opt/hadoop-3.2.1/bin/hdfs

// 2. Formatting HDFS
[tomtan@ip-172-31-27-219 ~]$ clush -g nn ". $HOME/.bash_profile; hdfs namenode -format -force"
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
[tomtan@ip-172-31-27-219 ~]$ clush -g nn ". $HOME/.bash_profile; hdfs --daemon start namenode"
[tomtan@ip-172-31-27-219 ~]$ clush -g dn ". $HOME/.bash_profile; hdfs --daemon start datanode"
ip-172-31-29-73.ec2.internal: WARNING: /opt/hadoop-3.2.1/logs does not exist. Creating.
ip-172-31-17-244.ec2.internal: WARNING: /opt/hadoop-3.2.1/logs does not exist. Creating.
```

You can check each process with `jps` command:

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "jps | grep -vi jps"
ip-172-31-16-27.ec2.internal: 19425 NameNode
[tomtan@ip-172-31-27-219 ~]$ clush -g dn "jps | grep -vi jps"
ip-172-31-29-73.ec2.internal: 774 DataNode
ip-172-31-17-244.ec2.internal: 997 DataNode
```

You can also check if the MasterNode has metadata files of HDFS.

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "ls -a /data/hadoop/hdfs/"
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "ls -a /data/hadoop/hdfs/nn/current"
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
[tomtan@ip-172-31-27-219 ~]$ clush -g nn ". $HOME/.bash_profile; yarn --daemon start resourcemanager"
[tomtan@ip-172-31-27-219 ~]$ clush -g dn ". $HOME/.bash_profile; yarn --daemon start nodemanager"
[tomtan@ip-172-31-27-219 ~]$ clush -g nn ". $HOME/.bash_profile; mapred --daemon start historyserver"
```

You can check those processes:

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "jps | grep -vi jps"
ip-172-31-16-27.ec2.internal: 20977 ResourceManager
ip-172-31-16-27.ec2.internal: 21478 JobHistoryServer
ip-172-31-16-27.ec2.internal: 20521 NameNode

[tomtan@ip-172-31-27-219 ~]$ clush -g dn "jps | grep -vi jps"
ip-172-31-17-244.ec2.internal: 1737 DataNode
ip-172-31-17-244.ec2.internal: 1902 NodeManager
ip-172-31-29-73.ec2.internal: 1555 DataNode
ip-172-31-29-73.ec2.internal: 1719 NodeManager
```

### 1-4. Checking the status of HDFS
You can check the running status of HDFS as follows:

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn ". $HOME/.bash_profile; hdfs dfsadmin -report"
ip-172-31-16-27.ec2.internal: Configured Capacity: 17154662400 (15.98 GB)
ip-172-31-16-27.ec2.internal: Present Capacity: 10961317888 (10.21 GB)
ip-172-31-16-27.ec2.internal: DFS Remaining: 10961293312 (10.21 GB)
ip-172-31-16-27.ec2.internal: DFS Used: 24576 (24 KB)
ip-172-31-16-27.ec2.internal: DFS Used%: 0.00%
ip-172-31-16-27.ec2.internal: Replicated Blocks:
ip-172-31-16-27.ec2.internal: 	Under replicated blocks: 0
ip-172-31-16-27.ec2.internal: 	Blocks with corrupt replicas: 0
ip-172-31-16-27.ec2.internal: 	Missing blocks: 0
ip-172-31-16-27.ec2.internal: 	Missing blocks (with replication factor 1): 0
ip-172-31-16-27.ec2.internal: 	Low redundancy blocks with highest priority to recover: 0
ip-172-31-16-27.ec2.internal: 	Pending deletion blocks: 0
ip-172-31-16-27.ec2.internal: Erasure Coded Block Groups:
ip-172-31-16-27.ec2.internal: 	Low redundancy block groups: 0
ip-172-31-16-27.ec2.internal: 	Block groups with corrupt internal blocks: 0
ip-172-31-16-27.ec2.internal: 	Missing block groups: 0
ip-172-31-16-27.ec2.internal: 	Low redundancy blocks with highest priority to recover: 0
ip-172-31-16-27.ec2.internal: 	Pending deletion blocks: 0
ip-172-31-16-27.ec2.internal:
ip-172-31-16-27.ec2.internal: -------------------------------------------------
ip-172-31-16-27.ec2.internal: Live datanodes (2):
ip-172-31-16-27.ec2.internal:
ip-172-31-16-27.ec2.internal: Name: 172.31.17.244:9866 (ip-172-31-17-244.ec2.internal)
ip-172-31-16-27.ec2.internal: Hostname: ip-172-31-17-244.ec2.internal
ip-172-31-16-27.ec2.internal: Decommission Status : Normal
ip-172-31-16-27.ec2.internal: Configured Capacity: 8577331200 (7.99 GB)
ip-172-31-16-27.ec2.internal: DFS Used: 12288 (12 KB)
ip-172-31-16-27.ec2.internal: Non DFS Used: 3096616960 (2.88 GB)
ip-172-31-16-27.ec2.internal: DFS Remaining: 5480701952 (5.10 GB)
ip-172-31-16-27.ec2.internal: DFS Used%: 0.00%
ip-172-31-16-27.ec2.internal: DFS Remaining%: 63.90%
ip-172-31-16-27.ec2.internal: Configured Cache Capacity: 0 (0 B)
ip-172-31-16-27.ec2.internal: Cache Used: 0 (0 B)
ip-172-31-16-27.ec2.internal: Cache Remaining: 0 (0 B)
ip-172-31-16-27.ec2.internal: Cache Used%: 100.00%
ip-172-31-16-27.ec2.internal: Cache Remaining%: 0.00%
ip-172-31-16-27.ec2.internal: Xceivers: 1
ip-172-31-16-27.ec2.internal: Last contact: Mon Nov 23 04:32:42 UTC 2020
ip-172-31-16-27.ec2.internal: Last Block Report: Mon Nov 23 04:21:42 UTC 2020
ip-172-31-16-27.ec2.internal: Num of Blocks: 0
ip-172-31-16-27.ec2.internal:
ip-172-31-16-27.ec2.internal:
ip-172-31-16-27.ec2.internal: Name: 172.31.29.73:9866 (ip-172-31-29-73.ec2.internal)
ip-172-31-16-27.ec2.internal: Hostname: ip-172-31-29-73.ec2.internal
ip-172-31-16-27.ec2.internal: Decommission Status : Normal
ip-172-31-16-27.ec2.internal: Configured Capacity: 8577331200 (7.99 GB)
ip-172-31-16-27.ec2.internal: DFS Used: 12288 (12 KB)
ip-172-31-16-27.ec2.internal: Non DFS Used: 3096727552 (2.88 GB)
ip-172-31-16-27.ec2.internal: DFS Remaining: 5480591360 (5.10 GB)
ip-172-31-16-27.ec2.internal: DFS Used%: 0.00%
ip-172-31-16-27.ec2.internal: DFS Remaining%: 63.90%
ip-172-31-16-27.ec2.internal: Configured Cache Capacity: 0 (0 B)
ip-172-31-16-27.ec2.internal: Cache Used: 0 (0 B)
ip-172-31-16-27.ec2.internal: Cache Remaining: 0 (0 B)
ip-172-31-16-27.ec2.internal: Cache Used%: 100.00%
ip-172-31-16-27.ec2.internal: Cache Remaining%: 0.00%
ip-172-31-16-27.ec2.internal: Xceivers: 1
ip-172-31-16-27.ec2.internal: Last contact: Mon Nov 23 04:32:42 UTC 2020
ip-172-31-16-27.ec2.internal: Last Block Report: Mon Nov 23 04:21:42 UTC 2020
ip-172-31-16-27.ec2.internal: Num of Blocks: 0
ip-172-31-16-27.ec2.internal:
ip-172-31-16-27.ec2.internal:
```

And, you can check the permisson for `/tmp` on HDFS. This directory is used by YARN applications. To check this easily, you move to MasterNode.

```
[tomtan@ip-172-31-16-27 ~]$ hdfs dfs -chmod -R 1777 /tmp
[tomtan@ip-172-31-16-27 ~]$ hdfs dfs -ls /
Found 1 items
drwxrwxrwt   - tomtan supergroup          0 2020-11-23 04:29 /tmp
```

Additionally, you can check the space of HDFS on MasterNode.

```
[tomtan@ip-172-31-16-27 ~]$ hdfs dfs -df -h
Filesystem                                  Size  Used  Available  Use%
hdfs://ip-172-31-16-27.ec2.internal:9000  16.0 G  24 K     10.2 G    0%
```

Finally, let's test if you can copy a file on HDFS on MasterNode.

```
[tomtan@ip-172-31-16-27 ~]$ dd if=/dev/zero of=~/file01 bs=1024k count=10
10+0 records in
10+0 records out
10485760 bytes (10 MB) copied, 0.00461907 s, 2.3 GB/s
[tomtan@ip-172-31-16-27 ~]$ hdfs dfs -mkdir /testdir1
[tomtan@ip-172-31-16-27 ~]$ hdfs dfs -put ~/file01 /testdir1
2020-11-23 04:42:21,824 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false
[tomtan@ip-172-31-16-27 ~]$ hdfs dfs -ls /testdir1
Found 1 items
-rw-r--r--   3 tomtan supergroup   10485760 2020-11-23 04:42 /testdir1/file01

// Check if the file uses the HDFS space, compared with the previous result.
[tomtan@ip-172-31-16-27 ~]$ hdfs dfs -df -h
Filesystem                                  Size    Used  Available  Use%
hdfs://ip-172-31-16-27.ec2.internal:9000  16.0 G  20.2 M     10.2 G    0%
```

### 1-5. Access from ClientNode

```
[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -df -h
Filesystem                                  Size    Used  Available  Use%
hdfs://ip-172-31-16-27.ec2.internal:9000  16.0 G  20.2 M     10.2 G    0%

[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -put ~/file01 /user/tomtan-clientnode
2020-11-23 04:58:41,944 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false

[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -mkdir -p /user/tomtan-clientnode
[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -ls /user/tomtan-clientnode
Found 1 items
-rw-r--r--   3 tomtan supergroup   10485760 2020-11-23 04:58 /user/tomtan-clientnode/file01
```

#### From a new user
If you create a new user, and you want to access to the cluster from the new user, you need to add the permission to the user. Specifically, you need to do as follows:

```
$ hdfs dfs -mkdir /user/newuser
$ hdfs dfs -chown newuser:supergroup /user/newuser
$ hdfs dfs -chmod 700 /user/newuser
```

## 2. Running a YARN application
As a last step, we'll check whether a yarn application runs fine. Firstly we check the [HDFS safemode](https://hadoop.apache.org/docs/r3.2.1/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html#Safemode) as follows (If needed, you check if the NTP server works fine).

```
[tomtan@ip-172-31-27-219 ~]$ hdfs dfsadmin -safemode get
Safe mode is OFF
```

Then, let's run a yarn application; [Monte Carlo simulation](https://en.wikipedia.org/wiki/Monte_Carlo_method).

```
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
[tomtan@ip-172-31-27-219 mapreduce]$ hadoop jar hadoop-mapreduce-examples-3.2.1.jar pi 5 1000
Number of Maps  = 5
Samples per Map = 1000
...
2020-11-23 07:01:00,992 INFO mapreduce.Job: Job job_1606114133340_0003 running in uber mode : false
2020-11-23 07:01:00,993 INFO mapreduce.Job:  map 0% reduce 0%
2020-11-23 07:01:05,030 INFO mapreduce.Job:  map 20% reduce 0%
2020-11-23 07:01:06,035 INFO mapreduce.Job:  map 60% reduce 0%
2020-11-23 07:01:08,044 INFO mapreduce.Job:  map 100% reduce 0%
2020-11-23 07:01:10,051 INFO mapreduce.Job:  map 100% reduce 100%
...
2020-11-23 07:01:10,165 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false
Estimated value of Pi is 3.14160000000000000000

```

You've done the cluster configuration successfully! Using this cluster, we'll deploy yarn-based cluster such as Spark, Hive etc from the next chapter.
