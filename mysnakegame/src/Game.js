// Reference: https://github.com/weibenfalk/react-snake-starter-files/tree/master/react-snake-finished
// Apple image: https://en.m.wikipedia.org/wiki/File:Apple_Computer_Logo_rainbow.svg
// Google image: https://www.cleanpng.com/png-google-logo-2280160/
// Amazon image: https://wisdom-stone.com/home/amazon-logo/
// Facebook image: https://www.pngwing.com/en/free-png-zwysg/download
// Netflix image: https://www.iconfinder.com/icons/4375011/logo_netflix_icon
// Student image: https://icon-icons.com/icon/woman-student/100407
// Lightning image: https://stock.adobe.com/sg/search?k=lightning+logo&asset_id=166809176

import React, { useState, useRef, useEffect } from "react";
import SpeechRecognition, {useSpeechRecognition} from "react-speech-recognition"; 
import useInterval from "./useInterval";
import useSound from 'use-sound';
import buttonSound from './sound/button.mp3';
import gameoverSound from './sound/gameover.mp3';
import scoreSound from './sound/scoreSound.mp3';
import './Game.css';
import Google from './images/google.png';
import Apple from './images/apple.png';
import Amazon from './images/amazon.png';
import Netflix from './images/netflix.png';
import Facebook from './images/facebook.png';
import Student from './images/student.png';
import Lightning from './images/lightning.png';

const CANVAS = [550, 550];
const DIRECTION_MAP = {
  'up': [0, -1],  // Up
  'down': [0, 1],   // Down
  'left': [-1, 0],  // Left
  'right': [1, 0]    // Right
};
const DIRECTIONS = ["up", "down", "left", "right"];
const INITIAL_DIRECTION = [1, 0]; // To move right at the beginning of game
const SCALE = 40;
const STUDENT_COORDS = [
  [7, 3],
  [6, 3],
]; 
const INTERNSHIP_COORDS = [4, 8];
const INTERNSHIPS = ["google", "apple", "amazon", "netflix", "facebook"];
const MOVEMENT_DELAY = 1000;  // Delay duration of the movement, smaller delay means faster movement

