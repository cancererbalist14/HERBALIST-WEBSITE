

var KEY_MAP = {
  'orderId': 'Order ID',
  'orderDate': 'Timestamp',
  'createdAt': 'Timestamp', // maps to same column
  'updatedAt': 'Updated At',
  'customerName': 'Customer Name',
  'phone': 'Phone',
  'email': 'Email',
  'address': 'Address',
  'city': 'City',
  'state': 'State',
  'pincode': 'Pincode',
  'productName': 'Product Name',
  'productId': 'Product ID',
  'quantity': 'Quantity',
  'unitPrice': 'Unit Price (₹)',
  'orderAmount': 'Order Total (₹)',
  'paymentMethod': 'Payment Method',
  'paymentStatus': 'Payment Status',
  'orderStatus': 'Status',
  'shipmentStatus': 'Shipment Status',
  'cancellationStatus': 'Cancellation Status',
  'returnStatus': 'Return Status',
  'refundStatus': 'Refund Status',
  'shiprocketOrderId': 'Shiprocket Order ID',
  'shipmentId': 'Shipment ID',
  'awb': 'AWB',
  'courierId': 'Courier ID',
  'courierName': 'Courier Name',
  'trackingUrl': 'Tracking URL',
  'estimatedDeliveryDate': 'Estimated Delivery Date',
  'latestStatus': 'Latest Status',
  'lastSyncedAt': 'Last Synced At'
};

var REVERSE_KEY_MAP = {};
// Pre-populate reverse key map from KEY_MAP
for (var key in KEY_MAP) {
  if (key === 'createdAt') continue; // let orderDate take precedence for 'Timestamp'
  REVERSE_KEY_MAP[KEY_MAP[key]] = key;
}
// Manual custom fallbacks
REVERSE_KEY_MAP['Timestamp'] = 'orderDate';
REVERSE_KEY_MAP['Order Total (₹)'] = 'orderAmount';
REVERSE_KEY_MAP['Unit Price (₹)'] = 'unitPrice';
REVERSE_KEY_MAP['Status'] = 'orderStatus';

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    
    if (action === 'sendEmail') {
      return sendEmail(postData);
    }
    
    var sheetName = postData.sheet || 'orders';
    sheetName = normalizeSheetName(sheetName);
    
    var ss;
    try {
      ss = SpreadsheetApp.openById("1dfGA_WunqNH3cIpghIbBuIR42p4KXba_EVIac_9mH4c");
    } catch (err) {
      try {
        ss = SpreadsheetApp.getActiveSpreadsheet();
      } catch (e2) {}
    }
    
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Spreadsheet not found or access denied." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    if (action === 'appendRow') {
      return appendRow(sheet, postData);
    }
    if (action === 'updateRow') {
      return updateRow(sheet, postData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Invalid action in POST request." 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "POST error: " + err.message 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var action = e.parameter.action;
  var sheetName = e.parameter.sheet || 'orders';
  
  // Normalize sheet names to avoid casing issues
  sheetName = normalizeSheetName(sheetName);
  
  var ss;
  try {
    ss = SpreadsheetApp.openById("1dfGA_WunqNH3cIpghIbBuIR42p4KXba_EVIac_9mH4c");
  } catch (err) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e2) {}
  }
  
  if (!ss) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Spreadsheet not found or access denied." 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Handle email sending action from GET if needed (e.g. testing)
  if (action === 'sendEmail') {
    return sendEmail(e.parameter);
  }

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  if (action === 'getRows') {
    return getRows(sheet, ss);
  }
  
  if (action === 'updateRow') {
    return updateRow(sheet, e.parameter);
  }
  
  if (action === 'deleteRow') {
    return deleteRow(sheet, e.parameter, ss);
  }
  
  if (action === 'clearSheet') {
    return clearSheet(sheet);
  }
  
  // Default action: Append row (backward compatible with existing appends)
  // Determine correct sheet if not explicitly specified
  if (!e.parameter.sheet) {
    if (e.parameter.type === 'APPOINTMENT' || e.parameter.apptId) {
      sheetName = 'appointments';
    } else if (e.parameter.type === 'REFUND' || e.parameter.refundId) {
      sheetName = 'refunds';
    } else if (e.parameter.type === 'EVENT' || e.parameter.eventId) {
      sheetName = 'orderEvents';
    } else {
      sheetName = 'orders';
    }
    sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
  }
  
  return appendRow(sheet, e.parameter);
}

