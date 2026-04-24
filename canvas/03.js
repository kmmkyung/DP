/** @format */

import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

let objectHeight;
let globe; // 지구본 객체를 전역으로 선언
const markers = []; // 도시 마커(큐브)를 저장할 배열

// 1. Scene, Camera, Renderer 설정
const container = document.getElementById("globe_cont");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  1000,
);
// 초기 카메라 위치 설정 (지구본이 로드되기 전에)
camera.position.set(2, 1, 3); // 적당한 초기 위치
camera.lookAt(0, 0, 0); // 원점을 바라보게

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// 카메라를 scene에 추가 (자식 객체들이 렌더링되도록)
scene.add(camera);

// 2. OrbitControls 설정
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 확대/축소 비활성화
controls.enableZoom = false;

// 카메라의 상하 회전 각도를 '적도' 기준으로 대칭적으로 제한
const verticalRotationLimit = 0.7; // 적도(수평) 기준 상/하로 움직일 수 있는 범위 (라디안)
controls.minPolarAngle = Math.PI / 2 - verticalRotationLimit; // 위쪽 한계
controls.maxPolarAngle = Math.PI / 2 + verticalRotationLimit; // 아래쪽 한계

// 3. Depth fog 설정 (거리에 따른 안개 효과)
scene.fog = new THREE.Fog(0x0000ff, 0, 5);
// scene.fog = null;

// 3. GLTFLoader 및 커스텀 셰이더 설정
let globePoints = null;
let shaderMaterial = null; // 상시 적용될 셰이더 재질 (Y축 밝기 + 호버 글로우)
let isHovering = false; // 호버 상태 추적 (나중에 글로우 강도 조절에 사용)
let frameCount = 0; // 프레임 카운터
let hasMouseMoved = false; // 마우스가 한 번이라도 움직였는지 추적

// "상단부에서 빛이 나오는" 효과를 위한 셰이더
const vertexShader = `
    varying vec3 vWorldPosition;
    varying float vLocalY; // 로컬 Y축 위치를 Fragment Shader로 전달
    varying float vColorVariant; // 색상 변형을 위한 랜덤 값
    varying float vVertexIndex; // vertex 인덱스를 Fragment Shader로 전달

    // 호버 글로우를 위한 추가 uniform
    uniform vec3 uHoverPosition; // 호버된 3D 위치
    uniform float uHoverRadius;  // 호버 글로우 반경
    uniform float uHoverIntensity; // 호버 글로우 강도
    uniform float uMaxPointSize; // 포인트 최대 크기

    // 의사 랜덤 함수 (position 기반)
    float random(vec3 pos) {
        return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vLocalY = position.y; // 모델의 로컬 Y축 위치
        vVertexIndex = float(gl_VertexID); // vertex 인덱스 전달
        
        // 각 점마다 고유한 랜덤 값 생성 (0.0~1.0)
        vColorVariant = random(position);

        vec4 mvPosition = viewMatrix * worldPosition;
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = 0.008 * ( 300.0 / -mvPosition.z ); // 점 크기 설정
    }
`;

