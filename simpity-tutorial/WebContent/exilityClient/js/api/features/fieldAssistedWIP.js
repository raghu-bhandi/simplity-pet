/**
 * temp variable used
 */
var a;
/**
 * this field is designed as the next-gen answer to increasing expectation from UI.
 * In general, we say that we assist the user in getting the right value in the simplest possible way
 * Basic approach is to design different "assistant"s for different situations.
 */
var AssistedInputField = function ()
{
    AbstractInputField.call(this);
	this.requiresValidation = true;
};

AssistedInputField.prototype = new AbstractInputField;

a = AssistedInputField.prototype;

/**
 * whether to select values based on starting characters, or finding characters anywhere
 */
a.matchStartingChars = false;
a.helpText = 'Help is not available on this field';
/**
 * this is in the form of valid list..
 */
a.FETCHING_MESSAGE = [['', 'Fetching.....']];
a.FETCHING_MESSAGE.stillFetching = true;

/**
 * called from after adding this field to the fields collection by P2 
 */
a.initialize = function ()
{
    /**
     * we keep a single assistant for a page, as we assist one field at a time anyways..
     */
    if (!this.P2.ia)
        this.P2.ia = new InputAssistant(this.P2);

    if (this.valueList) //it comes as string, convert that to array of arrays
    {
        var vals = this.valueList.split(';');
        this.valueList = [];
        for (var i = 0; i < vals.length; i++)
        {
            var pair = vals[i].split(',');
            var row = [pair[0].trim()];
            if (pair[1])
                row.push(pair[1].trim());
            else
                row.push(row[0]);
            this.valueList.push(row);
        }
    }
    var ele = this.P2.doc.getElementById(this.name);
    if (ele)
    {
        if (this.valueList || this.listServiceId || this.suggestionServiceId)
        {
            ele.autocomplete = false;
        }
    }
};

/**
 * set min and max date for this field, if it happens to be a date field. 
 * These values over-ride the ones set by the underlying data type.
 * Leave either min or max null if you do not want to over-ride, 
 * or if you want to reset a value that was set earlier
 * @param min{Date} minimum date optional
 * @param max {Date} max date optional
 */
a.setMinMax = function(min, max)
{
		this.minDate = min;
		this.maxDate = max;
};

a.setValueToObject = function (ele, val)
{
    if (!this.valueList && !this.valueLists) //simple input field
    {
        ele.value = val;
        return;
    }

    //possible that the val to be set is an internal value, and we may have to render a matching text in the view
    ele.internalValue = val;

    //if this.valueList exists, it means there is only one list of values. Otherwise we will have this.valueLists[] array with one entry for each row.
    var vList = this.valueList; //list of possible values
    if (!vList) //value list for each row, probably
    {
        vList = this.valueLists[ele.rowIdx];
        if (!vList) // this row does not have list of values as of now. create empty one
        {
            this.valueLists[ele.rowIdx] = vList = [];
        }
    }

    var displayValue = '';
    if (val || val === '')
    {
        var valueFound = false;
        for (var i = 0; i < vList.length; i++)
        {
            var row = vList[i];
            if (row[0] == val) //found matching internal value
            {
                displayValue = row[1] || val;
                valueFound = true;
                break;
            }
        }
        if (!valueFound)
        {
            displayValue = val;
            //possible if values list is yet to arrive, or some issue with data. We ALWAYS assume that the value being set is VALID. Hence we add this value to the list
            debug(val + ' is not found in the list of values for ' + this.name);
            vList.push([val, val]);
            ele.valueNotFoundInList = true;
        }
        else if(ele.valueNotFoundInList) //was not found earlier...
           delete  ele.valueNotFoundInList;
    }

    ele.value = displayValue;
    return;
};

a.getValueFromObject = function (obj)
{
    if (obj.internalValue || obj.internalValue == '')
        return obj.internalValue;
    return obj.value || '';
};

//inherit from SelectionField
a.callListService = SelectionField.prototype.callListService;
/**
 * it is possible that a value-list is attached to this assisted field. 
 * "display value" of a value in such a case is the value in the second column for a matching first column
 */
a.getDisplayVal = function(val)
{
	if(!this.valueList)
	{
		if(val)
			return val;
		return '';
	}	
	var dataGrid = this.valueList;
	if(!val && val != 0)
		val = this.internalValue;
	var rowIdx = findRowIndex(dataGrid, val, 0);
	if(rowIdx >= 0)
	{
		return dataGrid[rowIdx][1] || dataGrid[rowIdx][0];
		
	}
	debug('display value for [' + val + "] not found");
	return val || '';	
};


/**
 * has the view-value changed from its model value?
 * @override  Field will override it because it has more than one assistants for field.
 * @param obj : This is an object represents to html ele.
 * @returns {Boolean}
 * @author Anant on 29 Jan 2014
 */
a.isChanged = function(obj)
{
	//get the model value
	var val = this.getValue();	
	//It might be a list or suggestion list so get the display value
	if(this.valueList)
	{
		val = this.getDisplayVal(val);	
	}
	
	return ( val != obj.value);	
};