function doPost(e) {
  var params = {};
  
  // Try to parse JSON from POST body
  try {
    if (e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    }
  } catch (err) {}
  
  // Merge query string parameters as fallback
  for (var key in e.parameter) {
    if (params[key] === undefined) {
      params[key] = e.parameter[key];
    }
  }
  
  var action = params.action;
  var sheetName = params.sheet || 'orders';
  
  var ss;
  try {
    ss = SpreadsheetApp.openById("1dfGA_WunqNH3cIpghIbBuIR42p4KXba_EVIac_9mH4c");
  } catch (err) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e2) {}
  }
  
  if (!ss) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Spreadsheet not found or access denied." 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Handle email sending action
  if (action === 'sendEmail') {
    return sendEmail(params);
  }
  
  var sheet = ss.getSheetByName(normalizeSheetName(sheetName));
  if (!sheet) {
    sheet = ss.insertSheet(normalizeSheetName(sheetName));
  }
  
  if (action === 'getRows') {
    return getRows(sheet, ss);
  }
  
  if (action === 'updateRow') {
    return updateRow(sheet, params);
  }
  
  if (action === 'deleteRow') {
    return deleteRow(sheet, params, ss);
  }
  
  if (action === 'clearSheet') {
    return clearSheet(sheet);
  }
  
  // Default action: Append row
  // Determine correct sheet if not explicitly specified
  if (!params.sheet) {
    if (params.type === 'APPOINTMENT' || params.apptId) {
      sheetName = 'appointments';
    } else if (params.type === 'REFUND' || params.refundId) {
      sheetName = 'refunds';
    } else if (params.type === 'EVENT' || params.eventId) {
      sheetName = 'orderEvents';
    } else {
      sheetName = 'orders';
    }
    sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
  }
  
  return appendRow(sheet, params);
}

function sendEmail(params) {
  var to = params.to;
  var subject = params.subject;
  var htmlBody = params.htmlBody;
  
  if (!to || !subject || !htmlBody) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: 'Missing fields. to, subject, and htmlBody are required.' 
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    // Attempt sending using GmailApp (native and high deliverability)
    GmailApp.sendEmail(to, subject, '', {
      htmlBody: htmlBody,
      name: 'Cancer Herbalist'
    });
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully via GmailApp' 
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    try {
      // Fallback to MailApp
      MailApp.sendEmail({
        to: to,
        subject: subject,
        htmlBody: htmlBody,
        name: 'Cancer Herbalist'
      });
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully via MailApp' 
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err2) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Failed to send email: ' + err.message + ' | Fallback: ' + err2.message 
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
}


function normalizeSheetName(name) {
  var n = name.toLowerCase();
  if (n === 'orders') return 'Orders';
  if (n === 'appointments') return 'Appointments';
  if (n === 'refunds') return 'Refunds';
  if (n === 'orderevents' || n === 'events') return 'OrderEvents';
  return name;
}