const fragmentShader = `
    varying vec3 vWorldPosition;
    varying float vLocalY; // Vertex Shader에서 전달받은 로컬 Y축 위치
    varying float vColorVariant; // 색상 변형을 위한 랜덤 값
    varying float vVertexIndex; // Vertex Shader에서 전달받은 vertex 인덱스

    uniform vec3 uTopColor;
    uniform vec3 uBottomColor;
    uniform float uSphereRadius; // 구의 반지름 (Y축 밝기 계산에 사용)
    uniform vec3 uCameraPosition; // 카메라 위치

    // 호버 글로우를 위한 추가 uniform
    uniform vec3 uHoverPosition;
    uniform float uHoverRadius;
    uniform float uHoverIntensity;
    uniform float uDistortionFactor; // 꼭대기 상호작용 왜곡 강도
    uniform vec3 uAfterglowPosition; // 잔상 위치
    uniform float uAfterglowIntensity; // 잔상 강도
    uniform vec3 uHoverColorStart; // 호버 그라디언트 시작 색상
    uniform vec3 uHoverColorEnd;   // 호버 그라디언트 끝 색상
    uniform float uHoverOverallAlpha; // 호버 글로우 전체 투명도
    
    // 고정 조명 효과용 uniform (간단 버전)
    uniform vec3 uFixedLightPosition; // 고정 조명 위치
    uniform float uFixedLightIntensity; // 고정 조명 강도
    
    // Fog uniforms 추가
    uniform vec3 uFogColor; // 안개 색상
    uniform float uFogNear; // 안개 시작 거리
    uniform float uFogFar;  // 안개 끝 거리
    
    // 전역 어둡기 uniform 추가
    uniform float uGlobalDarkness; // 전역 어둡기 (0.0~1.0)

    void main() {
        // 사각형 점 모양 만들기 - gl_PointCoord는 0.0~1.0 범위
        vec2 coord = gl_PointCoord * 2.0 - 1.0; // -1.0~1.0 범위로 변환
        
        // 완벽한 사각형 만들기
        float square = max(abs(coord.x), abs(coord.y));
        if (square > 0.8) discard; // 사각형 밖의 픽셀 제거
        
        // Y축 밝기 그라데이션 (로컬 Y축 기준)
        float normalizedLocalY = (vLocalY / uSphereRadius + 1.0) / 2.0;
        float smoothMix = smoothstep(0.5, 0.80, normalizedLocalY);
        vec3 baseColor = mix(uBottomColor, uTopColor, smoothMix);
        
        // 색상 변형: 70%는 기본 색상, 30%는 어두운 색상
        vec3 colorVariant;
        if (vColorVariant < 0.6) {
            // 70% - 기본 색상
            colorVariant = baseColor;
        } else {
            // 30% - 어두운 색상 (기본 색상의 60% 밝기)
            colorVariant = baseColor * 0.6;
        }
        
        // 안쪽으로 어두워지는 효과와 투명도 조절 (depth fade)
        vec3 pointNormal = normalize(vWorldPosition); // 구 표면 법선
        vec3 cameraDirection = normalize(uCameraPosition - vWorldPosition); // 카메라 방향
        float frontDot = dot(pointNormal, cameraDirection);

        // rawFade는 가장자리면 0, 정면이면 1
        float rawFade = smoothstep(-1.0, 0.0, frontDot);

        // 1. 색상 밝기 조절
        float colorFade = 0.4 + rawFade * 0.3; // 앞값 가장자리 최소 밝기, 뒷값 가장자리와 정면 사이 밝기 변화 폭 조절
        vec3 finalColor = colorVariant * colorFade;

        // 2. 알파(투명도) 조절. 가장자리는 투명하게 만듦
        float alpha = rawFade;
        alpha = alpha * alpha; // 제곱하여 가장자리에서 더 빨리 투명

        // 현재 호버 글로우 계산
        vec3 distVector = vWorldPosition - uHoverPosition;
        distVector.y /= (1.0 + uDistortionFactor * 2.0);
        float distToHover = length(distVector);
        float hoverAlpha = smoothstep(uHoverRadius, uHoverRadius * 0.5, distToHover);
        // 호버 글로우 색상 그라디언트 적용
        // 호버 위치를 기준으로 Y축 정규화 (0.0 ~ 1.0)
        float hoverYNormalized = (vWorldPosition.y - (uHoverPosition.y - uHoverRadius)) / (2.0 * uHoverRadius);
        hoverYNormalized = clamp(hoverYNormalized, 0.0, 1.0); // 0.0에서 1.0 사이로 클램프

        // 시작 색상과 끝 색상을 Y축 정규화 값으로 혼합
        vec3 gradientColor = mix(uHoverColorStart, uHoverColorEnd, hoverYNormalized);
        vec3 hoverGlowColor = gradientColor * uHoverIntensity * hoverAlpha * uHoverOverallAlpha;
        
        // 잔상 글로우 계산 (다른 색상으로)
        vec3 afterglowDistVector = vWorldPosition - uAfterglowPosition;
        float distToAfterglow = length(afterglowDistVector);
        float afterglowAlpha = smoothstep(uHoverRadius, uHoverRadius * 0.4, distToAfterglow);
        vec3 afterglowColor = vec3(0.8, 0.8, 0.8) * uAfterglowIntensity * afterglowAlpha;
        
        // ===== 번짐효과 (북극-호버 연결 빛 경로) =====
        // 북극 근처에서 호버할 때 북극에서 호버 지점까지 이어지는 빛의 경로를 만드는 효과
        // 마치 피자 치즈처럼 북극에서 호버 지점까지 주욱 늘어나는 드라마틱한 시각적 효과
        vec3 pathGlow = vec3(0.0);
        
        // 1. 북극 근처 호버 감지 (Y축 70% 이상에서만 활성화)
        float normalizedHoverY = uHoverPosition.y / uSphereRadius;
        if (normalizedHoverY > 0.7 && uHoverIntensity > 0.0) { // 북극 근처 호버시에만
            vec3 northPole = vec3(0.0, uSphereRadius, 0.0); // 북극점 좌표
            
            // 2. 방향 벡터 계산
            vec3 dirToHover = normalize(uHoverPosition - northPole); // 북극 → 호버 지점 방향
            vec3 dirToPoint = normalize(vWorldPosition - northPole);  // 북극 → 현재 점 방향
            
            // 3. 경로 매칭 (현재 점이 북극-호버 직선 경로상에 있는지 체크)
            float pathMatch = dot(dirToHover, dirToPoint); // 두 방향의 유사도 (-1 ~ 1)
            float pathWidth = 0.98; // 경로 폭 조절 (0.98 = 거의 정확한 직선상에서만 효과 발생)
            
            if (pathMatch > pathWidth) { // 경로상에 있는 점들만
                // 4. 거리 비율 계산 (북극에서 호버까지의 진행도)
                float distToNorth = length(vWorldPosition - northPole);      // 북극-현재점 거리
                float distHoverToNorth = length(uHoverPosition - northPole); // 북극-호버 거리
                float pathProgress = distToNorth / distHoverToNorth;         // 진행 비율 (0~1)
                
                // 5. 치즈 늘어짐 효과 적용 (북극-호버 사이 구간에서만)
                if (pathProgress <= 1.0) { // 북극과 호버 사이 구간에서만
                    // 북극에서 가장 밝고 호버 지점으로 갈수록 어두워지는 그라데이션
                    float cheeseIntensity = (1.0 - pathProgress) * 0.4; // 강도: 북극=0.4, 호버=0.0
                    pathGlow = vec3(1.0, 1.0, 1.0) * cheeseIntensity * uHoverIntensity; // 투명한 흰색
                }
            }
        }
        // ===== 번짐효과 끝 =====

        // 최종 색상 혼합 (기본색 + 호버/잔상)
        vec3 totalGlow = hoverGlowColor + afterglowColor + pathGlow;
        float glowStrength = length(totalGlow) * 0.15;
        vec3 blendedColor = mix(finalColor, finalColor + totalGlow, glowStrength);
        
        // 강한 고정 조명 효과 (집중된 범위)
        float distToLight = distance(vWorldPosition, uFixedLightPosition);
        float lightEffect = smoothstep(5.0, 0.0, distToLight) * uFixedLightIntensity;
        
        // 더 확실한 붉은 조명 효과 (기존 색상을 완전히 덮어씌움)
        vec3 redLight = vec3(0.8, 0.8, 0.8); // 밝은 빨간색
        blendedColor = mix(blendedColor, redLight, lightEffect * 0.8);
        
        // 전역 어둡기 적용 (안개 계산 전에)
        blendedColor *= uGlobalDarkness;
        
        // ===== Fog 계산 추가 =====
        // 카메라로부터의 거리를 직접 계산
        float depth = distance(vWorldPosition, uCameraPosition);
        float fogFactor = smoothstep(uFogNear, uFogFar, depth); // fog 강도 계산
        
        // fog 색상과 최종 색상 혼합
        vec3 finalColorWithFog = mix(blendedColor, uFogColor, fogFactor);
        
        // 최종 색상과 계산된 알파값을 출력
        gl_FragColor = vec4(finalColorWithFog, alpha);
    }
`;

