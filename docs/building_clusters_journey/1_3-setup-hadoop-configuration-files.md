---
id: 1_3-setup-hadoop-configuration-files
title: '1-3. Setup Hadoop Configuration files'
sidebar_label: '1-3. Setup Hadoop Configuration files'
---


:::caution
This document is still under construction. 
:::

```
[tomtan@ip-172-31-27-219 hadoop]$ pwd
/opt/hadoop-3.2.1/etc/hadoop
[tomtan@ip-172-31-27-219 hadoop]$ ls -l | grep xml
-rw-r--r-- 1 1001 1001  8260 Sep 10  2019 capacity-scheduler.xml
-rw-r--r-- 1 1001 1001   774 Sep 10  2019 core-site.xml
-rw-r--r-- 1 1001 1001 11392 Sep 10  2019 hadoop-policy.xml
-rw-r--r-- 1 1001 1001   775 Sep 10  2019 hdfs-site.xml
-rw-r--r-- 1 1001 1001   620 Sep 10  2019 httpfs-site.xml
-rw-r--r-- 1 1001 1001  3518 Sep 10  2019 kms-acls.xml
-rw-r--r-- 1 1001 1001   682 Sep 10  2019 kms-site.xml
-rw-r--r-- 1 1001 1001  4113 Sep 10  2019 mapred-queues.xml.template
-rw-r--r-- 1 1001 1001   758 Sep 10  2019 mapred-site.xml
-rw-r--r-- 1 1001 1001  2316 Sep 10  2019 ssl-client.xml.example
-rw-r--r-- 1 1001 1001  2697 Sep 10  2019 ssl-server.xml.example
-rw-r--r-- 1 1001 1001  2642 Sep 10  2019 user_ec_policies.xml.template
-rw-r--r-- 1 1001 1001   690 Sep 10  2019 yarn-site.xml
```

全てのファイルに関して以下の手順で行う。

1. Creating a backup file on each node
2. Adding configuration on the "Client" node
3. Delivering the configuration files to each node

## `core-site.xml`
初期状態では以下の内容となっているため、ClientNodeでこれを編集し、各Nodeに配布する。

```
[tomtan@ip-172-31-27-219 hadoop]$ cat core-site.xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<!--
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. See accompanying LICENSE file.
-->

<!-- Put site-specific property overrides in this file. -->

<configuration>
</configuration>
```



### Step 1. Creating a backup file

```
[tomtan@ip-172-31-27-219 ~]$ sudo cp /opt/hadoop-3.2.1/etc/hadoop/core-site.xml /opt/hadoop-3.2.1/etc/hadoop/core-site.xml.bak
[tomtan@ip-172-31-27-219 ~]$ ls -l /opt/hadoop-3.2.1/etc/hadoop/ | grep core-site
-rw-r--r-- 1 1001 1001   774 Sep 10  2019 core-site.xml
-rw-r--r-- 1 root root   774 Nov 15 01:16 core-site.xml.bak

[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv /opt/hadoop-3.2.1/etc/hadoop/core-site.xml /opt/hadoop-3.2.1/etc/hadoop/core-site.xml.bak"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /opt/hadoop-3.2.1/etc/hadoop/ | grep core-site"
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1 1001 1001   774 Sep 10  2019 core-site.xml.bak
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1 1001 1001   774 Sep 10  2019 core-site.xml.bak
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1 1001 1001   774 Sep 10  2019 core-site.xml.bak
```

### Step 2. dding configuration on the "Client" node
Add the configuration to `core-site.xml` as follows

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn -L hostname
ip-172-31-16-27.ec2.internal: ip-172-31-16-27.ec2.internal
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
... Omitted ...
<!-- Put site-specific property overrides in this file. -->

<configuration>
	<property>
		<name>fs.defaultFS</name>
		<value>hdfs://ip-172-31-16-27.ec2.internal:9000</value>
	</property>
	<property>
		<name>hadoop.tmp.dir</name>
		<value>/tmp/hadoop-${user.name}</value>
	</property>
