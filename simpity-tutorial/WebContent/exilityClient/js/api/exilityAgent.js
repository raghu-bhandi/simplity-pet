/**********************************************************************************************
*
* EXILANT CONFIDENTIAL
* _____________________________________________________________________________________________
*
*  [2004 - 2013]  EXILANT Technologies Pvt. Ltd.
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains the property of EXILANT
* Technologies Pvt. Ltd. and its suppliers, if any.  
* The intellectual and technical concepts contained herein are proprietary to   
* EXILANT Technologies Pvt. Ltd. and its suppliers and may be covered by India and 
* Foreign Patents, patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material is strictly forbidden 
* unless prior written permission is obtained * from EXILANT Technologies Pvt. Ltd.
***********************************************************************************************/

/**********************************************************************************************
*
* PURPOSE
* _____________________________________________________________________________________________
*
* In Exility, all data exchanged between various program elements (either java classes, or 
* from client to server) is done via an object called DataCollection. This object contains
* key/value pairs and grids. It also contains additional attributes to define success/failure
* of a call. This object is serialized and de-serialized before sending and after receiving.
* The serialization is purely text based. This is a fundamental object to exchange data.
************************************************************************************************/

/***********************************************************************************************
* Date			Version		Author			Comments
*-------------------------------------------------------------------------------------------
* 10-Dec-2013	 1.0.0		Vishnu Sharma	First draft
*-------------------------------------------------------------------------------------------
***********************************************************************************************/
/**
 * The default constructor
 */
var DataCollection = function ()
{
	this.values = new Object();
	this.lists = new Object();
	this.grids = new Object();
	this.success = true;
	this.messages = new Object();
	
	/*Constants used internally by DC*/
	this.TABLE_SEPARATOR = String.fromCharCode(28); // ASCII file separator
	this.BODY_SEPARATOR = String.fromCharCode(29); // ASCII group separator
	this.ROW_SEPARATOR = String.fromCharCode(30); // ASCII record separator
	this.FIELD_SEPARATOR = String.fromCharCode(31); // ASCII unit separator
	this.VALUES_TABLE_NAME = 'values';
	this.SUCCESS_FIELD_NAME = '_success';
	this.MESSAGES_TABLE_NAME = '_messages';
	this.MESSAGE_TYPE_ERROR = "error";
	this.MESSAGE_TYPE_WARN = "warning";
	this.AUTHENTICATION_STATUS = 'authenticationStatus';
	this.TRACE_FIELD_NAME = 'exilityServerTraceText';
	this.PERFORMANCE_FIELD_NAME = 'exilityServerPerformanceText';
};
/**
 * A copy constructor
 * ARGUMENTS:
 * 1. dc - A valid instance of another DC object
 */
DataCollection.prototype.fromDc = function (dc)
{
    this.success = dc.success;
    this.values = dc.values;
    this.messages = dc.messages;
    this.grids = dc.grids;
    this.lists = dc.lists;
};

/**
 * Add a message to the DC instance
 * ARGUMENTS:
 * 1. typ - The type of message (error/warning/info)
 * 2. text - The message text
 * RETURNS: None
 */
DataCollection.prototype.addMessage = function (typ, text)
{
    typ = typ.toLowerCase();
    var msgs = this.messages[typ];
    if (!msgs || typeof msgs === "undefined")
    {
        msgs = new Array();
        this.messages[typ] = msgs;
    }
    msgs.push(text);
    if (typ == this.MESSAGE_TYPE_ERROR)
        this.success = false;
};

/**
 * Check if the values collection in the DC instance has got any values
 * RETURNS: boolean
 */
DataCollection.prototype.hasValues = function ()
{
    for (var val in this.values)
    {
        return true;
    }
    return false;
};

/**
 * Get the value for the named key
 * ARGUMENTS:
 * 1) name - The name of the key whose value is required
 * RETURNS: The value of the key if found else undefined
 */
DataCollection.prototype.getValue = function(name)
{
    return this.values[name];
};
/**
 * Check if the values collection in the DC instance contains
 * a value with the given key
 * ARGUMENTS:
 * 1. name - The key name whose value existence we need to check
 * RETURNS: boolean
 */
DataCollection.prototype.hasValue = function (name)
{
	return typeof this.values[name] !== 'undefined';
};

