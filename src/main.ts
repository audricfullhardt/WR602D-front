import "./style.css";
import { initScene } from "./core/scene";
import { initPhysics } from "./core/physics";
import { Ball } from "./game/Ball";
import { Track } from "./game/Track";
import { InputController } from "./game/InputController";
import { GameState } from "./game/GameState";
import { HUD } from "./ui/HUD";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const { scene, camera, renderer } = initScene(canvas);
const { world, fixedTimeStep, maxSubSteps } = initPhysics();

const ball = new Ball(scene, world);
const gameState = new GameState();
const track = new Track(scene, world);
const hud = new HUD();
new InputController(ball, camera, scene, () => {
  gameState.addStroke();
  hud.updateStrokes(gameState.getStrokes());
});

const holePosition = track.getHolePosition();
const holeRadius = 0.3;

let lastTime: number | undefined;

function animate(time: number) {
  requestAnimationFrame(animate);

  const delta = lastTime !== undefined ? (time - lastTime) / 1000 : 0;
  world.step(fixedTimeStep, delta, maxSubSteps);
  lastTime = time;

  ball.update();

  if (!gameState.isHoleCompleted()) {
    const distanceToHole = ball.getBallPosition().distanceTo(holePosition);
    if (distanceToHole < holeRadius) {
      gameState.completeHole();
      hud.showMessage("Trou complété");
      hud.showResetMessage();
    }
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
