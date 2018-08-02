const noble = require('noble');

const ham = (a, b) => 
  a.reduce((sofar, _, i) => 
    sofar += Math.abs(a[i] - b[i])
  , 0)

let prior;

function onDiscovery(peripheral) {
  // peripheral.rssi                             - signal strength
  // peripheral.address                          - MAC address
  // peripheral.advertisement.localName          - device's name
  // peripheral.advertisement.manufacturerData   - manufacturer-specific data
  // peripheral.advertisement.serviceData        - normal advertisement service data
  // ignore devices with no manufacturer data
  if (!peripheral.advertisement.manufacturerData) return;
  // output what we have

  const data = peripheral.advertisement.manufacturerData;

  // check that it matches espruino
  if (!(data[0] === 0x90 && data[1] === 0x05)) return;

  const values = new Uint8Array(data.slice(2));


  // debug hamming stuff
  // if(prior) {
  //   console.log(`  ${prior.join(',')}  =>  ${values.join(',')}   (${ham(values, prior)})`)
  // }

  if(!prior || ham(values, prior) > 4) {
    prior = values;
  
    console.log(
      '⚡️',
      peripheral.address,
      JSON.stringify(peripheral.advertisement.localName),
      values.join(', ')
    );

    send(values)

  }
}

noble.on('stateChange',  function(state) {
  if (state!="poweredOn") return;
  console.log("Starting scan...");
  noble.startScanning([], true);
});
noble.on('discover', onDiscovery);
noble.on('scanStart', function() { console.log("Scanning started."); });
noble.on('scanStop', function() { console.log("Scanning stopped.");});



const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

function send(row) {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    // authorize(JSON.parse(content), listMajors);
    authorize(JSON.parse(content), client => {

      addStuff(client, row)
    });
  });
}

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


function addStuff(auth, values) {
  const sheets = google.sheets({version: 'v4', auth});

  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: '1fUPTybKHk7Oa-SJTf_6ffivT5YELYuz1RckwJDtBQrk',

    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: 'stuffometer!A:E', 

    // How the input data should be interpreted.
    valueInputOption: 'USER_ENTERED', 

    // How the input data should be inserted.
    insertDataOption: 'INSERT_ROWS', 

    resource: {
      values: [[+new Date, ...values]]
    },

    auth: auth,
  };

  sheets.spreadsheets.values.append(request, function(err, response) {
    if (err) {
      console.error(err);
      return;
    }

    console.log(response.status, response.statusText);
    console.log(response.data);
  });

}