/**
 * Add a new value to the internal values collection. If
 * a value with the same key exists, it will be updated
 * ARGUMENTS:
 * 1. name - The key name to use
 * 2. value - The corresponding value
 * RETURNS: None
 */
DataCollection.prototype.addValue = function (name, value)
{
    this.values[name] = value;
};
/**
 * Remove a value from the internal values collection. If
 * a value with the given key does not exists then no changes
 * will be made.
 * ARGUMENTS:
 * 1. name - The key name to use
 * RETURNS: None
 */
DataCollection.prototype.removeValue = function (name)
{
	var val = this.values[name];
    delete this.values[name];
    return val;
};
/**
 * Get the grid in the internal grids collection of this DC instance
 * ARGUMENTS:
 * 1. name - The name of the grid to extract
 * RETURNS:
 * A grid object if found else undefined
 */
DataCollection.prototype.getGrid = function (name)
{
    return this.grids[name];
};
/**
 * Add a new grid to the internal grids collection. If a grid
 * exists under the same key, it will be updated
 * ARGUMENTS:
 * 1. name - The name of the grid
 * 2. grid - The grid object to add
 * RETURNS: None
 */
DataCollection.prototype.addGrid = function (name, grid)
{
    if(this.grids[name])
        debug('grid ' + name + ' is already in the dc. It will be replaced with the new grid');
    this.grids[name] = grid;
};
/**
 * Remove a grid from the internal grids collection. If
 * a grid with the given key does not exists then no changes
 * will be made.
 * ARGUMENTS:
 * 1. name - The key name to use
 * RETURNS: None
 */
DataCollection.prototype.removeGrid = function(name)
{
     var grid = this.grids[name];
     delete this.grids[name];
     return grid;
};
/**
 * Add a list of values to the internal list of values
 * A value list is nothing but an array. If value list under the
 * same name exists, it will be updated
 * ARGUMENTS:
 * 1. name  - The name of value list
 * 2. valueList - The value list to add
 * RETURNS: None
 */
DataCollection.prototype.addList = function(name, valueList)
{
    this.lists[name] = valueList;
};
/**
 * Get the value list for the given key name
 * ARGUMENTS:
 * 1. name - The key name by which we need to get the value list
 * RETURNS: The value list instance if found else undefined
 */
DataCollection.prototype.getList = function(name)
{
     return this.lists[name];
};
/**
 * Remove the value list from the internal collection of value list objects
 * If the value list for the given name is not found, then no changes take place
 * ARGUMENTS:
 * 1. name - The name of the value list to remove
 */
DataCollection.prototype.removeList = function(name)
{
    var list = this.lists[name];
    delete this.lists[name];
    return list;
};
/**
 * Check if the DC instance represents an error condition
 * RETURNS: boolean
 */
DataCollection.prototype.hasError = function()
{
   return (!this.success);
};
/**
 * Get all the messages embedded in this instance of DC
 * RETURNS: string
 */
DataCollection.prototype.getMessageText = function ()
{
    var str = '';
	for(var mKey in this.messages)
	{
		if(mKey == ClientConstants.MESSATE_TYPE_ERROR)
			str += 'Error\n';
		else
			str += mKey + '\n';
		
		var arr = this.messages[mKey];
	    for(var i = 0; i < arr.length; i ++)
		    str += arr[i] +'\n';
	}
    return str;
};
/**
 * Serialize the DC object
 * RETURNS: string
 */
