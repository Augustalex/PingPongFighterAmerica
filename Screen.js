let colorsLib = require('cli-color')

const COLORS = {
    black: 'black',
    red: 'red',
    green: 'green',
    yellow: 'yellow',
    blue: 'blue',
    magenta: 'magenta',
    cyan: 'cyan',
    white: 'white',
    gray: 'gray',
    grey: 'grey'
}

const BACKGROUNDS = {
    white: 'bgWhite',
    red: 'bgRed'
}

module.exports = function Screen() {
    let lastOutputWasBreakLine = false
    return {
        wasLastOutputBreakLine() {
            return lastOutputWasBreakLine
        },
        clear() {
            lastOutputWasBreakLine = false
    
            process.stdout.write(colorsLib.erase.screen)
        },
        print(text, color = COLORS.black, background) {
            lastOutputWasBreakLine = false

            let textFormatter = colorsLib[color]
            if (background) {
                textFormatter = textFormatter[background]
            }
            process.stdout.write(textFormatter(text))
        },
        breakLine() {
            process.stdout.write('\n')
            lastOutputWasBreakLine = true
        },
        async type(text, color = COLORS.black, background) {
            lastOutputWasBreakLine = false

            let textFormatter = colorsLib[color]
            if (background) {
                textFormatter = textFormatter[background]
            }
            await typeIt(text, textFormatter)
        }
    }
}

const randomSequence = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]
let randomNumberIndex = 0
const getRandomNumber = (max) => {
    if (randomNumberIndex >= randomSequence) {
        randomNumberIndex = 0
    }
    return randomSequence[randomNumberIndex] * max
}

async function typeIt(text, colorFn, totalTime = 1500) {
    let chars = text.split('')
    let individualTime = totalTime / chars.length
    for (let char of chars) {
        process.stdout.write(colorFn(char))
        await wait(getRandomNumber(individualTime))
    }
}

async function wait(delay) {
    await new Promise(resolve => {
        setTimeout(resolve, delay)
    })
}