function getRows(sheet, ss) {
  // Load the list of deleted order IDs so we never return them
  var deletedIds = {};
  if (ss && sheet.getName() === 'orders') {
    var delSheet = ss.getSheetByName('deletedOrders');
    if (delSheet && delSheet.getLastRow() > 1) {
      var delData = delSheet.getDataRange().getValues();
      for (var d = 1; d < delData.length; d++) {
        var did = String(delData[d][0]).trim();
        if (did) deletedIds[did] = true;
      }
    }
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, rows: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      
      // Try to parse JSON strings or boolean/numeric values
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (val === '') val = null;
      else if (typeof val === 'string' && val.trim().startsWith('{') && val.trim().endsWith('}')) {
        try {
          val = JSON.parse(val);
        } catch (err) {}
      }
      
      var dbKey = REVERSE_KEY_MAP[headers[j]] || headers[j];
      row[dbKey] = val;
    }
    
    // Skip orders that have been deleted
    if (sheet.getName() === 'orders' && row.orderId && deletedIds[String(row.orderId).trim()]) {
      continue;
    }
    
    rows.push(row);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, rows: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

function appendRow(sheet, params) {
  // Filter and map control parameters
  var data = {};
  for (var key in params) {
    if (key !== 'sheet' && key !== 'action') {
      var mappedKey = KEY_MAP[key] || key;
      data[mappedKey] = params[key];
    }
  }
  
  var headers = [];
  if (sheet.getLastColumn() > 0) {
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }
  
  // Find new headers that aren't in the sheet yet
  var newHeaders = [];
  for (var key in data) {
    if (headers.indexOf(key) === -1) {
      newHeaders.push(key);
    }
  }
  
  if (newHeaders.length > 0) {
    headers = headers.concat(newHeaders);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  // Prepare row values according to header order
  var rowValues = headers.map(function(h) {
    var val = data[h];
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  });
  
  sheet.appendRow(rowValues);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Row appended successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateRow(sheet, params) {
  var sheetName = sheet.getName();
  var idKey = 'orderId';
  if (sheetName === 'appointments') idKey = 'apptId';
  else if (sheetName === 'refunds') idKey = 'refundId';
  else if (sheetName === 'orderEvents') idKey = 'eventId';
  
  var idVal = params[idKey];
  if (!idVal) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Missing unique ID: ' + idKey }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var headers = values[0];
  
  // ID column in spreadsheet maps from database key to spreadsheet header name
  var mappedIdKey = KEY_MAP[idKey] || idKey;
  var idColIdx = headers.indexOf(mappedIdKey);
  
  if (idColIdx === -1) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'ID column (' + mappedIdKey + ') not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Find matching row
  var rowIdx = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idColIdx]).trim() === String(idVal).trim()) {
      rowIdx = i + 1; // 1-indexed row number
      break;
    }
  }
  
  // If row not found, append it instead (upsert behavior)
  if (rowIdx === -1) {
    return appendRow(sheet, params);
  }
  
  // Map incoming parameters to sheet columns
  var mappedData = {};
  for (var key in params) {
    if (key !== 'sheet' && key !== 'action' && key !== idKey) {
      var mappedKey = KEY_MAP[key] || key;
      mappedData[mappedKey] = params[key];
    }
  }
  
  // Update cells
  for (var key in mappedData) {
    var colIdx = headers.indexOf(key);
    if (colIdx === -1) {
      // Add new header column
      headers.push(key);
      sheet.getRange(1, headers.length).setValue(key);
      colIdx = headers.length - 1;
    }
    
    var val = mappedData[key];
    if (val === undefined || val === null) val = '';
    else if (typeof val === 'object') val = JSON.stringify(val);
    
    sheet.getRange(rowIdx, colIdx + 1).setValue(val);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Row updated successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteRow(sheet, params, ss) {
  var sheetName = sheet.getName();
  var idKey = 'orderId';
  if (sheetName === 'appointments') idKey = 'apptId';
  else if (sheetName === 'refunds') idKey = 'refundId';
  else if (sheetName === 'orderEvents') idKey = 'eventId';
  
  var idVal = params[idKey];
  if (!idVal) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Missing ID parameter: ' + idKey }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var headers = values[0];
  
  // Try mapped key first (e.g. 'Order ID'), then raw key (e.g. 'orderId') as fallback
  var mappedIdKey = KEY_MAP[idKey] || idKey;
  var idColIdx = headers.indexOf(mappedIdKey);
  if (idColIdx === -1) {
    idColIdx = headers.indexOf(idKey); // raw key fallback
  }
  
  if (idColIdx === -1) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: 'ID column not found (tried: ' + mappedIdKey + ', ' + idKey + ')' 
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var deleted = false;
  // Iterate in reverse so row index doesn't shift after deletion
  for (var i = values.length - 1; i >= 1; i--) {
    if (String(values[i][idColIdx]).trim() === String(idVal).trim()) {
      sheet.deleteRow(i + 1);
      deleted = true;
      break;
    }
  }

  // For orders: record to deletedOrders sheet to prevent reappearance on sync
  if (sheetName === 'orders' && ss) {
    try {
      var delSheet = ss.getSheetByName('deletedOrders');
      if (!delSheet) {
        delSheet = ss.insertSheet('deletedOrders');
        delSheet.appendRow(['orderId', 'deletedAt']);
      }
      delSheet.appendRow([String(idVal), new Date().toISOString()]);
    } catch (e) {
      // Non-fatal — log and continue
      Logger.log('Could not write to deletedOrders sheet: ' + e.message);
    }
  }
  
  if (deleted) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Row deleted successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Row not in sheet but still recorded in deletedOrders — treat as success
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Row not found in sheet (may already be deleted)' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function clearSheet(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Sheet cleared successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}