// shaderMaterial을 여기서 초기화하여 항상 사용 가능하도록 변경
shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTopColor: {value: new THREE.Color(0xffffff)}, // 위쪽 색상 (흰색)
    uBottomColor: {value: new THREE.Color(0xffffff)}, // 아래쪽 색상 (흰색)
    uSphereRadius: {value: 0}, // 초기값, 로드 후 업데이트
    uCameraPosition: {value: new THREE.Vector3()}, // 카메라 위치
    uHoverPosition: {value: new THREE.Vector3(0, 0, 0)}, // 호버 위치 초기값
    uHoverRadius: {value: 0.1}, // 호버 글로우 반경 초기값
    uHoverIntensity: {value: 0.0}, // 호버 글로우 강도 초기값 (0이면 안 보임)
    uHoverOverallAlpha: {value: 0.8}, // 호버 글로우 전체 투명도 (0.0~1.0)
    uDistortionFactor: {value: 0.0}, // 꼭대기 상호작용 왜곡 강도 초기값
    uAfterglowPosition: {value: new THREE.Vector3(0, 0, 0)}, // 잔상 위치
    uAfterglowIntensity: {value: 0.0}, // 잔상 강도
    uDynamicLightPosition: {value: new THREE.Vector3()}, // 카메라 기준 조명 위치
    uHoverColorStart: {value: new THREE.Color(0xffffff)}, // 호버 그라디언트 시작 색상 (흰색)
    uHoverColorEnd: {value: new THREE.Color(0xcccccc)}, // 호버 그라디언트 끝 색상 (밝은 회색)
    // 고정 조명 효과 추가
    uFixedLightPosition: {value: new THREE.Vector3(3, 2, -2)}, // 우측 뒤쪽에서 조명
    uFixedLightIntensity: {value: 2.0}, // 강한 조명
    // Fog uniforms 추가
    uFogColor: {value: new THREE.Color(0xfb233b)}, // 안개 색상 (빨간색)
    uFogNear: {value: 0.4}, // 안개 시작 거리
    uFogFar: {value: 2.0}, // 안개 끝 거리
    // 전역 어둡기 uniform 추가
    uGlobalDarkness: {value: 0.7}, // 70% 밝기 (0.0~1.0)
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true,
  blending: THREE.NormalBlending, // AdditiveBlending에서 NormalBlending으로 변경
  depthWrite: true, // 깊이 버퍼에 쓰도록 하여 점들이 서로를 가리도록 함
});

