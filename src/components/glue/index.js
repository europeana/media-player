//Glue communication bridge

export default class Glue {
    constructor () {
        this.listeners = [];
    }

    signal(item, event, data) {
        //console.log("signal that "+item+" "+event+" took place with data "+data);
        let signalItems = this.listeners.filter(obj => obj.item == item && obj.event == event);
        console.log("signal "+signalItems.length+" objects");
        signalItems.forEach(function(obj) {
            obj.callback(data);
        });
    }

    listen(item, event, handler, callback) {
        let obj = { item, event, handler, callback };
        this.listeners.push(obj);
    }
}