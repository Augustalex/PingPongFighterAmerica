module.exports = {
    wait,
    doXTimes
}

async function wait(delay) {
    await new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}

async function doXTimes(fn, x) {
    let results = []
    for (let i = 0; i < x; i++) {
        let result = await fn(i)
        results.push(result)
    }
    return results
}