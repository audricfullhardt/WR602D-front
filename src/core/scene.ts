import * as THREE from 'three'

interface SceneObjects {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
}

export function initScene(canvas: HTMLCanvasElement): SceneObjects {
  const scene = new THREE.Scene()

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  )
  camera.position.set(0, 8, 10)
  camera.lookAt(0, 0, 0)

  const axesHelper = new THREE.AxesHelper(1)
  axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff) // Rouge = X, Vert = Y, Bleu = Z
  axesHelper.position.set(3, 0.01, 0)
  scene.add(axesHelper)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xffffff, 1)
  sunLight.position.set(10, 20, 10)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 2048
  sunLight.shadow.mapSize.height = 2048
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 50
  sunLight.shadow.camera.left = -20
  sunLight.shadow.camera.right = 20
  sunLight.shadow.camera.top = 20
  sunLight.shadow.camera.bottom = -20
  scene.add(sunLight)

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  return { scene, camera, renderer }
}