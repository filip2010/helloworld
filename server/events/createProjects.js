var util        = require("util")
    , events    = require("events");

function CreateProjectEvents() {
    events.EventEmitter.call(this);
    
}

util.inherits(CreateProjectEvents, events.EventEmitter);


var events = new CreateProjectEvents();


events.on("data", function(data) {
    console.log('Received data: "' + data + '"');
})

events.emit('data', "It works!"); // Received data: "It works!"