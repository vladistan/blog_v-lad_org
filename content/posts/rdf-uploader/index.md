---
title: "RDF-Uploader: Simplifying RDF Data Ingestion"
date: "2025-04-11"
discussionId: "2025-04-11-rdf-uploader"
redirect_from:
---

Lately I’ve been knee-deep in knowledge-graph work, and most of my
projects require juggling several triple stores at the same time —MarkLogic, Blazegraph,
RDFox, AWS Neptune, StarDog and more. Each store comes with a different
bulk-loading process, its own endpoint URLs, authentication rules,
and named-graph conventions. Dealing with those differences gets
very tedious very fast.


To put an end to these headaches, I built **RDF-Uploader**—a tool
that streamlines the workflow and offers a consistent, high-performance
method for uploading large RDF datasets.

![Demo GIF](demo.gif)


### Why is uploading RDF so annoying?


Below are the typical ways you can upload data to RDF Store:

 - Use RDFLib’s `store.update` method.

	This approach relies on the standard SPARQL Update protocol, so it will usually work with any
	triple store. Unfortunately, it is also the slowest option. The simplest usage pattern—calling
	`update` in a loop for one triple at a time—is easy to write but painfully inefficient. Stores
	like AWS Neptune take roughly the same time to ingest a single triple as they do a batch of a
	thousand, and the difference is even greater with high-performance engines such as RDFox.
  

  - Use proprietary method recommended by the store.
  
        Most triple stores ship with their own proprietary bulk-loading tools, and they’re usually far
        faster than looping over RDFLib’s `store.update`. The catch is that every vendor does it
        differently. AWS Neptune, for example, ingests data from an S3 bucket, while RDFox and
        Blazegraph expect a file that already lives on the server’s local disk.

        When your project has to target several stores at once, juggling these loader-specific
        workflows quickly becomes painful. Each path demands extra code to stage the files—either
        uploading to S3 or copying them onto the server—and each path requires additional permissions
        for developers and CI pipelines. In many organisations, granting that level of access simply
        isn’t feasible.
	 
  - Use CURL to post data to a bulk endpoint
  
	Almost all triple stores provide an HTTP endpoint for bulk loading data.  Either via standard
	Graph Store Protocol or through some proprietary means.   This method is performant and doesn't
	require setting up any special access.  However,  there are a few challenges to this method as
	well.  First, the actual implementation of the endpoint is different for different stores. Some
	support the standard protocols, some implement their own.  Second, using CURL implies loading 
	all the data in a single transaction.  This is OK when the dataset is rather small, but all the
	stores have a limit of how much data they could receive at a time.  For some stores this limit
	is pretty large, but nevertheless it is always finite and always much smaller that the limit
	of the number of triples the store can handle.  Also, if an error occurs during the batch upload
	of a very large data block the entire transaction has to be repeated.
	
	The later limitation can be mitigated by splitting the dataset into smaller parts and posting them
	to the triple store separately.  But this has to be done either manually through tedious and
	error prone process, or by developing a complex program to autmoate the splitting.
	
	
So to improve improve the data loading experience I developed an `rdf-uploader`, a tool that takes the best
from the above methods without the downsides:

### Key Features

- **Batch Uploads**: Upload RDF data in batches to avoid server overload.
- **Concurrency**: Perform multiple uploads simultaneously for faster processing.
- **Authentication**: Supports authentication if required by a store. 
- **Named Graphs**: Support for uploading data to specific named graphs.
- **Content Type Detection**: Automatically detects and handles various RDF formats.
- **Performance Optimization**:  Supports tweaking the concurency and batch size parameters


Supported data formats:

- Turtle
- N-Triples
- N3
- RDF/XML
- NQuads
- JSON-LD

Supported data stores:


- Marklogic
- BlazeGraph
- AWS Neptune
- Stardog
- RDFOX

The tool has a CLI interface:


```bash
rdf-uploader file.ttl --endpoint http://localhost:3030/dataset/sparql

```

Or can be used programatically:


```python
from pathlib import Path
from rdf_uploader.uploader import upload_rdf_file
from rdf_uploader.endpoints import EndpointType

# With explicit parameters
await upload_rdf_file(
    file_path=Path("file.ttl"),
    endpoint="http://localhost:3030/dataset/sparql",
    endpoint_type=EndpointType.MARKLOGIC,
    username="myuser",
    password="mypass"
)

# Using environment variables
await upload_rdf_file(
    file_path=Path("file.ttl"),
    endpoint_type=EndpointType.RDFOX
)
```


The tool is available through a variety of methods


PIP

```bash
pip install rdf-uploader
rdf-uploader file.ttl --endpoint http://localhost:3030/dataset/sparql
```


Docker


Homebrew


Further reading:

See the README at the project page for additional details




### Conclusion

RDF-Uploader is a powerful tool for simplifying the process of
uploading RDF data to various triple stores. Its support for batch
uploads, concurrency, and multi-store compatibility makes it an
essential tool for knowledge graph developers. Whether you're working
on a small project or a large-scale knowledge graph, RDF-Uploader
can save you time and effort.

Give it a try and let us know how it works for you!

[![License MIT](https://img.shields.io/github/license/vladistan/rdf-uploader)](https://github.com/vladistan/rdf-uploader)
