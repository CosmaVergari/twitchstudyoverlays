" use strict ";

const express = require("express");
const morgan = require("morgan");
const dayjs = require("dayjs");

const config = require("./config");

const PORT = 3001;
const app = express();
app.use(morgan("dev"));
app.use(express.json());

let startTime = undefined;
let elapsedTimeOn = false;
let newElapsedTime = 0;
let oldElapsedTime = 0;

let startPomodoro = undefined;
let pomodoroStatus = "FOCUS";
let pomodoroFocusCount = 0;
let pomodoroOn = false;
let newElapsedPomodoro = 0;
let oldElapsedPomodoro = 0;

app.get("/time", (req, res) => {
  let elapsed, pomodoro;
  if (elapsedTimeOn) elapsed = oldElapsedTime + newElapsedTime;
  else elapsed = oldElapsedTime;
  if (pomodoroOn)
    pomodoro = {
      pomodoroStatus: pomodoroStatus,
      pomodoroTime: oldElapsedPomodoro + newElapsedPomodoro,
    };
  else
    pomodoro = {
      pomodoroStatus: pomodoroStatus,
      pomodoroTime: oldElapsedPomodoro,
    };
  res.json({ ...pomodoro, elapsedTime: elapsed });
});

app.get("/time/elapsed", (req, res) => {
  if (elapsedTimeOn) time_res = oldElapsedTime + newElapsedTime;
  else time_res = oldElapsedTime;
  res.json({ time: time_res });
});

app.get("/time/elapsed/toggle", (req, res) => {
  if (elapsedTimeOn === false) startTime = dayjs();
  else {
    oldElapsedTime += newElapsedTime;
    newElapsedTime = 0;
    startTime = undefined;
  }
  elapsedTimeOn = !elapsedTimeOn;
  res.end();
});

app.get("/time/elapsed/reset", (req, res) => {
  startingTime = undefined;
  elapsedTimeOn = false;
  newElapsedTime = 0;
  oldElapsedTime = 0;
  res.end();
});

app.get("/time/pomodoro", (req, res) => {
  if (pomodoroOn)
    time_res = {
      status: pomodoroStatus,
      time: oldElapsedPomodoro + newElapsedPomodoro,
    };
  else
    time_res = {
      status: pomodoroStatus,
      time: oldElapsedPomodoro,
    };
  res.json(time_res);
});

app.get("/time/pomodoro/toggle", (req, res) => {
  if (pomodoroOn === false) {
    startPomodoro = dayjs();
  } else {
    oldElapsedPomodoro += newElapsedPomodoro;
    newElapsedPomodoro = 0;
    startPomodoro = undefined;
  }
  pomodoroOn = !pomodoroOn;
  res.end();
});

app.get("/time/pomodoro/reset", (req, res) => {
  startPomodoro = undefined;
  pomodoroOn = false;
  newElapsedPomodoro = 0;
  oldElapsedPomodoro = 0;
  pomodoroFocusCount = 0;
  pomodoroStatus = "FOCUS";
  res.end();
});

setInterval(() => {
  if (elapsedTimeOn) newElapsedTime = dayjs().diff(startTime, "seconds");

  /*console.log(`INPUT:`)
  console.log("  status: " + pomodoroStatus)
  console.log("  onOff: " + pomodoroOn)
  console.log("  startTime: " + startPomodoro)
  console.log("  currentTime: " + dayjs().format("HH:mm:ss"))
  console.log("  oldElapsedPomodoro: " + oldElapsedPomodoro)
  console.log("  newElapsedPomodoro: " + newElapsedPomodoro)*/

  if (pomodoroOn) newElapsedPomodoro = dayjs().diff(startPomodoro, "seconds");
  if (
    pomodoroStatus === "FOCUS" &&
    pomodoroOn &&
    newElapsedPomodoro + oldElapsedPomodoro >= config.pomodoro.focusTime
  ) {
    pomodoroFocusCount += 1;
    if (pomodoroFocusCount < config.pomodoro.focusRoundsBeforeLongBreak)
      pomodoroStatus = "SHORTBREAK";
    else {
      pomodoroStatus = "LONGBREAK";
      pomodoroFocusCount = 0;
    }

    startPomodoro = config.pomodoro.autoBreak ? dayjs() : undefined;
    pomodoroOn = config.pomodoro.autoBreak ? true : false;
    oldElapsedPomodoro = 0;
    newElapsedPomodoro = 0;
  } else if (
    pomodoroOn &&
    ((pomodoroStatus === "SHORTBREAK" &&
      newElapsedPomodoro + oldElapsedPomodoro >= config.pomodoro.shortBreak) ||
      (pomodoroStatus === "LONGBREAK" &&
        newElapsedPomodoro + oldElapsedPomodoro >= config.pomodoro.longBreak))
  ) {
    startPomodoro = config.pomodoro.autoFocus ? dayjs() : undefined;
    pomodoroOn = config.pomodoro.autoFocus ? true : false;
    pomodoroStatus = "FOCUS";
    oldElapsedPomodoro = 0;
    newElapsedPomodoro = 0;
  }
}, 1000);

app.get("/time/config", (req, res) => {
  res.json({
    focusTime: config.pomodoro.focusTime,
    shortBreakTime: config.pomodoro.shortBreak,
    longBreakTime: config.pomodoro.longBreak,
  });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
