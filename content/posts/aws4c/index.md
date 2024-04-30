---
title: AWS4C a C library that lets you work with AWS
date: "2009-08-15"
discussionId: "2009-08-15-aws4c"
redirect_from:
  - /archives/13
---

Believe it or not some people need to write programs to access Amazon Web Services in C. This project grew out of the conversion of my old HPC project to run on the amazon EC2.

I needed a C library to access the code. Unfortunately I couldn’t find any, so I wrote my own.

The code quality sucks, I wrote the whole thing pretty much in one day. And I wouldn’t use it for anything more then a proof of concept projects unless it is heavily reworked to be more robust. But nevertheless it gets the job done.

The library includes bindings for SQS and S3.

It depends on [libcurl](https://curl.haxx.se/libcurl/) for its network operations and [openssl](https://www.openssl.org/) for the crypto.

There is also [libAWS](http://aws.28msec.com/) but it is heavily C++ dependent so it wouldn’t work for all types of C projects.

The library is available at https://github.com/vladistan/aws4c

Have any questions or suggestions write to me ‘tutorials@v-lad.org’ or post your comment here.