const loader = new GLTFLoader();
loader.load(
  "/glb/globe.glb",
  function (gltf) {
    globe = gltf.scene; // 전역 globe 변수에 할당

    globe.traverse(function (child) {
      if (child.isPoints) {
        globePoints = child;
      }
    });

    if (!globePoints) {
      console.error("GLB 파일에서 Points 객체를 찾을 수 없습니다.");
      return;
    }

    const box = new THREE.Box3().setFromObject(globe);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const radius = size.y / 2; // 구의 반지름 계산
    // radius가 0이 되는 것을 방지하여 셰이더 오류를 막음
    const safeRadius = Math.max(radius, 0.001); // 최소값 설정

    // Points를 구 표면에 달라붙게 조정
    normalizePointsToSphere(globePoints, safeRadius);

    // globePoints에 shaderMaterial을 직접 할당
    globePoints.material = shaderMaterial;

    // 초기 로딩 시 글로우 효과가 나타나지 않도록 강도 초기화
    shaderMaterial.uniforms.uHoverIntensity.value = 0.0;
    shaderMaterial.uniforms.uAfterglowIntensity.value = 0.0;

    // shaderMaterial의 uSphereRadius 유니폼 업데이트
    shaderMaterial.uniforms.uSphereRadius.value = safeRadius;

    globe.position.x += globe.position.x - center.x;
    globe.position.y += globe.position.y - center.y;
    globe.position.z += globe.position.z - center.z;

    // 투명 껍질을 지구본에 자식으로 추가 (위치 자동 동기화)
    createShell(safeRadius, globe);

    // 호버 감지용 invisible sphere 생성 (구와 동일한 크기)
    const hoverGeometry = new THREE.SphereGeometry(safeRadius, 32, 32);
    const hoverMaterial = new THREE.MeshBasicMaterial({visible: false});
    hoverTargetSphere = new THREE.Mesh(hoverGeometry, hoverMaterial);
    hoverTargetSphere.position.copy(globe.position);
    scene.add(hoverTargetSphere);

    objectHeight = size.y;

    // 지구본 스케일 조절
    globe.scale.set(1.0, 1.0, 1.0);

    scene.add(globe);

    // Scene 전체를 아래로 이동해서 지구본이 canvas 아래쪽에 보이게
    scene.position.y = -0.0;

    // addCube(37.5665, 126.9780, 0xff0000, 'Seoul'); // 서울
    addCube(0.0, 20.0, 0xffffff, "Africa", "Africa"); // 아프리카(카이로)
    addCube(53.0, 27.0, 0xffffff, "East Europe", "East Europe"); // 동유럽(바르샤바)
    addCube(-15.0, -60.0, 0xffffff, "Latin America", "LATAM"); // 라틴 아메리카
    addCube(25.0, 45.0, 0xffffff, "Middle East", "Middle East"); // 중동
    addCube(40.0, -100.0, 0xffffff, "North America", "North America"); // 북아메리카
    addCube(-25.0, 135.0, 0xffffff, "Oceania", "Oceania"); // 오세아니아
    addCube(48.0, 10.0, 0xffffff, "West Europe", "West Europe"); // 서유럽
    // addCube(40.0, 90.0, 0xffffff, 'Asia'); // 아시아
    addCube(39.9, 116.4, 0xffffff, "East Asia", "East Asia"); // 동아시아
    addCube(13.7, 100.0, 0xffffff, "Southeast Asia", "southeast asia"); // 동남아시아
    addCube(
      41.3,
      69.2,
      0xffffff,
      "South and Central Asia",
      "south and central asia",
    ); // 남아시아 & 중앙아시아

    // 지구본 로드 완료 후 카메라 위치 재조정
    onWindowResize();

    // 모델 로드 및 재질 설정 완료 후 애니메이션 시작
    animate();
  },
  (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
  (error) => console.error("An error happened", error),
);

// 마우스 움직임 이벤트 리스너
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1; // Points 객체에 대한 감지 임계값 설정

// 호버 감지용 invisible sphere 생성
let hoverTargetSphere = null;

function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  hasMouseMoved = true; // 마우스가 움직였음을 표시
}
window.addEventListener("mousemove", onMouseMove, false);

