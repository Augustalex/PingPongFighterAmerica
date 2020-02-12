let {wait} = require('./utils.js')
let generateSportsTeamName = require('sports-team-name-generator');

const READ_LINE_TIME_LIMIT = 5000;
const options = ['BACKSPIN', 'TOPSPIN', 'SMASH'];

module.exports = {
    createMatch,
    runTrainingMatch
}

function createMatch(team, opponent, {screen, input}) {
    return async () => {
        const printTeamStats = team => screen.print(`Backspin: ${team.stats.backspin}, Topspin: ${team.stats.topspin}, Smash: ${team.stats.smash}`)
        screen.breakLine()
        await screen.print(team.name)
        await screen.breakLine()
        await printTeamStats(team)
        await screen.breakLine()
        await screen.print(opponent.name)
        await screen.breakLine()
        await printTeamStats(opponent)
        
        let scores = {
            team: 0,
            opponent: 0
        }
        
        let gameDeps = {team, opponent, screen, input}
        scores = await runRound(1, scores, true, gameDeps)
        scores = await runRound(2, scores, false, gameDeps)
        scores = await runRound(3, scores, true, gameDeps)
        await wait(3000)
        return scores
    }
}

async function runTrainingMatch(team, opponent, {screen, input}) {
    const printTeamStats = team => screen.print(`Backspin: ${team.stats.backspin}, Topspin: ${team.stats.topspin}, Smash: ${team.stats.smash}`)
    screen.breakLine()
    await screen.print(team.name)
    await screen.breakLine()
    await printTeamStats(team)
    await screen.breakLine()
    await screen.print(opponent.name)
    await screen.breakLine()
    await printTeamStats(opponent)
    
    let scores = {
        team: 0,
        opponent: 0
    }
    
    let gameDeps = {team, opponent, screen, input}
    scores = await runRound(1, scores, true, gameDeps)
    scores = await runRound(2, scores, false, gameDeps)
    scores = await runRound(3, scores, true, gameDeps)
    await endGame(scores, gameDeps)
}

async function endGame(scores, {team, opponent, screen}) {
    await screen.clear()
    await wait(1000)
    await screen.type('And the winner is!')
    await wait(1500)
    await screen.type(' ...')
    await wait(1500)
    await screen.type('...')
    await screen.clear()
    await wait(1000)
    await screen.type('Drum roll please...')
    await screen.type('.')
    await wait(500)
    await screen.type('.')
    await wait(500)
    await screen.type('.')
    await screen.type('.')
    await wait(1000)
    await screen.type('.')
    await screen.type('.')
    await wait(800)
    await screen.type('.')
    await wait(1500)
    await screen.clear()
    await screen.breakLine()
    if (scores.team > scores.opponent) {
        await screen.type(team.name + '!')
        await wait(1800)
        await screen.type(' A damn shame.')
    }
    else if (scores.team < scores.opponent) {
        await screen.type(opponent.name + '!')
        await wait(1800)
        await screen.type(' Big congratulations.')
    }
    else {
        await screen.type('Everybody!')
        await wait(1800)
        await screen.type(' Yay.')
    }
    await wait(2000)
    await screen.breakLine()
}

async function runRound(roundNumber, scores, playerIsAttacker, deps) {
    let {team, opponent, input, screen} = deps
    
    await screen.breakLine()
    await screen.breakLine()
    await screen.type(`ROUND ${roundNumber}\n`)
    await screen.type(`${team.name}: ${scores.team}\t${opponent.name}: ${scores.opponent}\n`)
    await wait(500)
    
    let attacker = playerIsAttacker ? team : opponent
    let defender = playerIsAttacker ? opponent : team
    let winner;
    while (!winner) {
        let chosenMoves = await runTurn(attacker, defender, options, deps)
        attack = chosenMoves.attack
        defence = chosenMoves.defence
        if (attack === 'MISS') {
            winner = defender
        }
        else if (defence === 'MISS') {
            winner = attacker
        }
        else {
            let winningMove = decideWinner(attack, defence)
            if (winningMove) {
                await screen.breakLine()
                await wait(1000)
                await screen.type('Winning move: ' + winningMove)
                winner = winningMove === attack ? attacker : defender
            }
        }
    }
    
    if (team === winner) {
        return {
            team: scores.team + 1,
            opponent: scores.opponent,
        }
    }
    else {
        return {
            team: scores.team,
            opponent: scores.opponent + 1,
        }
    }
}

