(function () {
  'use strict';

  var waveVert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

  var waveFrag = `
precision highp float;
varying vec2 vUv;

uniform vec2  resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3  waveColor;

vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
vec2 fade(vec2 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi=floor(P.xyxy)+vec4(0.0,0.0,1.0,1.0);
  vec4 Pf=fract(P.xyxy)-vec4(0.0,0.0,1.0,1.0);
  Pi=mod289(Pi);
  vec4 ix=Pi.xzxz,iy=Pi.yyww,fx=Pf.xzxz,fy=Pf.yyww;
  vec4 i=permute(permute(ix)+iy);
  vec4 gx=fract(i*(1.0/41.0))*2.0-1.0;
  vec4 gy=abs(gx)-0.5;
  vec4 tx=floor(gx+0.5); gx=gx-tx;
  vec2 g00=vec2(gx.x,gy.x),g10=vec2(gx.y,gy.y),g01=vec2(gx.z,gy.z),g11=vec2(gx.w,gy.w);
  vec4 norm=taylorInvSqrt(vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11)));
  g00*=norm.x;g01*=norm.y;g10*=norm.z;g11*=norm.w;
  float n00=dot(g00,vec2(fx.x,fy.x)),n10=dot(g10,vec2(fx.y,fy.y));
  float n01=dot(g01,vec2(fx.z,fy.z)),n11=dot(g11,vec2(fx.w,fy.w));
  vec2 fd=fade(Pf.xy);
  vec2 nx=mix(vec2(n00,n01),vec2(n10,n11),fd.x);
  return 2.3*mix(nx.x,nx.y,fd.y);
}

float fbm(vec2 p){
  float v=0.0,amp=1.0,freq=waveFrequency;
  for(int i=0;i<4;i++){v+=amp*abs(cnoise(p));p*=freq;amp*=waveAmplitude;}
  return v;
}
float pattern(vec2 p){vec2 p2=p-time*waveSpeed; return fbm(p+fbm(p2));}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;
  float f = pattern(uv);
  gl_FragColor = vec4(mix(vec3(0.0), waveColor, f), 1.0);
}`;

  var ditherVert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

  var ditherFrag = `
precision highp float;
varying vec2 vUv;

uniform sampler2D inputBuffer;
uniform sampler2D bayerTexture;
uniform vec2  resolution;
uniform float colorNum;
uniform float pixelSize;

vec3 dither(vec2 uv, vec3 color){
  vec2 sc = floor(uv * resolution / pixelSize);

  vec2 bayerUv = (mod(sc, 8.0) + 0.5) / 8.0;
  float threshold = texture2D(bayerTexture, bayerUv).r * 0.004;

  float stepsize = 1.0 / (colorNum - 1.0);
  color += threshold * stepsize;
  color = clamp(color, 0.0, 1.0);
  return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
}

void main(){
  vec4 color = texture2D(inputBuffer, vUv);
  color.rgb = dither(vUv, color.rgb);
  gl_FragColor = color;
}`;

  function initDither(container, opts) {
    opts = Object.assign({
      waveColor:     [0.5, 0.5, 0.5],
      colorNum:      64,
      pixelSize:     1,
      waveAmplitude: 0.3,
      waveFrequency: 3.0,
      waveSpeed:     0.05
    }, opts);

    if (typeof THREE === 'undefined') { console.error('Three.js not loaded'); return; }

    var renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%!important;height:100%!important;display:block;';
    container.appendChild(renderer.domElement);

    var W = container.offsetWidth, H = container.offsetHeight;

    var quad = new THREE.PlaneGeometry(2, 2);

    var bayerData = new Uint8Array([
       0,192, 48,240, 12,204, 60,252,
     128, 64,176,112,140, 76,188,124,
      32,224, 16,208, 44,236, 28,220,
     160, 96,144, 80,172,108,156, 92,
       8,200, 56,248,  4,196, 52,244,
     136, 72,184,120,132, 68,180,116,
      40,232, 24,216, 36,228, 20,212,
     168,104,152, 88,164,100,148, 84
    ]);
    var bayerTex = new THREE.DataTexture(bayerData, 8, 8, THREE.LuminanceFormat, THREE.UnsignedByteType);
    bayerTex.minFilter = THREE.NearestFilter;
    bayerTex.magFilter = THREE.NearestFilter;
    bayerTex.wrapS = THREE.RepeatWrapping;
    bayerTex.wrapT = THREE.RepeatWrapping;
    bayerTex.needsUpdate = true;

    var rt = new THREE.WebGLRenderTarget(W, H, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });

    var waveUniforms = {
      resolution:    { value: new THREE.Vector2(W, H) },
      time:          { value: 0.0 },
      waveSpeed:     { value: opts.waveSpeed },
      waveFrequency: { value: opts.waveFrequency },
      waveAmplitude: { value: opts.waveAmplitude },
      waveColor:     { value: new THREE.Vector3(opts.waveColor[0], opts.waveColor[1], opts.waveColor[2]) }
    };
    var waveScene = new THREE.Scene();
    waveScene.add(new THREE.Mesh(quad, new THREE.ShaderMaterial({
      vertexShader: waveVert, fragmentShader: waveFrag, uniforms: waveUniforms
    })));

    var ditherUniforms = {
      inputBuffer:  { value: rt.texture },
      bayerTexture: { value: bayerTex },
      resolution:   { value: new THREE.Vector2(W, H) },
      colorNum:     { value: parseFloat(opts.colorNum) },
      pixelSize:    { value: parseFloat(opts.pixelSize) }
    };
    var ditherScene = new THREE.Scene();
    ditherScene.add(new THREE.Mesh(quad, new THREE.ShaderMaterial({
      vertexShader: ditherVert, fragmentShader: ditherFrag, uniforms: ditherUniforms
    })));

    var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cam.position.z = 1;

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        W = container.offsetWidth; H = container.offsetHeight;
        renderer.setSize(W, H);
        rt.setSize(W, H);
        waveUniforms.resolution.value.set(W, H);
        ditherUniforms.resolution.value.set(W, H);
      }, 120);
    });

    var isVisible = true;
    var obs = new IntersectionObserver(function (e) { isVisible = e[0].isIntersecting; }, { threshold: 0 });
    obs.observe(container);

    var animId, t0 = performance.now();
    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;
      waveUniforms.time.value = (performance.now() - t0) * 0.001;

      renderer.setRenderTarget(rt);
      renderer.render(waveScene, cam);

      renderer.setRenderTarget(null);
      renderer.render(ditherScene, cam);
    }
    animate();

    return function () {
      cancelAnimationFrame(animId);
      obs.disconnect();
      rt.dispose();
      bayerTex.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }

  window.initPixelSnow = initDither;
})();
