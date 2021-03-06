---
id: 2_2-running-spark-app-on-yarn
title: '2-2. Running Spark applications on YARN'
sidebar_label: '2-2. Running Spark applications on YARN'
---

In this section, we'll build and run Scala-Spark/PySpark applications using [LearningSparkV2/chapter2 at master · databricks/LearningSparkV2 · GitHub](https://github.com/databricks/LearningSparkV2/tree/master/chapter2). 

## 1. Running Scala-Spark
### 1-1. Preparation
In this part, we'll develop a Scala-Spark application with `sbt` (about installing the `sbt` on your EC2 instance, please refer to https://www.scala-sbt.org/1.x/docs/Installing-sbt-on-Linux.html). Before building the application, note the supported Scala version at [here](https://spark.apache.org/docs/latest/).
> Spark runs on Java 8/11, Scala 2.12, Python 2.7+/3.4+ and R 3.5+. Java 8 prior to version 8u92 support is deprecated as of Spark 3.0.0. Python 2 and Python 3 prior to version 3.6 support is deprecated as of Spark 3.0.0. For the Scala API, Spark 3.0.1 uses Scala 2.12. You will need to use a compatible Scala version (2.12.x).

```
[tomtan@ip-172-31-27-219 ~]$ curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo
[tomtan@ip-172-31-27-219 ~]$ sudo yum install -y sbt
Installed:
  sbt.noarch 0:1.4.4-0

Complete!
[tomtan@ip-172-31-27-219 ~]$ sbt -version
sbt version in this project: 1.4.4
sbt script version: 1.4.4

[tomtan@ip-172-31-27-219 ~]$ sudo yum install -y git
```

Then, we clone the repository.

```
[tomtan@ip-172-31-27-219 ~]$ git clone https://github.com/databricks/LearningSparkV2.git
[tomtan@ip-172-31-27-219 ~]$ ls -a | grep LearningSpark
LearningSparkV2
```

After the cloning the repo, we put the sample dataset; `./LearningSparkV2/chapter2/scala/data/mnm_dataset.csv` on HDFS as follows:

```
[tomtan@ip-172-31-27-219 data]$ hdfs dfs -mkdir /user/tomtan/spark-mnm-count
[tomtan@ip-172-31-27-219 data]$ hdfs dfs -put mnm_dataset.csv /user/tomtan/spark-mnm-count/
[tomtan@ip-172-31-27-219 data]$ hdfs dfs -ls /user/tomtan/spark-mnm-count/
Found 1 items
-rw-r--r--   3 tomtan supergroup    1284872 2020-12-02 02:31 /user/tomtan/spark-mnm-count/mnm_dataset.csv
```

### 1-2. Building the Scala package
Before building the application, we update the `build.sbt` for the compatiblity with our cluster environment.

```scala
//name of the package
name := "main/scala/chapter2"
//version of our package
version := "1.0"
//version of Scala
scalaVersion := "2.12.10"
// spark library dependencies
// change this to 3.0.0 when released
libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-core" % "3.0.1",
  "org.apache.spark" %% "spark-sql"  % "3.0.1"
)
```

Then, let's build the package with `sbt`.

```
[tomtan@ip-172-31-27-219 scala]$ sbt clean package
[info] Updated file /home/tomtan/LearningSparkV2/chapter2/scala/project/build.properties: set sbt.version to 1.4.4
[info] welcome to sbt 1.4.4 (Oracle Corporation Java 1.8.0_265)
...
[info]   Compilation completed in 8.873s.
[success] Total time: 16 s, completed Dec 2, 2020 2:34:40 AM

[tomtan@ip-172-31-27-219 scala]$ ls -a target/scala-2.12/ | grep jar
main-scala-chapter2_2.12-1.0.jar
```

### 1-3. Running the application
Finally, let's run your code via `spark-submit`!

