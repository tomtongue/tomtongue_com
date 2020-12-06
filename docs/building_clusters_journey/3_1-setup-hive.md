---
id: 3_1-setup-hive
title: '3-1. Setup Apache Hive'
sidebar_label: '3-1. Setup Apache Hive'
---

:::caution
This page is still under construction. 
:::

## Overview
1. Preparation
2. Configuration of Hive
3. Running Hive
4. Running a Hive query

### Condition
* Apache Hive 3.1.2 - [Release note](https://hive.apache.org/downloads.html)
* Meta store - [MariaDB - a community-developed fork of MySQL](https://mariadb.org/about/) 



## 1. Preparation
* Apache Hive 3.1.2
* MariaDB
* JDBC Driver for MySQL

### 1-1. Setup Hive

```
[tomtan@ip-172-31-27-219 ~]$ wget https://mirrors.whoishostingthis.com/apache/hive/hive-3.1.2/apache-hive-3.1.2-bin.tar.gz
[tomtan@ip-172-31-27-219 ~]$ sudo tar -xzf apache-hive-3.1.2-bin.tar.gz -C /opt/

// Copy
[tomtan@ip-172-31-27-219 ~]$ clush -g all -c apache-hive-3.1.2-bin.tar.gz --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo tar -xzf apache-hive-3.1.2-bin.tar.gz -C /opt/"
```

`.bash_profile`に以下の内容を追記し、各nodeにcopyする。

```
[tomtan@ip-172-31-27-219 ~]$ cat .bash_profile | tail -3
# Hive
export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
export PATH=$HIVE_HOME/bin:$PATH

[tomtan@ip-172-31-27-219 ~]$ clush -g all -c .bash_profile --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all "cat .bash_profile | tail -3"
ip-172-31-27-178.ec2.internal: # Hive
ip-172-31-27-178.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-27-178.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-29-73.ec2.internal: # Hive
ip-172-31-29-73.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-29-73.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-25-166.ec2.internal: # Hive
ip-172-31-25-166.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-25-166.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-16-27.ec2.internal: # Hive
ip-172-31-16-27.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-16-27.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-17-244.ec2.internal: # Hive
ip-172-31-17-244.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-17-244.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-19-163.ec2.internal: # Hive
ip-172-31-19-163.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-19-163.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH

// root
[tomtan@ip-172-31-27-219 ~]$ sudo su -c "echo -e 'export HIVE_HOME=/opt/apache-hive-3.1.2-bin/\nexport PATH=\$HIVE_HOME/bin:\$PATH'| tee -a /root/.bash_profile"
export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
export PATH=$HIVE_HOME/bin:$PATH

[tomtan@ip-172-31-27-219 ~]$ sudo cat /root/.bash_profile | tail -2
export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
export PATH=$HIVE_HOME/bin:$PATH

[tomtan@ip-172-31-27-219 ~]$ clush -g all "echo -e 'export HIVE_HOME=/opt/apache-hive-3.1.2-bin/\nexport PATH=\$HIVE_HOME/bin:\$PATH' | sudo tee -a /root/.bash_profile"
ip-172-31-16-27.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-16-27.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-19-163.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-19-163.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-29-73.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-29-73.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-25-166.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-25-166.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-17-244.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-17-244.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
ip-172-31-27-178.ec2.internal: export HIVE_HOME=/opt/apache-hive-3.1.2-bin/
ip-172-31-27-178.ec2.internal: export PATH=$HIVE_HOME/bin:$PATH
```

Create an AMI based on this image.

### 1-2. Installing MariaDB and connector
If you need MariaDB server and mysql client, you can install them as follows (mysql client is included in the package).

```
$ sudo yum install -y mariadb-server
```

`/etc`

```
[tomtan@ip-172-31-25-230 etc]$ ls -la| grep my.cnf
-rw-r--r--  1 root root      570 Oct 15 21:19 my.cnf
drwxr-xr-x  2 root root       67 Dec  4 00:29 my.cnf.d

[tomtan@ip-172-31-25-230 etc]$ cat my.cnf
[mysqld]
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
# Settings user and group are ignored when systemd is used.
# If you need to run mysqld under a different user or group,
# customize your systemd unit file for mariadb according to the
# instructions in http://fedoraproject.org/wiki/Systemd

[mysqld_safe]
log-error=/var/log/mariadb/mariadb.log
pid-file=/var/run/mariadb/mariadb.pid

#
# include all files from the config directory
#
!includedir /etc/my.cnf.d
```

Run MariaDB with `systemctl` and enable auto-start.

```
[tomtan@ip-172-31-25-230 ~]$ sudo systemctl start mariadb
[tomtan@ip-172-31-25-230 ~]$ sudo systemctl status mariadb | grep Active
   Active: active (running) since Sat 2020-12-05 18:30:03 UTC; 24s ago

[tomtan@ip-172-31-25-230 ~]$ sudo systemctl enable mariadb
Created symlink from /etc/systemd/system/multi-user.target.wants/mariadb.service to /usr/lib/systemd/system/mariadb.service.
```

Initial config of MariaDB

```
[tomtan@ip-172-31-25-230 ~]$ sudo mysql_secure_installation

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!
... Omitted ...

Setting the root password ensures that nobody can log into the MariaDB
root user without the proper authorisation.

Set root password? [Y/n] Y
New password:
... Omitted ...
 ... Success!


By default, a MariaDB installation has an anonymous user, allowing anyone
... Omitted ...

Remove anonymous users? [Y/n] Y
 ... Success!

Normally, root should only be allowed to connect from 'localhost'.  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n] Y
 ... Success!

By default, MariaDB comes with a database named 'test' that anyone can
access.  This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n] Y
 - Dropping test database...
 ... Success!
 - Removing privileges on test database...
 ... Success!

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n] Y
 ... Success!

Cleaning up...

All done!  If you've completed all of the above steps, your MariaDB
installation should now be secure.

Thanks for using MariaDB!
```

Test connection

```
[tomtan@ip-172-31-25-230 ~]$ mysql -u root -e "SHOW DATABASES;" -p
Enter password:
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
```

最後にHiveからMariaDBに接続するためのconnectorをinstallする。今回はMasterNodeにHiveserver2を起動する予定なので、MasterNodeにinstallする (以下ではClientNodeから行っている)。

```
[tomtan@ip-172-31-27-219 ~]$ clush -g nn "sudo yum -y install mysql-connector-java"
ip-172-31-16-27.ec2.internal: Loaded plugins: extras_suggestions, langpacks, priorities, update-motd
...
ip-172-31-16-27.ec2.internal: Complete!

// Create the symbolic link
[tomtan@ip-172-31-16-27 ~]$ sudo ln -s \
/usr/share/java/mysql-connector-java.jar \
/opt/apache-hive-3.1.2-bin/lib/mysql-connector-java.jar
```

### 1-3. Creating `metastore` database & `hive` user for Hive
MariaDBに`root` user経由でログインし、`metastore` database, `hive` userを作成する。`hive` userのhostnameは Metastore (VM)のhostnameとする。この場合はMasterNodeのhostname: `ip-172-31-16-27.ec2.internal`を指定している。

```
[tomtan@ip-172-31-25-230 ~]$ mysql -u root -p
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 16
Server version: 5.5.68-MariaDB MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> CREATE DATABASE metastore;
Query OK, 1 row affected (0.00 sec)

MariaDB [(none)]> USE metastore;
Database changed
MariaDB [metastore]> CREATE USER 'hive'@'ip-172-31-16-27.ec2.internal' IDENTIFIED BY '******';
Query OK, 0 rows affected (0.00 sec)

MariaDB [metastore]> REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'hive'@'ip-172-31-16-27.ec2.internal';
Query OK, 0 rows affected (0.00 sec)

MariaDB [metastore]> GRANT ALL PRIVILEGES ON metastore.* TO 'hive'@'ip-172-31-16-27.ec2.internal';
Query OK, 0 rows affected (0.00 sec)

MariaDB [metastore]> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)

// Or
[tomtan@ip-172-31-25-230 ~]$ mysql -u root -p '******' < ./hive-grant.sql
```

念のためMasterNodeから`hive` user経由でMariaDBに接続できるか確認する。

```
[tomtan@ip-172-31-16-27 ~]$ mysql -h ip-172-31-25-230.ec2.internal -u hive -e "SHOW DATABASES;" -p
Enter password:
+--------------------+
| Database           |
+--------------------+
| information_schema |
| metastore          |
+--------------------+
```

## 2. Configuration of Hive
`hive-site.xml`における以下のparameterを変更する。

* `javax.jdo.option.ConnectionURL`
* `javax.jdo.option.ConnectionDriverName`
* `javax.jdo.option.ConnectionUserName`
* `javax.jdo.option.ConnectionPassword`
* `hive.metastore.uris`
* `system:java.io.tmpdir`
* `system:user.name`


ClientNodeにおいて、以下の通り`hive-site.xml`を変更する。`system:`についてはthe beginning of `hdfs-site.xml`に記載する必要がある (Ref: [hadoop - java.net.URISyntaxException when starting HIVE - Stack Overflow](https://stackoverflow.com/questions/27099898/java-net-urisyntaxexception-when-starting-hive))。

```xml
<!-- hive-site.xml -->
  <property>
	  <name>system:java.io.tempdir</name>
	  <value>/tmp/hive/java</value>
  </property>
  <property>
	  <name>system:user.name</name>
	  <value>${user.name}</value>
  </property>  
  <!-- omitted -->
  <property>
    <name>javax.jdo.option.ConnectionPassword</name>
    <value>*******</value>
    <description>password to use against metastore database</description>
  </property>
  <!-- omitted -->
  <property>
    <name>javax.jdo.option.ConnectionURL</name>
    <value>jdbc:mysql://ip-172-31-25-230.ec2.internal/metastore</value>
    <description>
      JDBC connect string for a JDBC metastore.
      To use SSL to encrypt/authenticate the connection, provide database-specific SSL flag in the connection URL.
      For example, jdbc:postgresql://myhost/db?ssl=true for postgres database.
    </description>
  </property>
  <property>
    <name>javax.jdo.option.ConnectionDriverName</name>
    <value>com.mysql.jdbc.Driver</value>
    <description>Driver class name for a JDBC metastore</description>
  </property>
  <!-- omitted -->
  <property>
    <name>javax.jdo.option.ConnectionUserName</name>
    <value>hive</value>
    <description>Username to use against metastore database</description>
  </property>
  <!-- omitted -->
  <property>
    <name>hive.metastore.uris</name>
    <value>thrift://ip-172-31-16-27.ec2.internal:9083/</value>
    <description>Thrift URI for the remote metastore. Used by metastore client to connect to remote metastore.</description>
  </property>
  <!-- omitted -->
```

また以下の部分`Exclusive locks for&#8;transactional tables`部分にあるURL文字を削除しておく。`Illegal character entity`で`schemaTool`が失敗する。

```xml
  <property>
    <name>hive.txn.xlock.iow</name>
    <value>true</value>
    <description>
      Ensures commands with OVERWRITE (such as INSERT OVERWRITE) acquire Exclusive locks for transactional tables.  This ensures that inserts (w/o overwrite) running concurrently
      are not hidden by the INSERT OVERWRITE.
    </description>
  </property>
```


上記ファイルを全Nodeにcopyする。

```
[tomtan@ip-172-31-27-219 ~]$ clush -g all -c /opt/apache-hive-3.1.2-bin/conf/hive-site.xml --dest=~
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo mv ~/hive-site.xml /opt/apache-hive-3.1.2-bin/conf"
[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "sudo chown root:root /opt/apache-hive-3.1.2-bin/conf/hive-site.xml"

[tomtan@ip-172-31-27-219 ~]$ clush -g all -L "ls -l /opt/apache-hive-3.1.2-bin/conf | grep hive-site"
ip-172-31-16-27.ec2.internal: -rw-r--r-- 1 root root 300717 Dec  5 19:49 hive-site.xml
ip-172-31-17-244.ec2.internal: -rw-r--r-- 1 root root 300717 Dec  5 19:49 hive-site.xml
ip-172-31-19-163.ec2.internal: -rw-r--r-- 1 root root 300717 Dec  5 19:49 hive-site.xml
ip-172-31-25-166.ec2.internal: -rw-r--r-- 1 root root 300717 Dec  5 19:49 hive-site.xml
ip-172-31-27-178.ec2.internal: -rw-r--r-- 1 root root 300717 Dec  5 19:49 hive-site.xml
ip-172-31-29-73.ec2.internal: -rw-r--r-- 1 root root 300717 Dec  5 19:49 hive-site.xml


[tomtan@ip-172-31-27-219 ~]$ scp /opt/apache-hive-3.1.2-bin/conf/hive-site.xml tomtan@ip-172-31-25-230.ec2.internal:~
[tomtan@ip-172-31-25-230 ~]$ sudo mv hive-site.xml /opt/apache-hive-3.1.2-bin/conf/
[tomtan@ip-172-31-25-230 ~]$ sudo chown root:root /opt/apache-hive-3.1.2-bin/conf/hive-site.xml
[tomtan@ip-172-31-25-230 ~]$ ls -l /opt/apache-hive-3.1.2-bin/conf/hive-site.xml
-rw-r--r-- 1 root root 300717 Dec  5 19:56 /opt/apache-hive-3.1.2-bin/conf/hive-site.xml
```

`hive-site.xml`における`system:java.io.tempdir`で記述した`tmp/hive/java` dirに対する設定を行う。

```
[tomtan@ip-172-31-27-219 ~]$ sudo mkdir -p /tmp/hive/java
[tomtan@ip-172-31-27-219 ~]$ sudo chmod 1777 /tmp/hive/java

[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo mkdir -p /tmp/hive/java"
[tomtan@ip-172-31-27-219 ~]$ clush -g all "sudo chmod 1777 /tmp/hive/java"
```