//called back when server returns valueList for this field. Refer to SelectionField.
a.fillList = function (grid, ele, keyValue, listServiceOnLoad)
{
    if (!ele && !this.table) //it is a simple field, but ele is not passed
        ele = this.P2.getFieldObject(this.name);

    if (this.blankOption)
        grid = this.addBlankOption(grid);
    var vlist = [];
    for (var i = 1; i < grid.length; i++) //we skip the header.
        vlist.push(grid[i]);

    if (!this.table || this.sameListForAllRows)
        this.valueList = vlist;

    else//list of value could be different for each row
    {
        if (!this.valueLists)//collection, indexed by row.
            this.valueLists = new Object();
        if (!ele)
        {
            debug('ele not found for fillList. pushing to current row for ' + this.name);

        }
        this.valueLists[ele ? ele.rowIdx : this.table.currentRow] = vlist;
    }

    var val = '';
    if (this.selectFirstOption && vlist.length)
    {
    	var v = vlist[0][0];
    	if( v || v === '' )
    		val = v;
    }

    //is there an assistant active for this field?
    var assistant = this.P2.ia && this.P2.ia.assistant;
    if (assistant && assistant.field != this)
        assistant = null;

    if (ele && (!this.table || this.sameListForAllRows == false)) //let us just deal with this ele and get out
    {
        //it is possible that the internal value was set when value list was not available
        if (ele.valueNotFoundInList)
            this.setValueToObject(ele, ele.internalValue);

        else
            this.setValue(val, ele, null, null, true, false, listServiceOnLoad);

        //did we get this when the field is in focus, and an assistant is active?
        if (assistant && assistant.ele === ele)
            assistant.restart(vlist);
    }

    else if (val && this.table && this.sameListForAllRows)
    {
        //set default value for all rows in the table
        var data = this.table.grid;
        for (var i = 1; i < data.length; i++)
        {
            var row = data[i];
            if (row && row.isDeleted == false)
            {
                ele = this.P2.getFieldObject(this.name, i);
                if (ele.valueNotFoundInList)
                    this.setValueToObject(ele, ele.internalValue);

                else
                    this.setValue(val, ele, i, null, true, false, listServiceOnLoad);
                if (assistant && assistant.ele === ele)
                    assistant.restart(vlist);
            }
        }
    }
};

a.addBlankOption = function (grid)
{
    var header = grid[0];
    var firstRow = [];
    var n = header.length;
    //create a row with same number of columns
    for (var j = 0; j < n; j++)
        firstRow.push('');

    //add blank option as display value of first row
    firstRow[1] = this.blankOption;

    var newGrid = [header, firstRow];
    //add all rows
    for (var i = 1; i < grid.length; i++)
    {
        var row = grid[i];
        if (n == 1) //single column
            row.push(row[0]);
        newGrid.push(row);
    }
    return newGrid;
};

//caller will have to handle null if this field does not have value list
a.getValueList = function (ele)
{
    if (this.valueList)
        return this.valueList;
    //each row has separate valueList. these are in valueLists{}
    if (this.valueLists)
    {
        var vlist = this.valueLists[ele.rowIdx];
        if (!vlist)//only possibility is that the list service is in-progress for this row
        {
            this.valueLists[ele.rowIdx] = vlist = this.FETCHING_MESSAGE;
        }
        return vlist;
    }

    if (this.listServiceId) //list service has not fired yet!!!
    {
        debug(this.name + ' does not have valueList though it has a list service attached to that');
        return this.FETCHING_MESSAGE;
    }

    return null;
};

/**
 * get suggested values from server for the chars that are typed into this field
 * @param ele dom element
 * @param val current value
 * @returns
 */
a.getSuggestions = function (ele, val)
{
    var dc = new DataCollection();
    dc.addValue(this.unqualifiedName || this.name, val);
    if (this.suggestionServiceFields)
    {
    	var nbrFields = this.suggestionServiceFields.length;
        for (var i = 0; i < nbrFields; i++)
        {
            var fieldName = this.suggestionServiceFields[i];
            var field = this.P2.getField(fieldName);
            if (field && field.unqualifiedName)
                fieldName = field.unqualifiedName; 
            var v;
            if (this.suggestionServiceFieldSources)
                v = this.P2.getFieldValue(this.suggestionServiceFieldSources[i]);
            else
                v = field.getValue();
            dc.addValue(fieldName, v);
        }
    }
    this.courier = new FieldServiceCourier(this, ele, val);
    var se = new ServiceEntry(this.suggestionServiceId, dc, false, null, this.courier, this.name, ServerAction.NONE, false, false, null);
    this.P2.win.serverStub.callService(se);
};

//called from this.courier after ensuring that this indeed is the CURRENT expected data
a.gotSuggestions = function (dc, ele, val)
{
    //if this field is in focus, then we will have ia attched..
    if (!this.beingAssisted)
    {
        debug('Suggested values service came too late for field ' + this.name);
        return;
    }

    var data = null; //get the first grid
    for (var gridName in dc.grids)
    {
        data = dc.grids[gridName];
        break;
    }
    this.P2.ia.assistant.setSuggestions(ele, val, data);
};

//called onfocus event. we are to return false if this is a false start
a.focussed = function (ele)
{
    //debug(ele.id + ' focussed.');
    return(this.P2.ia.start(this, ele));
};

//we are to return false if this is a false end!!
a.blurred = function (ele)
{
    //debug(ele.id + ' blurred ');
    return(this.P2.ia.end(this, ele));
};

//temp object created to provide a callback method to callService()
FieldServiceCourier = function (field, ele, val)
{
    this.field = field;
    this.ele = ele;
    this.val = val;
};
//a callBackObject needs to implement serviceReturned() method
FieldServiceCourier.prototype.serviceReturned = function (dc)
{
    if (this.field.courier !== this)
    {
        //another courier is fired. this is obsolete
        debug('User has typed before we could suggest for what she had already typed for field ' + this.field.name);
        return;
    }

    this.field.courier = null;
    this.field.gotSuggestions(dc, this.ele, this.val);
};

