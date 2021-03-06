App.shaders.push(
  {
    name: 'Matrix',
    path : '!matrix',
    uniforms: {
      colour: { type: 'c', value: new THREE.Color(0x89ff89) },
      rows: { type: 'f', value: 15},
      glow: { type: 'f', value: 1.0},
      glowRadius: { type: 'f', value: 1.0},
      charDetail: { type: 'f', value: 3.0},
      speed: { type: 'f', value: 10.0},
      iGlobalTime: { type: 'f', value: App.clock.getDelta(), hidden: 1}
    },
    vertexShader: '\
varying vec2 vUv;\
void main() {\
  vUv = uv;\
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\
}\
    ',
    fragmentShader: '\
\
uniform vec3 colour;\
uniform float rows;\
uniform float glow;\
uniform float glowRadius;\
uniform float charDetail;\
uniform float speed;\
uniform float iGlobalTime;\
varying vec2 vUv;\
\
float random(in float x){\
    return fract(sin(x)*43758.5453);\
}\
\
float random(in vec2 st){\
    return fract(sin(dot(st.xy ,vec2(12.9898,78.233))) * 43758.5453);\
}\
\
float randomChar(in vec2 outer,in vec2 inner){\
    float grid = charDetail;\
    vec2 margin = vec2(.2,.05);\
    float seed = 23.;\
    vec2 borders = step(margin,inner)*step(margin,1.-inner);\
    return step(.5,random(outer*seed+floor(inner*grid))) * borders.x * borders.y;\
}\
\
vec3 matrix(in vec2 st){\
    vec2 ipos = floor(st*rows)+vec2(1.,0.);\
\
    ipos += vec2(.0,floor(iGlobalTime*speed*random(ipos.x)));\
\
    vec2 fpos = fract(st*rows);\
    vec2 center = (.5-fpos);\
\
    float pct = random(ipos);\
    float glowamount = (glowRadius-dot(center,center)*3.)*glow;\
\
    return vec3(randomChar(ipos,fpos) * pct * glowamount) * colour;\
}\
\
void main() {\
    gl_FragColor = vec4(matrix(vUv),1.0);\
}\
    ',
    update: function(uniforms){
      // Uniforms are passed in, because when a shader is created and the UniformUtils.merge function is called,
      // the uniforms in this object are cloned.
      uniforms.iGlobalTime.value = App.clock.getElapsedTime();
    }
  }

);
