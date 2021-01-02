---
id: 1_5-managing-hadoop-cluster
title: '1-5. Managing Hadoop Cluster'
sidebar_label: '1-5. Managing Hadoop Cluster'
---

:::caution
This page is still under construction. 
:::

## WorkerNode Comission/Decomission
### Overview
Nodeのcomission/decomissionを行う。EC2に関しては、[3-1. EC2 Instanceの設定](3_1-setup-hadoop-environment)と同様の内容でのsetupが必要であるが、ここは簡単のため、AMIを取得し、それをベースにcomission/decomissionを行う。大まかに以下の手順で実施する。

1. WorkerNodeのAMIを取得 (このstepは省略する)
2. Launching an EC2 instance from the AMI and setup
3. Commission the worker node
4. 上記"3."で追加したNodeをDecommissionする
5. Re-commission the worker node

### Step2. Launching an EC2 instance from the AMI and setup
基本的に設定した内容は全て引き継がれるので以下の内容を実施する。
* CientNodeにおける`/etc/clustershell/groups/`に対象のNodeのhostnameを追記
* hdfstabに記載したように`/data` directoryがmountされているか確認 (on the additional node)
* HDFS用directoryの確認 (もしmetadataが残っていたら削除)

```
[tomtan@ip-172-31-27-219 ~]$ clush -g dn -L  hostname
ip-172-31-17-244.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-19-163.ec2.internal: ip-172-31-19-163.ec2.internal <= New worker node
ip-172-31-29-73.ec2.internal: ip-172-31-29-73.ec2.internal

[tomtan@ip-172-31-19-163 ~]$ df -HT | grep /data
/dev/nvme1n1p1 xfs        35G   83M   35G   1% /data

[tomtan@ip-172-31-19-163 ~]$ ls -l /data/hadoop/
total 0
drwxrwxr-x 3 hdfs hadoop 16 Nov 23 06:04 hdfs

[tomtan@ip-172-31-19-163 ~]$ rm -rf /data/hadoop/hdfs/dn/current/
```

### Step3. Comission the worker node
以下ClientNodeで実施する。具体的な手順としては