/*********************** assistant that assists assistedInputField **************************/
//class for Input Assistantr. CommonField.initialize() ensures that P2.ia is initiated to an instance of this class
//.start() is triggered onfocus() for the ele via P2.commonFieldFocussed()
InputAssistant = function (page)
{
    this.P2 = page;
    this.win = page.win;
};

a = InputAssistant.prototype;

//start assisting this element
a.start = function (field, ele)
{
    if (this.ele && this.ele === ele) //focus had drifted to, probably an assistant, and it is back now.
        return false;

    this.ele = ele;
    this.field = field;
    this.oldValue = ele.value;
    field.beingAssisted = true;

    dataType = dataTypes[field.dataType];
    if (dataType && dataType.basicType == AbstractDataType.DATE)
    {
        if (!this.dateAssistant)
            this.dateAssistant = new DateAssistant(this.P2);
        this.assistant = this.dateAssistant;
        this.assistant.start(field, ele, dataType);
        return true;
    }

    //fixed list?
    this.vList = null;
    var vList = field.getValueList(ele);
    if (vList)
    {
        if (!this.listAssistant)
            this.listAssistant = new ListAssistant(this.P2);
        this.assistant = this.listAssistant;
        this.assistant.start(field, ele, vList);
        //this.listener = this.P2.addListener(ele, 'keydown', this.P2.ia, 'keyDowned');
        return true;
    }

    //suggestions?
    if (field.suggestionServiceId)
    {
        if (!this.suggestionAssistant)
            this.suggestionAssistant = new SuggestionAssistant(this.P2);
        this.assistant = this.suggestionAssistant;
        this.assistant.start(field, ele);
        return true;
    }

    //we don't know how else to assist
    debug('Unable to assist field ' + field.Name);
    this.ele = null;
    field.beingAssisted = false;
    //but still, this is not a false start. that is, caller should continue with the start event. Hence return true.
    return true;
};

//done with. close shop and go home.
a.end = function (field, ele, toMoveOn)
{
    //debug('end request for ' + ele.id + ' while this.ele is ' + (this.ele && this.ele.id) + ' and retainFocus=' + this.toRetainFocus + ' and letitgo=' + this.letItGo);
    //if we didn't start() for this ele, shouldn't be end()ing as well!!
    if (ele && ele !== this.ele)
        return false;

    if (this.toRetainFocus)//we are to retain focus on the input field, because our preview says that calendar area is clicked
    {
        //if the month is clicked, then we should let the focus go to that (And still report to the caller that blur should not continue)
        if (this.letItGo)
            this.letItGo = false;
        else
            new TimeBomb(this.ele, 'focus', null, 0, this.win); //we are queing it rather than this.ele.focus(). Why ?? there is a long story about browser compatibility..
        return false;
    }

    if (this.assistant)
    {
        this.assistant.end(ele);
        this.assistant = null;
    }
    else
    {
        debug('Possible error. trying to close an assistent that was never created');
    }

    field.beingAssisted = false;
    this.ele = null;
    return true;
};
/*************************
event handling for calendar.
1. month drop-down is the only control that can take focus
2. we should treat the field and calendar together as one control. That is, any movement betwen teh two should not trigger focus/blur event for the field
3. user can either type of select from the calendar.
Our design is:
1.
*******************************/
//called whenever mouse downed on an assistant, that may take the input focus away from the ele.
//we have to simulate as if ele and assistant together form one unit, and any focus-blur between them is to be ignored
a.mouseDownedOnAssistant = function ()
{
    debug(' mouse downed on an assistamt');
    //this is a warning that our ia area is being clicked, because of which blur is going to be triggered
    this.toRetainFocus = true;
    //however, in nonIE, onscroll does not take the focus away from the input element.
    //and, what is 'funny' is, if you click on scroll bar, onmousedown event is fired on the element, but on onclick
    //hence, we just switch this flag afer all events trigger when mouse down happens (mousedown, focus and blur)
    new TimeBomb(this, 'mousedownEventsDone', false, 0, this.win);
};

//called from the tomer above. reset toRetainFocus
a.mousedownEventsDone = function ()
{
    debug('all mousedown related events done. toRetainFocus will be set to false');
    this.toRetainFocus = false;
};
//three cases to be handled : 1. user clicked on the input element, 2. clicked on other part of calendar, 3. others

a.monthBlurred = function ()
{
    debug('month blurr event fired with to retain focus = ' + this.toRetainFocus);
   if (this.toRetainFocus) //blurred because mouse is downed on some other area on the calendar
        new TimeBomb(this.ele, 'focus', null, 0, this.win);
   else this.end(this.field, this.ele, true);
};

/********************************* DateAssistant *****************************/
var DateAssistant = function (p2)
{
    this.P2 = p2;
    this.win = p2.win;
    var doc = p2.doc;
    var div = doc.createElement('div');
    div.className = 'cal';
    div.style.position = 'absolute';
    div.innerHTML = this.paintCal();
    doc.body.appendChild(div);

    //cache frequently used elements
    this.viewStyle = div.style;
    this.yearEle = doc.getElementById('cal_year');
    this.monthEle = doc.getElementById('cal_month');
    this.dayEle = doc.getElementById('cal_dates');
};

var a = DateAssistant.prototype;
a.weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
a.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

