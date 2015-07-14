
 var ele;
var P2 = new PM.ExilityPage(window, 'category');
P2.onLoadActionNames = [ 'filter'];
P2.pageWidth = 1028;
P2.pageHeight = 700;
P2.breadCrumpTitle = 'category';

/* MetaData for Panel :categoryList with table name = categories*/
ele = new PM.GridPanel();
ele.name = 'categories';
ele.panelName = 'categoryList';
ele.rowsCanBeAdded = true;
ele.showHeader = true;
ele.simulateClickOnRow = 'none';
ele.sendAffectedRowsOnly = true;
ele.tableName = 'categories';
ele.dataForNewRowToBeClonedFromRow = 'none';
ele.rowsCanBeDeleted = true;
ele.slideEffect = 'none';
//linkedTableName  DOES NOT EXIST

ele.actionFieldName = 'categories_bulkAction';
ele.idFieldName = 'categories_categoryId';
ele.keyFieldName = 'categories_name';
ele.firstFieldName = 'categories_name';
P2.addTable(ele);
ele = new PM.TextInputField();
ele.fieldType = 'TextInputField';
ele.dataType = 'shortName';
ele.isRequired = true;
ele.minCharsToTriggerService = 1;
ele.isValid = true;
ele.codePickerLeft = -1;
ele.codePickerTop = -1;
ele.name = 'categories_name';
ele.tableName = 'categories';
ele.unqualifiedName = 'name';
ele.label = 'Category';
ele.value = '';
P2.addField(ele);
ele = new PM.HiddenField();
ele.fieldType = 'HiddenField';
ele.dataType = 'id';
ele.name = 'categories_categoryId';
ele.tableName = 'categories';
ele.unqualifiedName = 'categoryId';
ele.label = '';
ele.value = '';
P2.addField(ele);
ele = new PM.HiddenField();
ele.fieldType = 'HiddenField';
ele.dataType = 'timeStamp';
ele.name = 'categories_lastUpdate';
ele.tableName = 'categories';
ele.unqualifiedName = 'lastUpdate';
ele.label = '';
ele.value = '';
P2.addField(ele);
ele = new PM.HiddenField();
ele.fieldType = 'HiddenField';
ele.dataType = 'text';
ele.name = 'categories_bulkAction';
ele.tableName = 'categories';
ele.unqualifiedName = 'bulkAction';
ele.label = '';
ele.value = '';
P2.addField(ele);
/***** action field = filter  ********/
ele = new PM.ServerAction();
ele.name = 'filter';
ele.serviceId = 'filter.film.category';
ele.toRefreshPage = 'beforeMyAction';
ele.closeWindow = true;
P2.addAction(ele);
/***** action field = save  ********/
ele = new PM.ServerAction();
ele.name = 'save';
ele.serviceId = 'save.film.category';
ele.callBackActionName = 'filter';
ele.submitForm = true;
ele.toRefreshPage = 'beforeMyAction';
ele.disableForm = true;
ele.resetFormModifiedState = true;
ele.closeWindow = true;
P2.addAction(ele);
/***** action field = close  ********/
ele = new PM.CloseAction();
ele.name = 'close';
ele.warnIfFormIsModified = true;
P2.addAction(ele);