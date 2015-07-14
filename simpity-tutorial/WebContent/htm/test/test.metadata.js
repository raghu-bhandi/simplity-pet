
 var ele;
var P2 = new PM.ExilityPage(window, 'test');
P2.pageWidth = 1028;
P2.pageHeight = 700;
P2.breadCrumpTitle = 'test';

/* MetaData for Panel :test with table name = persons*/
ele = new PM.JtablePanel();
ele.name = 'persons';
ele.panelName = 'test';
ele.tableName = 'persons';
ele.slideEffect = 'none';
//linkedTableName  DOES NOT EXIST

P2.addTable(ele);
/***** action field = load  ********/
ele = new PM.ServerAction();
ele.name = 'load';
ele.serviceId = 'test.getPersons';
ele.toRefreshPage = 'beforeMyAction';
ele.closeWindow = true;
P2.addAction(ele);