//start calendar assistant
a.start = function (field, ele, dataType)
{
    debug('Date assistant started for ' + ele.id + ' with value ' + ele.value);
    this.field = field;
    this.ele = ele;
    this.lastValue = ele.value;
    var xy = getDocumentXy(ele);
    this.viewStyle.top = (xy.y + ele.clientHeight + 1) + 'px';
    this.viewStyle.left = xy.x + 'px'; //-1 to take care of border
    var today = getToday();

    this.minDate = field.minDate || getToday(-dataType.maxDaysBeforeToday);
    this.tmin = this.minDate.getFullYear() * 100 + this.minDate.getMonth();

    this.maxDate = field.maxDate || getToday(dataType.maxDaysAfterToday);
    this.tmax = this.maxDate.getFullYear() * 100 + this.maxDate.getMonth();
    var val = ele.value;
    if (val)
        val = parseDate(val);

    if (!val) //not a date
    {
        if (dataType.maxDaysBeforeToday < 0) //only future datesa are valid. Pick the first valid date
            val = gettToday(-dataType.maxDaysBeforeToday);
        else if (dataType.maxDaysAfterToday < 0) //only past dates are valid. pick the nearest one to today.
            val = getToday(dataType.maxDaysAfterToday);
        else
            val = today;
    }
    this.year = this.oYear = val.getFullYear();
    this.month = this.oMonth = val.getMonth();
    this.date = this.oDate = val.getDate();
    this.yearEle.innerHTML = this.year;
    this.monthEle.selectedIndex = this.month;

    this.render();
    this.viewStyle.display = '';
};

a.end = function ()
{
    debug('Date assistant done with for ' + this.ele.id );
    this.viewStyle.display = 'none';

};
//return the text that is a valid html fragment for the calendar
a.paintCal = function ()
{
    var s = new Array();
    s.push('<table id="cal_table" onmousedown="P2.ia.mouseDownedOnAssistant(event)" ><tr><td id="cal_header"><div id="cal_prev" onclick="P2.ia.assistant.changeYear(-1)"></div><div id="cal_year">Year</div><div id="cal_next" onclick="P2.ia.assistant.changeYear(1)" ></div><div id="cal_month_div"><select id="cal_month" onmousedown="P2.ia.letItGo = true;" onblur="P2.ia.monthBlurred();" onchange="P2.ia.assistant.changeMonth()" >');
    for (var i = 0; i < 12; i++)
    {
        s.push('<option value="' + i + '">');
        s.push(exilParms.monthNames[i]);
        s.push('</option>');
    }
    s.push('</select></div></td></tr><tr><td><table id="cal_dates_table"><thead><tr>');
    for (var i = 0; i < 7; i++)
    {
        s.push('<th>');
        s.push(this.weekDays[i]);
        s.push('</th>');
    }
    s.push('</tr></thead><tbody id="cal_dates" onclick="P2.ia.assistant.clicked(event);">');
    for (var i = 0; i < 6; i++)
    {
        s.push('<tr>');
        for (var j = 0; j < 7; j++)
            s.push('<td>&nbsp;</td>');
        s.push('</tr>');
    }
    s.push('</tbody></table></td></tr></table>');
    return s.join('');
};

// change the dates for the painted callendar for current selected values
a.render = function ()
{
    this.yearEle.innerHTML = this.year;
    this.monthEle.selectedIndex = this.month;

    //we have to disable dates that are not valid. css class is set based on that
    var classForAll = null;
    var min = 0;
    var max = 32;

    //this.tmin is set to yyyymm where yyyy is the min year and mm is month. this is a number
    //this.tmax is on similar lines
    var t = this.year * 100 + this.month;
    if (t < this.tmax && t > this.tmin)
        classForAll = 'ok'; //all dates in this month are in valid range
    else if (t < this.tmin || t > this.tmax)
        classForAll = 'nok'; //all dates areoutside range
    else //some days are in range
    {
        if (t == this.tmin) //we are in the min month
            min = this.minDate.getDate();
        if (t == this.tmax)
            max = this.maxDate.getDate();
    }
    var curDate = -1; //current date is not in this month
    if (this.year === this.oYear && this.month === this.oMonth)
        curDate = this.oDate; //to be highlighted

    //let us write dates into our table cells
    var firstOfThisMonth = new Date(this.year, this.month, 1);
    var startingCell = firstOfThisMonth.getDay(); //day of week this month starts
    var en = this.daysInMonth[this.month];
    if (this.month == 1 && (this.year % 4) == 0 && (this.year % 100))// i will not bother about another 400 years..
        en = 29;

    var val, cls;
    var dateNumber = 1;
    var rows = this.dayEle.childNodes;
    
    //Bug: Rows cant be fixed to 5. It can very 4 to 6.Below is the simple logic which calculates required rows for given days.
    //Anant on 20/01/2014
    var rowsToBePainted = Math.ceil((en + startingCell)/7);

    for (var i = 0; i < rowsToBePainted; i++)
    {
        var row = rows[i];       
        var cells = row.childNodes;
        //Make it visible if hided
        row.style.display = '';
        for (var j = 0; j < 7; j++)
        {
            var cell = cells[j];
            //first row may have some empy cells in the beginning. Also the cells after the last date of the month
            if ((i == 0 && j < startingCell) || dateNumber > en)
            {
                val = ' ';
                cls = 'empty';
            }
            else
            {
                val = dateNumber;
                dateNumber++;
                //what  is the css we have to apply to this cell?
                if (val == curDate)
                {
                    this.selectedTd = cell;
                    cls = 'sel';
                }
                else if (classForAll)
                    cls = classForAll;
                else if (val >= min && val <= max)
                    cls = 'ok';
                else
                    cls = 'nok';
            }
            cell.className = cls;
            cell.firstChild.nodeValue = val; //we avoid using innerHTML as ie does not like it for table elements
        }
    }
    
   //hide extra row if exist. 
   if(rows[rowsToBePainted])
   {
	  rows[rowsToBePainted].style.display = 'none';
   }	  
};

