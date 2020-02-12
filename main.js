let Screen = require('./Screen.js');
let Input = require('./Input.js');
let generateSportsTeamName = require('sports-team-name-generator');
let getRandomAmericanTown = require('./getRandomAmericanTown.js')
let {wait} = require('./utils.js')
let {runTrainingMatch} = require('./matchSystem.js')
let createTournament = require('./createTournament.js')

let createSetups = (deps) => {
    
    let test2 = PickTeamScene(deps)
        .chainNextScene(TutorialMatchScene(deps))
    let test1 = MainScene(deps)
        .chainNextScene(test2)
    
    let teamName = generateSportsTeamName()
    let opponentName = generateSportsTeamName()
    let test3 = TutorialMatchScene({
        ...deps,
        save: {
            team: {
                isPlayer: true,
                name: teamName,
                stats: {
                    backspin: 25,
                    topspin: 0,
                    smash: 0
                }
            },
            opponent: {
                name: opponentName,
                stats: {
                    backspin: 0,
                    topspin: 10,
                    smash: 10
                }
            }
        }
    })
    let test4 = TournamentScene({
        ...deps,
        save: {
            team: {
                isPlayer: true,
                name: teamName,
                stats: {
                    backspin: 25,
                    topspin: 0,
                    smash: 0
                }
            },
            opponent: {
                name: opponentName,
                stats: {
                    backspin: 0,
                    topspin: 10,
                    smash: 10
                }
            }
        }
    })
    let test5 = TownScene({
        ...deps,
        save: {
            currentTown: getRandomAmericanTown(),
            team: {
                isPlayer: true,
                name: teamName,
                stats: {
                    backspin: 45,
                    topspin: 35,
                    smash: 20
                }
            },
            opponent: {
                name: opponentName,
                stats: {
                    backspin: 50,
                    topspin: 50,
                    smash: 10
                }
            }
        }
    })
    return {
        test1,
        test2,
        test3,
        test4,
        test5
    }
}

(async function () {
    let screen = Screen()
    screen.clear()
    let input = Input()
    let save = {}
    let setups = createSetups({input, screen, save})
    setups.test5.play()
})()

function MainScene(deps) {
    let screen = deps.screen;
    let input = deps.input;
    
    let nextScene;
    
    return {
        async play() {
            await screen.type('Welcome')
            await wait(1500)
            await screen.type(' ...what is your name again?')
            screen.breakLine()
            
            let line = (await input.readLine()).trim()
            await screen.type('Hello ' + line)
            await wait(1000)
            
            this.stop()
            return this
        },
        stop() {
            if (nextScene) {
                nextScene.play();
            }
            return this
        },
        chainNextScene(scene) {
            nextScene = scene;
            return this;
        }
    }
}

function PickTeamScene(deps) {
    let screen = deps.screen;
    let input = deps.input;
    let save = deps.save;
    let nextScene;
    
    let teams = [
        generateSportsTeamName(),
        generateSportsTeamName(),
        generateSportsTeamName()
    ]
    return {
        async play() {
            screen.clear()
            await screen.type(`It's time to pick a team.`)
            await wait(1500)
            await screen.type(` Who's side are you on?`)
            await screen.breakLine()
            await screen.type(`1. ${teams[0]}`)
            await screen.breakLine()
            await screen.type(`2. ${teams[1]}`)
            await screen.breakLine()
            await screen.type(`3. ${teams[2]}`)
            await screen.breakLine()
            
            let rawLine = await input.readLine()
            let line = rawLine.toLowerCase().trim()
            let [team1, team2, team3] = teams.map(t => t.toLowerCase())
            
            let choiceMap = {
                '1': teams[0], [team1]: teams[0],
                '2': teams[1], [team2]: teams[1],
                '3': teams[2], [team3]: teams[2],
            }
            let responseMap = {
                [teams[0]]: 'Great choice!',
                [teams[1]]: 'I see....',
                [teams[2]]: 'Well. Good luck.',
            }
            let chosenTeamName = choiceMap[line];
            save.team = {
                name: chosenTeamName,
                stats: {
                    backspin: 1,
                    topspin: 1,
                    smash: 0
                }
            }
            save.opponent = {
                name: chosenTeamName === teams[0] ? teams[1] : teams[0],
                stats: {
                    backspin: 0,
                    topspin: 1,
                    smash: 1
                }
            }
            
            await screen.type(`\"${chosenTeamName}\".. ${responseMap[chosenTeamName]}`)
            await wait(2000)
            this.stop()
        },
        stop() {
            if (nextScene) {
                nextScene.play();
            }
            return this
        },
        chainNextScene(scene) {
            nextScene = scene;
            return this;
        }
    }
}

