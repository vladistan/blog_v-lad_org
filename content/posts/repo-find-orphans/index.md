---
title: Small tool for finding orphans in the projects managed by repo
date: "2024-05-11"
discussionId: "2024-05-01-repo-find-orphans"
tags: [android, repo, devtools]
---


Many large projects, such as [Android AOSP](https://source.android.com/docs/setup/start), use [repo tools](https://source.android.com/docs/setup/start/requirements#repo) to
manage thousands of small repositories that make up the project.
The tool is great, but the workflow is somewhat unusual when compared
to the standard Git workflow. One common issue with using this tool
over the lifetime of the multi-year projects is that developers add
new components but fail to register subprojects in the repository
manifest. These unregistered projects, also known as orphan projects,
cause issues with repo synchronization and update tasks because the
tool is unaware of their existence. This problem worsens over time
as these small projects lurk on developers' laptops, causing the
project tree to diverge from the rest of the team and build servers,
and eventually get lost when the developer gets a new machine.

A [feature request](https://issues.gerritcodereview.com/issues/289518474)
was submitted to the repo developers years ago to address this
issue, but it has not been addressedfor several years.  To finally
resolve this issue, I built a small tool that scans the repository
for orphan directories and returns a list of them.  Developers can
use this list to clean up their project, either by removing orphans
or adding them to the manifest.

You can download this tool from [PyPi](https://pypi.org/project/repo-find-orphans/) or [Github](https://github.com/vladistan/repo-find-orphans).

I hope you find it useful.


