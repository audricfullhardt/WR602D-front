import "./style.css";
import { initScene } from "./core/scene";
import { initPhysics } from "./core/physics";
import { Ball } from "./game/Ball";
import { Track } from "./game/Track";
import { InputController } from "./game/InputController";
import { GameState, MAX_STROKES } from "./game/GameState";
import { Flag } from "./game/Flag";
import { Club } from "./game/Club";
import { HUD } from "./ui/HUD";
import { AudioManager } from "./audio/AudioManager";
import { isAuthenticated, logout } from "./api/auth";
import { postScore } from "./api/scores";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const { scene, camera, renderer } = initScene(canvas);
const { world, fixedTimeStep, maxSubSteps } = initPhysics();

const ball = new Ball(scene, world);
const track = new Track(scene, world, ball.material);
const gameState = new GameState();
const audio = new AudioManager();

const club = new Club(scene);

let holePosition = track.getHolePosition();
const flag = new Flag(scene, holePosition);

function loadLevel(): void {
  const level = gameState.getCurrentLevel();
  // [TEMP DEBUG] comptage des corps physiques autour du changement de niveau.
  const before = world.bodies.length;
  track.load(level);
  const after = world.bodies.length;
  console.log(
    `[loadLevel] niveau id=${level.id} | bodies avant=${before} après=${after} | murs=${level.walls.length} obstacles=${level.obstacles?.length ?? 0} (+1 sol +1 balle)`
  );
  holePosition = track.getHolePosition();
  ball.setStart(track.getBallStart());
  ball.reset();
  flag.setHolePosition(holePosition);
  club.setVisible(true);
}

const hud = new HUD({
  onAuthenticated: () => {
    gameState.goToStart();
    hud.update(gameState);
  },
  onGuest: () => {
    gameState.goToStart();
    hud.update(gameState);
  },
  onStart: () => {
    gameState.startGame();
    audio.playBgMusic();
    hud.update(gameState);
  },
  onNextHole: () => {
    gameState.nextHole();
    loadLevel();
    hud.update(gameState);
  },
  onRestart: () => {
    gameState.reset();
    loadLevel();
    hud.update(gameState);
  },
  onLogout: () => {
    logout();
    audio.stopBgMusic();
    gameState.reset();
    loadLevel();
    gameState.requireAuth();
    hud.update(gameState);
  },
});

loadLevel();

if (!isAuthenticated()) {
  gameState.requireAuth();
}

new InputController(
  ball,
  camera,
  scene,
  () => {
    // Relâchement : déclenche le swing du club.
    club.release();

    if (gameState.getPhase() !== "playing") return;
    gameState.addStroke();
    audio.playHit();

    if (gameState.getStrokes() >= MAX_STROKES) {
      gameState.loseLife();
      if (gameState.isGameOver()) {
        club.setVisible(false);
        audio.stopBgMusic();
        audio.playGameOver();
      } else {
        ball.reset();
      }
    }

    hud.update(gameState);
  },
  (angle, power) => {
    // Visée en temps réel : le club tourne et arme le backswing.
    club.aim(angle, power);
  }
);

const holeRadius = 0.3;

hud.update(gameState);

let lastTime: number | undefined;

function animate(time: number) {
  requestAnimationFrame(animate);

  const delta = lastTime !== undefined ? (time - lastTime) / 1000 : 0;
  track.update(delta);
  world.step(fixedTimeStep, delta, maxSubSteps);
  lastTime = time;

  ball.update(delta);
  flag.update(delta);
  club.update(ball.mesh.position, ball.isMoving(), delta);

  if (gameState.getPhase() === "playing") {
    if (ball.isInHole(holePosition, holeRadius)) {
      const strokes = gameState.getStrokes();
      const holeNumber = gameState.getCurrentLevel().id + 1;
      gameState.completeHole();
      club.setVisible(false);
      audio.playHoleIn();
      if (gameState.getPhase() === "game-over") {
        audio.stopBgMusic();
      }
      if (isAuthenticated()) {
        postScore(strokes, holeNumber).catch((err) =>
          console.warn("Échec de l'envoi du score:", err)
        );
      }
      ball.enterHole(holePosition, () => {
        flag.down();
        hud.update(gameState);
      });
    }

    if (ball.isCloseToHole(holePosition, holeRadius * 3)) {
      flag.raise();
    } else {
      flag.down();
    }
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