DataCollection.prototype.serialize = function()
{
    var val = '';
    var str = [this.VALUES_TABLE_NAME, this.BODY_SEPARATOR];
    var firstValue = true;
    for (name in this.values)
    {
        val = this.values[name];
        if (!val && val != 0)
            val = '';
        if (firstValue)
            firstValue = false;
        else
            str.push(this.ROW_SEPARATOR);
        str.push(name);
        str.push(this.FIELD_SEPARATOR);
        str.push(val);
    }


    for (var gridName in this.grids)
    {
        if (!this.grids[gridName])
            continue;
        var thisGrid = this.grids[gridName];

        str.push(this.TABLE_SEPARATOR);
        str.push(gridName);
        str.push(this.BODY_SEPARATOR);

        for (var i = 0; i < thisGrid.length; i++)
        {
            if (i != 0)
                str.push(this.ROW_SEPARATOR);
            var row = thisGrid[i];
            for (var j = 0; j < thisGrid[i].length; j++)
            {
                var val = row[j];
                if (!val && val != 0) val = '';
                if (j != 0)
                    str.push(this.FIELD_SEPARATOR);
                str.push(val);
            }
        }
    }
    //and finally lists

    for (var listName in this.lists)
    {
        var list = this.lists[listName];
        if (list)
        {
            str.push(this.TABLE_SEPARATOR);
            str.push(listName);
            str.push(this.BODY_SEPARATOR);
            for (i = 0; i < list.length; i++)
            {
                if (i != 0)
                    str.push(this.ROW_SEPARATOR);
                str.push(list[i]);
            }
        }
    }
    return str.join('');
};
/**
 * De-serialize DC. From the given text, populate this DC instance
 * ARGUMENTS:
 * 1. txt - The serialized text representation of the DC
 * RETURNS: A new instance of DC
 */
DataCollection.prototype.deserialize = function (txt)
{
    var tablesAndNames = txt.split(this.TABLE_SEPARATOR);
    for (var i = 0; i < tablesAndNames.length; i++)
    {
        var t = tablesAndNames[i].split(this.BODY_SEPARATOR);
        if (t.length != 2) //empty ones, put at the beginning and at end as possible defence against characters added by jsp
            continue;
        var tableName = t[0];
        var rows = t[1].split(this.ROW_SEPARATOR);
        var grid = [];
        for (var j = 0; j < rows.length; j++)
        {
            grid.push(rows[j].split(this.FIELD_SEPARATOR));
        }
        var row;
        if (tableName == this.VALUES_TABLE_NAME)
        {
            for (var j = 1; j < grid.length; j++)
            {
                row = grid[j]; //row is name, value
                this.addValue(row[0], row[1]);
            }
            var st = this.getValue(this.SUCCESS_FIELD_NAME);
            this.success = st && (st == '1');
            continue;
        }

        if (tableName == this.MESSAGES_TABLE_NAME)
        {
            for (var j = 1; j < grid.length; j++)
            {
                row = grid[j]; //columns are messageId, severity and text
                this.addMessage(row[0], row[1]);
            }
            continue;
        }
        this.addGrid(tableName, grid);
    }
};
/**
 * Pickup and populate DC instance attributes from the given HTML element
 * ARGUMENTS:
 * 1 . element - The parent HTML element (DOM object)
 */
DataCollection.prototype.fromElement = function (element)
{
    var children = element.getElementsByTagName('input');
    var n = children.length;
    var id, val;
    var ele = null;
    for (var i = 0; i < n; i++)
    {
        ele = children[i];
        id = ele.name || ele.id;
        if (!id)
            continue;

        var typ = ele.type ? ele.type.toLowerCase() : 'text';
        if (typ != 'text')//small optimization because text is the most common input
        {
            //buttons are not values. Also, we do not handle file in this
            if (typ === 'button' || typ == 'reset' || typ === 'submit' || typ == 'image' || typ === 'file')
                continue;

            //unchecked radio/check-box to be ignored
            if (typ == 'radio' || typ == 'checkbox')
            {
                if (!ele.checked)
                    continue;
            }
        }
        
        val = ele.value;
        //name should not repeat, except for check-boxes. We use comma separated value
        if (this.hasValue(id))
            val = this.getValue(id) + ',' + val;
        this.addValue(id, val);
    }

    //drop-downs
    children = element.getElementsByTagName('select');
    n = children.length;
    for (var i = 0; i < n; i++)
    {
    	ele = children[i];
    	id = ele.id || ele.name;
    	if(!id)
    		continue;
        var options = ele.childNodes;
        val = null;
        if (ele.multiple)
        {
            for (var j = 0; j < options.length; j++)
            {
                var option = options[j];
                if (options.selected)
                {
                    if (val)
                        val += ',' + option.value;
                    else
                        val = option.value;
                }
            }
        }
        else if (ele.selectedIndex || ele.selectedIndex == 0)
            val = options[ele.selectedIndex].value;
        
        if(val != null)
            this.addValue(id, val);
    }
};
/**
 * Conver the DC instance to HTML representation
 * RETURNS: HTML string
 */
