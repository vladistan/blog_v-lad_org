---
title: Restoring a stale Proxmox node to the cluster
date: "2024-07-15"
discussionId: "2024-07-15-proxmox-restart"
tags: [proxmox, devops]
---

![screen](./proxmox.jpg)

[Proxmox VE](https://www.proxmox.com/en/) is a robust virtualization
platform widely used in highly available clusters. In such environments,
it is not uncommon for a particular physical node to fail. Fortunately,
this does not typically affect daily operations, as the workload
is distributed across the remaining healthy nodes.

Usually, these failures are due to minor issues with the hardware,
and the affected node can be repaired and brought back online.
However, because the cluster continues to function and useful work
is still being done, these repairs are often not the highest priority
and can take a few weeks to complete.

Once the repairs are finished, the node is put back into the the
rack and turned on with the expectation that it will join back into
the cluster and start taking the useful workloads.  Unfortunately,
quiet often the repaired node is not accepted by the cluster. 

The usual course of action in such cases is to wipe the node clean,
reinstall the Proxmox software, give the node a new identity, and
rejoin the cluster as a new node. Then, mop up by removing the old
node from the cluster. This works, but it is quite labor-intensive.
Perhaps there is a way to tweak the node so it is accepted back
into the cluster without such extensive steps. This post describes a
common reason for this failure, and a way to fix it.


Like any robust cluster environment Proxmox needs to maintain it's
configuration and state in a reliable store that can tolerate any
physical node going doing at any time. For this purpose Proxmox
uses an open source cluster engine called
 [Corosync](https://corosync.github.io/corosync/). 

Each node in a Proxmox cluster runs an instance of Corosync. Each
of these instances keeps a copy of the cluster's configuration and
state.  When a change such as adding or removing a virtual machine
is made to the cluster, the node where the change was made creates
a new version of the configuration and propagates it to the other
nodes. This mechanism ensures that all nodes are always synchronized.

However, when a node fails and is taken offline, the cluster continues
to operate normally. During this time, the failed node misses out
on all the updates and changes being made to the cluster. When the
node is eventually repaired and brought back online, it will have
an outdated copy of the cluster's configuration. As a result, the
cluster will bar the node from participating until its configuration
is updated to match the current state of the cluster.

To repair this, first ensure that the failure is indeed due to the
node having an outdated configuration. 

1. Run the commands below to check if corosync is broken.

   ```
   systemctl stop corosync
   journalctl -fu corosync &
   systemctl start corosync
   ```

2. Look for log messages similar to the following:

```
[CMAP  ] Received config version (32) is different config version (31)! 
[SERV  ] Unloading all Corosync service engines.
systemd[1]: corosync.service: Failed with result 'exit-code'.
```

If you don't see any Corosync log messages, it might be due to a
different logging configuration that doesn't use systemd. Instead,
check the log file `/var/log/corosync/corosync.log` for any relevant
messages.

If you do see such messages, proceed with the steps outlined in
this post to resolve the issue. Otherwise, an inconsistent Corosync
configuration is not causing the problem, and you will need
to look somewhere else to find the real cause of the failure.


Now that we know that outdated corosync config is the culprit, we
can tweak the node to repair it. To begin we must make sure  that 
`corosync` and `pve-cluster` services are not running, this is needed to prevent
potential race conditions. Use commands below to do it

```
systemctl stop pve-cluster
systemctl stop corosync
```


Then copy the configuration file from a good node to a temporary location
on the node. Use `scp` command to do it. Make sure to replace `<good-node>`
with the name of the good node in the cluster.

```
scp root@<good-node>:/etc/corosync/corosync.conf /tmp/
```

Once we copied the file we can check if the configuration has diverged
from the original. Use `diff` command to do it.

```
diff /tmp/corosync.conf /etc/corosync/corosync.conf
```

You should see output similar to the following:

```
31a32,37
>     name: pve14
>     nodeid: 14
>     quorum_votes: 1
>     ring0_addr: 192.168.15.64
>   }
>   node {
81c87
<   config_version: 32
---
>   config_version: 31
```

If you see such output, the configuration has diverged, and we are on the right track to fixing the issue.


Now move the configuration to the correct location. 

```
mv /tmp/corosync.conf /etc/corosync/
```

The last step is to reboot the node.  

Once the node is back online it should be accepted back into the cluster.

