
module.exports = function Input() {
    
    let listeners = []
    let onceListeners = []
    let readLineListeners = []
    init();
    
    return {
        onLine(listener) {
            listeners.push(listener)
        },
        onceLine(listener) {
            onceListeners.push(listener)
        },
        async readLine() {
            return await new Promise(resolve => {
                readLineListeners.push((rawLine) => {
                    resolve(rawLine)
                })
            })
        }
    }
    
    function init() {
        process.stdin.addListener("data", function(d) {
            if(d.toString().trim() === 'q') process.exit()
            
            let rawInput = d.toString()
            readLineListeners.forEach(l => l(rawInput))
            listeners.forEach(l => l(rawInput))
            
            let toRemove = []
            onceListeners.forEach(l => {
                l(d.toString())
                toRemove.push(l)
            })
            onceListeners = onceListeners.filter(l => !toRemove.includes(l))
        });
    }
}