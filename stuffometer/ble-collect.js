const noble = require('noble');

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

  const values = data.slice(2);
  const str = Uint8Array.from(values).join(', ')

  if(str === prior) {return}

  prior = str;

  console.log(
    '⚡️',
    peripheral.address,
    JSON.stringify(peripheral.advertisement.localName),
    str
  );
}

noble.on('stateChange',  function(state) {
  if (state!="poweredOn") return;
  console.log("Starting scan...");
  noble.startScanning([], true);
});
noble.on('discover', onDiscovery);
noble.on('scanStart', function() { console.log("Scanning started."); });
noble.on('scanStop', function() { console.log("Scanning stopped.");});
