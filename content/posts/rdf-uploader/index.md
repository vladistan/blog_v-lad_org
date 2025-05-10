---
title: "RDF-Uploader: Simplifying RDF Data Ingestion"
date: "2025-05-10"
discussionId: "2025-05-10-rdf-uploader"
redirect_from:
---

Recently, I've been working extensively with knowledge graphs, which
often involves work with different types of triple stores like
[MarkLogic](https://www.marklogic.com/),
[Blazegraph](https://github.com/blazegraph/database),
[RDFox](https://www.oxfordsemantic.tech/rdfox), [AWS
Neptune](https://aws.amazon.com/neptune/), and
[StarDog](https://www.stardog.com/) at the same time.  Each store
comes with a different bulk-loading process, its own endpoint URLs,
authentication rules, and named-graph conventions. Dealing with
those differences became very tedious very quickly.


To put an end to these headaches, I built [**RDF-Uploader**](https://github.com/vladistan/rdf-uploader) — a tool
that streamlines the workflow and offers a consistent, high-performance
method for uploading large RDF datasets.

![Demo GIF](demo.gif)


### Why is uploading RDF so annoying?


Below are the typical ways you can upload data to RDF Store:

 - Use RDFLib’s `store.update` method.

    This approach relies on the standard [SPARQL Update
    protocol](https://www.w3.org/TR/sparql11-update/),
    so it will most likely work with any triple store. However, it is
    the slowest option. The simplest usage pattern is easy to write;
    however, calling [`store.update`](https://rdflib.readthedocs.io/en/stable/apidocs/rdflib.plugins.stores.html#rdflib.plugins.stores.memory.Memory.update) in a loop for one triple at a time is
    painfully inefficient. Stores like [AWS Neptune](https://aws.amazon.com/neptune/) 
    take roughly the same time to ingest a single triple as they do a batch of a
    thousand, and the difference is even greater with high-performance
    engines such as RDFox.

  - Use proprietary method recommended by the store.
  
    Most triple stores implement their own proprietary bulk-loading tools, and they’re usually far
    faster than looping over RDFLib’s `store.update`. The catch is that every vendor does it
    differently. AWS Neptune, for example, [ingests data from an S3 bucket](https://docs.aws.amazon.com/neptune/latest/userguide/bulk-load.html), while 
    Blazegraph expects a file that already lives on the [server's local disk](https://github.com/blazegraph/database/wiki/Bulk_Data_Load).

    When your project has to target several stores at once, juggling these loader-specific
    workflows quickly becomes painful. Each path demands extra code to stage the files—either
    uploading to S3 or copying them onto the server—and each path requires additional permissions
    for developers and CI pipelines. In many organizations, granting that level of access simply
    isn’t feasible.
	 
  - Use CURL to post data to a bulk endpoint
  
	Almost all triple stores provide an HTTP endpoint for bulk loading data.  Either via standard
	[Graph Store Protocol](https://www.w3.org/TR/sparql11-http-rdf-update/) or 
    through some proprietary means like [Stardog's CLI](https://docs.stardog.com/operating-stardog/database-administration/adding-data#adding-data-via-the-cli).   This method is performant and doesn't
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
	error prone process, or by developing a complex program to automate the splitting.
	
	
To make the data loading experience less annoying, I created
[RDF-Uploader](https://github.com/vladistan/rdf-uploader), a tool
that combines the advantages of the above methods while
eliminating their downsides.


### Key Features

- **Batch Uploads**: Upload RDF data in batches to avoid server overload.
- **Concurrency**: Perform multiple uploads simultaneously for faster processing.
- **Authentication**: Supports authentication if required by a store. 
- **Named Graphs**: Support for uploading data to specific named graphs.
- **Content Type Detection**: Automatically detects and handles various RDF formats.
- **Performance Optimization**:  Supports tweaking the concurrency and batch size parameters


Supported data formats:

- [Turtle](https://www.w3.org/TR/turtle/)
- [N-Triples](https://www.w3.org/TR/n-triples/)
- [N3](https://www.w3.org/TeamSubmission/n3/)
- [RDF/XML](https://www.w3.org/TR/rdf-syntax-grammar/)
- [NQuads](https://www.w3.org/TR/n-quads/)
- [JSON-LD](https://www.w3.org/TR/json-ld/)

Supported data stores:


- [MarkLogic](https://www.marklogic.com/)
- [Blazegraph](https://blazegraph.com/)
- [AWS Neptune](https://aws.amazon.com/neptune/)
- [Stardog](https://www.stardog.com/)
- [RDFox](https://www.oxfordsemantic.tech/rdfox)

The tool has a CLI interface:


```bash
rdf-uploader file.ttl --endpoint http://localhost:3030/dataset/sparql

```

Or can be used programmatically:


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


### Further steps:

See the [project repository](https://github.com/vladistan/rdf-uploader) for additional information.


### License:

This project is licensed under the [MIT Licensee](https://github.com/vladistan/rdf-uploader/blob/main/LICENSE). 
