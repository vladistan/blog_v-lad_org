---
title: CodeBreaker2018 walkthrough, Task 1 It begins
date: "2019-01-05"
discussionId: "2011-01-05-codebreaker2018-task2"
featuredImage: './assignment.png'
---

In this task we are asked to examine the binary pieces left over by ransomware and captured network traffic to extract the following information:

  * Victim Identifier
  * Encrypted Ransom Key
  * One-Time Passcode (OTP) used to authenticate the client to the ransomware LP
  * Escrow contract address

There are two ways to do this, we can just extract this information from the dump using some guesswork and a bit of luck, or we can go the full reverse engineering route.

Doing it the second way is fast,  unfortunately it will get us stuck in the following tasks, so we'd have to reverse engineer everything anyway.

Let's do it correctly the first time.

We are given to binary shared libraries that are pieces of larger program. The challenge states that the rest of the ransomware has been removed by the attackers post the infection.  

We will solve the problem by building the model that incorporates the reverse engineered code from the libraries, unit tests that exercise the code under different conditions and some mock up code to simulate the attackers infrastructure.  

The mock-up code is very important for several reasons.  First, the ransomware is a client-server type of system for which we have only the client.  We don't have any control over the server part, nor should we communicate with the attackers while trying to develop countermeasures against them.  Second, even if we had access to a ransomware server, we sill would've used the mocks because the distributed network development is very hard. It's much easier to work on something that is self contained within single process and we have complete control over it.

We will use standard mock pattern, which is:

1. Prepare canned responses to the ransomware code
* Reset the mock to initial state
* Call ransomware function under tests
   * Mocks check that they were called with the expected parameters and return back the canned response
* We'll assert that mocks we called correct number of times in correct sequence with correct parameters
* We'll also assert that function under test returned expected result

