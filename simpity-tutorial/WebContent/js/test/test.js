var jtableOptions = {
	persons : {
		title : 'My j Table List',
		paging : true,
		pageSize : 8,
		sorting : true,
		multiSorting : true,
		defaultSorting : 'name ASC',
		actions : {
			listAction : function() {
				return loadData();
			}
		},
		fields : {
			personId : {
				key : true,
				list : false
			},
			name : {
				title : 'Author Name'
			},
			age : {
				title : 'Age'
			},
			recordDate : {
				title : 'Record date',
				type : 'date'
			}
		}
	}
};

/**
 * serverAgent looks for presence PM.localServices. If found, it will first call
 * .hasService(serviceName). If we return true, he calls us back with .serve(dc)
 * expecting a dc as returned value
 */
var localServices = (function() {

	/**
	 * collection of all service methods
	 */
	var services = {
		"test.getPersons" : function(dc) {
			var grid = personGrid;
			var p = dc.getValue('personsPageSize');
			dc = new PM.DataCollection(true);
			if (p) {
				grid = getPage(personGrid, p, 1);
				dc.addValue('personsTotalRows', personGrid.length - 1);
			}
			dc.addGrid('persons', grid);
			return dc;
		},
		paginationService : function(dc) {
			var grid = getPage(personGrid, dc.getValue('pageSize'), dc
					.getValue('pageNo'));
			dc = new PM.DataCollection(true);
			dc.addGrid('persons', grid);
			dc.addValue('personsTotalRows', personGrid.length - 1);
			return dc;
		}
	};

	/**
	 * get a page data from the grid
	 */
	var getPage = function(grid, pageSize, pageNo) {
		pageSize = parseInt(pageSize);
		pageNo = parseInt(pageNo);
		PM.debug('going to get page for ' + pageSize + ' and ' + pageNo
				+ ' and the total is ' + (pageNo + pageSize));
		var n = grid.length;
		var newGrid = [ grid[0] ];
		var iStart = (pageSize * (pageNo - 1)) + 1;
		var iEnd = iStart + pageSize - 1;
		if (iEnd > n) {
			iEnd = n;
		}
		for (; iStart <= iEnd; iStart++) {
			newGrid.push(grid[iStart]);
		}
		return newGrid;
	};

	/**
	 * contains a ready dc as response to services
	 */
	var readyResponses = {};
	var dc = new PM.DataCollection(true);
	dc.addMessage('error', 'service is not implemented');
	/*
	 * special dc that is used as response when we do not have a response for a
	 * service
	 */
	readyResponses['error'] = dc;

	/*
	 * for getPersons service
	 */
	var personGrid = [ [ 'personId', 'name', 'age', 'recordDate' ] ];
	for (var i = 100; i < 200; i++) {
		personGrid.push([ i, 'Name ' + i, i, '2' + i + '-04-16' ]);
	}

	return {
		hasService : function(serviceName) {
			return true;
		},
		serve : function(serviceName, inDc) {
			var dcToReturn = readyResponses[serviceName];
			if (dcToReturn) {
				return dcToReturn;
			}
			var fn = services[serviceName];
			if (fn) {
				return fn(inDc);
			}
			debug('error in local services. We said OK to ' + serviceName
					+ ' but we could not deliver on that.');
			return readyResponses['error'];
		}

	};
})();
