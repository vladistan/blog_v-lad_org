---
title: How to Stop Proxmox VE Virtual Machines Across a Cluster Using the CLI
date: "2024-05-04"
discussionId: "2024-05-04-proxmox-restart"
tags: [proxmox, devops]
---

![screen](./proxmox.jpg)


[Proxmox VE](https://www.proxmox.com/en/) is a great virtualization platform for home labs and development environments. It's excellent for managing multiple experimental virtual clusters such as [Ambari](https://ambari.apache.org/) or [Kubernetes](https://kubernetes.io/) on a single physical Proxmox Cluster. In these cases, it is typical to work on only one cluster at a time, hence, temporarily shutting down the other clusters allows for more efficient allocation of compute resources. Because such clusters are made up of various VMs spread across multiple physical nodes, it is a common need to start and stop multiple VMs at the same time.

Although the Proxmox web interface is intended to be intuitive and simple to use, manually starting or stopping virtual machines across several nodes can be time-consuming. The command-line interface (CLI) is a far more efficient approach in this scenario.  It allows you to complete this operation with a single command.

Unfortunately, Proxmox does not offer a direct command for starting and stopping virtual machines across a cluster using a name pattern. STH described a strategy in a [blog post](https://www.servethehome.com/how-to-start-stop-and-list-proxmox-ve-virtual-machines-via-the-cli/) for managing virtual machine operations on a single node. Building on this, I changed the script to execute over the entire cluster.


To manage VMs across a cluster efficiently using the CLI, follow these steps:

1. Make sure thath SSH keys are set up for passwordless login to each node. This setup is typically already in place in a Proxmox environment.
2. Adjust the script to match the VM names you wish to manage. The script uses the pattern from the first line of the script to identify the VMs to start or stop. 


```bash
PATTERN="k8s"  # Replace this with your pattern
OP="start"  # Replace this with "stop" to stop VMs

VM_INFO=$(pvesh get /cluster/resources --type vm | grep $PATTERN | 
awk -F'│' '{
    for (i = 1; i <= NF; i++) {
        if ($i ~ /qemu\//) {
            gsub(/[^0-9]/, "", $i); 
            vmid = $i;
        } 
        if ($i ~ /pve[0-9]+/) {
            node = $i; 
            gsub(/ /, "", node); 
            print vmid, node; 
            break;
        }
    }
}')

# Convert VM_INFO into an array
VM_ARRAY=($VM_INFO)

# Process each VM ID and host pair
for (( i=0; i<${#VM_ARRAY[@]}; i+=2 )); do
    VM_ID=${VM_ARRAY[i]}
    HOST=${VM_ARRAY[i+1]}
    ssh $HOST "qm $OP $VM_ID"
    echo "$OP VM ID: $VM_ID on host: $HOST"
done
```

Thank you to STH for their first thoughts, which helped design the script.  A special thanks goes out to all the open source contributors to Proxmox, Kubernetes (K8s), and Ambari.  The community's contributions have enabled strong, scalable, and efficient solutions like these, which benefit both small-scale initiatives and large enterprise environments.