</configuration>
```

### Step 3. Delivering the configuration files to each node

```
[tomtan@ip-172-31-27-219 ~]$ clush -g all -c /opt/hadoop-3.2.1/etc/hadoop/core-site.xml --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv core-site.xml /opt/hadoop-3.2.1/etc/hadoop/"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /opt/hadoop-3.2.1/etc/hadoop/ | grep core-site | grep  -v bak"
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1 tomtan   hadoop     968 Nov 15 03:01 core-site.xml
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1 tomtan   hadoop     968 Nov 15 03:01 core-site.xml
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1 tomtan   hadoop     968 Nov 15 03:01 core-site.xml
```

User,Groupの変更は最後にまとめて行う。


## `yarn-site.xml`
Set the configuration as same as the previous case.

Step1: 

```
[tomtan@ip-172-31-27-219 ~]$ sudo cp /opt/hadoop-3.2.1/etc/hadoop/yarn-site.xml /opt/hadoop-3.2.1/etc/hadoop/yarn-site.xml.bak
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv /opt/hadoop-3.2.1/etc/hadoop/yarn-site.xml /opt/hadoop-3.2.1/etc/hadoop/yarn-site.xml.bak"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /opt/hadoop-3.2.1/etc/hadoop/ | grep yarn-site"
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1     1001     1001   690 Sep 10  2019 yarn-site.xml.bak
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1     1001     1001   690 Sep 10  2019 yarn-site.xml.bak
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1     1001     1001   690 Sep 10  2019 yarn-site.xml.bak
```

Step2:

```xml
<?xml version="1.0"?>
... Omitted ...
<configuration>
	<property>
		<name>yarn.resourcemanager.hostname</name>
		<value>ip-172-31-16-27.ec2.internal</name>
	</property>
	<property>
		<name>yarn.resourcemanager.address</name>
		<value>ip-172-31-16-27.ec2.internal:8032</name>
	</property>
	<property>
		<name>yarn.nodemanager.aux-services</name>
		<value>mapreduce_shuffle</value>
	</property>
	<property>
		<name>yarn.nodemanager.env-whitelist</name>
		<value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTANCE,HADOOP_YARN_HOME,HADOOP_MAPRED_HOME</value>
	</property>
	<property>
		<name>yarn.nodemanager.pmem-check-enabled</name>
		<value>false</value>
	</property>
	<property>
		<name>yarn.nodemanager.vmem-check-enabled</name>
		<value>false</value>
	</property>
	<property>
		<name>yarn.log-aggregation-enable</name>
		<value>true</value>
	</property>
	<property>
		<name>yarn.nodemanager.remote-app-log-dir</name>
		<value>/tmp/logs</value>
	</property>
	<property>
		<name>yarn.resourcemanager.nodes.exclude-path</name>
		<value>/opt/hadoop-3.2.1/etc/hadoop/yarn.exclude</value>
	</property>
</configuration>
```

Step3:

```

[tomtan@ip-172-31-27-219 ~]$ clush -g all -c /opt/hadoop-3.2.1/etc/hadoop/yarn-site.xml --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv yarn-site.xml /opt/hadoop-3.2.1/etc/hadoop/"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /opt/hadoop-3.2.1/etc/hadoop/ | grep yarn-site | grep  -v bak"
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1 tomtan hadoop  1705 Nov 15 03:16 yarn-site.xml
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1 tomtan hadoop  1705 Nov 15 03:16 yarn-site.xml
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1 tomtan hadoop  1705 Nov 15 03:16 yarn-site.xml
```

## `hdfs-site.xml`
今までと同様に設定するが、設定値として以下の内容に注意する。
* Replicas (`dfs.replication`): `3`
* Paths for Nodes
   * NameNode (`dfs.namenode.name.dir`): `/data/hadoop/hdfs/nn`
   * DataNode (`dfs.data.node.data.dir`): `/data/hadoop/hdfs/dn`

Step1: 

```
[tomtan@ip-172-31-27-219 ~]$ sudo cp /opt/hadoop-3.2.1/etc/hadoop/hdfs-site.xml /opt/hadoop-3.2.1/etc/hadoop/hdfs-site.xml.bak
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv /opt/hadoop-3.2.1/etc/hadoop/hdfs-site.xml /opt/hadoop-3.2.1/etc/hadoop/hdfs-site.xml.bak"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /opt/hadoop-3.2.1/etc/hadoop/ | grep hdfs-site"
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1   1001   1001   775 Sep 10  2019 hdfs-site.xml.bak
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1   1001   1001   775 Sep 10  2019 hdfs-site.xml.bak
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1   1001   1001   775 Sep 10  2019 hdfs-site.xml.bak
```

Step2: 

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
... Omitted ...
<configuration>
	<property>
		<name>dfs.replication</name>
		<value>3</value>
	</property>
	<property>
		<name>dfs.namenode.name.dir</name>
		<value>/data/hadoop/hdfs/nn</value>
	</property>
	<property>
		<name>dfs.datanode.data.dir</name>
		<value>/data/hadoop/hdfs/dn</value>
	</property>
	<property>
		<name>dfs.namenode.checkpoint.dir</name>
		<value>/data/hadoop/hdfs/snn</value>
	</property>
	<property>
		<name>dfs.namenode.checkpoint.edits.dir</name>
		<value>/data/hadoop/hdfs/snn</value>
	</property>
	<property>
		<name>dfs.hosts.exclude</name>
		<value>/opt/hadoop-3.2.1/etc/hadoop/dfs.exclude</value>
	</property>
</configuration>
```