//we use mouseDown as a sneak-preview into click and prepare accordingly
a.mouseDowned = function ()
{
    //this is a warning that our ia area is being clicked, because of which blur is going to be triggered
    this.toRetainFocus = true;
    //however, in nonIE, onscroll does not take the focus away from the input element.
    //and, what is 'funny' is, if you click on scroll bar, onmousedown event is fired on the element, but on onclick
    //hence, we just switch this flag afer all events trigger when mouse down happens (mousedown, focus and blur)
    new TimeBomb(this.P2.ia, 'retainFocus', false, 0, this.win);
};

//onclick anywhere on the calendar
a.clicked = function (e)
{
    debug('calendar clicked');
    var ele = e.target || e.srcElement;
    if (ele.nodeType == 3)
        ele = ele.parentNode;
    if (ele.className != 'ok' && ele.className != 'sel') //clicked on a cell that is not a valid date
        return;

    var d = new Date(this.year, this.month, parseInt(ele.innerHTML, 10));
    var dt = dataTypes[this.dataType];
    if(dt && dt.includesTime)
    	this.ele.value = formatDateTime(d);
    else
    	this.ele.value = formatDate(d);
    
    this.P2.focusNext(this.field, this.ele);
};

//called when arrow mark for next/prev year is clicked
a.changeYear = function (incr)
{
    this.year += incr;
    this.render();
};

//called when month is selected from drop-down box
a.changeMonth = function ()
{
    this.month = this.monthEle.selectedIndex;
    this.render();
};


/************ 
fixed-list assistant : behaves like a drop-down, well almost.
1. All values are displayed.
2. As user types, list is shortened to show only rows that start with the typed characters. (this behaviour is an improvement(?) over drop-down
3. first matching row is also selected.
4. If user types a character that results in no-match, a sound is produced, and that character,a nd any subsequent ones are all ignored
5. A pause of 500 millisecond is considered to be end of seleciton process. Subsequent typing is considered to be a fresh start
6. up/down arrow keys work.
7. escape key restores old value and abandons selection. Focus is still retained.
8. click on a row selects the row and simulates a tab. 
we handle onkeydown and cancel the event, so that onkeppress never triggers.
***************/
var ListAssistant = function (p2)
{
    this.P2 = p2;
    this.win = p2.win;

    //create the assistant container, only once for a page
    if (!p2.listDiv)
        p2.listDiv = this.createListDiv(p2.doc);

    this.div = p2.listDiv;
};

a = ListAssistant.prototype;

a.createListDiv = function (doc)
{
    var div = doc.createElement('div');
    div.innerHTML = '<div id="list_assistant" style="position:absolute; z-index:3;display:none" onmousedown="P2.ia.assistant.rowClicked(event)"></div>';
    //we need ul element and not div
    div = div.firstChild;
    if (div.nodeType == 3)//some browsers insert text-elements all-over the place
        div = div.nextSibling;
    doc.body.appendChild(div);
    return div;
};
//start assisting an input element. this is typically invoked onfocus of the field
a.start = function (field, ele, vList, isRestart)
{
    this.field = field;
    this.ele = ele;
    this.displayValue = this.oldValue = this.ele.value;
    this.oldInternalValue = this.ele.internalValue;
    this.vList = vList;
    this.nbrRows = vList.length;

    //this.colIdx is the column that is used for matching. Additionally, it is possible that we are displaying other columns as well.
    //If so, such columnsa are in this.colIndexes
    if (field.columnIndexesToShow)
    {
        var indexes = field.columnIndexesToShow.split(',');
        this.colIdx = parseInt(indexes[0], 10);
        if (indexes.length > 1)
        {
            this.colIndexes = [];
            for (var i = 0; i < indexes.length; i++)
            {
                this.colIndexes.push(parseInt(indexes[i], 10));
            }
        }
    }
    else
    {
        //second column is what we have to use, if it exists of course
        if (vList.length && vList[0].length > 1)
            this.colIdx = 1;
        else
            this.colIdx = 0;
    }

    this.ucasedValues = []; //caches uppercased values for performance
    this.val = null; //tracks the characters typed so far
    this.wrongChars = false; //has the user already typed characters with no match?
    this.curRow = null;
    this.position();
    this.render();
    if (!isRestart)
    {
        //let onkeydown from this element call this.keyDowned()
        this.listener = this.P2.addListener(ele, 'keydown', this, 'keyDowned');
    }
    if (this.oldValue)
        this.matchARow(this.oldValue);
};

//bring the assistant just below the field
a.position = function ()
{
    var xy = getDocumentXy(this.ele); //part of exility utility
    var style = this.div.style;
    style.top = (xy.y + this.ele.clientHeight - 1) + 'px'; //(ele.offsetTop + ele.clientHeight) + 'px';
    style.left = (xy.x - 1) + 'px'; //ele.offsetLeft + 'px';
    if (this.field.listCss)
        this.div.className = this.field.listCss;
    else
    {
        this.div.className = '';
        style.width = (this.field.listWidth || this.ele.clientWidth) + 'px';
    }
};

//done..
a.end = function ()
{
    //is user leaving behind junk value
    if (this.displayValue != this.ele.value)
    {
    	//if this is mandatory, we will revert to last valid value
    	if(this.field.isRequired)
    	{
    		if(this.ele.value)
                this.ele.value = this.displayValue;
    		else
    			this.displayValue = '';
    	}
    	else 
    	{
        	//select first row if it is for blank
    		if(this.vList[0][0] === '')
    			this.select(null, 0);
        	else 
        		this.ele.value = this.displayValue = '';
    	}
    }

    //debug('List assistance done. Bye..');
    this.P2.removeListener(this.listener);
    this.div.style.display = 'none';
};

