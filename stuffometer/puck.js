setInterval(() => {
  const values = 
     [D28, D29, D30, D31]
      .map(analogRead)
      .map(v => ~~ (v * 255));
  
  console.log(values);
  
  NRF.setAdvertising({},{
    manufacturer: 0x0590, 
    manufacturerData: values
  });
}, 500);