Copyright (c) 2015 EXILANT Technologies Private Limited

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.



HOW IT WORKS
=================
The client makes a service call. If the service call is marked in the service entry as "submitAsBackgroundProcess=true" then the Exility server opens a new thread and executes the service in the new thread. The original service call immediately returns with the value of a job id in the DC. The job id in the returned DC is stored in the values collection with the special name "_backgroundJobId".
Additionally, each and every call to the server contains the status of all submitted jobs in the returned DC in the values collection under the special name "_backgroundJobs". The format is [jobid]=[status];[jobId]=[status]. The status can have only two values - "running" and "done". Once a thread completes the execution, it creates a file in the "temp" folder of the web deployment. The file name is same as the job id. The job id is a UUID. The file contains a serialized DC that was the result of the job. To know the status of a specific job, you can call a server action with the special name "getBackgroundJobResult". If the job is complete, then this method will read the DC stored in the file, delete the file and return the job status in the values collection field as "done". Please note, the field name "_backgroundJobStatus" is used to return the status. This time, this only contains the status as "done" or "running". The result of the background job is contained in the returned DC.

WHAT IS DONE ON EXILITY SERVER AND CLIENT SIDE
===============================================
A new object called "backgroundJobs" will always be available to the client as an attribute of the "PM" (PageManager) object. Every call to the server, as stated before, returns with the status of the background jobs. Exility client side automatically updates the status of each job. The developer does not have to do anything. The "PM.backgroundJobs" is a collection of all background jobs that got submitted during the session. If you decide to know the status of a specific job, by the job id, you can call a server action. The service id must be the special service name "getBackgroundJobResult" and the input job id should be in values collection with the special name "_backgroundJobId". Once the server action returns, once again, Exility client side updates the status of the job automatically and result is stored in the "PM.backgroundJobs" object.

SEQUENCE OF JS FILE INCUSION
==============================
The clientConstants.js file must be the first file to be included in the index.htm file. Also, backgroundJobs.js file must be included in index.htm before the pageManager.js and serverAgent.js file


LIMITATIONS
======================
There is no specific limitation. We only need to remember, that if the user refreshes the screen then status of all background jobs will be lost. This is consistent with current exility behavior.

SERVER OBJECTS ADDED/CHANGES
=============================
1. agent/com/exilant/exility/core/ServiceSubmitter.java - Generate batch id and fixed "run" method for error handling.
2. agent/com/exilant/exility/core/ServiceAgent.java - Fixed constant names
3. client/com/exilant/exility/core/CommonFieldNames.java - New class. Will contain constants used between JavaScript client and Java server side
4. client/com/exilant/exility/core/HttpRequestHandler.java - New servlet. This servlet will be used for all service calls. Does not include file upload/download handling
5. glue/com/exilant/exility/core/ServiceData.java - Fixed bug to ignore empty string during de-serialization of ServiceData object
6. glue/com/exilant/exility/core/ResourceManager.java - Inclusion of file path setup
7. glue/com/exilant/exility/core/InternallyUsedNames.java - Going forward, will hold the constants used internally
8. glue/com/exilant/exility/core/ExilityMessageIds.java - Going forward, all message Ids used internally by exility will be stored here
9. glue/com/exilant/exility/core/Spit.java - Need to check. Not sure.
10. glue/com/exilant/exility/core/ApplicationParameters.java - Need to check. Not sure
11. service/com/exilant/exility/core/ListService.java - Fixed constant names
12. utils/com/exilant/exility/core/FileUtility.java - New class. Read/Write files on the disk

CLIENT OBJECTS ADDED/CHANGES
============================
1. backgroundJobs.js - New object definition to work with background jobs
2. clientConstants.js - New object definition to start storing all constants used at the client side
3. pageManager.js - Added new attribute called "backgroundJobs" to hold the background job statuses across page calls
4. serverAgent.js - Added code to update the background job status for each service call

