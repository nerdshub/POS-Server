const axios = require('axios');
const convertXml2Json = require('xml-js');

class TallyHelper {


  single(id) {
      
    return new Promise((resolve, reject) => {
        var data =  '<ENVELOPE>  \r\n  <HEADER>  \r\n    <VERSION>1</VERSION>  \r\n    <TALLYREQUEST>  EXPORT</TALLYREQUEST>  \r\n    <TYPE>COLLECTION</TYPE>  \r\n    <ID>  RTSAllVouchers_FilterForVchNoAndVchType</ID>  \r\n  </HEADER>  \r\n  <BODY>  \r\n    <DESC>  \r\n      <STATICVARIABLES>  \r\n        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>  \r\n        <!-- TODO : Specify the VoucherNo -->  \r\n        <RTS_KEY>'+id+'</RTS_KEY>  \r\n        <!-- TODO : Specify the VoucherType here -->  \r\n        <RTS_VOUCHERTYPENAME>Sales</RTS_VOUCHERTYPENAME>  \r\n      </STATICVARIABLES>  \r\n      <TDL>  \r\n        <TDLMESSAGE>  \r\n          <!-- Retrieve all Vouchers for specified VoucherNo and VoucherType -->  \r\n          <COLLECTION NAME="RTSAllVouchers_FilterForVchNoAndVchType" ISINITIALIZE="Yes">  \r\n              <TYPE>Voucher</TYPE>  \r\n              <FETCH>ALLLEDGERENTRIES.*</FETCH>  \r\n              <FETCH>ALLINVENTORYENTRIES.*</FETCH>  \r\n              <FILTER>RTS_FilterForVchNoAndVchType</FILTER>  \r\n          </COLLECTION>  \r\n          <VARIABLE NAME="RTS_KEY">  \r\n            <TYPE> String</TYPE>  \r\n          </VARIABLE>  \r\n          <VARIABLE NAME="RTS_VOUCHERTYPENAME">  \r\n            <TYPE>String</TYPE>  \r\n          </VARIABLE>  \r\n          <SYSTEM TYPE="FORMULAE" NAME="RTS_FilterForVchNoAndVchType">  \r\n            $VoucherNumber = $$String:##RTS_KEY and $VoucherTypeName = $$String:##RTS_VOUCHERTYPENAME\r\n          </SYSTEM>  \r\n        </TDLMESSAGE>  \r\n      </TDL>  \r\n    </DESC>  \r\n  </BODY>  \r\n</ENVELOPE> ';
        var config = {
        method: 'post',
        url: 'http://localhost:9000',
        headers: { 
        'Content-Type': 'application/xml'
        },
        data : data
        };
        axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            var result = JSON.parse(convertXml2Json.xml2json(response.data, {compact: true, spaces: 4}));
            console.log(result['ENVELOPE']['BODY']['DATA']['COLLECTION']['VOUCHER']['VOUCHERNUMBER']);
            
            var finalInvoices={};
            if( result['ENVELOPE']['BODY'])
            {   
                var tallyData = result['ENVELOPE']['BODY']['DATA']['COLLECTION']['VOUCHER'];
                if(tallyData)
                {
                    // console.log("in");
                    if(tallyData['LEDGERENTRIES.LIST'])
                    {
                        var price=[];
                        for (let j = 0; j < tallyData['LEDGERENTRIES.LIST'].length; j++) {
                            price[j]={
                                "TITLE":tallyData['LEDGERENTRIES.LIST'][j]['LEDGERNAME']['_text'],
                                "AMOUNT":Math.abs(tallyData['LEDGERENTRIES.LIST'][j]['AMOUNT']['_text'])
                            }; 
                        }
                    }
                    var date = tallyData['DATE']['_text'];
                    var newDate = date.substring(0, 4)+'-'+date.substring(4, 6)+'-'+date.substring(6, 8); 
                    finalInvoices={
                        "DATE":newDate,
                        "PARTYLEDGERNAME":tallyData['LEDGERENTRIES.LIST'][0]['LEDGERNAME']['_text'],
                        "PARTYNAME":tallyData['LEDGERENTRIES.LIST'][0]['LEDGERNAME']['_text'],
                        "id":tallyData['VOUCHERNUMBER']['_text'],
                        "PRODUCT":tallyData['ALLINVENTORYENTRIES.LIST']['STOCKITEMNAME']['_text'],
                        "RATE":tallyData['ALLINVENTORYENTRIES.LIST']['RATE']['_text'],
                        "AMOUNT":tallyData['ALLINVENTORYENTRIES.LIST']['AMOUNT']['_text'],
                        "ACTUALQTY":tallyData['ALLINVENTORYENTRIES.LIST']['ACTUALQTY']['_text'],
                        "BILLEDQTY":tallyData['ALLINVENTORYENTRIES.LIST']['BILLEDQTY']['_text'],
                        "AMOUNT_DETAILS":price,
                    };
                    
                    // console.log(finalInvoices)
                }
            }
            resolve(finalInvoices);  
        })
        .catch(function (error) {
            reject(error);
        });
    })
  }

  all() {
      
    return new Promise((resolve, reject) => {
        var data = '<ENVELOPE>\r\n  <HEADER>\r\n    <TALLYREQUEST>Export Data</TALLYREQUEST>\r\n  </HEADER>\r\n  <BODY>\r\n    <EXPORTDATA>\r\n      <REQUESTDESC>\r\n        <STATICVARIABLES>\r\n          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>\r\n        </STATICVARIABLES>\r\n        <REPORTNAME>Sales Vouchers</REPORTNAME>\r\n      </REQUESTDESC>\r\n    </EXPORTDATA>\r\n  </BODY>\r\n</ENVELOPE>';
        var config = {
        method: 'post',
        url: 'http://localhost:9000',
        headers: { 
        'Content-Type': 'application/xml'
        },
        data : data
        };
        axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            var result = JSON.parse(convertXml2Json.xml2json(response.data, {compact: true, spaces: 4}));
            // console.log(result['ENVELOPE']);
            
            var finalInvoices=[];
            if( result['ENVELOPE']['BODY']['IMPORTDATA']['REQUESTDATA']['TALLYMESSAGE'])
            {   
                var tallyData = result['ENVELOPE']['BODY']['IMPORTDATA']['REQUESTDATA']['TALLYMESSAGE'];
                var k=0;
                for (let i = 0; i < tallyData.length; i++) {
                    if(tallyData[i]['VOUCHER'])
                    {
                        if(tallyData[i]['VOUCHER']['LEDGERENTRIES.LIST'])
                        {
                            var price=[];
                            for (let j = 0; j < tallyData[i]['VOUCHER']['LEDGERENTRIES.LIST'].length; j++) {
                                price[j]={
                                    "TITLE":tallyData[i]['VOUCHER']['LEDGERENTRIES.LIST'][j]['LEDGERNAME']['_text'],
                                    "AMOUNT":Math.abs(tallyData[i]['VOUCHER']['LEDGERENTRIES.LIST'][j]['AMOUNT']['_text'])
                                }; 
                            }
                        }
                        var date = tallyData[i]['VOUCHER']['DATE']['_text'];
                        var newDate = date.substring(0, 4)+'-'+date.substring(4, 6)+'-'+date.substring(6, 8); 
                        finalInvoices[k]={
                            "DATE":newDate,
                            "PARTYLEDGERNAME":tallyData[i]['VOUCHER']['PARTYLEDGERNAME']['_text'],
                            "PARTYNAME":tallyData[i]['VOUCHER']['PARTYNAME']['_text'],
                            "id":tallyData[i]['VOUCHER']['VOUCHERNUMBER']['_text'],
                            "PRODUCT":tallyData[i]['VOUCHER']['ALLINVENTORYENTRIES.LIST']['STOCKITEMNAME']['_text'],
                            "RATE":tallyData[i]['VOUCHER']['ALLINVENTORYENTRIES.LIST']['RATE']['_text'],
                            "AMOUNT":tallyData[i]['VOUCHER']['ALLINVENTORYENTRIES.LIST']['AMOUNT']['_text'],
                            "ACTUALQTY":tallyData[i]['VOUCHER']['ALLINVENTORYENTRIES.LIST']['ACTUALQTY']['_text'],
                            "BILLEDQTY":tallyData[i]['VOUCHER']['ALLINVENTORYENTRIES.LIST']['BILLEDQTY']['_text'],
                            "AMOUNT_DETAILS":price,
                        };
                        k++;
                    }
                    // finalInvoices[i]['DATE']=tallyData[i]['DATE'];
                }
            }
            resolve(finalInvoices);  
        })
        .catch(function (error) {
            reject(error);
        });
    })
  }
}
module.exports = TallyHelper