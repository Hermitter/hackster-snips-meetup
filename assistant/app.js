var matrix = require('@matrix-io/matrix-lite');
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://' + '127.0.0.1', { port: 1883 });
var snipsUserName = "timWiz";

// MQTT Topics
var wakeword = 'hermes/hotword/default/detected';
var sessionEnd = 'hermes/dialogueManager/sessionEnded';
var colorChange = 'hermes/intent/'+snipsUserName+':colorChange';


// Subscribe to each event (MQTT Topic)
client.on('connect', ()=>{
    console.log('Connected to Snips MQTT server\n');
    client.subscribe(wakeword);// when a conversation starts
    client.subscribe(sessionEnd);// when a conversation ends
    client.subscribe(colorChange);
});

// On data from Snips' MQTT server
var wakeColor = "blue";
client.on('message', (topic, message)=>{
    // Extract message (convert string to JSON)
    var message = JSON.parse(message);

    switch(topic){
        case wakeword:
            console.log("I HEARD YOU!!!!!\n");
            matrix.led.set(wakeColor);
            break;

        case colorChange:
            try{wakeColor = message.slots[0].rawValue;}
            catch(error){console.log("sorry I didn't get the color you wanted.");}

            console.log("YOU'RE CHANGEING THE COLOR");

            client.snipsRespond({
                sessionId: message.sessionId,
                text: "You changed the color to"+wakeColor
            });

            break;

        case sessionEnd:
            console.log("\n...k bye");
            matrix.led.set({});
            break;
    }
});

// - Request Snips session end & utter text given
client.snipsRespond = (payload)=>{
    client.publish('hermes/dialogueManager/endSession', JSON.stringify({
      sessionId: payload.sessionId,
      text: payload.text
    }));
};