async function runTurn(attacker, defender, options, io) {
    let {screen, input} = io
    screen.breakLine()
    
    let attack = await getTeamMove(attacker, options, io)
    if (attack === 'MISS') return {attack}
    
    let defence
    if (defender.isPlayer) {
        await screen.breakLine()
        defence = await getPlayerMove(defender, options, io)
    }
    else {
        defence = await tryMatchMove(attack, defender, options)
        await screen.breakLine()
        await screen.type(`${defender.name}: ${defence}`)
        await wait(1000)
    }
    return {attack, defence}
}

async function getTeamMove(team, options, io) {
    let {screen} = io
    if (team.isPlayer) {
        return await getPlayerMove(team, options, io)
    }
    let move = await randomElement(options, ['SMASH'])
    await screen.type(`${team.name}: ${move}`)
    return move
}

async function tryMatchMove(move, team, options) {
    let doesNotMatchMove = Math.random() * 100 > team.stats[move.toLowerCase()]
    if (doesNotMatchMove) {
        return randomElement(options, ['SMASH', 'MISS'])
    }
    return move
}

async function getPlayerMove(team, options, {input, screen}) {
    await screen.breakLine()
    await screen.print(`${team.name}: `)
    let choice
    let rawLine = await readLineAndShowTimeLimit({input, screen}, READ_LINE_TIME_LIMIT)
    let line = rawLine.trim().toUpperCase()
    if (line === '') {
        await screen.type(`MISSED!`)
        return 'MISS'
    }
    
    choice = options.find(o => o === line)
    if (!choice) {
        return await getPlayerMove(team, options, {input, screen})
    }
    
    let randomChoice = randomElement(options, ['SMASH'])
    if (randomChoice !== choice && Math.random() * 100 > team.stats[choice.toLowerCase()]) {
        await screen.type(`Shit, did a \"${randomChoice}\" instead!`)
        return randomChoice
    }
    return choice
}

function decideWinner(attack, defence) {
    if (attack === 'MISS') return defence
    if (defence === 'MISS') return attack
    
    if (attack === defence) return null
    
    if (attack === 'SMASH') return attack
    if (defence === 'SMASH') return defence
    return attack
}

function randomElement(array, exclude = []) {
    let selectable = array.filter(a => !exclude.includes(a))
    return selectable[Math.round(Math.random() * (selectable.length - 1))]
}

async function readLineAndShowTimeLimit({input, screen}, timeLimit) {
    return await new Promise(async resolve => {
        let resolved = false;
        (async () => {
            const nDots = 3
            const timeBetweenDots = Math.round(timeLimit / nDots + 1)
            
            await wait(timeBetweenDots)
            if (resolved) return
            await screen.print('. ')
            await wait(timeBetweenDots)
            if (resolved) return
            await screen.print('. ')
            await wait(timeBetweenDots)
            if (resolved) return
            await screen.print('. ')
            await wait(timeBetweenDots)
            if (resolved) return
            
            if (!resolved) {
                resolved = true
                resolve('')
            }
        })()
        
        let rawLine = await input.readLine()
        if (!resolved) {
            resolved = true;
            resolve(rawLine)
        }
    })
}

//Have certain players have specialty moves that have certain perks
//examples: https://www.thoughtco.com/how-to-play-the-basic-strokes-3173505

//$$$Have a time limit of making a move! mark passed time by dots ". . ." by the third dot you miss the shot
//Make time limit shrink each succeeding turn
//Have sound portrait the time limit by a peep in increasing tempo?
//Should not be able to skip time limit by typing invalid word