'use strict';

fresh.factory('Socket', ['socketFactory',
    function(socketFactory){

        return socketFactory();

/*        var myIoSocket = io.connect('http://localhost:8000');

        var mySocket = socketFactory({
            ioSocket: myIoSocket
        });

        return mySocket;*/
        
    }
]);

