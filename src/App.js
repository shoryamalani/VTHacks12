import logo from './logo.svg';
import './output.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from "react-webcam";
function PlayerCard({ name }) {
  return (
    <div className=" player-card col-span-1 bg-blue-500 p-4 m-2 drop-shadow-[0_15px_15px_rgba(185,185,185,.25)] ">
      <div>{name}</div>
      <div>Performance stats</div>
    </div>
  );
}

function Game( { gameID, inGameSetter, userData }) {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState(gameID); //TODO more state info?
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
              setGameState(...gameState, {game: data.game});
          }else{
              alert("Game not found");
          }
      });
  }, 1000);
  return () => clearInterval(interval);
 
},[]);
  return (
    <>
      <div className="col-span-3 p-4 grid-cols-subgrid ">
        <button onClick={e => inGameSetter(
          {playing: false, game: 0, player: "new player name"} //TODO username generation api call?
        )} className="bg-red-900 p-4 drop-shadow-[0_15px_15px_rgba(185,185,185,.25)]">Exit {gameID[1]}</button>
      </div>
        <div>
        {/* <p>{score}</p> */}
        
        </div>
      <div>
      <PlayerCard name="User Info"class="player-card" />
      <div className='col-span-1 ' />
      <PlayerCard name="Saucy Asparagus" class="saucy-asparagus" />
      <PlayerCard name="Confused Carrot" />
      <div className='col-span-1' />
      <PlayerCard name="Wacky Watermelon" />

      </div>
      <Webcam
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            audio={false}
            height={640}
            width={480}
            ref={webcamRef}
            mirrored={true}
          /> 
      {/* {gameState.users.map((u) => (
        <PlayerCard name={u} /> // TODO Generate player stat cards from gamestate users
      ))} */}
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
    <div className="p-12  text-slate-200 grid grid-cols-3">
      <GameManager />
    </div>
  );
}

export default App;
