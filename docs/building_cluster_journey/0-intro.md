---
id: 0-intro
title: Building Cluster Journey
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
1. Hadoop 3 (Currently working)
2. Spark cluster
    1. Spark on Standalone
    2. Spark on Hadoop/YARN
    3. Spark on Kubernetes
3. Hive on Hadoop/YARN
4. Presto
5. Kafka cluster


## Environment
Here's the detail which you need to prepare when you build a cluster:
* Amazon EC2 instances
    * us-east-1
    * AmazonLinux2 (AMI ID: )
* `clush` command