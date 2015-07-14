
 var ele;
var P2 = new PM.ExilityPage(window, 'language');
P2.onLoadActionNames = [ 'filter'];
P2.pageWidth = 1028;
P2.pageHeight = 700;
P2.breadCrumpTitle = 'language';

/* MetaData for Panel :languageList with table name = languages*/
ele = new PM.JtablePanel();
ele.name = 'languages';
ele.panelName = 'languageList';
ele.rowsCanBeAdded = true;
ele.pageSize = 5;
ele.showHeader = true;
ele.simulateClickOnRow = 'none';
ele.tableName = 'languages';
ele.dataForNewRowToBeClonedFromRow = 'none';
ele.rowSaveActionName = 'save';
ele.rowsCanBeModified = true;
ele.rowsCanBeDeleted = true;
ele.slideEffect = 'none';
//linkedTableName  DOES NOT EXIST

ele.label = 'Languages';
ele.idFieldName = 'languages_languageId';
ele.firstFieldName = 'languages_name';
P2.addTable(ele);
ele = new PM.TextInputField();
ele.fieldType = 'TextInputField';
ele.dataType = 'shortName';
ele.isRequired = true;
ele.minCharsToTriggerService = 1;
ele.isValid = true;
ele.codePickerLeft = -1;
ele.codePickerTop = -1;
ele.name = 'languages_name';
ele.tableName = 'languages';
ele.unqualifiedName = 'name';
ele.label = 'Language';
ele.value = '';
P2.addField(ele);
ele = new PM.HiddenField();
ele.fieldType = 'HiddenField';
ele.dataType = 'id';
ele.name = 'languages_languageId';
ele.tableName = 'languages';
ele.unqualifiedName = 'languageId';
ele.label = '';
ele.value = '';
P2.addField(ele);
ele = new PM.HiddenField();
ele.fieldType = 'HiddenField';
ele.dataType = 'timeStamp';
ele.name = 'languages_lastUpdate';
ele.tableName = 'languages';
ele.unqualifiedName = 'lastUpdate';
ele.label = '';
ele.value = '';
P2.addField(ele);
/***** action field = filter  ********/
ele = new PM.ServerAction();
ele.name = 'filter';
ele.serviceId = 'filter.film.language';
ele.toRefreshPage = 'beforeMyAction';
ele.closeWindow = true;
P2.addAction(ele);
/***** action field = save  ********/
ele = new PM.ServerAction();
ele.name = 'save';
ele.serviceId = 'save.film.language';
ele.toRefreshPage = 'beforeMyAction';
ele.closeWindow = true;
P2.addAction(ele);
/***** action field = close  ********/
ele = new PM.CloseAction();
ele.name = 'close';
ele.warnIfFormIsModified = true;
P2.addAction(ele);