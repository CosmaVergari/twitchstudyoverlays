import "./App.css";
import React from "react";
import { useEffect, useState } from "react";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import dingSfx from "./sounds/ding.wav";
import useSound from "use-sound";

function App() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pomodoroStatus, setPomodoroStatus] = useState("FOCUS");
  const [pomodoroTime, setPomodoroTime] = useState(0);
  const [play] = useSound(dingSfx);

  const CONFIG = {
    pomodoro: {
      focusTime: 25 * 60,
      shortBreakTime: 5 * 60,
      longBreakTime: 15 * 60,
      focusColor: "red",
      shortBreakColor: "green",
      longBreakColor: "blue",
      focusText: "Focus",
      shortBreakText: "Pausa",
      longBreakText: "Pausa lunga"
    },
    elapsed: { studyGoal: 3 * 60 * 60 },
  };

  function secondsToString(seconds) {
    const ss = pad2digits(seconds % 60);
    const mm = pad2digits(Math.floor((seconds / 60) % 60));
    const hh = pad2digits(Math.floor(seconds / 3600));
    return `${hh}:${mm}:${ss}`;
  }

  function pad2digits(number) {
    return (number < 10 ? "0" : "") + number;
  }

  function secondsToMinutes(seconds) {
    const ss = pad2digits(seconds % 60);
    const mm = pad2digits(Math.floor((seconds / 60) % 60));
    return `${mm}:${ss}`;
  }

  useEffect(() => {
    setInterval(() => {
      fetch("http://localhost:3000/time")
        .then((res) => res.json())
        .then((time) => {
          setElapsedTime(time.elapsedTime);
          setPomodoroStatus(oldStatus => {
            if (oldStatus !== time.pomodoroStatus) {
              play();
            }
            return time.pomodoroStatus;
          });
          setPomodoroTime(time.pomodoroTime);
        });
    }, 1000);
  }, [play]);

  let pomodoroColor, pomodoroText, pomodoroMaxValue, pomodoroValue;
  if (pomodoroStatus === "FOCUS") {
    pomodoroColor = CONFIG.pomodoro.focusColor;
    pomodoroText = CONFIG.pomodoro.focusText;
    pomodoroValue = CONFIG.pomodoro.focusTime - pomodoroTime;
    pomodoroMaxValue = CONFIG.pomodoro.focusTime;
  }
  else if (pomodoroStatus === "SHORTBREAK")  {
    pomodoroColor = CONFIG.pomodoro.shortBreakColor;
    pomodoroText = CONFIG.pomodoro.shortBreakText;
    pomodoroValue = CONFIG.pomodoro.shortBreakTime - pomodoroTime;
    pomodoroMaxValue = CONFIG.pomodoro.shortBreakTime;
  }
  else {
    pomodoroColor = CONFIG.pomodoro.longBreakColor;
    pomodoroText = CONFIG.pomodoro.longBreakText;
    pomodoroValue = CONFIG.pomodoro.longBreakTime - pomodoroTime;
    pomodoroMaxValue = CONFIG.pomodoro.longBreakTime;
  }

  return (
    <div className="App">
      <header className="App-header">
        <CircularProgressbarWithChildren
          maxValue={CONFIG.elapsed.studyGoal}
          value={elapsedTime}
          styles={buildStyles({
            pathColor: "#FA704B",
            trailColor: "#FEF2CC",
          })}
        >
          <p style={{ color: "#FA704B", fontSize: "4vmin" }}>
            <strong>Studio di oggi</strong>
            <br />
            <span style={{ fontSize: "5vmin", fontFamily: "Nova Slim" }}>
              {secondsToString(elapsedTime)}
            </span>
          </p>
        </CircularProgressbarWithChildren>
        <br />
        <CircularProgressbarWithChildren
          maxValue={pomodoroMaxValue}
          value={pomodoroValue}
          styles={buildStyles({
            pathColor: pomodoroColor,
            trailColor: "#FEF2CC",
          })}
        >
          <p style={{fontSize: "5vmin", color: pomodoroColor}}>
            <span
              style={{
                color: "#FA704B",
                fontSize: "8vmin",
                lineHeight: "8vmin",
              }}
            >
              &#x1f345;
            </span>
            <br />
            <strong>{pomodoroText}</strong>
            <br />
            <span style={{ fontFamily: "Nova Slim" }}>
              {secondsToMinutes(pomodoroValue)}
            </span>
          </p>
        </CircularProgressbarWithChildren>
      </header>
    </div>
  );
}

export default App;