const hoverFadeInSpeed = 0.08; // 호버 시 글로우 페이드인 속도 (더 빠르게)
const hoverFadeOutSpeed = 0.015; // 호버 해제 시 글로우 페이드아웃 속도 (더 느리게 - 잔상 효과)

// 꼭대기 상호작용을 위한 변수
let currentDistortionFactor = 0.0; // 현재 왜곡 강도
const maxDistortionFactor = 0.5; // 최대 왜곡 강도
const distortionThresholdY = 0.8; // Y축 왜곡 시작 임계값 (구 반지름 대비)

// 호버 글로우 강도 조절을 위한 변수
let currentHoverIntensity = 0.0;
const targetHoverIntensity = 1.8; // 호버 시 목표 강도 (더 밝게)
const uHoverRadius = 0.3; // 호버 글로우 반경 (더 크게)

// 잔상을 위한 변수들
let afterglowIntensity = 0.0;

// shaderMaterial의 uHoverRadius 유니폼 업데이트
// 이 부분은 shaderMaterial 초기화 시점에 한 번만 설정되므로, 여기에 직접 값을 할당
// shaderMaterial.uniforms.uHoverRadius.value = uHoverRadius; // 이 줄은 필요 없음, 초기화 시 설정됨

// 잔상 효과를 위한 새로운 변수
const realHoverPoint = new THREE.Vector3(); // 실제 마우스 교차점
let isHoveringGlobe = false; // 현재 마우스가 지구본 위에 있는지 여부

