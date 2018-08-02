E.on('init', function() { 

  setInterval(() => {
    const values = 
       [D28, D29, D30, D31]
        .map(analogRead)
        .map(v => ~~ (v * 255));
    
    values.push(E.getBattery());
  
    console.log(values);
    
    NRF.setAdvertising({},{
      manufacturer: 0x0590, 
      manufacturerData: values
    });
  }, 1000);

});

