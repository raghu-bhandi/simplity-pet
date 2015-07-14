
 var ele;
var P2 = new PM.ExilityPage(window, 'tester');
P2.onLoadActionNames = [ 'initButtons'];
P2.pageWidth = 835;
P2.pageHeight = 800;
P2.breadCrumpTitle = 'tester';

/* MetaData for the Page element :serviceId*/
ele = new PM.TextInputField();
ele.dataType = 'text';
ele.isRequired = true;
ele.minCharsToTriggerService = 1;
ele.isValid = true;
ele.codePickerLeft = -1;
ele.codePickerTop = -1;
ele.name = 'serviceId';
ele.label = 'Service ID';
ele.value = '';
P2.addField(ele);

/* MetaData for the Page element :resultDisplayFld*/
ele = new PM.TextAreaField();
ele.dataType = 'description';
ele.name = 'resultDisplayFld';
ele.label = '';
ele.value = '';
P2.addField(ele);
/***** action field = initButtons  ********/
ele = new PM.DummyAction();
ele.name = 'initButtons';
ele.disableFields = [ 'clearDC','addElement'];
P2.addAction(ele);
/***** action field = clearDC  ********/
ele = new PM.LocalAction();
ele.name = 'clearDC';
ele.functionName = 'clearDC';
P2.addAction(ele);
/***** action field = displayFields  ********/
ele = new PM.LocalAction();
ele.name = 'displayFields';
ele.functionName = 'displayFields';
P2.addAction(ele);
/***** action field = addValue  ********/
ele = new PM.LocalAction();
ele.name = 'addValue';
ele.functionName = 'addValue';
P2.addAction(ele);
/***** action field = addList  ********/
ele = new PM.LocalAction();
ele.name = 'addList';
ele.functionName = 'addList';
P2.addAction(ele);
/***** action field = addGrid  ********/
ele = new PM.LocalAction();
ele.name = 'addGrid';
ele.functionName = 'addGrid';
P2.addAction(ele);
/***** action field = testServiceStub  ********/
ele = new PM.LocalAction();
ele.name = 'testServiceStub';
ele.functionName = 'testServiceStub';
P2.addAction(ele);
/***** action field = closeTesterActn  ********/
ele = new PM.CloseAction();
ele.name = 'closeTesterActn';
ele.warnIfFormIsModified = true;
P2.addAction(ele);