DataCollection.prototype.toHtml = function ()
{
    var htmlArr = [];
    this.messagesToHtml(htmlArr);
    this.valuesToHtml(htmlArr);
    this.gridsToHtml(htmlArr);
    this.listsToHtml(htmlArr);
    return htmlArr.join('');
};
/**
 * Convert the messages stored in this DC instance to HTML
 * ARGUMENTS:
 * 1. htmlStrArr - An array that will contain the HTML string
 */
DataCollection.prototype.messagesToHtml = function (htmlStrArr)
{
    //we have to handle case when there are no messages
    var msgFound = false;
    for (var sev in this.messages)
    {
        msgFound = true;
        htmlStrArr.push('<br/>');
        htmlStrArr.push(sev);
        htmlStrArr.push('<br/>');
        var endstr = '</font>';
        if (sev === this.MESSAGE_TYPE_ERROR)
        	htmlStrArr.push('<font color="red">');
        else if (sev === this.MESSAGE_TYPE_WARN)
        	htmlStrArr.push('<font color="blue">');
        else
            endstr = '';

        var msgs = this.messages[sev];
        for (var i = 0; i < msgs.length; i++)
        	htmlStrArr.push(msgs[i] + '<br/>');
        htmlStrArr.push(endstr);
    }

    if (!msgFound)
    	htmlStrArr.push('<br/>There are no messages<br/>');
};
/**
 * Convert values stored in this DC instance to an HTML
 * ARGUMENTS:
 * 1. htmlStrArr - The array that will contain the returned HTML string
 */
DataCollection.prototype.valuesToHtml = function (htmlStrArr)
{
    //very unlikely that there are no name-value pairs. It is OK to say values and not print anything after that 
	htmlStrArr.push('<br/>Values are :<br/>');
	htmlStrArr.push('<table border="1"><tr><th>Variable</th><th>Value</th></tr>');
    for (var a in this.values)
    {
        if ((a == this.TRACE_FIELD_NAME) || (a == this.PERFORMANCE_FIELD_NAME))
            continue;
        htmlStrArr.push('<tr><td>');
        htmlStrArr.push(a);
        htmlStrArr.push('</td><td>');
        htmlStrArr.push(this.values[a]);
        htmlStrArr.push('</td></tr>');
    }
    htmlStrArr.push('</table>');
};
/**
 * Convert the grids stored in this DC instance into HTML
 * ARGUMENTS:
 * 1. htmlStrArr - The array that will hold the returned HTML
 */
DataCollection.prototype.gridsToHtml = function (htmlStrArr)
{
    var gridFound = false;

    for (var a in this.grids)
    {
        var thisGrid = this.grids[a];
        if (!thisGrid)
            continue;
        if (!gridFound)
        {
        	htmlStrArr.push('<br/>Grids are:');
            gridFound = true;
        }
        htmlStrArr.push('<br/>');
        var n = thisGrid.length;
        var m = n && thisGrid[0].length;
        htmlStrArr.push(a);
        htmlStrArr.push(' has ');
        if (!m)
        {
        	htmlStrArr.push(' no data.');
            continue;
        }

        htmlStrArr.push(n - 1);
        htmlStrArr.push(' data rows and ');
        htmlStrArr.push(m);
        htmlStrArr.push(' columns<br/><table border="1"><tr>');
        //header row
        var hdr = thisGrid[0];
        for (var j = 0; j < m; j++)
        {
        	htmlStrArr.push('<th>');
        	htmlStrArr.push(hdr[j]);
        	htmlStrArr.push('</th>');
        }
        htmlStrArr.push('</tr>');

        //data rows
        for (var i = 1; i < n; i++)
        {
        	htmlStrArr.push('<tr>');
            var row = thisGrid[i];
            for (var j = 0; j < m; j++)
            {
            	htmlStrArr.push('<td>');
            	htmlStrArr.push(row[j] || '&nbsp;');
            	htmlStrArr.push('</td>');
            }
            htmlStrArr.push('</tr>');
        }
        htmlStrArr.push('</table>');
    }
};
/**
 * Convert the lists stored in this DC instance to HTML
 * ARGUMENTS:
 * 1. htmlStrArr - The array that will hold the HTML string
 */