You can read more about mocking [here](http://bit.ly/2FsnvOv).  We will use [cpputest](http://bit.ly/2M7S0dP) library which includes both great unit testing and mocking package.

## So let's begin.

First we setup our [initial model](http://bit.ly/2smEg60).  This model is just a skeleton framework with some rudimentary tests.  We will add flesh to it shortly.

Then we'll use wireshark to dump the conversation between the ransomware and command post into the form of C arrays.  This is very handy to use in our model code.

1. Open provided traffic capture with [wireshark](http://bit.ly/2FpNNBc)

*  Right click (on mac CMD-Click) the first packet and select "Follow TCP Stream" ![screen](followstream.png)

*  Once you see the conversation dump, select show as C arrays and save the file into the model code.  ![screen](showascarrays.png)

* Include saved file [into the model](http://bit.ly/2D4iEld)

Now that we have test data, let's take a crack at lib\_comm.so. We will use a combination of [Dissasembler.io](http://bit.ly/2Fpufwz) and [Radare](http://bit.ly/2sgwURE). If you haven't done [Task 2](../codebreaker2018_task2/)  yet I stronggly recommend do it before doing this task.

So first we look at the code with Dissasembler.io. ![screen](first_look_dis_io.png)
Most functions in the library are just shims for that glue dynamic libraries together. Except for the three at the bottom that seem to do something useful.

Unfortunately disassembler.io doesn't do a good jump at resolving external references. This makes it quite hard to understand what is going on. Perhaps Radare will do better job. ![screen](radare_first_dump.png).

Yes this looks much better. We do see actual external names mentioned.

The function at *0xa30* is just a standard DLL shutdown / cleanup function, we can ignore it for now.

Let's look at the one at *0xb30* ![screen](radare_dump_of_transmit.png)

Although disassembler.io was not that helpful with the external names, it is much better with analyzing the structure of the code ![screen](dis_io_transmit_struct.png)

Looks like a function that tries to send a fixed size buffer while handling the case of partial transmissions due to full buffers on the local host.

What else can we learn from it.

  1.  We confirm that our block size is 0x300
  2. Also we see that they are trying to be Object Oriented and pass around an object of 0x790 bytes long... that includes 0x300 size buffer (edited)
  3. We also see that the buffer starts at position 0x320

So let's copy these facts to our model.  [Here](http://bit.ly/2Foc4Zb)  is our reverse engineered transmit function.

## Now let's take a look at at the next function.

Again the structure dump from disassembler.io is handy

![screen](startclient_dump.png)

as well as analysis done by the Radare2.  

An ugly set of parameters

![screen](scli_params.png)

However it doesn't look that bad

![screen](sclient_not_bad.png)

Mostly just a bunch of data shuffling back and forth

![screen](bunch_of_data_shuffle.png)

So let's rewrite those back in C.  We see lots of calls being made to *libclient_crypt.so* routines. For now we'll just hardcode their responses using the information we got from the wireshark dump.

But we'll make one exception to the above. Let's look at what BCVH function might be doing. Looks like it just converts binary values to hex strings. we can just write one like this without resorting to reverse engineering tricks.

[Here](http://bit.ly/2FrI2Tm) is the result of our efforts so far.

These are all the functions that look interesting in the *libclient_comm.so*

## Now let's look at the crypto library

First let's take a look at the functions. ![screen](libcrypto_funcs.png)

Some of those like base32 decode/encode we can just write ourselves. Faster than digging through reverse engineering.  The V_hh function looks like some kind of authentication function. Since we know that this is successful exchange between ransomware and the server we'll just stub it. Doesnt' look like it's relevant to our task anyway.

We'll use [RFC-4648](http://bit.ly/2SLbYOd) for the spec of base32 encoding.

So [here](http://bit.ly/2THikhC) is what we got so far.


Now we got all basic functions. Let's see if we can compute packet signatures
that we had hard coded.

Let's see what does Radare show.

![screen](crypto_funcs.png)

Looks like c_hh is just straightforward HMAC setup using SHA256 follow with the call to BCVH for which we already have a source code.  Let's code it up and see if it works.

[Here](http://bit.ly/2smRfEH) is the implementation of the real checksum function and the rest of the protocol.

Now we understand completely what is the protocol between client and the server. It looks like This ![screen](cli_ser_proto.png)

Here is our guess what is the meaning of each message:

  * `HELLO` - initial message to the server,  include victim IP address, vicitim ID,  OTP and Encrypted Ransom Key. The message is signed with Ransomware secret key using HMAC/SHA256 protocol
  * `ACK` - server responds with an ACK of some sort
  * `PING` - ransomeware again sends a message to the server,  this time with it's just a victim_ip and victim_id signed using the same method
  * `PONG` - server responds with an ACK of some sort
  * `BYE` - finally ransomware sends the final message which just a signature of the last ACK received from the server

The protocol looks pretty naive and convoluted, probably the attackers are trying to guard against replay attacks and substituted malware code.

Now that we have a complete reverse engineered model of the ransomware [code](http://bit.ly/2AGXTu1) we can take a look at the code that prepares HELLO packet.  ![screen](hello_prep.png)

the structure of client `HELLO` packet

![screen](cli_hello_pkt.png)

and these unit tests

![screen](cli_hello_unit.png)

as well as the ransom note

![screen](ransom_note.png)

and a dump of hello packet

![screen](hellopktdump.png)

and we have all the information we indeed

* Escrow contract address - is just given to us in the ransom note left by the attacker
* Victim Identifier - is given in the ransom note,  we can also see it in the dump of the hello packet
* One-Time Passcode (OTP) - in the dump of the hello packet, it is 6 symbols that immediately follow the victim identifier
* Encrypted Ransom Key - again in the dump of the hello packet. it's the rest of data after OTP


Note on the encoding.  The encoding of the messages is little bit weird.  Looks like they convert all binary values to their hex representation,  except for the OTP which is converted to decimal.  Not clear what the attackers trying to accomplish here.  Perhaps command server is written in the language that is not very friendly to binary encoding. (Javascript?)


Now that we have all the data.  We can submit it to the challenge.

![screen](task1_done.png)

## Additional reading materials

1. We relied a lot on test driven development (TDD) techniques.  It was not a pure TDD because that we already had a code. But a lot of practices came from TDD approach.  Kent Becks' [Test Driven Development](https://amzn.to/2M7RSuS) and Roy Osherove [The Art of Unit Testing](https://amzn.to/2SPqHYx) are great introductions to these techniques

2. To learn more about Mocks read Martin Fowler's article [Mocks Arent' Stubs](http://bit.ly/2FsnvOv)

3. Although most of the TDD material out there usually talks about projects written in languages like Java / Python / Ruby / Javascript.  The James Grenning's [Test Driven Development for Embedded C](https://amzn.to/2RFiBV7) describes a lot of techniques we used to solve this task

4. The best way to learn TDD is to practice it.  And the best way to practice it is with the group of people.  If checkout this meetups if you live close by:

   * [New York](http://bit.ly/2Rm5RDj)
   * [Baltimore](http://bit.ly/2VNQh1L)
   * [Austin](http://bit.ly/2FpYZOW)
   * [Boston](http://bit.ly/2soL5nI)
   * [Washington,DC](http://bit.ly/2QGDOZX)
   * [Global Day of Code Retreat](http://bit.ly/2slH1oa) -- annual event happens around November.
