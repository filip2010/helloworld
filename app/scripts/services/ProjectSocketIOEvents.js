'use strict';

fresh.service('ProjectSocketIOEvents', ['Socket', '$q',
    function(Socket, $q){

        var basicEvents = ['Start', 'Update', 'Success', 'Error'];

        var self = this;

        var createEventNames = function(event){
            var events = [];
            angular.forEach(basicEvents, function(basic, index){
                this.push(event.concat(basic));
            }, events);
            return events;
        }
        

        this.register = function(event){
            var events = createEventNames(event);

            var deferred = $q.defer();
            Socket.on(events[0], function(data){
                deferred.notify(data.start);
            });

            Socket.on(events[1], function (data){
                deferred.notify(data.update);
            });

            Socket.on(events[2], function(data){
                self.unRegister(events);
                deferred.resolve(data.success);
            });

            Socket.on(events[3], function(data){
                self.unRegister(events);
                deferred.reject(data.error);
            });
            return deferred.promise;
        }


        this.unRegister = function(events){
            Socket.removeAllListeners(events[0]);
            Socket.removeAllListeners(events[1]);
            Socket.removeAllListeners(events[2]);
            Socket.removeAllListeners(events[2]);
        }
        
    }
]);

