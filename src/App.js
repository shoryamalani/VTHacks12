import logo from './logo.svg';
import './output.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from "react-webcam";
function PlayerCard({ name, score, reason, isYou, parity }) {
  return (
    <div  className={" player-card p-4 m-2 drop-shadow-[0_15px_15px_rgba(185,185,185,.25)] " +(parity ? 'col-start-1 ' : 'col-start-3 ') +(isYou ? 'bg-green-500 ':'bg-blue-500 ')+ (reason==="" ? 'text-slate-200 ':'text-red-800 ')}>
      <div>{name}</div>
      <div>Score: {score}</div>
      <div>Reason: {reason}</div>

    </div>
  );
}

function Game( { gameID, inGameSetter, userData }) {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState(gameID); //TODO more state info?
  const [gameData, setGameData] = useState([]); // all the users
    const videoConstraints = {
      width: 640,
      height: 480,
      facingMode: "user",
    };

  const webcamRef = useRef(null);
  const [img, setImg] = useState(null);
  const [imgAll, setImgAll] = useState([]);
  // useEffect(() => {
  //   fetch('https://gaze.shoryamalani.com/api/getGameData')
  //     .then((res) => {
  //       return res.json();
  //     })
  //     .then((data) => {
  //       setGameState(data);
  //     });
  // }, []);
  const capture = useCallback(() => {
  var imageSrc = webcamRef.current.getScreenshot();
  // console.log(imageSrc);
  setImg(imageSrc);
  setImgAll([...imgAll, imageSrc]);
}, [webcamRef, setImg, imgAll, setImgAll]);

  
useEffect(() => {
  const interval = setInterval(() => {
      capture();
      capture();
      capture();
      capture();
      
      // console.log(imgAll);
      if(imgAll.length>3){
          // upload these four images
          var url = '/api/uploadFrames';
          fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  images:[imgAll[0], imgAll[1], imgAll[2], imgAll[3]],
                  user_id: userData[0],
              })
          })

          setImgAll([]);
          // set timeout to do nothing for a second
          
      }
  }, 250);
  return () => clearInterval(interval);
}, [imgAll,img]);

useEffect(() => {
  const interval = setInterval(() => {
      var url = '/api/getGameData';
      fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              userId: userData[0],
              gameId: userData[1],
          })
      })
      .then(response => response.json())
      .then(data => {
          console.log(data);
          if(data != null){
              // show the game screen
              setScore(data.score);
              setGameData(data.gameUsers);
console.log(gameState);
          }else{
              alert("Game not found");
          }
      });
  }, 1000);
  return () => clearInterval(interval);
 
},[]);
  return (
    <>
      <div className="col-span-3 p-4 grid grid-cols-subgrid ">
        <button onClick={e => inGameSetter(
          {playing: false, game: 0, player: "new player name"} //TODO username generation api call?
        )} className="bg-red-900 p-4 drop-shadow-[0_15px_15px_rgba(185,185,185,.25)]">Exit {gameID[1]}</button>
      </div>
      <div className="col-span-3 p-4 grid grid-cols-subgrid bg-[url('static/nocar.gif')]">
      
      <div className='col-span-2' />
      {gameData.map((u, idx) => (
        <PlayerCard name={u[2]} score={u[3]} reason={u[5]} isYou={u[0]===userData[0]} parity={idx%2===0} /> 
      ))}
      <Webcam
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            audio={false}
            height={640}
            width={480}
            ref={webcamRef}
            mirrored={true}
            style={{zIndex:-1, position: 'absolute', top: 0, left: 0}}
          />
      </div>
      
    </>
  );
}

function GameMenu({ inGameSetter }) {
  const [games, setGames] = useState([]);

  useEffect(() => {
    var url = '/api/getActiveGames';
    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setGames(data);
      });
  }, []);

  function CreateGameButton() {
    return <button className="bg-red-900 p-4 p-4" onClick={e => {
      fetch('/api/createGame',
        {
          method: "POST",
        }
      )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        inGameSetter({playing: true, game: data.game, player: data.user}); // TODO fix data
      });
    }}>Create Game</button>
  }

  return (
    <>
      <div>
        <CreateGameButton />
        {games.map((g) => (
          <button className="bg-red-900 p-4 p-4" onClick={e => {
            fetch('/api/joinGame', {
              method: "POST",
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                joinCode: g[1],
              })
            })
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              inGameSetter({playing: true, game: data.game, player: data.user}); // TODO fix data
            });
          }}>Enter Game {g[1]}</button>
        ))}
      </div>
      
    </>
  )
}

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
    <div className="p-12  text-slate-200 grid grid-cols-3 " style={{'z-index': 1,"backgroundColor":"#272531",minHeight:480}}>
      <GameManager />
    </div>
  );
}

export default App;
