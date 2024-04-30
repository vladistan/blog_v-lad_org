---
title: AWS4C has been updated
date: "2009-11-18"
discussionId: "2009-11-18-aws4c-update-1"
redirect_from:
  - /archives/22
---

Thanks to Henry N. for sending patches to the AWS4C library. I applied and tested them, hence the new release of the library.

Here is the list of changes:

The code quality has been improved. Some memory leaks fixed. Also addressed some warnings given by GCC 4.1.2
  * Addressed a bug with having wrong file length after get
  * When debug is not set, don’t print verbose output to stdout
  * Fixed up EU and virtual host URLS
  * Now can set the mime-type for the items
  * Now can attach canned ACL to the items

The library is available at https://github.com/vladistan/aws4c

Have any questions or suggestions write to me ‘tutorials@v-lad.org’ or post your comment here.
