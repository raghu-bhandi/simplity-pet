
 var ele;
var P2 = new PM.ExilityPage(window, 'actorSearch');
P2.pageWidth = 1028;
P2.pageHeight = 700;
P2.breadCrumpTitle = 'actorSearch';
ele = new PM.AssistedInputField();
ele.fieldType = 'AssistedInputField';
ele.dataType = 'number';
ele.defaultValue = '3';
ele.isFilterOperator = true;
ele.isRequired = true;
ele.minCharsToTriggerService = 1;
ele.isValid = true;
ele.valueList = '1,Equals;2,Starts with;3,Contains';
ele.codePickerLeft = -1;
ele.codePickerTop = -1;
ele.suggestAfterMinChars = 1;
ele.name = 'firstNameOperator';
ele.label = 'First Name';
ele.value = '3';
P2.addField(ele);
ele = new PM.AssistedInputField();
ele.fieldType = 'AssistedInputField';
ele.dataType = 'name';
ele.minCharsToTriggerService = 1;
ele.isValid = true;
ele.isFilterField = true;
ele.codePickerLeft = -1;
ele.codePickerTop = -1;
ele.suggestAfterMinChars = 1;
ele.name = 'firstName';
ele.label = '';
ele.value = '';
P2.addField(ele);
ele = new PM.AssistedInputField();
ele.fieldType = 'AssistedInputField';
ele.dataType = 'number';
ele.defaultValue = '3';
ele.isFilterOperator = true;
ele.isRequired = true;
ele.minCharsToTriggerService = 1;
ele.isValid = true;
ele.valueList = '1,Equals;2,Starts with;3,Contains';
ele.codePickerLeft = -1;
ele.codePickerTop = -1;
ele.suggestAfterMinChars = 1;
ele.name = 'lastNameOperator';
ele.label = 'lastName';
ele.value = '3';
P2.addField(ele);
ele = new PM.AssistedInputField();
ele.fieldType = 'AssistedInputField';
ele.dataType = 'name';
ele.minCharsToTriggerService = 1;
ele.isValid = true;
ele.isFilterField = true;
ele.codePickerLeft = -1;
ele.codePickerTop = -1;
ele.suggestAfterMinChars = 1;
ele.name = 'lastName';
ele.label = '';
ele.value = '';
P2.addField(ele);

/* MetaData for Panel :actorsList with table name = actors*/
ele = new PM.ListPanel();
ele.name = 'actors';
ele.panelName = 'actorsList';
ele.onClickActionName = 'edit';
ele.pageSize = 5;
ele.paginateButtonType = 'linear';
ele.showHeader = true;
ele.simulateClickOnRow = 'none';
ele.tableName = 'actors';
ele.slideEffect = 'none';
//linkedTableName  DOES NOT EXIST

P2.addTable(ele);
ele = new PM.OutputField();
ele.fieldType = 'OutputField';
ele.dataType = 'name';
ele.name = 'actors_firstName';
ele.tableName = 'actors';
ele.unqualifiedName = 'firstName';
ele.label = 'First Name';
ele.value = '';
P2.addField(ele);
ele = new PM.HiddenField();
ele.fieldType = 'HiddenField';
ele.dataType = 'id';
ele.name = 'actors_actorId';
ele.tableName = 'actors';
ele.unqualifiedName = 'actorId';
ele.label = '';
ele.value = '';
P2.addField(ele);
ele = new PM.OutputField();
ele.fieldType = 'OutputField';
ele.dataType = 'name';
ele.name = 'actors_lastName';
ele.tableName = 'actors';
ele.unqualifiedName = 'lastName';
ele.label = 'lastName';
ele.value = '';
P2.addField(ele);
ele = new PM.HiddenField();
ele.fieldType = 'HiddenField';
ele.dataType = 'timeStamp';
ele.name = 'actors_lastUpdate';
ele.tableName = 'actors';
ele.unqualifiedName = 'lastUpdate';
ele.label = '';
ele.value = '';
P2.addField(ele);
/***** action field = filter  ********/
ele = new PM.ServerAction();
ele.name = 'filter';
ele.serviceId = 'filter.film.actor';
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
/***** action field = edit  ********/
ele = new PM.NavigationAction();
ele.name = 'edit';
ele.pageToGo = 'film/actorEdit.htm';
ele.windowDisposal = 'popup';
ele.queryFieldNames = [ 'actorId'];
ele.queryFieldSources = [ 'actors_actorId'];
P2.addAction(ele);
/***** action field = new  ********/
ele = new PM.NavigationAction();
ele.name = 'new';
ele.pageToGo = 'film/actorEdit.htm';
ele.windowDisposal = 'reset';
P2.addAction(ele);