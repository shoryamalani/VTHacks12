import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import PlayerCard from "./PlayerCard";


function Game( { gameID, inGameSetter, userData }) {
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState(gameID); //TODO more state info?
    const [gameData, setGameData] = useState([]); // all the users
    const [curUserData, setUserData] = useState(userData);
    const [currentGif, setCurrentGif] = useState(null);
    const [action, setAction] = useState(null);
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

    useEffect(() => {
        var urls = ['leftCrash.gif', 'rightCrash.gif', 'nocar.gif'];
        if(action == "left"){
            setCurrentGif("bg-[url('leftCrash.gif')]");
        } else if(action == "right"){
            setCurrentGif("bg-[url('rightCrash.gif')]");
        } else if(action == "nocar"){
            setCurrentGif("bg-[url('nocar.gif')]");

        }
        console.log(action);
        console.log("SETTING CURRENT GIF")
    }, [action]);

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
            }).then(response => response.json())
            .then(data => {
                setAction(data.action);
            });
  
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
                setUserData(data.userData);
  console.log(gameState);
            }else{
                alert("Game not found");
            }
        });
    }, 1000);
    return () => clearInterval(interval);
   
  },[]);
    function activatePowerup(){
        var url = '/api/activatePowerup';
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
                alert("Powerup activated");
            // show the game screen
            // setUserData(data.userData);
            }else{
            alert("Game not found");
            }
    });
    }
    return (
      <div className={"bg-cover bg-center w-full" + {currentGif}} >
        <div className="col-span-3 p-4 grid grid-cols-subgrid ">
          <button onClick={e => inGameSetter(
            {playing: false, game: 0, player: "new player name"} //TODO username generation api call?
          )} className="bg-red-900 p-4 rounded-md drop-shadow-[0_15px_15px_rgba(185,185,185,.25)]">Exit Room {gameID[1]}</button>
        </div>
        {/* set aspect ratio to 500 by 313 */}
        <div className="col-span-3 p-4 grid grid-cols-subgrid" style={{
          'minHeight': '313px',
          'aspectRatio': '500/313',
        }}>
        
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
        <div style={{backgroundColor:"white"}}>
            <h1>POWERUPS</h1>
            <p>Next Powerup Available at score: {curUserData[11]}</p>
            {curUserData[8] && !curUserData[9] && <button onClick={activatePowerup} className="bg-green-500 p-4 drop-shadow-[0_15px_15px_rgba(185,185,185,.25)]">{curUserData[8]}</button>}
        </div>
      </div>
    );
  }
  

export default Game;