1. [Creating workers file](3_3-setup-hadoop-configuration-files#creating-workers-file)で作成したファイルに新しいnodeのhostnameを追加する。
2. Adding the worker node to the cluster
3. Checking the running status

```
// 1. Adding the hostame of new node to workers
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L ". ~/.bash_profile; cat $HADOOP_HOME/etc/hadoop/workers"
ip-172-31-16-27.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-16-27.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-16-27.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-19-163.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-19-163.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-19-163.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-29-73.ec2.internal

[tomtan@ip-172-31-27-219 ~]$ clush -g all -L ". ~/.bash_profile; echo 'ip-172-31-19-163.ec2.internal' | sudo tee -a $HADOOP_HOME/etc/hadoop/workers"
ip-172-31-16-27.ec2.internal: ip-172-31-19-163.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-19-163.ec2.internal
ip-172-31-19-163.ec2.internal: ip-172-31-19-163.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-19-163.ec2.internal

[tomtan@ip-172-31-27-219 ~]$ clush -g all -L ". ~/.bash_profile; cat $HADOOP_HOME/etc/hadoop/workers"
ip-172-31-16-27.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-16-27.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-16-27.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-16-27.ec2.internal: ip-172-31-19-163.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-17-244.ec2.internal: ip-172-31-19-163.ec2.internal
ip-172-31-19-163.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-19-163.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-19-163.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-19-163.ec2.internal: ip-172-31-19-163.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-16-27.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-17-244.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-29-73.ec2.internal
ip-172-31-29-73.ec2.internal: ip-172-31-19-163.ec2.internal

// 2. Adding the worker node to the cluster
// DataNode
[tomtan@ip-172-31-27-219 ~]$ clush -w ip-172-31-19-163.ec2.internal "sudo su -c '. $HOME/.bash_profile; hdfs --daemon start datanode'"

[tomtan@ip-172-31-27-219 ~]$ clush -w ip-172-31-19-163.ec2.internal "sudo jps | grep -v Jps"
ip-172-31-19-163.ec2.internal: 17852 DataNode

[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". .bash_profile; hdfs dfsadmin -report | egrep 'Live|Name'"
Live datanodes (3):
Name: 172.31.17.244:9866 (ip-172-31-17-244.ec2.internal)
Name: 172.31.19.163:9866 (ip-172-31-19-163.ec2.internal)
Name: 172.31.29.73:9866 (ip-172-31-29-73.ec2.internal)

// NodeManager
[tomtan@ip-172-31-27-219 ~]$ clush -w ip-172-31-19-163.ec2.internal "sudo su -c '. $HOME/.bash_profile; yarn --daemon start nodemanager'"

[tomtan@ip-172-31-27-219 ~]$ clush -w ip-172-31-19-163.ec2.internal "sudo jps | grep -v Jps"
ip-172-31-19-163.ec2.internal: 18117 NodeManager
ip-172-31-19-163.ec2.internal: 17852 DataNode

[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; yarn node -list"
2020-11-30 04:55:42,474 INFO client.RMProxy: Connecting to ResourceManager at ip-172-31-16-27.ec2.internal/172.31.16.27:8032
Total Nodes:3
         Node-Id	     Node-State	Node-Http-Address	Number-of-Running-Containers
ip-172-31-17-244.ec2.internal:45413	        RUNNING	ip-172-31-17-244.ec2.internal:8042	                           0
ip-172-31-19-163.ec2.internal:36515	        RUNNING	ip-172-31-19-163.ec2.internal:8042	                           0
ip-172-31-29-73.ec2.internal:41361	        RUNNING	ip-172-31-29-73.ec2.internal:8042	                           0
```

最後に、[2. YARN Applicationの実行](3_4-running-hadoop-cluster#2-yarn-applicationの実行)と同様yarn applicationを実行して、問題ないか確認する。

```
[tomtan@ip-172-31-27-219 mapreduce]$ hadoop jar hadoop-mapreduce-examples-3.2.1.jar pi 10 100
Number of Maps  = 10
Samples per Map = 100
2020-11-30 04:09:30,046 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false
Wrote input for Map #0
...
2020-11-30 04:09:47,274 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false
Estimated value of Pi is 3.14800000000000000000
```

基本的には以上で稼働は問題ないが、必要であれば`$HADOOP_HOME/logs`における、起動時のDataNodeとNodeManagerのログを確認すると良い。

### Step4. Decommission the worker node
今度は先ほど追加したNodeをDecomissionする。まず事前に以下の2fileにおける各パラメータに正しい値が指定されていることを確認する。
* `hdfs-site.xml` -> `dfs.hosts.exclude`
* `yarn-site.xml` -> `yarn.resourcemanager.nodes.exclude-path`

```
[tomtan@ip-172-31-27-219 ~]$ cat $HADOOP_HOME/etc/hadoop/hdfs-site.xml | grep "dfs.hosts.exclude" -A 1
		<name>dfs.hosts.exclude</name>
		<value>/opt/hadoop-3.2.1/etc/hadoop/dfs.exclude</value>

[tomtan@ip-172-31-27-219 ~]$ cat $HADOOP_HOME/etc/hadoop/yarn-site.xml | grep "yarn.resourcemanager.nodes.exclude-path" -A 1
		<name>yarn.resourcemanager.nodes.exclude-path</name>
		<value>/opt/hadoop-3.2.1/etc/hadoop/yarn.exclude</value>
```

なおDecommissionの詳細については以下のドキュメントも参考にすると良い。
* [Apache Hadoop 3.2.1 – HDFS DataNode Admin Guide](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDataNodeAdminGuide.html)
* [Apache Hadoop 3.2.1 – Graceful Decommission of YARN Nodes](https://hadoop.apache.org/docs/stable/hadoop-yarn/hadoop-yarn-site/GracefulDecommission.html)

We'll decommission the DataNode firstly, and then decommission the NodeManager as follows.

#### Decommission the DataNode
NameNodeにおける`/opt/hadoop-3.2.1/etc/hadoop/dfs.exclude`にDecomissionするDataNodeのhostnameを記載する。今回は先ほどCommissionしたnodeを記載するが、複数ある場合は、行に渡って記載する。

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn ". ~/.bash_profile; echo 'ip-172-31-19-163.ec2.internal' | sudo tee -a /opt/hadoop-3.2.1/etc/hadoop/dfs.exclude"
ip-172-31-16-27.ec2.internal: ip-172-31-19-163.ec2.internal
```

その後Decommission処理を開始する。

```
[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; hdfs dfsadmin -refreshNodes"
Refresh nodes successful
```

Decommission処理がstartすると以下のように`Decommission in progress`となる (It will complete soon). 完了すると`Decommissioned`となる (Replication factorの関係で1 DataNodeさらに追加している)。

```
// Decommission in progress
[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; hdfs dfsadmin -report | grep Decommission -B 1"
Hostname: ip-172-31-17-244.ec2.internal
Decommission Status : Normal
--
Hostname: ip-172-31-19-163.ec2.internal
Decommission Status : Decommission in progress
--
Hostname: ip-172-31-25-166.ec2.internal
Decommission Status : Normal
--
Hostname: ip-172-31-29-73.ec2.internal
Decommission Status : Normal


[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; hdfs dfsadmin -report | grep Decommission -B 1"
Hostname: ip-172-31-17-244.ec2.internal
Decommission Status : Normal
--
Hostname: ip-172-31-19-163.ec2.internal
Decommission Status : Decommissioned
--
Hostname: ip-172-31-25-166.ec2.internal
Decommission Status : Normal
--
Hostname: ip-172-31-29-73.ec2.internal
Decommission Status : Normal
```

If your decommisioning DataNode is stuck, let's check [DataNode not decommisioning - Cloudera Community](https://community.cloudera.com/t5/Support-Questions/DataNode-not-decommisioning/td-p/176243).
> If the Replication factor >= no of datanodes currently and you try to decommission a data node , it may get stuck in Decommissioning state.

最後に対象のNodeにおけるDataNode processをshutdownする (YARNの場合、NodeManagerはdecommission時にshutdownされる)。

```
[tomtan@ip-172-31-27-219 ~]$ clush -w ip-172-31-19-163.ec2.internal "sudo su -c '. $HOME/.bash_profile; hdfs --daemon stop datanode'"
[tomtan@ip-172-31-27-219 ~]$ clush -w ip-172-31-19-163.ec2.internal "sudo jps"
ip-172-31-19-163.ec2.internal: 5000 NodeManager
ip-172-31-19-163.ec2.internal: 8758 Jps
```


#### Decommision the NodeManager
DataNodeの場合と同様に、NameNodeにおける`/opt/hadoop-3.2.1/etc/hadoop/yarn.exclude`にDecomissionするDataNodeのhostnameを記載する。

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn ". ~/.bash_profile; echo 'ip-172-31-19-163.ec2.internal' | sudo tee -a /opt/hadoop-3.2.1/etc/hadoop/yarn.exclude"
ip-172-31-16-27.ec2.internal: ip-172-31-19-163.ec2.internal

[tomtan@ip-172-31-27-219 ~]$ clush -g nn "cat /opt/hadoop-3.2.1/etc/hadoop/yarn.exclude"
ip-172-31-16-27.ec2.internal: ip-172-31-19-163.ec2.internal

[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; yarn rmadmin -refreshNodes"
2020-11-30 22:08:05,467 INFO client.RMProxy: Connecting to ResourceManager at ip-172-31-16-27.ec2.internal/172.31.16.27:8033

[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; yarn node -list"
2020-11-30 22:08:48,852 INFO client.RMProxy: Connecting to ResourceManager at ip-172-31-16-27.ec2.internal/172.31.16.27:8032
Total Nodes:3
         Node-Id	     Node-State	Node-Http-Address	Number-of-Running-Containers
ip-172-31-29-73.ec2.internal:35311	        RUNNING	ip-172-31-29-73.ec2.internal:8042	                           0
ip-172-31-25-166.ec2.internal:41819	        RUNNING	ip-172-31-25-166.ec2.internal:8042	                           0
ip-172-31-17-244.ec2.internal:44057	        RUNNING	ip-172-31-17-244.ec2.internal:8042	                           0
```

### Step5. Re-commission the worker node
先ほどDecommissionしたNode (hostname: `ip-172-31-19-163.ec2.internal`)を再度Commissionする。`dfs.exclude`および`yarn.exclude`におけるhostnameを削除し、`-refreshNodes`を実行する。

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn hostname
ip-172-31-16-27.ec2.internal: ip-172-31-16-27.ec2.internal
[tomtan@ip-172-31-27-219 ~]$ ssh ip-172-31-16-27.ec2.internal

// Remove the decommissioned hostname
[tomtan@ip-172-31-16-27 ~]$ cat /opt/hadoop-3.2.1/etc/hadoop/dfs.exclude
[tomtan@ip-172-31-16-27 ~]$ cat /opt/hadoop-3.2.1/etc/hadoop/yarn.exclude


// Re-commissioning DataNode
[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; hdfs dfsadmin -refreshNodes"
Refresh nodes successful

[tomtan@ip-172-31-27-219 ~]$ clush -w ip-172-31-19-163.ec2.internal "sudo su -c '. $HOME/.bash_profile; hdfs --daemon start datanode'"

[tomtan@ip-172-31-27-219 ~]$ clush -w ip-172-31-19-163.ec2.internal "sudo jps"
ip-172-31-19-163.ec2.internal: 9027 Jps
ip-172-31-19-163.ec2.internal: 8917 DataNode


// Re-commissioning NodeManager
[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; yarn rmadmin -refreshNodes"
2020-11-30 22:25:51,955 INFO client.RMProxy: Connecting to ResourceManager at ip-172-31-16-27.ec2.internal/172.31.16.27:8033

[tomtan@ip-172-31-27-219 ~]$ clush -w ip-172-31-19-163.ec2.internal "sudo su -c '. $HOME/.bash_profile; yarn --daemon start nodemanager'"

[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; yarn node -list"
2020-11-30 22:26:52,214 INFO client.RMProxy: Connecting to ResourceManager at ip-172-31-16-27.ec2.internal/172.31.16.27:8032
Total Nodes:4
         Node-Id	     Node-State	Node-Http-Address	Number-of-Running-Containers
ip-172-31-29-73.ec2.internal:35311	        RUNNING	ip-172-31-29-73.ec2.internal:8042	                           0
ip-172-31-25-166.ec2.internal:41819	        RUNNING	ip-172-31-25-166.ec2.internal:8042	                           0
ip-172-31-19-163.ec2.internal:36061	        RUNNING	ip-172-31-19-163.ec2.internal:8042	                           0
ip-172-31-17-244.ec2.internal:44057	        RUNNING	ip-172-31-17-244.ec2.internal:8042	                           0
```

### Step6. Rebalancing HDFS
You need to rebalance the storage of usage in HDFS after adding new worker node, because even if you add new node, the HDFS does NOT automatically rebalance the storage. Firstly we check the balance of the usage.

```
[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; hdfs dfsadmin -report | egrep 'Name|DFS\ Used%'"
DFS Used%: 0.07%
Name: 172.31.17.244:9866 (ip-172-31-17-244.ec2.internal) // <= unbalanced node
DFS Used%: 0.00%
Name: 172.31.19.163:9866 (ip-172-31-19-163.ec2.internal)
DFS Used%: 0.10%
Name: 172.31.25.166:9866 (ip-172-31-25-166.ec2.internal)
DFS Used%: 0.10%
Name: 172.31.29.73:9866 (ip-172-31-29-73.ec2.internal)
DFS Used%: 0.10%
```

We set the bandwidth which needs specifying data-transfer size among data nodes for rebalancing. In the following example, 100 MB is specified.

```
[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; hdfs dfsadmin -setBalancerBandwidth 104857600"
Balancer bandwidth is set to 104857600
```

Then, let's run `hdfs balancer` with the following threadhold. This threshold means Disk usage in each worker node for the averaged usage of the whole disk size of cluster (refer to [Apache Hadoop 3.2.1 – HDFS Commands Guide](http://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HDFSCommands.html#balancer)).
> -threshold threshold	Percentage of disk capacity. This overwrites the default threshold.

```
[tomtan@ip-172-31-27-219 ~]$ sudo su -c ". ~/.bash_profile; hdfs balancer -threshold 10"  // <= Set 10%
WARNING: /opt/hadoop-3.2.1/logs does not exist. Creating.
2020-11-30 22:53:12,861 INFO balancer.Balancer: Using a threshold of 10.0
2020-11-30 22:53:12,862 INFO balancer.Balancer: namenodes  = [hdfs://ip-172-31-16-27.ec2.internal:9000]
2020-11-30 22:53:12,863 INFO balancer.Balancer: parameters = Balancer.BalancerParameters [BalancingPolicy.Node, threshold = 10.0, max idle iteration = 5, #excluded nodes = 0, #included nodes = 0, #source nodes = 0, #blockpools = 0, run during upgrade = false]
2020-11-30 22:53:12,863 INFO balancer.Balancer: included nodes = []
2020-11-30 22:53:12,863 INFO balancer.Balancer: excluded nodes = []
2020-11-30 22:53:12,863 INFO balancer.Balancer: source nodes = []
Time Stamp               Iteration#  Bytes Already Moved  Bytes Left To Move  Bytes Being Moved
2020-11-30 22:53:13,681 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false
2020-11-30 22:53:13,884 INFO balancer.Balancer: dfs.balancer.movedWinWidth = 5400000 (default=5400000)
2020-11-30 22:53:13,884 INFO balancer.Balancer: dfs.balancer.moverThreads = 1000 (default=1000)
2020-11-30 22:53:13,884 INFO balancer.Balancer: dfs.balancer.dispatcherThreads = 200 (default=200)
2020-11-30 22:53:13,884 INFO balancer.Balancer: dfs.datanode.balance.max.concurrent.moves = 50 (default=50)
2020-11-30 22:53:13,884 INFO balancer.Balancer: dfs.balancer.getBlocks.size = 2147483648 (default=2147483648)
2020-11-30 22:53:13,884 INFO balancer.Balancer: dfs.balancer.getBlocks.min-block-size = 10485760 (default=10485760)
2020-11-30 22:53:13,889 INFO balancer.Balancer: dfs.balancer.max-size-to-move = 10737418240 (default=10737418240)
2020-11-30 22:53:13,889 INFO balancer.Balancer: dfs.blocksize = 134217728 (default=134217728)
2020-11-30 22:53:13,906 INFO net.NetworkTopology: Adding a new node: /default-rack/172.31.25.166:9866
...
Nov 30, 2020 10:53:13 PM Balancing took 1.215 seconds
```

## Updating Operations
Here's overview that we'll see below:

1. Stopping the cluster:
    1. `hdfs -daemon stop namenode`
    2. `hdfs -daemon stop datanode`
    3. `yarn -daemon stop nodemanager`
    4. `yarn -daemon stop resourcemanager`
    5. `mapred -daemon stop historyserver`
2. Changing the replication factor - `hdfs dfs -setrep`
3. Erasure Coding - `hdfs ec`
    1. Listing EC Policy - `hdfs ec -listPolicies`
    2. Enabling EC Policy - `hdfs ec -enablePolicy`
    3. Setting EC Policy - `hdfs ec -setPolicy/-getPolicy`
    4. Checking block groups and unsetting the policy - `hdfs ec -unsetPolicy`

### 1. Stopping the cluster
以下のサービス・手順で停止する (from the client node)。

1. HDFS: WMaster -> Worker
2. YARN: Worker -> Master
3. History server

```
$ clush -g nn "sudo su -c '. $HOME/.bash_profile; hdfs --daemon stop namenode'"
$ clush -g dn "sudo su -c '. $HOME/.bash_profile; hdfs --daemon stop datanode'"
$ clush -g dn "sudo su -c '. $HOME/.bash_profile; yarn --daemon stop nodemanager'"
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


### 2. Changing the replication factor - `hdfs dfs -setrep`
* Hot data - Replication factor = 3
* Cold data - Replication factor = 2 etc.

以下で具体例を確認する。まずは、対象のdirectoryとdefaultのreplication factorが適用されたファイルを作成する (ここでは`/user/tomtan`配下を操作しているので`tomtan` userで実施している。

```
[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -mkdir /user/tomtan/rep2
[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -put file01 /user/tomtan/rep2
2020-11-26 20:55:11,099 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false
[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -ls /user/tomtan/rep2
Found 1 items
-rw-r--r--   3 tomtan supergroup   10485760 2020-11-26 20:55 /user/tomtan/rep2/file01
// => The number of replicas shows "3" in this time.

```

以下のコマンドでreplication factorを変更する。ここでは`-w` wait optionを付与している。

```
[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -setrep -w 2 /user/tomtan/rep2
Replication 2 set: /user/tomtan/rep2/file01
Waiting for /user/tomtan/rep2/file01 ... done
```

以下のようにreplica数が "2" となっていることが確認できる。

```
[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -ls /user/tomtan/rep2
Found 1 items
-rw-r--r--   2 tomtan supergroup   10485760 2020-11-26 20:55 /user/tomtan/rep2/file01
```


## Basic Monitoring Operations
Here's overview that we'll see below:

1. Checking the cluster service status - `jps`
2. Showing the hadoop version - `hadoop version`
3. Checking each node status - `hdfs dfsadmin -report`
4. Showing the running duration of DataNode service - `hdfs dfsadmin -getDatanodeInfo`
5. Checking block status - `hdfs dfsadmin -metasave`
6. Checking HDFS block status - `hdfs fsck`


