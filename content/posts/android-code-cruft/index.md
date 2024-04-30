---
title: Compiling native programs for Android
date: "2010-08-18"
discussionId: "2010-18-18-compile-native-android"
redirect_from:
  - /archives/26
---


There is an excellent tutorial by [Nirnimesh](https://plus.google.com/+Nirnimesh) on how to compile native programs for Android here http://android-tricks.blogspot.com/2009/02/hello-world-c-program-on-using-android.html

Unfortunately things have changed a bit since last year when this post was written. Andy’s agcc script doesn’t work with the most recent Google NDK release 4B.

I have changed the script a little bit to address new path changes. The new script is available here http://android-cruft.googlecode.com/files/agcc-0.2.tgz.

Make sure to add this to your path

$HOME/AndroidNDK/build/prebuilt/linux-x86/arm-eabi-4.4.0/bin/

*Where AndroidNDK is your NDK installation directory.*

Hope this works for you.
