import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import PlayerCard from "./PlayerCard";
import Powerups from "./Powerups";
import { Button, Divider } from "@material-ui/core";
import useSound from 'use-sound';
import { ButtonBase } from "@mui/material";

function Game( { gameID, inGameSetter, userData }) {
    const audioRef1 = useRef(null);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState(gameID); //TODO more state info?
    const [gameData, setGameData] = useState([]); // all the users
    const [curUserData, setUserData] = useState(userData);
    const [currentGif, setCurrentGif] = useState(require('./static/nocar.gif'));
    const [action, setAction] = useState(null);
    const [webcam, setWebcam] = useState(false);

    // after 600 milliseconds change the gif to the no car gif
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentGif(require('./static/spawn.gif'));
            
        }, 500);
        const timer2 = setTimeout(() => {
            setCurrentGif(require('./static/car_final.gif'));
            
        }, 1100);
        return () => clearTimeout(timer, timer2);
    }, []);
    


    
    



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
    const playActive = () => {
        audioRef1.current.play();
    }

    useEffect(() => {
        var urls = ['leftCrash.gif', 'rightCrash.gif', 'nocar.gif'];
        if(action == "left"){
            setCurrentGif(require('./static/leftCrash.gif'));
            playActive();
            const timer = setTimeout(() => {
                setCurrentGif(require('./static/nocar.gif'));
            }, 600);
            return () => clearTimeout(timer);
        } else if(action == "right"){
            setCurrentGif(require('./static/rightCrash.gif'));
            playActive();
            const timer = setTimeout(() => {
                setCurrentGif(require('./static/nocar.gif'));
            }, 600);
            return () => clearTimeout(timer)
        } else if (action == "down"){
            setCurrentGif(require('./static/car_crash_animation.gif'));
            playActive();
            const timer = setTimeout(() => {
                setCurrentGif(require('./static/nocar.gif'));
            }, 600);
            return () => clearTimeout(timer)

        }
        else if(action == "up"){
            setCurrentGif(require('./static/car_crash_animation.gif'));
            playActive();
            const timer = setTimeout(() => {
                setCurrentGif(require('./static/nocar.gif'));
            }, 600);
            return () => clearTimeout(timer)
        }
         else if(action == "nocar"){
            setCurrentGif(require('./static/nocar.gif'))
        
        } else if(action == "respawn"){
            setCurrentGif(require('./static/spawn.gif'));
            const timer = setTimeout(() => {
                setCurrentGif(require('./static/car_final.gif'));
            }, 600);
            return () => clearTimeout(timer);
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
                console.log("CHANGING ACTION TO " + data.action);
            });
  
            setImgAll([]);
            
            // set timeout to do nothing for a second
            
        }
    }, 250);
    return () => clearInterval(interval);
  }, [imgAll,img,action]);
  const gifs = [
    { url: 'static/nocar.gif', duration: 600 }, // 5 seconds duration for gif1
    { url: 'static/leftCrash.gif', duration: 600 }  // 3 seconds duration for gif2
  ];
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
    function getCurrentGif(){
        return currentGif;
    }

    function toggleWebcam(){
        alert("Webcam toggled");
        setWebcam(!webcam);
    }
    const greens = curUserData[3] * 10 / curUserData[11];
    const valid = curUserData[9];
    return (
        <div className={"bg-cover bg-center w-full "} style={{backgroundImage:'url(' + currentGif + ')'}}>
                
            <audio ref={audioRef1}>
        <source src={require('./static/crash.mp3')} type="audio/mpeg" />
        <p>Your browser does not support the audio element.</p>
      </audio>
        {/* <div className="col-span-3 p-4 grid grid-cols-subgrid "> */}
          <button onClick={e => inGameSetter(
            {playing: false, game: 0, player: "new player name"} //TODO username generation api call?
          )} className="bg-red-900 col-span-1 col-end-1 m-8 p-5  drop-shadow-[0_15px_15px_rgba(185,185,185,.25)]" style={{color:'white'}}>Exit Room {gameID[1]}</button>
        {
            <div onClick={toggleWebcam} className="w-[20%] h-[5%]  col-start-11 col-end-12 row-start-1 row-end-2"   ></div>
        }
        {/* </div> */}
        {/* set aspect ratio to 500 by 313 */}
        <div className="col-span-3 p-2 m-11 grid grid-cols-subgrid " style={{
          'minHeight': '313px',
          'aspectRatio': '500/313',
        }}>
        
        <div className='grid grid-cols-4 min-w-full max-h-[80svh]'>
        <Powerups clickable={valid} curUserData={curUserData} greens={greens} activatePowerup={activatePowerup} />

        {gameData.map((u, idx) => (
          <PlayerCard name={u[2]} score={u[3]} reason={u[5]} isYou={u[0]===userData[0]} parity={idx < 5} /> 
        ))}
        </div>
        <Webcam
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              audio={false}
              height={640}
              width={480}
              ref={webcamRef}
              mirrored={true}
              style={{zIndex:webcam ? 100 : -1, position: 'absolute', top: 50, left: 50}}
            />
        </div>
      </div>
    );
  }
  

export default Game;