//for readonly, i.e. fixed list of options. key is keyCode and shift is true if user had pressed shift key
//this is not used as of now.
a.keyDowned = function (e)
{
    var key = e.keyCode;
    if (key === 9)//tab
        return;
    if (key === 27)//esc
    {
        this.cancel();
        return;
    }

    if (!this.vList.stillFetching)//are we still waiting for values
    {
        if (key === 38) //up
            this.moveUpDown(true, e.shiftKey);

        else if (key === 40) //down
            this.moveUpDown(false, e.shiftKey);

        else if (key < 48 || key > 90) //not the characters we expect
        {
            if (key != 32 && (key < 96 || key > 111)) //well, 32 is space, and 96-111 is numeric pad
                return;
        }
        this.matchARow(String.fromCharCode(key));
    }

    if (e.preventDefault)
        e.preventDefault();
    else
        e.returnValue = false;
};

a.moveUpDown = function (up, shift)
{
    this.val = null;
    if (shift)
    {
        this.scroll(up);
        return;
    }
    if (!this.curRow)
        this.select(null, 0); //let start

    var row;
    if (up)
        row = (this.curRow && this.curRow.previousSibling) || this.div.lastChild;
    else
        row = (this.curRow && this.curRow.nextSibling) || this.div.firstChild;

    this.select(row);

    return;
};

a.matchARow = function (val)
{
    if (this.val) //continuous typing
    {
        if (this.wrongChars)
            return;

        this.val += val;
    }
    else
    {
        this.wrongChars = false;
        if (val == ' ') //at this time, I am unable to see why space is accepted. Hence trapping right here
            return;
        this.val = val;
    }
    var row, idx;
    //start from current row, or from the beginning
    if (this.curRow)
    {
        row = this.curRow;
        idx = +row.getAttribute('idx');
    }
    else
    {
        row = this.div.firstChild;
        idx = 0;
    }
    var i = idx;
    while (true)//look for break.. see if a row exists for all chars.
    {
        var v = this.ucasedValues[i];
        if (!v)
        {
            v = this.vList[i] && this.vList[i][this.colIdx];
            if (!v.toUppercase)
                v = new String(v);
            v = this.ucasedValues[i] = v.toUpperCase();
        }
        if (v.indexOf(this.val) == 0) //indeed started with the typed chars.
        {
            this.select(row);
            break;
        }
        row = row.nextSibling;
        i++;
        if (i == this.nbrRows)//loop back
        {
            row = this.div.firstChild;
            i = 0;
        }
        if (i === idx) //reached back. No luck
        {
            this.wrongChars = true; //small optimization. Any more typing is ignored..
            break;
        }
    }
    if (this.timer)
    {
        this.timer.stop();
        this.timer = null;
    }
    //if user pauses, current selection aborts..
    this.timer = new TimeBomb(this, 'resetValue', null, 1000, this.win);
};

//user has paused typing. Assume end of typing to select a row
a.resetValue = function ()
{
    this.val = null;
    this.wrongChars = false;
};

//row is the dom <div> element. idx is the index of the seletced row.
a.select = function (row, idx)
{
    if (row)
        idx = parseInt(row.getAttribute('idx'), 10);
    else if (idx || idx == 0)
        row = this.div.childNodes[idx];

    if (this.curRow)
        this.curRow.className = '';

    if (row)
    {
        row.className = 'selected';
        this.curRow = row;
        this.displayValue = this.ele.value = this.vList[idx][this.colIdx];
        this.ele.internalValue = this.vList[idx][0];
    }
    else
    {
        this.curRow = null;
    }
    //We need to select and focus so that the carrot is not visisble...
    this.ele.focus();
    if(this.ele.select)
        this.ele.select();
    
    //is the actual row visible?
    if (!this.isScrolled || !row)
        return;
    
    var n = row.offsetTop;
    if (n < this.div.scrollTop) //this row is scrolled-up. That is it is above visible rows
    {
        this.div.scrollTop = n; //bring currtent row to top
        return;
    }
    //row is somwhere below the top visible row
    row = row.nextSibling;
    if (row) //next sibling exisits, means selected row is not the last row
    {
        if (n > (this.div.scrollTop + this.div.clientHeight)) //next row is below the last visible row
            this.div.scrollTop = n - this.div.clientHeight; //scroll just enough for the top of this to be visible. That way, our row WILL be visible
    }
    else//our row was the last row. scroll to the last page.
        this.div.scrollTop = this.div.scrollHeight - this.div.clientHeight;
};

//called as an event handler when user clicks on any of the row.
a.rowClicked = function (e)
{
    var row = e.target || e.srcElement;
    if (row.nodeType == 3)
        row = row.parentNode;
    var idx = parseInt(row.getAttribute('idx'), 10);
    if (!idx && idx != 0)
    {
        debug('Suprising that there was a click on a dom element with no idx attriute. click ignored');
        return;
    }
    //this click action ends up executing after whtever we do (like focusing to next field et..) spoiling all that.
    //better prevent that.
    if (e.preventDefault)
        e.preventDefault();
    else
        e.returnValue = false;

    this.displayValue = this.ele.value = this.vList[idx][this.colIdx];
    this.ele.internalValue = this.vList[idx][0];
    this.P2.focusNext(this.field, this.ele);
};

a.cancel = function ()
{
};