function Game() {
    const canvasRef = useRef();
    const [speechSupport, setSpeechSupport] = useState(true);
    const [internshipCoords, setInternshipCoords] = useState(INTERNSHIP_COORDS);
    const [internshipType, setInternshipType] = useState(0);
    const [student, setStudent] = useState(STUDENT_COORDS);
    const [delay, setDelay] = useState(null);
    const [score, setScore] = useState(0);
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [command, setCommand] = useState("");
    const [pressButton] = useSound(buttonSound);
    const [playGameover] = useSound(gameoverSound);
    const [playScoresound] = useSound(scoreSound);

    if(!SpeechRecognition.browserSupportsSpeechRecognition()){
        setSpeechSupport(false);
    }

    // Speech recognition commands and change direction 
    const commands = [
        {
            command: ["Go *"],
            callback: (cmd) => {
                setCommand(cmd);
                if(cmd){
                    if(DIRECTIONS.includes(cmd)){
                        setDirection(DIRECTION_MAP[cmd]);
                    }
                }
            }
        },
    ];

    const {transcript, resetTranscript} = useSpeechRecognition({commands});

    // Start the game
    const handleGameStart = () => {
        pressButton();
        setInternshipCoords(INTERNSHIP_COORDS);
        setInternshipType(0);
        setStudent(STUDENT_COORDS);
        setDirection(INITIAL_DIRECTION);
        setScore(0);
        setDelay(MOVEMENT_DELAY);
        setCommand("");
        setGameOver(false);
        SpeechRecognition.startListening({continuous: true});
    };

    // Pause the same
    const handleGamePause = () => {
        pressButton();
        setCommand("");
        setDelay(null);
        resetTranscript();
        SpeechRecognition.stopListening();
    };

    // Resume the game
    const handleGameResume = () => {
        pressButton();
        setCommand("");
        setDelay(MOVEMENT_DELAY);
        SpeechRecognition.startListening({continuous: true});
    }

    // End the game
    const handleGameStop = () => {
        handleGameOver();
    }

    // Game over
    const handleGameOver = () => {
        SpeechRecognition.stopListening();
        resetTranscript();
        setDelay(null);
        setGameOver(true);
        setCommand("");
        playGameover();
    };

    // Check collision of student with walls
    const hasCollisionWithWalls = (snakeHead) => {
        if((snakeHead[0]*SCALE)>=CANVAS[0] || (snakeHead[0]*SCALE)<0 || (snakeHead[1]*SCALE)>=CANVAS[1] || (snakeHead[1]*SCALE)<0) {
            return true;
        }
        return false;
    };

    // Check collision of student with internship or himself
    const hasCollisionWithStudent = (head, fullStudent) => {
        for (let i=0; i<fullStudent.length; i+=1){
            if(head[0]===fullStudent[i][0] && head[1]===fullStudent[i][1]){
                return true;
            }
        }
        return false; 
    }

    // Generate the coordinates of internships
    const generateInternshipCoords = () => {
        var x = Math.floor(Math.random() * (CANVAS[0]/SCALE));
        var y = Math.floor(Math.random() * (CANVAS[1]/SCALE));
        return [x, y];
    }

    // Generate the index/type of internships [0, INTERNSHIPS.length)
    const generateInternshipIndex = () => {
        return Math.floor(Math.random() * INTERNSHIPS.length);
    }

    // Check whether the current internship is taken and create new internships
    const hasInternshipTaken = (newStudent) => {
        if (newStudent[0][0] === internshipCoords[0] && newStudent[0][1] === internshipCoords[1]) {
            let newScore = score+1;
            setScore(newScore);
            playScoresound();
            let newInternship = generateInternshipCoords();
            while (hasCollisionWithStudent(newInternship, newStudent)) {
                newInternship = generateInternshipCoords();
            }
            setInternshipCoords(newInternship);
            let index = generateInternshipIndex();
            setInternshipType(index);
            return true;
        }
        return false;
    };

    // Student Movement
    const moveStudent = () => {
        const studentTemp = JSON.parse(JSON.stringify(student));
        const newStudentHead = [studentTemp[0][0] + direction[0], studentTemp[0][1] + direction[1]];
        studentTemp.unshift(newStudentHead);
        if (hasCollisionWithWalls(newStudentHead) || hasCollisionWithStudent(newStudentHead, student)){
            handleGameOver();
        } 
        if (!hasInternshipTaken(studentTemp)){
            studentTemp.pop();
        } 
        setStudent(studentTemp);
    };

    // Draw canvas elements
    const draw = (x, y, imgPath) => {
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        const img = document.getElementById(imgPath);
        context.drawImage(img, x, y, 35, 35);
      }

    // Student moves continuously at delay interval 
    useInterval(() => moveStudent(), delay);

    // Re-render canvas given change of states
    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, CANVAS[0], CANVAS[1]);

        // Draw student
        for(let i=0; i<student.length; i+=1){
            let studentSegment = student[i];
            if(i===0){
                draw(studentSegment[0]*SCALE, studentSegment[1]*SCALE, "student");
            }else{
                draw(studentSegment[0]*SCALE, studentSegment[1]*SCALE, "lightning");
            }
        }

        // Draw internship
        draw(internshipCoords[0]*SCALE, internshipCoords[1]*SCALE, INTERNSHIPS[internshipType]);

    }, [student, internshipCoords, internshipType, gameOver]);

    return (
        <div className = "game" role="button" tabIndex="0">
            <div style={{display:"none"}}>
                <img id="google" src = {Google} alt="google internship" width="35px" height="35px"></img>
                <img id="apple" src = {Apple} alt="apple internship" width="35px" height="35px"></img>
                <img id="amazon" src = {Amazon} alt="amazon internship" width="35px" height="35px"></img>
                <img id="netflix" src = {Netflix} alt="netflix internship" width="35px" height="35px"></img>
                <img id="facebook" src = {Facebook} alt="facebook internship" width="35px" height="35px"></img>
                <img id="student" src = {Student} alt="student" width="35px" height="35px"></img>
                <img id="lightning" src = {Lightning} alt="lightning" width="35px" height="35px"></img>
            </div>
            <div className="canvasWrapper">
                <canvas
                    id = "canvas"
                    style={{
                        marginTop: "20px",
                        border: "2px solid black",
                        backgroundColor: 'azure',
                    }}
                    ref={canvasRef}
                    width={`${CANVAS[0]}px`}
                    height={`${CANVAS[1]}px`}
                />
            </div>
            <div className = "gameOver" 
                style={{ 
                display: gameOver ? "flex" : "none" , 
                justifyContent:'center', 
                alignItems:'center', 
                flexDirection: 'column',
                position: 'absolute', 
                marginTop: '16.3px',
                marginLeft: '2px',
                width:`${CANVAS[0]}px`, 
                height:`${CANVAS[0]}px`}}>
                    <div>GAME OVER!</div>
                    <div>Score: {score}</div>
                </div>
            <div className = "information">
                <div className="title">Num-Num Intern</div>
                <div className = "score">Score: {score}</div>
                {/* <div className = "cmd">Command: {command}</div> */}
                {/* <div className = "transcriptScreen"> Transcript: {transcript}</div> */}
                
                <div className = "buttons">
                    <button className = "startBtn" onClick={handleGameStart}>Start</button>
                    <button className = "stopBtn" onClick={handleGameStop}>Stop</button>
                    <button className = "pauseBtn" onClick={handleGamePause}>Pause</button>
                    <button className = "resumeBtn" onClick={handleGameResume}>Resume</button>
                </div>
                <div style={{display: speechSupport ? "none" : "block"}}>The current Web browser does not support speech recognition, please try another one. </div>
            </div>
        </div>
    );
};

export default Game;