function animate() {
  requestAnimationFrame(animate);
  frameCount++;

  const isMobile = window.innerWidth <= 767;

  if (globe) {
    // 지구본 객체가 로드되었는지 확인
    // 데스크톱에서만 모든 로직 실행
    if (!isMobile) {
      globe.rotation.y += 0.0003; // 지구본을 Y축으로 자동 회전 줄이면 느리게 회전 늘리면 빠르게 회전
    }

    // 카메라 위치를 기준으로 마커의 가시성 조절
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition); // 카메라의 월드 좌표

    const globePosition = globe.position.clone(); // 지구본의 월드 좌표

    const camToGlobeDir = cameraPosition.sub(globePosition).normalize(); // 지구에서 카메라를 향하는 벡터

    for (const marker of markers) {
      const markerWorldPosition = new THREE.Vector3();
      marker.cube.getWorldPosition(markerWorldPosition);
      const globeToMarkerDir = markerWorldPosition
        .clone()
        .sub(globePosition)
        .normalize();
      const dot = camToGlobeDir.dot(globeToMarkerDir);

      // 큐브와 라벨의 가시성 설정
      const isVisible = dot > 0.1;
      marker.cube.visible = isVisible;
      marker.label.style.display = isVisible ? "block" : "none";

      if (isVisible) {
        // 3D 위치를 2D 화면 좌표로 변환
        const screenPosition = markerWorldPosition.clone().project(camera);
        const width = container.clientWidth;
        const height = container.clientHeight;
        const x = (screenPosition.x * 0.5 + 0.5) * width;
        const y = (-screenPosition.y * 0.5 + 0.5) * height;

        // 라벨 위치 업데이트 (라벨의 중앙 상단이 큐브 위치에 오도록)
        marker.label.style.left = `${x}px`;
        marker.label.style.top = `${y}px`;
        marker.label.style.transform = "translateX(-50%) translateY(-100%)";
      }
    }
  }

  if (globePoints && shaderMaterial) {
    // 1. 카메라 및 레이캐스터 업데이트
    shaderMaterial.uniforms.uCameraPosition.value.copy(camera.position);

    raycaster.setFromCamera(mouse, camera);

    const intersects = hoverTargetSphere
      ? raycaster.intersectObject(hoverTargetSphere)
      : [];

    // 2. 호버 상태 감지 및 실제 호버 위치 업데이트
    // 마우스가 움직인 후에만 호버 감지를 활성화
    if (hasMouseMoved && intersects.length > 0) {
      // hasMouseMoved 조건 추가
      realHoverPoint.copy(intersects[0].point);
      isHoveringGlobe = true;
    } else {
      isHoveringGlobe = false;
    }

    // 3. 호버 및 잔상 강도 조절
    if (isHoveringGlobe) {
      // 호버 시: 메인 글로우 강도를 높이고, 잔상 강도를 그 뒤를 따르게 함
      currentHoverIntensity = Math.min(
        currentHoverIntensity + hoverFadeInSpeed,
        targetHoverIntensity,
      );
      afterglowIntensity = 0.0; // 잔상 효과 비활성화
    } else {
      // 호버 해제 시: 모든 글로우 강도를 서서히 줄임
      currentHoverIntensity = Math.max(
        currentHoverIntensity - hoverFadeOutSpeed,
        0.0,
      );
      afterglowIntensity = 0.0; // 잔상 효과 비활성화
    }

    // 4. 셰이더 유니폼 업데이트 (위치 및 강도)

    // uHoverPosition이 realHoverPoint를 부드럽게 따라감 (혜성의 머리)
    shaderMaterial.uniforms.uHoverPosition.value.lerp(realHoverPoint, 0.1);

    // uAfterglowPosition이 uHoverPosition을 부드럽게 따라감 (혜성의 꼬리)
    shaderMaterial.uniforms.uAfterglowPosition.value.lerp(
      shaderMaterial.uniforms.uHoverPosition.value,
      0.06,
    );

    // 강도 업데이트
    shaderMaterial.uniforms.uHoverIntensity.value = currentHoverIntensity;
    shaderMaterial.uniforms.uAfterglowIntensity.value = afterglowIntensity;

    // 5. Y축 왜곡 효과 (기존 로직 유지)
    const normalizedY =
      shaderMaterial.uniforms.uHoverPosition.value.y /
      shaderMaterial.uniforms.uSphereRadius.value;
    if (isHoveringGlobe && normalizedY > distortionThresholdY) {
      const distortionProgress =
        (normalizedY - distortionThresholdY) / (1.0 - distortionThresholdY);
      currentDistortionFactor = Math.min(
        distortionProgress * maxDistortionFactor,
        maxDistortionFactor,
      );
    } else {
      currentDistortionFactor = Math.max(currentDistortionFactor - 0.05, 0.0); // 부드럽게 복원
    }
    shaderMaterial.uniforms.uDistortionFactor.value = currentDistortionFactor;
  }

  if (!isMobile) {
    // 6. 렌더링
    controls.update();
    // 메인 Scene 렌더링 (지구본)
    renderer.render(scene, camera);
  }
}

