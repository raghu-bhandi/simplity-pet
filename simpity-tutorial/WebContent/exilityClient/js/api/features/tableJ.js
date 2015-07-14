/**
 * represents a jTable plugin for exility
 */
var JtablePanel = function() {
	AbstractTable.call(this);
};

a = JtablePanel.prototype = new AbstractTable;
a.LOAD = 'load';
a.ADD_RECORD = 'addRecord';
a.SET_DATA = 'setData';
/**
 * init() is called by P2 on load of page
 */
a.init = function() {
	if (this.inited)
		return;
	var win = this.P2.win;
	this.jtableEle = win.$('#' + this.name);
	var opt = win.jtableOptions && win.jtableOptions[this.name];
	if (!opt) {
		PM.debug("Error : page.js should define jtableOptions['" + this.name
				+ "'] = { options object for your jtable}.");
		return;
	}
	this.pageSize = (opt.paging && opt.pageSize) || 0;
	var table = this;
	opt.actions = {
		/*
		 * list action is always triggered by Exility when data is to be set to
		 * this table
		 */
		listAction : function(postData, jtParams) {
			return (table.listAction(postData, jtParams));
		},
		createAction : function() {
			return table.createAction();
		},
		updateAction : function() {
			return table.updateAction();
		},
		deleteAction : function() {
			return table.deleteAction();
		}
	};
	this.jtableEle.jtable(opt);
	this.nbrRows = 0;

	if (this.pageSize && this.pageSize > 0) {
		this.P2.win[this.name + 'PageSize'] = this.pageSize;
		this.P2.addPageSize(this.name, this.pageSize);
	}

	this.inited = true;
};

/*
 * loadAction of jtable
 */
a.listAction = function(postData, jtParams) {
	/*
	 * case 1 : triggered as part of our setTable() method.
	 */
	if (this.setDataInProgress) {
		this.setDataInProgress = false;
		return this.getResponseObject();
	}

	/*
	 * case 2 : triggered by jTable when user as clicked on pagination/sort
	 */
	if (this.pageSize != jtParams.jtPageSize) {
		this.pageSize = jtParams.jtPageSize;
		this.P2.addPageSize(this.name, this.pageSize);
	}

	var pageNo = jtParams.jtStartIndex / this.pageSize + 1;
	var columnToSort = jtParams.jtSorting;
	var sortDesc = 0;
	if (columnToSort) {
		var parts = columnToSort.split(' ');
		columnToSort = parts[0];
		if (parts[1] != 'ASC') {
			sortDesc = 1;
		}
	}
	var columnToMatch = null;
	var valueToMatch = null;
	var dc = new DataCollection();
	dc.values['tableName'] = this.name;
	dc.values['pageNo'] = pageNo;
	dc.values['pageSize'] = this.pageSize;
	if (columnToSort) {
		dc.values['paginationColumnToSort'] = columnToSort;
		dc.values['paginationSortDesc'] = sortDesc;
		if (columnToMatch) {
			dc.values['paginationColumnToMatch'] = columnToMatch;
			dc.values['paginationValueToMatch'] = valueToMatch;
		}
	}
	this.deferredObject = this.P2.win.$.Deferred();
	var se = new PM.ServiceEntry('paginationService', dc, false, null, this,
			null, ServerAction.NONE, null, false, true);
	this.P2.win.serverStub.callService(se);
	return this.deferredObject;
};

a.getResponseObject = function() {
	/*
	 * create an array of record objects
	 */
	var records = [];
	if (this.serverData && this.serverData.length > 1) {
		var rows = this.serverData;
		var nbrRows = rows.length;
		var fieldNames = rows[0];
		var nbrFields = fieldNames.length;
		for (var i = 1; i < nbrRows; i++) {
			var cells = rows[i];
			var record = {};
			for (var j = 0; j < nbrFields; j++) {
				record[fieldNames[j]] = cells[j];
			}
			records.push(record);
		}
	}
	return {
		Result : 'OK',
		Records : records,
		TotalRecordCount : this.totalRows || this.nbrRows
	};
};

// data is received from server in a dc. Set it to the table
a.setData = function(dc, rowsToBeAppended) {
	var grid = dc.grids[this.name];
	var nbrRows = grid.length;

	if (rowsToBeAppended) {
		if (nbrRows > 1) {
			this.appendRows(grid);
		}
		return;
	}
	this.saveData(dc);
	this.setDataInProgress = true;
	this.jtableEle.jtable(this.LOAD);
};
a.saveData = function(dc) {
	var grid = dc.grids[this.name];
	var nbrRows = grid.length;
	this.serverData = grid;
	this.nbrRows = nbrRows - 1;
	this.totalRows = dc.values[this.name + 'TotalRows'] || 0;
};

a.deleteAllRows = function() {
	if (this.serverData) {
		this.serverData.length = 1;
		this.nbrRows = 0;
		this.totalRpws = 0;
	}
	this.jtableEle.jtable(this.LOAD);
};

/**
 * append rows to existing grid.
 */
a.appendRows = function(grid) {
	var nbrRows = grid.length;
	if (nbrRows < 2) {
		return;
	}
	var fieldNames = grid[0];
	var nbrFields = fieldNames.length;
	var recordObject = {
		clientOnly : true
	};
	for (var i = 1; i < nbrRows; i++) {
		var record = {};
		var row = grid[i];
		for (var j = 0; j < nbrFields; j++) {
			record[fieldNames[j]] = row[j];
		}
		recordObject.record = record;
		this.jtableEle.jtable(this.ADD_RECORD, recordObject);
	}
};
a.setColumnValue = function(columnName, value, rowIdx) {
	throw "setColumn() is not yet implementedfor jTable";
};

/**
 * ensure that this is called from jTable whenever the curentRow nees to be set
 */
a.setCurrentRow = function(idx) {
	this.currentRow = idx;
};
a.serviceReturned = function(dc) {
	if (!this.deferredObject) {
		debug('Deferred object not found on return from pagination action');
		return;
	}

	if (!dc.success) {
		this.deferredObject.reject();
		return;
	}

	this.saveData(dc);
	this.deferredObject.resolve(this.getResponseObject());
};