//this.div is a UL element. We add LI elements to render the list
a.render = function ()
{
    //this.vList has the rows to be rendered
    if (this.vList && this.vList.length)
    {
        this.nbrRows = this.vList.length;
        var s = new Array();
        if (this.colIndexes)
        {
            s.push('<table><tbody>');
            for (var i = 0; i < this.nbrRows; i++)
            {
                var aRow = this.vList[i];
                s.push('<tr>');
                for (var j = 0; j < this.colIndexes.length; j++)
                {
                    s.push('<td idx="');
                    s.push(i);
                    s.push('">');
                    s.push(htmlEscape(aRow[this.colIndexes]));
                    s.push('</td>');
                }
                s.push('</tr>');
            }
            s.push('</tbody></table>');
        }
        else
        {
            for (var i = 0; i < this.nbrRows; i++)
            {
                var txt = this.vList[i][this.colIdx];
                s.push('<div idx="');
                s.push(i);
                s.push('" ');
                s.push('title=\"');
                s.push(txt);
                s.push('\" >');
                s.push(htmlEscape(txt));
                s.push('</div>');
            }
        }
        //page designer woudl have asked for specific css 
        if(this.field.suggestionCss)
            this.div.className = this.field.suggestionCss;
        this.div.innerHTML = s.join('');
    }
    else
    {
        this.nbrRows = 0;
        this.div.innerHTML = 'No valid options.';
    }
    this.div.style.display = '';

    if (this.div.scrollHeight > this.div.clientHeight)
        this.isScrolled = true;
    else
        this.isScrolled = false;
};

//scroll the list up/down
a.scroll = function (up)
{
    if (!this.isScrolled)
        return;

    var n;
    if (up)
    {
        if (!this.div.scrollTop) //scroll-top is zero means we can not go up any further
            return;

        n = this.div.scrollTop - this.div.clientHeight;
        if (n < 0)
            n = 0;
    }
    else
    {
        n = this.div.scrollTop + this.div.clientHeight;
        if (n > this.div.scrollHeight) //can't go any lower than this
            return;
    }
    this.div.scrollTop = n;
};

//if a list is received in th emiddle of this assistance, restart is called by field.fillList()
a.restart = function (vList)
{
    this.start(this.field, this.ele, vList, true);
};

/***************************** Suggestion Assistant***********************/

/* Text Assistanr related methods */
var SuggestionAssistant = function (p2)
{
    this.P2 = p2;

    //create the assistant container, only once for a page
    if (!p2.listDiv)
        p2.listDiv = this.createListDiv(p2.doc);

    this.div = p2.listDiv;
};

a = SuggestionAssistant.prototype;

a.start = function (field, ele)
{
    debug('starting assistance for ' + ele.id);
    /**
     * dom element that is being assisted
     */
    this.ele = ele;
    /**
     * field (model) being assisted
     */
    this.field = field;
    /**
     * minimum characters that user has to type before we suggest values
     */
    this.minChars = field.suggestAfterMinChars;
    /**
     * should we use "starting with" or "contains" to filter values ?
     */
    this.matchStartingChars = field.matchStartingChars;

    /**
     * suggestions are cached, indexed by the token that is used to fetch them
     */
    this.suggestions = {};
    
    /**
     * token with which we requested the suggestions from server last
     */
    this.lastToken = null;
    
    /**
     * value of this field before user started changing it
     */
    this.oldValue = ele.value;
    /**
     * last value that was used to filter suggested values
     */
    this.lastValue = null;
    
    /**
     * other attributes that are used
     * this.div : root element of the suggestion area
     * this.timer : to trigger a function that needs to be fired after all event related actions complete
     *  this.vList : [] of values being suggested
     *  this.uCasedValues : above one, but upper-cased for doing a case-insensitive comparison
     *  this.colIdx : 0 or 1 - column o from this.vList to match. Possibly internal value and displayed value concept
     *  this.listener : listner handle for on keypress
     */
    /**
     * position the suggestion div just below the dom elemnent being assisted
     */
    this.position();
    
    this.listener = this.P2.addListener(ele, 'keypress', this, 'keyPressed');
    
    this.listener1 = this.P2.addListener(ele, 'keydown', this, 'keyDowned');

    /**
     * start assisting if we already have some value
     */
    if (ele.value)
        this.filter();
};

a.end = function (field, ele)
{
    debug('Suggestion assistance done. Bye..');
    this.P2.removeListener(this.listener);
    this.P2.removeListener(this.listener1);
    this.div.style.display = 'none';
};

/*
 * we reuse some methods from listAssistant
 */
a.position = ListAssistant.prototype.position;
a.createListDiv = ListAssistant.prototype.createListDiv;
a.rowClicked = ListAssistant.prototype.rowClicked;
a.scroll = ListAssistant.prototype.scroll;

//User has typed a character
a.keyPressed = function (e)
{
    var key = e.keyCode;
    if (key === 9)//tab
        return;
    if (key === 27)//esc
    {
        this.ele.value = this.oldValue;
        this.ele.internalValue = this.oldInternalValue;
        this.P2.focusNext(this.field, this.ele);
        return;
    }

    if (key === 38 || key === 40) //up-down
    {
        this.moveUpDown(key === 38, e.shiftKey);
        if (e.preventDefault)
            e.preventDefault();
        else
            e.returnValue = false;
    }

    else if ( (key > 47 && key < 91) || key === 32 || (key >95 && key <112))// keys that we may have to respond to
    {
        this.timer = new TimeBomb(this, 'filter', null, 0, this.win); //so that ele.value is updated by the time we process
        return;
    }
};