```
[tomtan@ip-172-31-27-219 scala]$ pwd
/home/tomtan/LearningSparkV2/chapter2/scala

[tomtan@ip-172-31-27-219 ~]$ spark-submit \
--class main.scala.chapter2.MnMcount \
--master yarn \
--deploy-mode cluster \
--num-executors 1 \
--executor-cores 2 \
./target/scala-2.12/main-scala-chapter2_2.12-1.0.jar "hdfs://ip-172-31-16-27.ec2.internal:9000/user/tomtan/spark-mnm-count/mnm_dataset.csv"

...
2020-12-02 02:38:54,327 INFO yarn.Client:
	 client token: N/A
	 diagnostics: N/A
	 ApplicationMaster host: ip-172-31-29-73.ec2.internal
	 ApplicationMaster RPC port: 34357
	 queue: default
	 start time: 1606876709255
	 final status: SUCCEEDED
	 tracking URL: http://ip-172-31-16-27.ec2.internal:8088/proxy/application_1606714713076_0003/
	 user: tomtan
2020-12-02 02:38:54,334 INFO util.ShutdownHookManager: Shutdown hook called
...
```

You will be able to get the following results with `yarn logs`, if it runs successfully:

```
***********************************************************************

Container: container_1606714713076_0003_01_000001 on ip-172-31-29-73.ec2.internal_35311
LogAggregationType: AGGREGATED
=======================================================================================
LogType:stdout
LogLastModifiedTime:Wed Dec 02 02:38:55 +0000 2020
LogLength:2157
LogContents:
+-----+------+-----+
|State|Color |Count|
+-----+------+-----+
|TX   |Red   |20   |
|NV   |Blue  |66   |
|CO   |Blue  |79   |
|OR   |Blue  |71   |
|WA   |Yellow|93   |
+-----+------+-----+
only showing top 5 rows

+-----+------+----------+
|State| Color|sum(Count)|
+-----+------+----------+
|   CA|Yellow|    100956|
// omitted ...
|   WY|Yellow|     87800|
|   WY| Brown|     86110|
+-----+------+----------+

Total Rows = 60

+-----+------+----------+
|State| Color|sum(Count)|
+-----+------+----------+
|   CA|Yellow|    100956|
|   CA| Brown|     95762|
|   CA| Green|     93505|
|   CA|   Red|     91527|
|   CA|Orange|     90311|
|   CA|  Blue|     89123|
+-----+------+----------+


End of LogType:stdout
***********************************************************************
```

## 2. Running PySpark
As same as the first one, we run the application with PySpark. The default python version of EC2 instance is `Python 2.7.18`. Basically Python3 should be used in the current PySpark. However the sample code is also compatible with Python2. Therefore, we'll use it without any changes. If you want to use Python3 on your machine, please update that version.

Let's run the `mnmcount.py` as follows.

```
[tomtan@ip-172-31-27-219 src]$ pwd
/home/tomtan/LearningSparkV2/chapter2/py/src

[tomtan@ip-172-31-27-219 ~]$ spark-submit \
--master yarn \
--deploy-mode cluster \
--num-executors 1 \
--executor-cores 2 \
mnmcount.py "hdfs://ip-172-31-16-27.ec2.internal:9000/user/tomtan/spark-mnm-count/mnm_dataset.csv"

...
2020-12-02 02:58:44,730 INFO yarn.Client:
	 client token: N/A
	 diagnostics: N/A
	 ApplicationMaster host: ip-172-31-27-178.ec2.internal
	 ApplicationMaster RPC port: 43783
	 queue: default
	 start time: 1606877903666
	 final status: SUCCEEDED
	 tracking URL: http://ip-172-31-16-27.ec2.internal:8088/proxy/application_1606714713076_0004/
	 user: tomtan
2020-12-02 02:58:44,737 INFO util.ShutdownHookManager: Shutdown hook called
2020-12-02 02:58:44,738 INFO util.ShutdownHookManager: Deleting directory /tmp/spark-724a01a3-d72f-42bf-949e-de1215f87bff
2020-12-02 02:58:44,740 INFO util.ShutdownHookManager: Deleting directory /tmp/spark-35966e59-4801-458d-a9ce-0d5230edc998
```

Then, you can get the same result.