DataCollection.prototype.listsToHtml = function (htmlStrArr)
{
    var listFound = false;
    for (var a in this.lists)
    {
        var list = this.lists[a];
        if (!list)
            continue;
        if (!listFound)
        {
        	htmlStrArr.push('<br/>Lists are:<br/><table border="1" cellpadding="0" cellspacing="2"><tr><th>List Name</th><th>Values</th></tr>');
            listFound = true;
        }
        htmlStrArr.push('<tr><td>');
        htmlStrArr.push(a);
        htmlStrArr.push('</td><td>');
        htmlStrArr.push(list);
        htmlStrArr.push('</td></tr>');
    }
    if (listFound)
    	htmlStrArr.push('</table>');
};

/**
* Agent to make an Ajax call to an exility service
*/

/**
 * @module represents an adaptor to connect to an exility server for an ajax call
* Two possible usage scenarios:
* 1. There is a home page that is always present, and the application opens pages as iframes within this
*     (Exility client application use this technique) In this case, you include this file in the home page.
*     Set url in your home page, and individual pages can refer to this single object for service
* 2. Home page goes out of scope when individual pages are opened.
*    Include this file in each of your pages that need to make ajax calls and use this service
*/
var ExilityAgent = (function(){
	/*
	 * exility uses csrf header token for authentication
	 */
    var CSRF_HEADER = 'X-CSRF-Token';
    /*
     * and the header token has the value 'remove" when user logs out..
     */
    var REMOVE_CSRF = 'remove';
    
    /*
     * map logger, or make it dummy
     */
    var trace = null;
    if(window.debug){ //exility
    	trace = window.debug;
    }else if (window.logger && window.logger.trace){ //possible generic logger
    	trace = window.logger;
    }else{
    	trace = function(){};
    }
    
    var showMessage = null;
    if(window.message) { //exility
    	showMessage = window.message;
    }else{
    	showMessage = window.alert;
    }
	/*
	 * in case caller wants a one-way call, we can live with a dummy call back object
	 */
    var dummyCallBackObject = 
    {
		/*
		 * called when ajax call fails
		 */
        serviceFailed: function (code, msg)
        {
            showMessage('ERROR : Agent reported an error with code = ' + code + ' and msg = ' + msg);
        },

        /*
         * called when ajax call succeeds. dc is the data collection returned from the server
         */

        serviceReturned: function (dc)
        {
            trace('Call to server succeded.');
        }
    };

    /*
     * default time out is 2 minutes. Can be changed with a call to setTimeout()
     */
   var  timeout = 120000;
   /*
    * we keep track of all pending requests till they are disposed one way or the other
    */
   var  requests = {};
   
   /*
    * counter that acts as key for storing requests in requests object
    */
    var nextReqId = 1;
  
    /*
     * csrf token as returned by server, to be sent back to server each time
     */
    var csrfToken = null;
    /*
     * function called by XmlHttpRequest on state change.
     * note that "this" would refer to xmlHttpObject  
     */
    var stateChanged = function ()
    {
        if (this.readyState == 4){
        	ExilityAgent.serviceReturned(this);
        }
    };

	return {
		/*
		 * error codes returned by serve() method that the API users can use
		 */
		/**
		 * @constant serve() called before setting url using setUrl() method
		 */
	    ERROR_NO_URL : 1,
	    
	    /**
	     * @constant unable to connect to server. Possible network error, or invalid url
	     */
	    ERROR_CONNECTION_ERROR: 2,
	    
	    /**
	     * @constant server returned an error
	     */
	    ERRROR_HTTP_ERROR: 3,
	    
	    /**
	     * @constant server did not respond within reasonable time
	     */
	    ERROR_TIMED_OUT: 4,
	    
	    /**
	     * @constant server responded with a text that could not be parsed
	     */
	    ERROR_INVALID_RESPONSE: 5,
	    
	    /**
	     * @constant this user session has expired. you should re-authenticate
	     */
	    ERROR_SESSION_EXPIRED: 6,
	    
	    /**
	     *@constant  server requires authentication, and you have not authenticated
	     */
	    ERROR_NOT_LOGGED_IN: 7,
	    
	    /**
	     * @constant error on server.
	     */
	    ERROR_SERVER_ERROR: 8,
	    
	    /**
	     * @method change default timeout
	     * @param {integer} timeInSeconds time to wait for server to respond. default is two minutes
	     */
	    setTimeout: function (timeInSeconds)
	    {
	    	var t = parseInt(timeInSeconds);
	    	if(t)
	    		timeout = t * 1000;
	    },
	    
	    /**
	     * @method url to be used for the service. Note that exility uses just one url for the entire server. 
	     */
	    setUrl: function (serviceUrl)
	    {
	        url = serviceUrl;
	    },
	    
	    /**
	     * @method main method that asks for a service.setUrl() should have been called before this
	     * @param {string} serviceId service to b  service from server
	     * @param {object} callBackObject This object should have the desired method definitions for call back
	     * 	serviceReturned(dc) is called on success, and serviceFailed(messageId, message) on failure
	     * @param {DataCollection} dc data to be sent as part of this service request
	     * @param {boolean} waitForResponse default is false resulting in aan asynch call. 
	     * 	true value implies a sych call that will stall the execution thread till server returns
	     * @param {object} httpOptions refer to xmlHttpRequest of browser
	     * @returns {integer} a handle that can  be used to cancel() the call. null in case of error
	     */
	     serve: function (serviceId, callBackObject, dc, waitForResponse, httpOptions)
	     {
	         if (!callBackObject)
	             callBackObject = dummyCallBackObject;
	         else if (!callBackObject.serviceReturned || !callBackObject.serviceFailed)
	         {
	             showMessage('Callback object provided for serve() must have method serviceReturned(dc) for handling data returned from server, and serviceFailed(errorCode, errorMessage) to handle error. If you do not want to do any of these, pass null as callBackObject.');
	             return null;
	         }

	         var msg;
	         if (!url)
	         {
	             msg = 'Design error: url for server is not set before requesting a service';
	             trace(msg);
	             callBackObject.serviceFailed(ERROR_NO_URL, msg);
	             return;
	         }

	         trace('Received a request for service ' + serviceId);
	         if (dc)
	         {
	             trace('Data to be sent to serve\n' + dc.toHtml(), true);
	         }
	         else
	         {
	             dc = new DataCollection();
	         }
	         
	         dc.addValue('serviceId', serviceId);
	         var dcText = dc.serialize();

	         var httpObject = new XMLHttpRequest();
	         httpObject.startedAt = new Date();
	         httpObject.serviceId = serviceId;
	         httpObject.callBackObject = callBackObject;
	         /*
	          * keep all info about this request in httpObject, and save httpObject in a global collection
	          *  to be available for timeout function
	          */
	         var n = httpObject.reqId = nextReqId;
	         requests[n] = httpObject;
	         nextReqId++;
	         httpObject.timerHandle = setTimeout('ExilityAgent.timedOut(' + n + ')', timeout);
	         if (!waitForResponse) //asynch call
	         {
	             httpObject.onreadystatechange = stateChanged;
	         }
	         
	         //we are ready to contact server
	         try
	         {
	             httpObject.open( (httpOptions && httpOptions.requestMethod) || 'POST', url, !waitForResponse);
	             var contentType = (httpOptions && httpOptions.contentType) || 'text/html; charset=utf-8';
	             httpObject.setRequestHeader("Content-Type", contentType);
	             
	             if(csrfToken){
	             	httpObject.setRequestHeader(CSRF_HEADER, csrfToken);
	             }
	             httpObject.send(dcText);
	         }
	         catch (e)
	         {
	             msg = 'Error while requesting for url ' + url + '. ' + e;
	             trace(msg);
	             callBackObject.serviceFailed(ERROR_CONNECTION_ERROR, msg);
	             return null;
	         }
	         
	         /*
	          * if this is a synch call, we already have the response
	          */
	         if (waitForResponse)
	             serviceReturned(httpObject);
	         else
	             return n; //caller can use this index to cancel
	     },
	    
	     /**
	      * @method cancel a service request
	      * @param {integer} idx index that was returned to you by serve() method
	      * @return {boolean} true if the service request cancelled successfully, false otherwise
	      */
	     cancel: function (idx)
	     {
	         var httpObject = requests[idx];
	         if (!httpObject){
	             trace(idx + ' is not a valid handle to a service request.');
	        	 return false;
	         }
	         clearTimeout(httpObject.timerHandle);
             httpObject.gotCancelled = true;
             httpObject.timerHandle = null;
             delete requests[idx];
             trace('Service request for ' + httpObject.serviceId + ' was cancelled by caller.');
             return true;
	     },
	     
	     /**
	      * called by window timer. Hence it has to be public
	      */
	     timedOut: function (n)
	     {
	         var httpObject = requests[n];
	         if(!httpObject){
	             trace('Design error: timedOut called with ' + n + ' which is not a valid inidex to a service call.');
	        	 return false;
	         }
	         httpObject.timerHandle = null;
	         delete requests[n];
	         var msg = 'Request to url ' + url + ' for service ' + httpObject.serviceId + ' did not return within ' + timeout / 1000 + ' seconds. Giving-up.';
	         trace(msg);
	         httpObject.callBackObject.serviceFailed(ERROR_TIMED_OUT, msg);
	         return true;
	     },

	     /**
	      * @method call back method for xmlHttpRequest, hence this method is public
	      * @param {XmlHttpRequest} httpObject
	      * @returns true if all ok, false otherwise
	      */
	     serviceReturned: function (httpObject)
	     {
	         if (!httpObject.timerHandle) //it got timed out
	         {
	             trace(httpObject.serviceId + ' did come back,' + httpObject.gotCancelled ? ' but caller had already cancelled it.' : 'but too late to avoid a time-out.');
	             return false;
	         }

	         clearTimeout(httpObject.timerHandle);
	         httpObject.timerHandle = null;
	         delete requests[httpObject.reqId];
	         if (httpObject.status < 200 || httpObject.status >= 300)
	         {
	             var msg = 'Http Error: Request for service ' + httpObject.serviceId + ' failed with status : ' + httpObject.status + ' - ' + httpObject.statusText;
	             trace(msg);
	             httpObject.callBackObject.serviceFailed(ExilityAgent.HTTP_ERROR, msg);
	             return false;
	         }

	         var responseText = httpObject.responseText;
	         var myDc = new DataCollection();
	         if (responseText.length > 0)
	         {
	             try
	             {
	                 if (responseText.substr(0, 15).indexOf('var dc = ') >= 0)
	                 {
	                     //legacy code that was used before xmlHttp
	                     eval(responseText); //this creates an object dc, but we want an instance of DataCollection()
	                     myDc.fromDc(dc);
	                 }
	                 else
	                     myDc.deserialize(responseText);
	             }
	             catch (e)
	             {
	                 msg = 'Error while evaluating data returned by server. ' + e;
	                 trace(msg);
	                 trace('Text recd from server:');
	                 trace(responseText, true); //we do not want any html formatting
	                 httpObject.callBackObject.serviceFailed(ERROR_INVALID_RESPONSE, msg);
	                 return false;
	             }
	         }

	         //last possible error : authentication
	         var aStstus = myDc.getValue(myDc.AUTHENTICATION_STATUS);
	         if (aStstus && aStstus != '0')
	         {
	             var msg;
	             if (aStstus == '1')
	             {
	                 msg = 'Session expired';
	                 trace(msg);
	                 httpObject.callbackObject.serviceFailed(ERROR_SESSION_EXPIRED, msg);
	                 return false;
	             }
                 msg = 'Authentication failed. May be you are not logged-in.';
	             trace(msg);
                 httpObject.callbackObject.serviceFailed(ERROR_NOT_LOGGED_IN, msg);
	             return false;
	         }
	         
	         /**
	          * process CSRF token
	          */
	         var t = httpObject.getResponseHeader(CSRF_HEADER);
	         if(t){
	         	if(t === REMOVE_CSRF)
	         		csrfToken = null;
	         	else
	         		csrfToken = t;
	         }

	         //alright.. everything is aaaalright!!
	         trace('Time taken for service ' + httpObject.serviceId + ' : ' + (new Date() - httpObject.startedAt) + ' ticks.');
	         var txt = myDc.removeValue(myDc.PERFORMANCE_FIELD_NAME);
	         if (txt)
	         {
	             trace('Server Performance : ');
	             trace(txt);
	         }

	         txt = myDc.removeValue(myDc.TRACE_FIELD_NAME);
	         if (txt)
	         {
	             trace('******* begin trace from server ********');
	             trace(txt);
	             trace('******* end server trace ********');
	         }

	         trace('Data returned:');
	         myDc.addValue('serviceId', httpObject.serviceId);
	         trace(myDc.toHtml(), true);
	         httpObject.callBackObject.serviceReturned(myDc);
	         return true;
	     }
	    
	};
})();
