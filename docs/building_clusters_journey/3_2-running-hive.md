---
id: 3_2-running-hive
title: '3-2. Running Hive on Hadoop 3'
sidebar_label: '3-2. Running Hive on Hadoop 3'
---

:::caution
This page is still under construction. 
:::

## 1. Running Hive
SchemaToolを使用し、MetaStore用Dataaseを構成する。MasterNodeで行う。

```
[tomtan@ip-172-31-16-27 ~]$ sudo su -c ". .bash_profile; schematool -dbType mysql -initSchema"
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/opt/apache-hive-3.1.2-bin/lib/log4j-slf4j-impl-2.10.0.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/opt/hadoop-3.2.1/share/hadoop/common/lib/slf4j-log4j12-1.7.25.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [org.apache.logging.slf4j.Log4jLoggerFactory]
Metastore connection URL:	 jdbc:mysql://ip-172-31-25-230.ec2.internal/metastore
Metastore Connection Driver :	 com.mysql.jdbc.Driver
Metastore connection User:	 hive
Starting metastore schema initialization to 3.1.0
Initialization script hive-schema-3.1.0.mysql.sql

...

Initialization script completed
schemaTool completed
```

次にMetaStoreVM -> HiveServer2の順で起動する。

```
[root@ip-172-31-16-27 tomtan]# hive --service metastore &
[root@ip-172-31-16-27 tomtan]# hive --service hiveserver2 &
```

ClinetNodeからHiveCLI/beelineを実行できることを確認する。

```
[tomtan@ip-172-31-27-219 ~]$ hive
...
Logging initialized using configuration in jar:file:/opt/apache-hive-3.1.2-bin/lib/hive-common-3.1.2.jar!/hive-log4j2.properties Async: true
Hive Session ID = 4946052d-224f-4d6f-a976-bb800478b1c4
Hive-on-MR is deprecated in Hive 2 and may not be available in the future versions. Consider using a different execution engine (i.e. spark, tez) or using Hive 1.X releases.
hive> show databases;
OK
default
Time taken: 0.578 seconds, Fetched: 1 row(s)


[tomtan@ip-172-31-27-219 ~]$ beeline -u jdbc:hive2://
0: jdbc:hive2://> show databases;
OK
+----------------+
| database_name  |
+----------------+
| default        |
+----------------+
1 row selected (1.055 seconds)

??? `jdbc:hive2://host:10000/default`とすると失敗するのなぜ。
```

ちなみにMySQLの`metastore` databaseにおける`TBL`を確認すると以下のように`default` tableの存在を確認できる。

```
MariaDB [metastore]> select * from DBS;
+-------+-----------------------+--------------------------------------------------------------+---------+------------+------------+-----------+
| DB_ID | DESC                  | DB_LOCATION_URI                                              | NAME    | OWNER_NAME | OWNER_TYPE | CTLG_NAME |
+-------+-----------------------+--------------------------------------------------------------+---------+------------+------------+-----------+
|     1 | Default Hive database | hdfs://ip-172-31-16-27.ec2.internal:9000/user/hive/warehouse | default | public     | ROLE       | hive      |
+-------+-----------------------+--------------------------------------------------------------+---------+------------+------------+-----------+
1 row in set (0.00 sec)
```

## 2. Running Hive queries
最後にChapter5で使用したデータに対してクエリを実行する。まずは以下のようにTableを作成する。

```
[tomtan@ip-172-31-27-219 ~]$ beeline -u jdbc:hive2://
...
Beeline version 3.1.2 by Apache Hive
0: jdbc:hive2://> USE default;
OK
No rows affected (0.869 seconds)

0: jdbc:hive2://> 
CREATE TABLE mnm_count(
  state STRING,
  color STRING,
  count INT)
ROW FORMAT DELIMITED
  FIELDS TERMINATED BY ','
  ESCAPED BY '\\'
  LINES TERMINATED BY '\n'
LOCATION 'hdfs:///user/tomtan/streaming/'
TBLPROPERTIES("skip.header.line.count" = "1");
OK
No rows affected (0.33 seconds)

0: jdbc:hive2://> SHOW TABLES;
OK
+------------+
|  tab_name  |
+------------+
| mnm_count  |
+------------+
1 row selected (0.235 seconds)
```

最後にHive queriesを実行する。1つ目は単純な`SELECT` query、2つ目は[3. Running a Streaming application](5_2-running-spark-app-on-yarn#3-2-running-structured-streaming-with-scala)で実行したものと同様の処理を行っている (`#2`については結果も一致している)。

```
// #1
0: jdbc:hive2://> SELECT * FROM mnm_count LIMIT 5;
OK
+------------------+------------------+------------------+
| mnm_count.state  | mnm_count.color  | mnm_count.count  |
+------------------+------------------+------------------+
| TX               | Red              | 20               |
| NV               | Blue             | 66               |
| CO               | Blue             | 79               |
| OR               | Blue             | 71               |
| WA               | Yellow           | 93               |
+------------------+------------------+------------------+
5 rows selected (1.447 seconds)


// #2
0: jdbc:hive2://>
SELECT state, color, sum(count) AS sum_count FROM mnm_count 
WHERE state='CA'
GROUP BY state, color
ORDER BY sum_count DESC;
...
Total MapReduce CPU Time Spent: 10 seconds 930 msec
OK
+--------+---------+------------+
| state  |  color  | sum_count  |
+--------+---------+------------+
| CA     | Yellow  | 100956     |
| CA     | Brown   | 95762      |
| CA     | Green   | 93505      |
| CA     | Red     | 91527      |
| CA     | Orange  | 90311      |
| CA     | Blue    | 89123      |
+--------+---------+------------+
6 rows selected (36.606 seconds)
```

## Troubleshoot
### `java.lang.NoSuchMethodError: com.google.common.base.Preconditions.checkArgument`
Ref: https://issues.apache.org/jira/browse/HIVE-22915

```
[tomtan@ip-172-31-27-219 lib]$ pwd
/opt/apache-hive-3.1.2-bin/lib
[tomtan@ip-172-31-27-219 lib]$ ls -a | grep guava
guava-19.0.jar


[tomtan@ip-172-31-27-219 lib]$ pwd
/opt/hadoop-3.2.1/share/hadoop/hdfs/lib
[tomtan@ip-172-31-27-219 lib]$ ls -a | grep guava-
guava-27.0-jre.jar


[tomtan@ip-172-31-27-219 lib]$ cd /opt/apache-hive-3.1.2-bin/lib
[tomtan@ip-172-31-27-219 lib]$ sudo mv guava-19.0.jar ~
[tomtan@ip-172-31-27-219 lib]$ sudo cp /opt/hadoop-3.2.1/share/hadoop/hdfs/lib/guava-27.0-jre.jar .
[tomtan@ip-172-31-27-219 lib]$ ls -l | grep guava-27
-rw-r--r-- 1 root root  2747878 Dec  5 20:38 guava-27.0-jre.jar
```