/**
 * called once page got laded. getReady
 */
var pageLoaded = function() {
	var vets = document.getElementById('vetsTab');
	vets.href = '#';
	vets.parentNode.className = 'active';
	/*
	 * invoke service with no input data, and default call-back action
	 */
	Simplity.getResponse(SERVICES.getVets, null, setData);
};

var setData = function(json) {
	var arr = json.vets;
	if(!arr){
		arr = [];
	}
	var vets  = document.getElementById('vets');
	//alert(JSON.stringify(arr));
	vets.items = arr;
};