Step3:

```
[tomtan@ip-172-31-27-219 ~]$ clush -g all -c /opt/hadoop-3.2.1/etc/hadoop/hdfs-site.xml --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv hdfs-site.xml /opt/hadoop-3.2.1/etc/hadoop/"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /opt/hadoop-3.2.1/etc/hadoop/ | grep hdfs-site | grep  -v bak"
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1 tomtan hadoop  1374 Nov 15 03:27 hdfs-site.xml
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1 tomtan hadoop  1374 Nov 15 03:27 hdfs-site.xml
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1 tomtan hadoop  1374 Nov 15 03:27 hdfs-site.xml
```

## `mapred-site.xml`
注意点としてはJobHistoryServerをMasterNodeで稼働させるよう設定することである (`mapreduce.jobhistory.address`)。

Step1: 

```
[tomtan@ip-172-31-27-219 ~]$ sudo cp /opt/hadoop-3.2.1/etc/hadoop/mapred-site.xml /opt/hadoop-3.2.1/etc/hadoop/mapred-site.xml.bak
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv /opt/hadoop-3.2.1/etc/hadoop/mapred-site.xml /opt/hadoop-3.2.1/etc/hadoop/mapred-site.xml.bak"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /opt/hadoop-3.2.1/etc/hadoop/ | grep mapred-site"
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1   1001   1001   758 Sep 10  2019 mapred-site.xml.bak
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1   1001   1001   758 Sep 10  2019 mapred-site.xml.bak
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1   1001   1001   758 Sep 10  2019 mapred-site.xml.bak
```

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
... Omitted ...
<!-- Put site-specific property overrides in this file. -->

<configuration>
	<property>
		<name>mapreduce.framework.name</name>
		<value>yarn</value>
	</property>
	<property>
		<name>mapreduce.admin.user.env</name>
		<value>HADOOP_MAPRED_HOME=$HADOOP_COMMON_HOME</value>
	</property>
	<property>
		<name>yarn.app.mapreduce.am.env</name>
		<value>HADOOP_MAPRED_HOME=$HADOOP_COMMON_HOME</value>
	</property>
	<property>
		<name>mapreduce.map.java.opts</name>
		<value>-Xmx2560M</value>
	</property>
	<property>
		<name>mapreduce.reduce.java.opts</name>
		<value>-Xmx2560M</value>
	</property>
	<property>
		<name>mapreduce.jobhistory.address</name>
		<value>ip-172-31-16-27.ec2.internal:10020</value>
	</property>
</configuration>
```

Step3:

```
[tomtan@ip-172-31-27-219 ~]$ clush -g all -c /opt/hadoop-3.2.1/etc/hadoop/mapred-site.xml --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv mapred-site.xml /opt/hadoop-3.2.1/etc/hadoop/"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /opt/hadoop-3.2.1/etc/hadoop/ | grep mapred-site | grep  -v bak"
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1 tomtan hadoop  1391 Nov 15 03:40 mapred-site.xml
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1 tomtan hadoop  1391 Nov 15 03:40 mapred-site.xml
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1 tomtan hadoop  1391 Nov 15 03:40 mapred-site.xml
```

## Creating `workers` file
We add the hostnames to `/opt/hadoop-3.2.1/etc/hadoop/workers` file, then copy them to all nodes:

```
[tomtan@ip-172-31-27-219 ~]$ cat /opt/hadoop-3.2.1/etc/hadoop/workers
ip-172-31-16-27.ec2.internal
ip-172-31-17-244.ec2.internal
ip-172-31-29-73.ec2.internal

[tomtan@ip-172-31-27-219 ~]$ clush -g all -c /opt/hadoop-3.2.1/etc/hadoop/workers --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv workers /opt/hadoop-3.2.1/etc/hadoop/"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "cat /opt/hadoop-3.2.1/etc/hadoop/workers"
ip-172-31-16-27.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-16-27.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-16-27.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-29-73.ec2.internal
```