## 3. Running a Streaming application
In this section, we'll create a streaming processing application with "Structured Streaming". Structured streaming is one of the component in Apache Spark. This component is built on tops of the SparkSQL abstraction as the following diagram. We don't see the details of each Spark components in this session. If you want to learn about streaming components, the following resources should be very helpful.
* [Stream Processing with Apache Spark Book](https://www.oreilly.com/library/view/stream-processing-with/9781491944233/)
* [Spark: The Definitive Guide Book](https://www.oreilly.com/library/view/spark-the-definitive/9781491912201/)
* [Learning Spark, 2nd Edition Book](https://www.oreilly.com/library/view/learning-spark-2nd/9781492050032/)

![](/docs/building_clusters_journey/2-hadoop_2.png)

### 3-1. Preparation
We'll use csv FileSource for the streaming application in this section. The csv file source needs schema (you cannot use `inferSchem` option). Therefore, firstly we put the partial sample data which we used in the previous secion, on HDFS. In the streaming application, we'll extract the schema with DataFrame.

```
[tomtan@ip-172-31-27-219 ~]$ cat partial_mnm_ds.csv
State,Color,Count
TX,Red,20
NV,Blue,66
CO,Blue,79
OR,Blue,71
[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -put partial_mnm_ds.csv /user/tomtan/streaming
2020-12-02 20:28:46,501 INFO sasl.SaslDataTransferClient: SASL encryption trust check: localHostTrusted = false, remoteHostTrusted = false
[tomtan@ip-172-31-27-219 ~]$ hdfs dfs -ls /user/tomtan/streaming
Found 1 items
-rw-r--r--   3 tomtan supergroup         61 2020-12-02 20:28 /user/tomtan/streaming/partial_mnm_ds.csv
```

### 3-2. Running Structured Streaming with Scala
Here's the streaming application code. In this case, you just run these code thorough `spark-shell` consol. The first code means getting the file schema with DataFrame `inferSchema` option. Using this schema, we process the data which is put on HDFS.

```scala
val schema = spark.read.format("csv").
option("inferSchema", true).
option("header", true).
load("hdfs://ip-172-31-16-27.ec2.internal:9000/user/tomtan/streaming").schema
// > schema: org.apache.spark.sql.types.StructType = StructType(StructField(State,StringType,true), StructField(Color,StringType,true), StructField(Count,IntegerType,true))

val csvStream = spark.readStream.
format("csv").
schema(schema).
load("hdfs://ip-172-31-16-27.ec2.internal:9000/user/tomtan/streaming")
// > csvStream: org.apache.spark.sql.DataFrame = [State: string, Color: string ... 1 more field]

val caCountMnNDF = csvStream.select("*").
where(col("State") === "CA").
groupBy("State", "Color").
sum("Count").
orderBy(desc("sum(Count)"))
// > caCountMnNDF: org.apache.spark.sql.Dataset[org.apache.spark.sql.Row] = [State: string, Color: string ... 1 more field]

import org.apache.spark.sql.streaming.Trigger
// > import org.apache.spark.sql.streaming.Trigger

val streamingQuery = caCountMnNDF.writeStream.
format("console").
outputMode("complete").
trigger(Trigger.ProcessingTime("10 seconds")).
option("checkpointLocation", "hdfs://ip-172-31-16-27.ec2.internal:9000/user/tomtan/streaming-checkpoint/").
start()
// > streamingQuery: org.apache.spark.sql.streaming.StreamingQuery = org.apache.spark.sql.execution.streaming.StreamingQueryWrapper@181ae1b4

streamingQuery.awaitTermination()
```

After running the above code, we put the `mnm_dataset.csv` on the `/user/tomtan/streaming` directory on HDFS. Then, the streaming application processes the data, and you can get the following result.

```
[tomtan@ip-172-31-27-219 data]$ hdfs dfs -put mnm_dataset.csv /user/tomtan/streaming/

// Processing result
-------------------------------------------
Batch: 1
-------------------------------------------
+-----+------+----------+
|State| Color|sum(Count)|
+-----+------+----------+
|   CA|Yellow|    100956|
|   CA| Brown|     95762|
|   CA| Green|     93505|
|   CA|   Red|     91527|
|   CA|Orange|     90311|
|   CA|  Blue|     89123|
+-----+------+----------+

```