// 1단계 Territory만 선택
function selectTerritory(territoryName) {
  if (!window.choices1) return;
  console.log(territoryName);
  window.choices1.setChoiceByValue(territoryName);
  const territorySelect = document.getElementById("filter_territory");
  if (territorySelect) {
    territorySelect.dispatchEvent(new Event("change"));
  }
}

/**
 * 순차적으로 Territory -> Country 선택
 */
function selectRegionSequentially(territoryName, countryName) {
  const handleTerritoryDataLoaded = (event) => {
    if (event.detail.territory === territoryName && window.choices2) {
      // Country 선택
      window.choices2.setChoiceByValue(countryName);
      const countrySelect = document.getElementById("filter_country");
      if (countrySelect) {
        countrySelect.dispatchEvent(new Event("change"));
      }

      document.removeEventListener(
        "territoryDataLoaded",
        handleTerritoryDataLoaded,
      );
    }
  };

  // 커스텀 이벤트 감지 시작
  document.addEventListener("territoryDataLoaded", handleTerritoryDataLoaded);

  // Territory 선택 시작
  selectTerritory(territoryName);
}

/**
 * 3단계까지 순차 선택 (Territory -> Country -> Region)
 */
function selectRegionFullSequence(territoryName, countryName, regionName) {
  let step = 1;

  const handleTerritoryLoaded = (event) => {
    if (event.detail.territory === territoryName && step === 1) {
      step = 2;
      window.choices2?.setChoiceByValue(countryName);
      document
        .getElementById("filter_country")
        ?.dispatchEvent(new Event("change"));
      document.removeEventListener(
        "territoryDataLoaded",
        handleTerritoryLoaded,
      );
    }
  };

  const handleCountryLoaded = (event) => {
    if (event.detail.country === countryName && step === 2) {
      step = 3;
      window.choices3?.setChoiceByValue(regionName);
      document
        .getElementById("filter_region")
        ?.dispatchEvent(new Event("change"));
      document.removeEventListener("countryDataLoaded", handleCountryLoaded);
    }
  };

  document.addEventListener("territoryDataLoaded", handleTerritoryLoaded);
  document.addEventListener("countryDataLoaded", handleCountryLoaded);

  selectTerritory(territoryName);
}
// 위도/경도 위치에 정육면체 Mesh로 마커 생성 (표준 구면 좌표 변환)
function addCube(lat, lon, color, name, dataText) {
  const labelsContainer = document.getElementById("labels-container");

  // Points와 동일한 반지름 사용
  const radius = shaderMaterial.uniforms.uSphereRadius.value;

  // 위도(latitude)와 경도(longitude)를 라디안(radian)으로 변환
  // 위도는 90도에서 빼서 극좌표계의 각도(phi)로 변환 (북극 = 0)
  const phi = (90 - lat) * (Math.PI / 180);
  // 경도는 180도를 더해 Three.js 좌표계에 맞춥니다.
  const theta = (lon + 180) * (Math.PI / 180);

  // 표준 구면 좌표계를 사용하여 x, y, z 좌표를 계산
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  // 정육면체 생성 (작은 크기)
  const cubeSize = 0.006;
  const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: false,
  });

  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(x, y, z);

  // 구 중심을 바라보도록 회전 (플랫한 면이 바깥쪽을 향하게)
  cube.lookAt(new THREE.Vector3(0, 0, 0));

  // 지구본에 추가
  globe.add(cube); // scene 대신 globe에 추가하여 지구본과 함께 움직이도록 함

  // HTML 라벨 생성
  const label = document.createElement("div");
  label.className = "label";
  label.textContent = name;
  if (dataText) {
    label.setAttribute("data-text", dataText);
  }
  labelsContainer.appendChild(label);

  // 라벨 클릭 이벤트 - 통합 핸들러 사용
  label.addEventListener("click", () => {
    if (dataText) {
      selectTerritory(dataText);
    }
    // handleGlobeMarkerClick(name);
  });

  // 마커 배열에 큐브와 라벨을 함께 저장
  markers.push({cube: cube, label: label});
}

