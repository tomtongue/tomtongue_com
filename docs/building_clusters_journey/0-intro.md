---
id: 0-intro
title: Building Clusters Journey
sidebar_label: Introduction
---


This doc is about how we build "BigData" related clusters such as Hadoop, Spark, Kafka etc. Specifically we'll look into following clusters:
* Hadoop 3 cluster
* Spark cluster:
    * Spark on Standalone
    * Spark on Hadoop/YARN
    * Spark on Kubernetes
* Hive on Hadoop/YARN
* Presto
* Kafka

Note that we're using Apache licensed software for these projects except for Presto.

## Contents (& Progress)
1. Hadoop 3 **Under construction**
2. Spark cluster
    1. Spark on Standalone **Under construction**
    2. Spark on Hadoop/YARN **Under construction**
    3. Spark on Kubernetes (Not yet)
3. Hive on Hadoop/YARN (Not yet)
4. Presto (Not yet)
5. Kafka cluster (Not yet)


## Environment
Here's the detail which you need to prepare when you build a cluster:
* Amazon EC2 instances
    * us-east-1
    * AmazonLinux2 (AMI ID: `ami-0947d2ba12ee1ff75`)
    * Instance type: m5.xlarge
* `clush` command - version: `clush 1.8.3`

## Reference
* https://book.impress.co.jp/books/1116101090 (Partially referred)
* https://spark.apache.org/docs/latest/index.html