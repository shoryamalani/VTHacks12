import Game from './Game';
import GameMenu from './GameMenu';
import PlayerCard from './PlayerCard';
import logo from './logo.svg';
import './output.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from "react-webcam";

function GameManager () {
  const [inGame, setInGame] = useState({playing: false, game: 0, player: []});
  // useEffect(() => {
  //   fetch('https://gaze.shoryamalani.com/api/joinGame')
  // }, []);

  if (inGame.playing) {
    return <Game gameID={inGame.game} inGameSetter={setInGame} userData={inGame.player}/>
  }
  else {
    return <GameMenu inGameSetter={setInGame}/>
  }
}

function App() {
  return (
    // <div className="p-12  text-slate-200 grid grid-cols-3 " style={{'z-index': 1,"backgroundColor":"#272531",minHeight:480}}>
    <div className='flex justify-center bg-[#2e2e37] '>
      <GameManager />
    </div>
    // </div>
  );
}

export default App;