function TutorialMatchScene(deps) {
    let screen = deps.screen;
    let input = deps.input;
    let save = deps.save;
    let nextScene;
    
    return {
        async play() {
            let team = save.team
            let opponent = save.opponent;
            screen.clear()
            await screen.type(`Let's see what ${team.name} are made of.`)
            await wait(1000)
            await screen.type(` A training game is in order!`)
            await wait(1500)
            await screen.breakLine()
            let deps = {screen, input}
            await runTrainingMatch(team, opponent, deps)
        },
        stop() {
            if (nextScene) {
                nextScene.play();
            }
            return this
        },
        chainNextScene(scene) {
            nextScene = scene;
            return this;
        }
    }
}

function TournamentScene(deps) {
    let {screen, input, save} = deps;
    
    return Scene({
        async play() {
            let team = save.team
            screen.clear()
            let deps = {screen, input}
            let tournament = save.currentTournament || await createTournament({townCount: 10, team})
            await tournament.runNextMatch(deps)
        }
    })
}

function TownScene(deps) {
    let {screen, input, save} = deps;
    
    return Scene({
        async play() {
            let currentTown = save.currentTown
            await screen.clear()
            await screen.breakLine()
            await wait(500)
            await screen.type(`Welcome to ${currentTown}!`)
            await screen.breakLine()
            if (!!save.currentTournament) {
                await screen.print('1. Play tournament')
            }
            else {
                await screen.print('1. Enter \"Ping Pong Masters of America\"')
            }
            await screen.breakLine()
            await screen.print('2. Move to next town')
            
            await screen.breakLine()
            let rawLine = await input.readLine()
            let line = rawLine.trim().toLowerCase()
            if (line === '1') {
                if (!save.currentTournament) {
                    save.currentTournament = await createTournament({
                        townCount: 10,
                        team: save.team,
                        firstTown: save.currentTown
                    })
                }
                else {
                    await TournamentScene(deps).play()
                }
            }
            else if (line === '2') {
                if (save.currentTournament) {
                    await save.currentTournament.moveToNextTown(deps)
                    save.currentTown = save.currentTournament.getCurrentTown()
                }
                else {
                    save.currentTown = getRandomAmericanTown()
                }
            }
            await this.play()
        }
    })
}

function Scene(scene) {
    let nextScene
    
    return {
        play: scene.play,
        stop() {
            if (nextScene) {
                nextScene.play();
            }
            if (scene.stop) {
                scene.stop()
            }
            return this
        },
        chainNextScene(_nextScene) {
            nextScene = _nextScene;
            if (scene.chainNextScene) {
                scene.chainNextScene()
            }
            return this;
        }
    }
}

// TeamName
// Back spin: 1, Top spin: 2, Smash: 0, Special: 1
// OpponentName
// Back spin: 0, Top spin: 1, Smash: 2, Special: 0

//Round 1
//TeamName - 0  Opponent Name - 0
//BACKSPIN      TOPSPIN

//Round 2
//TeamName - 1  Opponent Name - 0
//BACKSPIN      BACKSPIN
//CLOSE         SMASH

//Round 3
//TeamName - 1  Opponent Name - 1
//.....

// $$$ Teams will switch being attacker each round
// $$$ should not get smash by random
// $$$ if move chosen is not chosen by chance but then chosen randomly again, should not show as a failed move!