// Points를 구 표면에 달라붙게 정규화하는 함수
function normalizePointsToSphere(pointsObject, targetRadius) {
  const geometry = pointsObject.geometry;
  const positions = geometry.attributes.position;

  // 각 점을 구 표면으로 정규화
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // 원점에서의 방향 벡터 계산
    const length = Math.sqrt(x * x + y * y + z * z);

    if (length > 0) {
      // 정규화하여 구 표면에 배치
      const normalizedX = (x / length) * targetRadius;
      const normalizedY = (y / length) * targetRadius;
      const normalizedZ = (z / length) * targetRadius;

      positions.setXYZ(i, normalizedX, normalizedY, normalizedZ);
    }
  }

  // 변경사항 적용
  positions.needsUpdate = true;
  geometry.computeBoundingSphere();
}

// 껍질 생성 함수 (지구본의 자식으로 추가)
function createShell(radius, globeObject) {
  // Points와 정확히 동일한 크기의 구 geometry 생성
  const shellGeometry = new THREE.SphereGeometry(radius, 64, 32);

  // 껍질 재질
  const shellMaterial = new THREE.MeshBasicMaterial({
    color: 0x4c4c4c,
    transparent: true,
    opacity: 0.05, // 투명도
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  const blueShell = new THREE.Mesh(shellGeometry, shellMaterial);
  // 지구본 객체 기준으로 상대 위치는 (0, 0, 0)
  blueShell.position.set(0, 0, 0);
  blueShell.renderOrder = -1; // Points보다 먼저 렌더링

  // 지구본의 자식으로 추가 (위치 자동 동기화)
  globeObject.add(blueShell);
}

function onWindowResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  // 새 컨테이너 너비에 따라 카메라 위치 업데이트
  if (objectHeight) {
    // 지구본이 로드되고 objectHeight가 설정되었는지 확인
    const desiredPixelWidth = 500; // 지구본의 보이는 크기를 위한 기준 너비
    const fov = camera.fov * (Math.PI / 180);

    // 객체가 수직으로 맞도록 기본 거리 계산
    const baseVerticalFitDistance = objectHeight / (2 * Math.tan(fov / 2));

    // 이제 너비에 따라 이 거리를 조정
    // 현재 너비가 desiredPixelWidth보다 작으면, 거리는 증가해야 함 (더 멀리 이동)
    // 현재 너비가 desiredPixelWidth보다 크면, 거리는 감소해야 함 (더 가까이 이동)
    const widthScaleFactor = desiredPixelWidth / width; // 역관계
    let distance = baseVerticalFitDistance * widthScaleFactor;

    // 카메라가 지구본 안으로 들어가는 것을 방지하기 위한 최소 거리 추가
    // objectHeight는 지구본의 반지름입니다.
    // objectHeight * 1.5는 지구본 표면에서 0.5 * objectHeight 만큼 떨어진 거리.
    const minCameraDistance = objectHeight * 1.0;
    distance = Math.max(distance, minCameraDistance); // 너무 가까이 가지 않도록 보장

    const initialAzimuthalAngle = 1.4;
    const initialPolarAngle = Math.PI / 5.6 + 0.3;

    controls.object.position.x =
      distance * Math.sin(initialPolarAngle) * Math.sin(initialAzimuthalAngle);
    controls.object.position.y = distance * Math.cos(initialPolarAngle);
    controls.object.position.z =
      distance * Math.sin(initialPolarAngle) * Math.cos(initialAzimuthalAngle);

    controls.update(); // 카메라 위치 변경 후 컨트롤 업데이트
  }
}
onWindowResize();
window.addEventListener("DOMContentLoaded", onWindowResize);
window.addEventListener("resize", onWindowResize, false);
