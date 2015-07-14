/*
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
 */
/**
 * Menu grid. Each row represents a menu item. Row with parentId as null appears
 * on the top. for each row, id has to be unique across all rows. we use a
 * dotted naming convention for convenience. hierarchy is built using parentId.
 * parentId has to be another valid id or null. Null implies root maneu. name is
 * displayed. value is either an htm file name, or valid script
 */
var MENU_ITEMS = null;
MENU_ITEMS = [
         [ 'id', 'parentId', 'name', 'value' ]
		,[ 'm1', null, 'Film', 'Film' ]
		,[ 'm2', null, 'Store', 'Store' ]
		,[ 'm3', null, 'Operations', 'Operations' ]
		,[ 'm1.1', 'm1', 'Actor', 'film/actorSearch.htm' ]
		,[ 'm1.2', 'm1', 'Category', 'film/category.htm' ]
		,[ 'm1.3', 'm1', 'Language', 'film/language.htm' ]
		,[ 'm1.4', 'm1', 'Film', 'film/filmSearch.htm' ]
		,[ 'm2.1', 'm2', 'Customer', 'store/customerSearch.htm' ]
		,[ 'm2.2', 'm2', 'Staff', 'store/staffSearch.htm' ]
		,[ 'm2.3', 'm2', 'Store', 'store/store.htm.htm' ]
		,[ 'm3.1', 'm3', 'Rental', 'ops/rental.htm' ]
		,[ 'm3.2', 'm3', 'Return', 'ops/return.htm' ]
		,[ 'm3.3', 'm3', 'Inventory', 'ops/inventory.htm' ]
];

var MENU_DIV_ID = 'menuDiv';
var MENU_NAME = 'indexMenu';
var MENU_TYPE = 'top';
var HOME_PAGE_NAME = 'home/home.htm';
var INVALID_SCRIPT = 'Invalid script attached to menu item.';
var LOGIN_PAGE_NAME = 'home/login.htm';

/**
 * go to a specific page. Called normally on click of a menu item
 * 
 * @param pageName
 */
var goToPage = function(pageName) {
	if (!pageName)
		return;

	/*
	 * our convention is that it could be either a file name for htm, or script.
	 */
	var idx = pageName.lastIndexOf('.htm');
	if ((idx === pageName.length - 4) || (pageName.lastIndexOf('.htm?') !== -1)) {
		/*
		 * exilityPageStack is a global variable exposed by Exility. Refer to
		 * pageManager.js
		 */
		exilityPageStack.resetStack();
		exilityPageStack.goTo(null, NavigationAction.REPLACE, pageName);
	} else {
		try {
			eval(pageName);
		} catch (e) {
			alert(INVALID_SCRIPT + '\n' + pageName);
		}
	}
};

/**
 * onload function of this page
 */
var indexPageLoaded = function() {
	/*
	 * refer to menu.js for methods available for menu
	 */
	var menu = new Tree(MENU_NAME);
	menu.buildFromArray(MENU_ITEMS, true);
	menu.createMenu(MENU_DIV_ID, MENU_TYPE, goToPage);
	// menuHomeClicked();
	// headerMenu.startTrace();
	// relogin();
};

/**
 * always love to do this
 */
var menuHomeClicked = function() {
	goToPage(HOME_PAGE_NAME);
};

/**
 * Exility API looks for a function by name relogin. This is called whenever a
 * call to server fails because of authentication.
 */
var relogin = function(dc, se) {
	exilityPageStack.goTo(null, NavigationAction.POPUP, LOGIN_PAGE_NAME);
};

/**
 * open a new window for exility ide
 */
var openIde = function() {
	var url = '../exilityClient/ez.htm?' + PM.getCsrfToken();
	var win = window.open(url, 'exilityIde');
	if (!win) {
		alert('We are sorry. You seem to have pop-up blocker because of which we are unable to open a new window for you. Please open ide manually and use a url /exilityClient/ez.htm');
	}
};

var jtableDefaultOptions = {
		junk : 'junk'
};