//filter the suggestion list far additional chars that are typed
a.filter = function ()
{
    debug('filter triggered when value ' + (this.ele && this.ele.value) + ' and lastValue ' + this.lastValue);
    if (!this.ele) //with a maze of event triggers, I want to play it safe!!!!
    {
        debug('filter triggered but ele is null!!. possible bug with the implemented event model.');
        return;
    }

    var val = this.ele.value;
    if (!val || val.length < this.minChars) //not yet ready to suggest, or user has back spaced
    {
        this.clear();
        return;
    }

    //filtering is not case sensitive
    var token = val.substr(0, this.minChars).toUpperCase();
    var suggestion = this.suggestions[token];
    if (!suggestion)//we do not have the suggested values for this token
    {
        //ask field to get suggestions. a call back will be made to this.setSuggestions(ele, val, valueList)
        this.suggestions[token] = 'fetching';
        this.field.getSuggestions(this.ele, token);
        this.clear();
        return;
    }

    if (suggestion == 'fetching')//more typing while suggestions for the corresponding token is underway...
        return;

    //if this is a different token, we have to render the list first
    if (this.lastToken != token)
    {
        this.lastToken = token;
        this.vList = suggestion.list;
        this.uCasedValues = suggestion.uList;
        this.colIdx = suggestion.idx;
        this.render();
    }

    //Ok. rigth list is rendered. we have to show only matched rows from there
    this.hideAndShow(val);
    return;
};

//value list has arrived for this element. This is called from field when it receives suggestions from server
a.setSuggestions = function (ele, token, arr)
{
    debug(' list recd .');
    if (ele != this.ele)
    {
        debug(' List recd too late.');
        return;
    }
    var idx = 0; //col idx of arr that contians the value to be used. if arr ha 2 or more columns, we used second column, else first
    var uCasedArr = [];
    if (arr && arr.length > 1)
    {
        if (arr[0].length > 1)
            idx = 1;
        //remove header row
        for (var i = 1; i < arr.length; i++)
        {
        	var row = arr[i];
            arr[i - 1] = row;
            uCasedArr.push(row[idx].toUpperCase()); //save upper-cased values for matching
        }
        arr.length--;
    }
    else //no suggestions for this token
        arr = [];

    var suggestion = {};
    suggestion.list = arr;
    suggestion.idx = idx;
    suggestion.uList = uCasedArr;
    this.suggestions[token] = suggestion;

    //If the current value of ele is waiting for this list, we should render
    if (ele.value && ele.value.toUpperCase().indexOf(token) == 0)
        this.filter();
    else
    {
        debug('list stored for token ' + token + ' with ' + arr.length + ' values');
    }
};

a.render = function ()
{
    this.curRow = null;
    if (this.vList)
        this.nbrRows = this.vList.length;
    else
        this.nbrRows = 0;

    this.nbrActiveRows = this.nbrRows;

    if (!this.nbrRows)
    {
        this.div.innerHTML = 'No Suggestions';
    }
    else
    {
        var s = new Array();
        for (var i = 0; i < this.nbrRows; i++)
        {
            var txt = this.vList[i][this.colIdx];
            s.push('<div idx="');
            s.push(i);
            s.push('" title=\"');
            s.push(txt);
            s.push('\" >');
            s.push(htmlEscape(txt));
            s.push('</div>');
        }
        this.div.innerHTML = s.join('');
        if (this.div.scrollHeight > this.div.clientHeight)
            this.isScrolled = true;
        else
            this.isScrolled = false;
    }
    this.div.style.display = '';
};

//clean up whatever we had cached for last list, and get ready to get new list
a.clear = function ()
{
    if (!this.nbrRows)
        return;

    this.lastValue = null;
    this.div.innerHTML = '';
};

//all suggestions are already rendered. hide/show based on match
a.hideAndShow = function (val)
{
    val = val.toUpperCase();
    if (val == this.lastValue)
    {
        debug('Not going to hide-show because I did it just now.');
        return;
    }

    //if this value is a character or more than what was used earlier, we know that hidden rows have no chance of getting displayed.
    var toOptimize = this.lastValue && val.indexOf(this.lastValue) == 0;

    this.lastValue = val;
    var row = this.div.firstChild;
    this.nbrActiveRows = 0;
    //I am using a for loop to get values, but dom element row uses .nextSibling().
    for (var i = 0; i < this.nbrRows; i++)
    {
        if (!row)
        {
            debug('Issue with suggestion logic. row is null for i = ' + i);
            break;
        }
        if (toOptimize && row.style.display)//hidden ones will continue to be hidden
        {
            row = row.nextSibling;
            continue;
        }

        var match = this.uCasedValues[i].indexOf(val);
        //reads slightly complex. if val is non-empty and it does not match as per need (no-match or not-starting)
        if (val && (this.matchStartingChars ? match != 0 : match < 0))
            row.style.display = 'none';
        else
        {
            row.style.display = '';
            this.nbrActiveRows++;
        }
        row = row.nextSibling;
    }

    //user had used the arrow key to go thru the list, strip it of its selection status
    if (this.curRow)
    {
        this.curRow.className = '';
        this.curRow = null;
    }
};
/////////////////////////// work in progress //////////////////////////////////

/**
 * select current row. either row or idx should be provided
 * @param row html element that is focussed
 * @param idx 0 based index to the row to be selected
 * @returns {a.select}
 */
a.select = function(row, idx)
{

};

/**
 * cancel this assistant and go to next field
 */
a.cancel = function()
{
    this.ele.value = this.oldValue;
    this.ele.internalValue = this.oldInternalValue;
    this.P2.focusNext(this.field, this.ele);
};