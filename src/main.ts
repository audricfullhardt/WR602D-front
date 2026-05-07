import "./style.css";
import { initScene } from "./core/scene";
import { initPhysics } from "./core/physics";
import { Ball } from "./game/Ball";
import { Track } from "./game/Track";
import { InputController, AimState } from "./game/InputController";
import { GameState } from "./game/GameState";
import { Flag } from "./game/Flag";
import { Club } from "./game/Club";
import { HUD } from "./ui/HUD";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const { scene, camera, renderer } = initScene(canvas);
const { world, fixedTimeStep, maxSubSteps } = initPhysics();

const ball = new Ball(scene, world);
const track = new Track(scene, world);
const gameState = new GameState();

const holePosition = track.getHolePosition();
const flag = new Flag(scene, holePosition);
const club = new Club(scene);

const hud = new HUD({
  onStart: () => {
    gameState.startGame();
    hud.update(gameState);
  },
  onNextHole: () => {
    gameState.nextHole();
    ball.reset();
    flag.reset();
    club.setVisible(true);
    hud.update(gameState);
  },
  onRestart: () => {
    gameState.reset();
    ball.reset();
    flag.reset();
    club.setVisible(true);
    hud.update(gameState);
  },
});

let aimState: AimState | null = null;

new InputController(
  ball,
  camera,
  scene,
  () => {
    if (gameState.getPhase() !== "playing") return;
    gameState.addStroke();
    hud.update(gameState);
  },
  (state) => {
    aimState = state;
  }
);

const holeRadius = 0.3;

hud.update(gameState);

let lastTime: number | undefined;

function animate(time: number) {
  requestAnimationFrame(animate);

  const delta = lastTime !== undefined ? (time - lastTime) / 1000 : 0;
  world.step(fixedTimeStep, delta, maxSubSteps);
  lastTime = time;

  ball.update(delta);
  flag.update(delta);
  club.update(
    ball.mesh.position,
    aimState?.direction ?? null,
    aimState?.power ?? 0
  );

  if (gameState.getPhase() === "playing") {
    if (ball.isInHole(holePosition, holeRadius)) {
      gameState.completeHole();
      club.setVisible(false);
      ball.enterHole(holePosition, () => {
        flag.down();
        hud.update(gameState);
      });
    }

    if (ball.isCloseToHole(holePosition, holeRadius * 3)) {
      flag.raise();
    }
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
