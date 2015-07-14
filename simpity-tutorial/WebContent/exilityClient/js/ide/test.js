/***********  manage GANTT chart for PathFinder****************/
var MILLI_PER_DAY = 24 * 60 * 60 * 1000; 
var myPage = {
	bhuHeader : [
     ['bhuId', 'health', 'bhu', 'anchor', 'bu']
    ,[11, '3', '1234 - penultimate Silver', 'Anchor Project', 'Apple Care, Logistics, Direct Procurement, Order Management, SDM, Sales, AOS, Retail, iTunes, Finance']
    ,[33, '1', '2345 - Buy In Store Pickup Online', 'Andica', 'Logistics, Order Management, SDM, Sales, AOS, Retail, Finance']
    ,[88, '2', '3456 - Direct DAV Model Using Web', 'Operation', 'Apple Care, Logistics']
     ],

     project : [
      ['projectId', 'bhuId']
      ,[111, 11]
      ,[112, 11]
      ,[113, 33]
      ,[114, 33]
      ,[115, 33]
      ,[116, 88]
      ,[117, 88]
      ,[118, 88]
      ,[119, 88]
      ],

      schedule : [
               ['phaseId', 'projectId', 'phase', 'fromDate', 'toDate']
              ,[1001, 111, 'BRD', '2013-08-15', '2013-10-15']
               ,[1002, 111, 'Design, Playback, Dev', '2013-10-01', '2013-12-31']
               ,[1003, 111, 'UAT', '2014-01-01', '2014-06-08']
               ,[1004, 111, 'Live', '2014-07-15', '2014-09-10']
               ,[1005, 112, 'BRD', '2013-09-15', '2013-11-']
               ,[1006, 112, 'Design, Playback, Dev', '2013-08-15', '2013-10-15']
               ,[1007, 112, 'UAT', '2013-08-15', '2013-10-15']
               ,[1008, 113, 'BRD', '2013-08-15', '2013-10-15']
               ,[1009, 113, 'Design, Playback, Dev', '2013-08-15', '2013-10-15']
               ,[1010, 113, 'UAT', '2013-08-15', '2013-10-15']
               ,[1011, 113, 'Live', '2013-08-15', '2013-10-15']
               ,[1012, 114, 'BRD', '2013-08-15', '2013-10-15']
               ,[1013, 114, 'Design, Playback, Dev', '2013-08-15', '2013-10-15']
               ,[1014, 115, 'BRD', '2013-08-15', '2013-10-15']
               ,[1015, 115, 'Design, Playback, Dev', '2013-08-15', '2013-10-15']
               ,[1016, 115, 'UAT', '2013-08-15', '2013-10-15']
               ,[1017, 115, 'Live', '2013-08-15', '2013-10-15']
               ,[1018, 116, 'BRD', '2013-08-15', '2013-10-15']
               ,[1019, 116, 'Design, Playback, Dev', '2013-08-15', '2013-10-15']
               ,[1020, 116, 'UAT', '2013-08-15', '2013-10-15']
               ,[1021, 116, 'Live', '2013-08-15', '2013-10-15']
               ,[1022, 117, 'BRD', '2013-08-15', '2013-10-15']
               ,[1023, 117, 'Design, Playback, Dev', '2013-08-15', '2013-10-15']
               ,[1024, 117, 'UAT', '2013-08-15', '2013-10-15']
               ,[1025, 117, 'Live', '2013-08-15', '2013-10-15']
               ,[1026, 118, 'BRD', '2013-08-15', '2013-10-15']
               ,[1027, 118, 'Design, Playback, Dev', '2013-08-15', '2013-10-15']
               ,[1028, 118, 'UAT', '2013-08-15', '2013-10-15']
               ,[1029, 118, 'Live', '2013-08-15', '2013-10-15']
               ,[1030, 119, 'BRD', '2013-08-15', '2013-10-15']
               ,[1031, 119, 'Design, Playback, Dev', '2013-08-15', '2013-10-15']
               ,[1032, 119, 'UAT', '2013-08-15', '2013-10-15']
               ,[1033, 119, 'Live', '2013-08-15', '2013-10-15']
         ],
         currentYear : 'FY14',
         prevYear : 'FY13',
         nextYear : 'FY15',
         startDate : '2013-04-01',
         endDate : '2015-03-31',
         
         /**
          * simulate a dc coming from server
          */
         createDc : function (){
        	 var dc = new PM.DataCollection();
        	 dc.addValue('currentYear', this.currentYear);
        	 dc.addValue('prevYear', this.prevYear);
        	 dc.addValue('nextYear', this.nextYear);
        	 dc.addValue('startDate', this.startDate);
        	 dc.addValue('endDate', this.endDate);
        	 dc.addGrid('bhuHeader', this.bhuHeader);
        	 dc.addGrid('project', this.project);
        	 dc.addGrid('schedule', this.schedule);
        	 dc.success = true;
        	 return dc;
         },
         /**
          * unfortunately, new Date('yyyy-mm-dd') doe not work on some version of safari
          * here is simple local version.
          */
         parseDate : function(val){
        	 var parts = val.split('-');
        	 return new Date(parts[0], parts[1], parts[2]);
         },
         /**
          * calculate left and width attributes of each phase. Also put tool-tip text
          * This function can be reused for actual page
          */
         calculateDimensions : function(dc){
        	 var startDate = this.parseDate(dc.getValue('startDate'));
        	 var endDate = this.parseDate(dc.getValue('endDate'));
        	 var totalTime = endDate - startDate;
        	 var gantGrid = dc.getGrid('schedule');
        	 var row = gantGrid[0];
        	 /**
        	  * we are going to add three columns to the grid
        	  */
        	 row.push('leftPercent');
        	 row.push('widthPercent');
        	 row.push('toolTip');
        	 var prevDate = startDate;
        	 for(var i = 1; i < gantGrid.length; i++){
        		 row = gantGrid[i];
        		 var d1 = this.parseDate(row[3]);
        		 var d2 = this.parseDate(row[4]);
        		 var left = Math.round((d1 - prevDate) * 100 /totalTime);
        		 var width = Math.round((d2 - d1) * 100 /totalTime);
        		 row.push(left);
        		 row.push(width);
        		 row.push(row[2] + '\nStart : ' + PM.formatDate(d1) + '     End : ' + PM.formatDate(d2));
        		 prevDate = d2; //next bar will put its margin with respect to this date
        	 }
         },
         
         refreshPage : function(dc){
        	 this.calculateDimensions(dc);
        	 P2.refreshPage(dc);
         }
};

/**
 * action called when use clicks on draw chart button. Instead of server action, we are creating a dc locally
 */
var populate = function(){
	var dc = myPage.createDc();
	myPage.calculateDimensions(dc);
	myPage.refreshPage(dc);
};
