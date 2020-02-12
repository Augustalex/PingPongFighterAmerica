let getRandomAmericanTown = require('./getRandomAmericanTown.js')
let {doXTimes, wait} = require('./utils.js')
let {runMatch, createMatch} = require('./matchSystem')
let generateSportsTeamName = require('sports-team-name-generator');

module.exports = async function createTournament({townCount, team, firstTown}) {
    let roadMap = await doXTimes(getRandomAmericanTown, townCount)
    if (firstTown) {
        roadMap.pop()
        roadMap.unshift(firstTown)
    }
    
    let currentLevel = 0
    let currentTown = roadMap[currentLevel]
    
    const createOpponent = (level) => {
        let skillIncreasePerLevel = 100 / townCount
        const calculateSkillLevel = () => Math.floor(skillIncreasePerLevel * level * (Math.random() * .2 + .8))
        return {
            name: generateSportsTeamName(),
            stats: {
                backspin: calculateSkillLevel(),
                topspin: calculateSkillLevel(),
                smash: calculateSkillLevel(),
            }
        }
    }
    
    return {
        runNextMatch,
        canMoveToNextTown,
        getRoadMap: () => roadMap,
        getCurrentLevel: () => currentLevel,
        getCurrentTown: () => currentTown,
        moveToNextTown
    }
    
    function canMoveToNextTown() {
        return roadMap.indexOf(currentTown) !== currentLevel
    }
    
    async function moveToNextTown({screen, input}) {
        if (canMoveToNextTown()) {
            currentTown = roadMap[currentLevel]
        }
        else {
            await screen.breakLine()
            await screen.type(`You have to beat an opponent at your own skill level to move to the next town.`)
            await wait(3000)
        }
    }
    
    async function runNextMatch({screen, input}) {
        let town = roadMap[currentLevel]
        if (town !== currentTown) {
            await screen.breakLine()
            await screen.type(`You've already beaten every racketeer around! You should go on to the next town.`)
            await wait(3000)
            return
        }
        
        let opponent = createOpponent(currentLevel + 1)
        let match = createMatch(team, opponent, {screen, input})
        
        await wait(1000)
        await screen.type(`Ping pongers of ${town}! `)
        await wait(1200)
        await screen.print('Ready ')
        await wait(500)
        await screen.print('your ')
        await wait(500)
        await screen.print('rackets.')
        await wait(500)
        
        let scores = await match({screen, input})
        let winner = null
        if (scores.team > scores.opponent) {
            winner = team
        }
        else if (scores.opponent > scores.team) {
            winner = opponent
        }
        await screen.clear()
        await screen.breakLine()
        await wait(1000)
        await screen.type('The winner is... ')
        await wait(1500)
        await screen.type(`${winner.name}!`)
        await wait(1000)
        await screen.breakLine()
        if (winner === team) {
            currentLevel++
            await screen.type(`Next town is ${roadMap[currentLevel]}`)
        }
        else {
            await screen.type(`You'l have to stay here in ${town} until your next opponent arrives. See you around.`)
        }
        await wait(3000)
    }
}

