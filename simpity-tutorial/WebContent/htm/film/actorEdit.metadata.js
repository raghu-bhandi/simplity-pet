
 var ele;
var P2 = new PM.ExilityPage(window, 'actorEdit');
P2.minParametersToFireOnLoad = 1;
P2.onModifyModeActionNames = [ 'getDetails'];
P2.pageMode = 'modify';
P2.pageWidth = 1028;
P2.pageHeight = 700;
P2.trackFieldChanges = true;
P2.breadCrumpTitle = 'actorEdit';
P2.onFormChangeActionName = 'showCancel';
P2.onFormResetActionName = 'hideCancel';
/*Page parameters */
ele = new PM.PageParameter();
ele.name = 'actorId';
ele.dataType = 'id';
ele.isPrimaryKey = true;
P2.addParameter(ele);

ele = new PM.TextInputField();
ele.fieldType = 'TextInputField';
ele.dataType = 'name';
ele.isRequired = true;
ele.minCharsToTriggerService = 1;
ele.isValid = true;
ele.codePickerLeft = -1;
ele.codePickerTop = -1;
ele.name = 'firstName';
ele.label = 'First Name';
ele.value = '';
P2.addField(ele);
ele = new PM.HiddenField();
ele.fieldType = 'HiddenField';
ele.dataType = 'id';
ele.name = 'actorId';
ele.label = '';
ele.value = '';
P2.addField(ele);
ele = new PM.TextInputField();
ele.fieldType = 'TextInputField';
ele.dataType = 'name';
ele.isRequired = true;
ele.minCharsToTriggerService = 1;
ele.isValid = true;
ele.codePickerLeft = -1;
ele.codePickerTop = -1;
ele.name = 'lastName';
ele.label = 'lastName';
ele.value = '';
P2.addField(ele);
ele = new PM.HiddenField();
ele.fieldType = 'HiddenField';
ele.dataType = 'timeStamp';
ele.name = 'lastUpdate';
ele.label = '';
ele.value = '';
P2.addField(ele);
/***** action field = getDetails  ********/
ele = new PM.ServerAction();
ele.name = 'getDetails';
ele.serviceId = 'get.film.actor';
ele.toRefreshPage = 'beforeMyAction';
ele.closeWindow = true;
P2.addAction(ele);
var getDetailsfieldsToSubmit = new Object();
 ele.fieldsToSubmit = getDetailsfieldsToSubmit;
var getDetailstablesToSubmit = new Object();
 ele.tablesToSubmit = getDetailstablesToSubmit;
getDetailsfieldsToSubmit['actorId'] = true;
/***** action field = save  ********/
ele = new PM.ServerAction();
ele.name = 'save';
ele.serviceId = 'save.film.actor';
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
/***** action field = reset  ********/
ele = new PM.ResetAction();
ele.name = 'reset';
ele.warnIfFormIsModified = true;
P2.addAction(ele);
/***** action field = cancel  ********/
ele = new PM.CloseAction();
ele.name = 'cancel';
ele.warnIfFormIsModified = true;
P2.addAction(ele);
/***** action field = showCancel  ********/
ele = new PM.DummyAction();
ele.name = 'showCancel';
ele.disableFields = [ 'close'];
ele.enableFields = [ 'cancel','save'];
P2.addAction(ele);
/***** action field = hideCancel  ********/
ele = new PM.DummyAction();
ele.name = 'hideCancel';
ele.disableFields = [ 'cancel','save'];
ele.enableFields = [ 'close'];
P2.addAction(ele);