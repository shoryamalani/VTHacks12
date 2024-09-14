import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

function PlayerCard({ name }) {
  return (
    <div className="col-span-1 bg-blue-500 p-4 m-2 rounded-md">
      <div>{name}</div>
      <div>Performance stats</div>
    </div>
  );
}

function Game( { gameID, inGameSetter }) {
  const [gameState, setGameState] = useState(gameID); //TODO more state info?

  useEffect(() => {
    fetch('https://gaze.shoryamalani.com/api/getGameData')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setGameState(data);
      });
  }, []);

  return (
    <>
      <div className="col-span-3 p-4 grid-cols-subgrid">
        <button onClick={e => inGameSetter(
          {playing: false, game: 0, player: "new player name"} //TODO username generation api call?
        )} className="bg-red-900 p-4 rounded-md">Exit</button>
      </div>
      
      <PlayerCard name="User Info" />
      <div className='col-span-1' />
      <PlayerCard name="Saucy Asparagus" />
      <PlayerCard name="Confused Carrot" />
      <div className='col-span-1' />
      <PlayerCard name="Wacky Watermelon" />
      {gameState.users.map((u) => (
        <PlayerCard name={u} /> // TODO Generate player stat cards from gamestate users
      ))}
    </>
  );
}

function GameMenu({ inGameSetter }) {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch('https://gaze.shoryamalani.com/api/getActiveGames')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setGames(data);
      });
  }, []);

  function CreateGameButton() {
    return <button className="bg-green-700 p-4 rounded-md" onClick={e => {
      fetch('https://gaze.shoryamalani.com/api/createGame', {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: 1, // TODO where are we pulling this from
        })
      })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        inGameSetter({playing: true, game: data.game, player: data.player}); // TODO fix data
      });
    }}></button>
  }

  return (
    <>
      <div>
        <CreateGameButton />
        {games.map((g) => (
          <button className="bg-green-600 p-4 rounded-md" onClick={e => {
            fetch('https://gaze.shoryamalani.com/api/joinGame', {
              method: "post",
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                joinCode: g,
              })
            })
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              inGameSetter({playing: true, game: data.game, player: data.player}); // TODO fix data
            });
          }}>Enter Game {g}</button>
        ))}
      </div>
      
    </>
  )
}

function GameManager () {
  const [inGame, setInGame] = useState({playing: false, game: 0, player: "new"});
  useEffect(() => {
    fetch('https://gaze.shoryamalani.com/api/joinGame')
  }, []);

  if (inGame) {
    return <Game gameID={inGame.game} inGameSetter={setInGame}/>
  }
  else {
    return <GameMenu inGameSetter={setInGame}/>
  }
}

function App() {
  return (
    <div className="p-12 bg-slate-800 text-slate-200 grid grid-cols-3">
      <GameManager />
    </div>
  );
}

export default App;
