---
id: 2_1-building-spark-cluster
title: '2-1. Building Spark Cluster'
sidebar_label: '2-1. Building Spark Cluster'
---

:::caution
This document is still under construction. 
:::

In this chapter, we'll create a Spark cluster based on the cluster that we created in the previous chapter.  We'll look into "how we build a spark cluster and run spark applications on both of Spark on YARN and Spark on Standalone. Specifically, we'll see following topics:

1. Building Spark cluster
    1. Installing Apache Spark
    2. Configuration
    3. Runnning Spark processes
2. Runnning Spark applications on YARN
    1. Running Scala-Spark
    2. Runnning PySpark
3. SparkSQL
4. Spark Streaming

We skip the following Spark related libraries:
* MLLib
* GraphX
* SparkR 

## Condition
* Spark on YARN/Hadoop3 (we'll use the Hadoop cluster which we built in the previous chapter.)
* Spark on Standalone
* Spark version: [Spark-3.0.1](https://archive.apache.org/dist/spark/spark-3.0.1/)


## 1. Installing Apache Spark

```
[tomtan@ip-172-31-27-219 ~]$ sudo su -c "wget https://archive.apache.org/dist/spark/spark-3.0.1/spark-3.0.1-bin-hadoop3.2.tgz"
[tomtan@ip-172-31-27-219 ~]$ sudo tar -xzf spark-3.0.1-bin-hadoop3.2.tgz -C /opt/

[tomtan@ip-172-31-27-219 ~]$ clush -g all -c spark-3.0.1-bin-hadoop3.2.tgz --dest ~
[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo tar -xzf spark-3.0.1-bin-hadoop3.2.tgz -C /opt/"

[tomtan@ip-172-31-27-219 ~]$ sudo chown root:root /opt/spark-3.0.1-bin-hadoop3.2
[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo chown root:root /opt/spark-3.0.1-bin-hadoop3.2"
```


## 2. Environmental setup
We'll setup the environmental variables for running Spark. Specifically, we'll look into the following configuration:
* `$SPARK_HOME`
* `$SPARK_HOME/conf/slave`
* `spark-defaults.conf`
* `spark-env.sh`
* (Optional) Copy the Spark related Jar to HDFS

### `$SPARK_HOME`

```
export SPARK_HOME=/opt/spark-3.0.1-bin-hadoop3.2
export PATH=$SPARK_HOME/bin:$SPARK_HOME/sbin:$PATH
```

ClientNodeも含めた全Nodeに反映させる。

```
// tomtan of ClientNode
[tomtan@ip-172-31-27-219 ~]$ echo 'export SPARK_HOME=/opt/spark-3.0.1-bin-hadoop3.2' | tee -a ~/.bash_profile
[tomtan@ip-172-31-27-219 ~]$ echo 'export PATH=$SPARK_HOME/bin:$SPARK_HOME/sbin:$PATH' | tee -a ~/.bash_profile

// root of ClientNode
[tomtan@ip-172-31-27-219 ~]$ echo 'export SPARK_HOME=/opt/spark-3.0.1-bin-hadoop3.2' | sudo tee -a /root/.bash_profile
[tomtan@ip-172-31-27-219 ~]$ echo 'export PATH=$SPARK_HOME/bin:$SPARK_HOME/sbin:$PATH' | sudo tee -a /root/.bash_profile

// for other nodes
[tomtan@ip-172-31-27-219 ~]$ clush -g all "mv .bash_profile .bash_profile.bak"
[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo mv /root/.bash_profile /root/.bash_profile.bak"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -c ~/.bash_profile --dest=~

[tomtan@ip-172-31-27-219 ~]$ sudo cp /root/.bash_profile .bash_profile_root
[tomtan@ip-172-31-27-219 ~]$ clush -g all -c .bash_profile_root --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo mv /root/.bash_profile_root /root/.bash_profile"

[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo ls -la /root | grep profile | grep -v bak"
ip-172-31-17-244.ec2.internal: -rw-r--r--  1 root root 1107 Dec  1 07:51 .bash_profile
ip-172-31-16-27.ec2.internal: -rw-r--r--  1 root root  1107 Dec  1 07:51 .bash_profile
ip-172-31-29-73.ec2.internal: -rw-r--r--  1 root root 1107 Dec  1 07:51 .bash_profile
ip-172-31-27-178.ec2.internal: -rw-r--r--  1 root root 1107 Dec  1 07:51 .bash_profile
ip-172-31-19-163.ec2.internal: -rw-r--r--  1 root root 1107 Dec  1 07:51 .bash_profile
ip-172-31-25-166.ec2.internal: -rw-r--r--  1 root root 1107 Dec  1 07:51 .bash_profile
```

Then, check the configuration.

```
[tomtan@ip-172-31-27-219 ~]$ source .bash_profile
[tomtan@ip-172-31-27-219 ~]$ echo $SPARK_HOME
/opt/spark-3.0.1-bin-hadoop3.2
[tomtan@ip-172-31-27-219 ~]$ sudo echo $SPARK_HOME
/opt/spark-3.0.1-bin-hadoop3.2

[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "echo $SPARK_HOME"
ip-172-31-16-27.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-17-244.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-19-163.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-25-166.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-27-178.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-29-73.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo echo $SPARK_HOME"
ip-172-31-16-27.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-17-244.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-19-163.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-25-166.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-27-178.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
ip-172-31-29-73.ec2.internal: /opt/spark-3.0.1-bin-hadoop3.2
```

### `$SPARK_HOME/conf/slave`

```
[tomtan@ip-172-31-27-219 ~]$ clush -g dn hostname
ip-172-31-19-163.ec2.internal: ip-172-31-19-163.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-25-166.ec2.internal: ip-172-31-25-166.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-27-178.ec2.internal: ip-172-31-27-178.ec2.internal

[tomtan@ip-172-31-27-219 ~]$ cat $SPARK_HOME/conf/slave
ip-172-31-19-163.ec2.internal
ip-172-31-29-73.ec2.internal
ip-172-31-25-166.ec2.internal
ip-172-31-17-244.ec2.internal
ip-172-31-27-178.ec2.internal

[tomtan@ip-172-31-27-219 ~]$ clush -g all -c $SPARK_HOME/conf/slave --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo mv slave $SPARK_HOME/conf/"
```

### `spark-defaults.conf`


```
[tomtan@ip-172-31-27-219 ~]$ cat /opt/spark-3.0.1-bin-hadoop3.2/conf/spark-defaults.conf
spark.master                     spark://ip-172-31-16-27.ec2.internal:7077
spark.driver.memory              5g
spark.executor.memory		 5g
spark.yarn.archive		 hdfs:///spark
spark.yarn.jars			 hdfs:///spark/*
```

Let's copy the configuration file to the all nodes as well.

```
[tomtan@ip-172-31-27-219 ~]$ clush -g all -c $SPARK_HOME/conf/spark-defaults.conf --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo mv spark-defaults.conf $SPARK_HOME/conf/"
```

### `spark-env.sh`

```
[tomtan@ip-172-31-27-219 ~]$ cat $SPARK_HOME/conf/spark-env.sh
HADOOP_CONF_DIR="/opt/hadoop-3.2.1/etc/hadoop/"
SPARK_EXECUTOR_MEMORY=5g
SPARK_WORKER_CORES=8
SPARK_WORKER_MEMORY=10g
SPARK_DEAMON_MEMORY=2g
SPARK_DEAMON_JAVA_OPTS="-Dspark.cleaner.ttl=43200"

[tomtan@ip-172-31-27-219 ~]$ clush -g all -c $SPARK_HOME/conf/spark-env.sh --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo mv spark-env.sh $SPARK_HOME/conf/"
```

### (Optional) Copy the Spark related Jar to HDFS
今回`spark-default.conf`に、`spark.yarn.archive    hdfs:///spark`と指定した。これは`/spark` directoryにSpark関連のJARファイルを配置しておくことで、Spark Jobが投入される大尾にJARがHDFSへコピーされる処理を省略することができるためである。これを行うことでJob投入にかかる時間を短縮できる。以下のようにSpark関連のJARファイルをHDFS上`/spark` directoryにcopyする。

```
[root@ip-172-31-27-219 ~]# hdfs dfs -mkdir /spark
[root@ip-172-31-27-219 ~]# hdfs dfs -put $SPARK_HOME/jars/* /spark/
[root@ip-172-31-27-219 ~]# hdfs dfs -ls /spark
Found 260 items
-rw-r--r--   3 root supergroup     136363 2020-12-01 08:22 /spark/HikariCP-2.5.1.jar
-rw-r--r--   3 root supergroup     232470 2020-12-01 08:22 /spark/JLargeArrays-1.5.jar
-rw-r--r--   3 root supergroup    1175798 2020-12-01 08:22 /spark/JTransforms-3.1.jar
-rw-r--r--   3 root supergroup     325335 2020-12-01 08:22 /spark/RoaringBitmap-0.7.45.jar
-rw-r--r--   3 root supergroup     236660 2020-12-01 08:22 /spark/ST4-4.0.4.jar
-rw-r--r--   3 root supergroup      30035 2020-12-01 08:22 /spark/accessors-smart-1.2.jar
...
```

## 3. Runnning Spark processes
We launch Spark processes, firstly launch the master, and then slave. Specifically, we run the folloinwing scripts under `$SPARK_HOME/sbin` directory.
* `start-master.sh`
* `start-slave.sh`

```
// Master
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo su -c '. ~/.bash_profile; start-master.sh'"
ip-172-31-16-27.ec2.internal: starting org.apache.spark.deploy.master.Master, logging to /opt/spark-3.0.1-bin-hadoop3.2/logs/spark-root-org.apache.spark.deploy.master.Master-1-ip-172-31-16-27.ec2.internal.out

[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo jps | grep -v Jps"
ip-172-31-16-27.ec2.internal: 10833 ResourceManager
ip-172-31-16-27.ec2.internal: 11205 JobHistoryServer
ip-172-31-16-27.ec2.internal: 10554 NameNode
ip-172-31-16-27.ec2.internal: 21420 Master <= Spark Master


// Slave
[tomtan@ip-172-31-27-219 ~]$ clush -g dn "sudo su -c '. ~/.bash_profile; start-slave.sh spark://ip-172-31-16-27.ec2.internal:7077'"
ip-172-31-25-166.ec2.internal: starting org.apache.spark.deploy.worker.Worker, logging to /opt/spark-3.0.1-bin-hadoop3.2/logs/spark-root-org.apache.spark.deploy.worker.Worker-1-ip-172-31-25-166.ec2.internal.out
ip-172-31-17-244.ec2.internal: starting org.apache.spark.deploy.worker.Worker, logging to /opt/spark-3.0.1-bin-hadoop3.2/logs/spark-root-org.apache.spark.deploy.worker.Worker-1-ip-172-31-17-244.ec2.internal.out
ip-172-31-27-178.ec2.internal: starting org.apache.spark.deploy.worker.Worker, logging to /opt/spark-3.0.1-bin-hadoop3.2/logs/spark-root-org.apache.spark.deploy.worker.Worker-1-ip-172-31-27-178.ec2.internal.out
ip-172-31-19-163.ec2.internal: starting org.apache.spark.deploy.worker.Worker, logging to /opt/spark-3.0.1-bin-hadoop3.2/logs/spark-root-org.apache.spark.deploy.worker.Worker-1-ip-172-31-19-163.ec2.internal.out
ip-172-31-29-73.ec2.internal: starting org.apache.spark.deploy.worker.Worker, logging to /opt/spark-3.0.1-bin-hadoop3.2/logs/spark-root-org.apache.spark.deploy.worker.Worker-1-ip-172-31-29-73.ec2.internal.out

[tomtan@ip-172-31-27-219 ~]$ clush -g dn "sudo jps | grep Worker"
ip-172-31-27-178.ec2.internal: 8396 Worker
ip-172-31-17-244.ec2.internal: 1718 Worker
ip-172-31-25-166.ec2.internal: 9205 Worker
ip-172-31-19-163.ec2.internal: 14764 Worker
ip-172-31-29-73.ec2.internal: 27017 Worker
```

If you want to stop a process, execute `stop-<master|slave>.sh` command.

```
[tomtan@ip-172-31-27-219 ~]$ clush -g dn "sudo su -c '. ~/.bash_profile; stop-slave.sh'"
ip-172-31-17-244.ec2.internal: stopping org.apache.spark.deploy.worker.Worker
...

[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo su -c '. ~/.bash_profile; stop-master.sh'"
ip-172-31-16-27.ec2.internal: stopping org.apache.spark.deploy.master.Master
```

### Checking the running status
We'll confirm if the Spark runs fine through the following two steps:
* Run a spark application through `spark-shell`
* Check an application status with Spark UI by accessing to `http://<MasterNodeHostname>:8080`

```
[tomtan@ip-172-31-27-219 ~]$ spark-shell
Setting default log level to "WARN".
To adjust logging level use sc.setLogLevel(newLevel). For SparkR, use setLogLevel(newLevel).
2020-12-01 09:28:12,035 WARN spark.SparkContext: Please ensure that the number of slots available on your executors is limited by the number of cores to task cpus and not another custom resource. If cores is not the limiting resource then dynamic allocation will not work properly!
Spark context Web UI available at http://ip-172-31-27-219.ec2.internal:4040
Spark context available as 'sc' (master = spark://ip-172-31-16-27.ec2.internal:7077, app id = app-20201201092812-0000).
Spark session available as 'spark'.
Welcome to
      ____              __
     / __/__  ___ _____/ /__
    _\ \/ _ \/ _ `/ __/  '_/
   /___/ .__/\_,_/_/ /_/\_\   version 3.0.1
      /_/

Using Scala version 2.12.10 (OpenJDK 64-Bit Server VM, Java 1.8.0_265)
Type in expressions to have them evaluated.
Type :help for more information.

scala> val rdd = sc.parallelize(List(1, 9, 9, 1, 12, 1), 3)
rdd: org.apache.spark.rdd.RDD[Int] = ParallelCollectionRDD[0] at parallelize at <console>:24

scala> rdd.collect
res0: Array[Int] = Array(1, 9, 9, 1, 12, 1)

scala> rdd.reduce((x, y) => x + y)
res1: Int = 33

scala> rdd.getNumPartitions
res2: Int = 3

scala> val rddHdfs = sc.textFile("hdfs://ip-172-31-16-27.ec2.internal:9000/user/tomtan/tomtan01/")
rddHdfs: org.apache.spark.rdd.RDD[String] = hdfs://ip-172-31-16-27.ec2.internal:9000/user/tomtan/tomtan01/ MapPartitionsRDD[5] at textFile at <console>:24

scala> rdd.collect
...
```

And, you can see the following Spark web ui.

![](/docs/building_clusters_journey/2-hadoop_1.png)
