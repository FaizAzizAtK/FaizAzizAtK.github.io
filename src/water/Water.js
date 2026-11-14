// A small GPU fluid simulation that renders like pigment in water: colour is
// subtracted from paper (Beer-Lambert) rather than added to black, and the dye
// is advected with MacCormack so filaments stay fine instead of blurring away.

const VERT = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos*.5+.5; gl_Position = vec4(aPos,0.,1.); }`

const HEAD = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv; out vec4 o;
`

const FS = {
  advect: HEAD + `
uniform sampler2D uVel, uSrc, uNoise; uniform vec2 uTexel, uShift, uFibreScale; uniform float uDt, uDiss, uFibre;
void main(){
  vec2 v = textureLod(uVel,vUv,0.).xy;
  float n = .44*textureLod(uNoise,vUv*uFibreScale*.028,0.).r + .3*textureLod(uNoise,vUv*uFibreScale*.11,0.).g + .17*textureLod(uNoise,vUv*uFibreScale*.37,0.).b + .09*textureLod(uNoise,vUv*uFibreScale,0.).a;
  float k = 1. + uFibre*(n-.5)*3.2;
  vec2 c = vUv - uDt*v*uTexel*max(k,0.) - uShift;
  vec4 s = textureLod(uSrc,c,0.);
  if (c.x<0.||c.x>1.||c.y<0.||c.y>1.) s = vec4(0.);
  o = s/(1.+uDiss*abs(uDt));
}`,
  macc: HEAD + `
uniform sampler2D uVel, uSrc, uFwd, uBack; uniform vec2 uTexel, uDye, uShift; uniform float uDt, uDiss, uK;
void main(){
  vec2 c = vUv - uDt*textureLod(uVel,vUv,0.).xy*uTexel - uShift;
  vec4 f = textureLod(uFwd,vUv,0.), b = textureLod(uBack,vUv,0.), s = textureLod(uSrc,vUv,0.);
  vec4 r = f + uK*.5*(s-b);
  vec2 t = uDye*.5;
  vec4 a = textureLod(uSrc,c+vec2(-t.x,-t.y),0.), e = textureLod(uSrc,c+vec2(t.x,-t.y),0.),
       g = textureLod(uSrc,c+vec2(-t.x,t.y),0.),  h = textureLod(uSrc,c+vec2(t.x,t.y),0.);
  r = clamp(r, min(a,min(e,min(g,h))), max(a,max(e,max(g,h))));
  o = max(r,vec4(0.))/(1.+uDiss*uDt);
}`,
  curl: HEAD + `
uniform sampler2D uVel; uniform vec2 uTexel;
void main(){
  float L=textureLod(uVel,vUv-vec2(uTexel.x,0.),0.).y, R=textureLod(uVel,vUv+vec2(uTexel.x,0.),0.).y,
        B=textureLod(uVel,vUv-vec2(0.,uTexel.y),0.).x, T=textureLod(uVel,vUv+vec2(0.,uTexel.y),0.).x;
  o = vec4(.5*(R-L-T+B),0.,0.,1.);
}`,
  vort: HEAD + `
uniform sampler2D uVel,uCurl; uniform vec2 uTexel; uniform float uCurlK,uDt;
void main(){
  float L=textureLod(uCurl,vUv-vec2(uTexel.x,0.),0.).x, R=textureLod(uCurl,vUv+vec2(uTexel.x,0.),0.).x,
        B=textureLod(uCurl,vUv-vec2(0.,uTexel.y),0.).x, T=textureLod(uCurl,vUv+vec2(0.,uTexel.y),0.).x,
        C=textureLod(uCurl,vUv,0.).x;
  vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
  f/=length(f)+1e-4; f*=uCurlK*C; f.y*=-1.;
  vec2 v=textureLod(uVel,vUv,0.).xy+f*uDt;
  o=vec4(clamp(v,-1500.,1500.),0.,1.);
}`,
  force: HEAD + `
uniform sampler2D uVel,uDye; uniform float uB,uDt,uTime,uTurb,uDrag,uAspect; uniform vec2 uWake;
vec2 h2(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453)*2.-1.; }
float n(vec2 p){ vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(dot(h2(i),f),dot(h2(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(h2(i+vec2(0,1)),f-vec2(0,1)),dot(h2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y); }
void main(){
  vec2 v=textureLod(uVel,vUv,0.).xy;
  vec4 d=textureLod(uDye,vUv,2.);
  float rho=d.r+d.g+d.b+d.a;
  v.y-=uB*min(rho,1.6)*uDt;
  vec2 p=vec2(vUv.x*uAspect,vUv.y); float e=.01, t=uTime*.07;
  float n0=n(p*3.+t), nx=n(p*3.+vec2(e,0.)+t), ny=n(p*3.+vec2(0.,e)+t);
  float m0=n(p*8.-t*1.7), mx=n(p*8.+vec2(e,0.)-t*1.7), my=n(p*8.+vec2(0.,e)-t*1.7);
  vec2 cn=vec2(ny-n0,-(nx-n0))/e + .5*vec2(my-m0,-(mx-m0))/e;
  v+=uTurb*cn*uDt;
  v+=uWake*uDt;
  v/=1.+uDrag*uDt;
  o=vec4(v,0.,1.);
}`,
  div: HEAD + `
uniform sampler2D uVel,uNoise; uniform vec2 uTexel; uniform vec4 uS[8]; uniform int uN; uniform float uAspect;
void main(){
  float L=textureLod(uVel,vUv-vec2(uTexel.x,0.),0.).x, R=textureLod(uVel,vUv+vec2(uTexel.x,0.),0.).x,
        B=textureLod(uVel,vUv-vec2(0.,uTexel.y),0.).y, T=textureLod(uVel,vUv+vec2(0.,uTexel.y),0.).y;
  float s=0.;
  vec2 g=vUv*vec2(uAspect,1.)*.42;
  float n=textureLod(uNoise,g,0.).r*.6+textureLod(uNoise,g*2.7,0.).g*.4;
  for(int i=0;i<uN;i++){ vec2 p=vUv-uS[i].xy; p.x*=uAspect; s+=uS[i].w*exp(-dot(p,p)/uS[i].z); }
  o=vec4(.5*(R-L+T-B)-s*(.25+1.5*n),0.,0.,1.);
}`,
  pres: HEAD + `
uniform sampler2D uP,uDiv; uniform vec2 uTexel;
void main(){
  float L=textureLod(uP,vUv-vec2(uTexel.x,0.),0.).x, R=textureLod(uP,vUv+vec2(uTexel.x,0.),0.).x,
        B=textureLod(uP,vUv-vec2(0.,uTexel.y),0.).x, T=textureLod(uP,vUv+vec2(0.,uTexel.y),0.).x;
  float e=step(uTexel.x,vUv.x)*step(uTexel.y,vUv.y)*step(vUv.x,1.-uTexel.x)*step(vUv.y,1.-uTexel.y);
  o=vec4(e*(L+R+B+T-textureLod(uDiv,vUv,0.).x)*.25,0.,0.,1.);
}`,
  grad: HEAD + `
uniform sampler2D uP,uVel; uniform vec2 uTexel;
void main(){
  float L=textureLod(uP,vUv-vec2(uTexel.x,0.),0.).x, R=textureLod(uP,vUv+vec2(uTexel.x,0.),0.).x,
        B=textureLod(uP,vUv-vec2(0.,uTexel.y),0.).x, T=textureLod(uP,vUv+vec2(0.,uTexel.y),0.).x;
  o=vec4(textureLod(uVel,vUv,0.).xy-vec2(R-L,T-B),0.,1.);
}`,
  fade: HEAD + `
uniform sampler2D uSrc; uniform float uK;
void main(){ o=textureLod(uSrc,vUv,0.)*uK; }`,
  clear: HEAD + `
uniform sampler2D uSrc; uniform vec4 uK;
void main(){ o=textureLod(uSrc,vUv,0.)*uK; }`,
  splat: HEAD + `
uniform sampler2D uTgt; uniform vec2 uP; uniform vec3 uC; uniform float uR,uAspect,uRough,uSeed;
float h(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y); }
void main(){
  vec2 p=vUv-uP; p.x*=uAspect;
  float a=dot(p,p);
  float w=1.+uRough*(n(p*34.+uSeed)+.5*n(p*80.-uSeed)-.75);
  o=textureLod(uTgt,vUv,0.)+vec4(uC*exp(-a/(uR*w)),0.);
}`,
  dose: HEAD + `
uniform sampler2D uTgt,uNoise; uniform vec4 uP[8]; uniform vec4 uC[8]; uniform int uN; uniform float uAspect;
void main(){
  vec4 a=textureLod(uTgt,vUv,0.);
  float n=textureLod(uNoise,vUv*vec2(uAspect,1.)*.9,0.).r;
  for(int i=0;i<uN;i++){ vec2 p=vUv-uP[i].xy; p.x*=uAspect; a+=uC[i]*exp(-dot(p,p)/(uP[i].z*(.7+.6*n))); }
  o=max(a,vec4(0.));
}`,
  feed: HEAD + `
uniform sampler2D uTgt,uNoise; uniform vec4 uR[8]; uniform int uN; uniform vec4 uC; uniform float uT,uBase,uRate,uHeal,uAspect;
void main(){
  vec4 a=textureLod(uTgt,vUv,0.);
  float tot=a.r+a.g+a.b+a.a;
  vec2 asp=vec2(uAspect,1.);
  vec2 w=(textureLod(uNoise,vUv*asp*.31,0.).rg-.5)*.05;
  float m=0.;
  for(int i=0;i<uN;i++){
    vec2 q=abs((vUv+w-uR[i].xy)*asp)-uR[i].zw*asp;
    m=max(m,1.-smoothstep(0.,.08,length(max(q,vec2(0.)))+min(max(q.x,q.y),0.)));
  }
  float need=max(mix(uBase,uT,m)-tot,0.);
  o=a+uC*need*mix(uHeal,1.,smoothstep(.02,.14,tot))*uRate;
}`,
  recede: HEAD + `
uniform sampler2D uTgt,uNoise; uniform float uY,uAspect; uniform vec4 uK;
void main(){
  vec4 a=textureLod(uTgt,vUv,0.);
  vec2 p=vec2(vUv.x*uAspect,vUv.y);
  float n=.6*textureLod(uNoise,p*.16,0.).r+.28*textureLod(uNoise,p*.53,0.).g+.12*textureLod(uNoise,p*1.7,0.).b;
  float e=uY+(n-.5)*.34;
  o=a*(1.-uK*(1.-smoothstep(e-.012,e+.05,vUv.y)));
}`,
  render: HEAD + `
uniform sampler2D uDye,uNoise; uniform vec2 uRes,uDyeSize;
uniform vec3 uA[4]; uniform vec3 uPaper;
uniform float uEdge,uRim,uHalo,uHalo2,uGrain,uMottle,uMax,uDen;
vec3 s2l(vec3 c){ return pow(c,vec3(2.2)); }
vec3 l2s(vec3 c){ return pow(max(c,vec3(0.)),vec3(1./2.2)); }
// B-spline bicubic so a sub-resolution field never shows its grid when enlarged
vec4 bi(float lod,vec2 uv){
  vec2 sz=uDyeSize/pow(2.,lod), p=uv*sz-.5, i=floor(p), f=p-i, f2=f*f, f3=f2*f;
  vec2 w0=(1.-f)*(1.-f)*(1.-f)/6., w1=(4.-6.*f2+3.*f3)/6., w2=(1.+3.*f+3.*f2-3.*f3)/6., w3=f3/6.;
  vec2 g0=w0+w1, g1=w2+w3, h0=(i-1.+w1/g0+.5)/sz, h1=(i+1.+w3/g1+.5)/sz;
  return (textureLod(uDye,h0,lod)*g0.x+textureLod(uDye,vec2(h1.x,h0.y),lod)*g1.x)*g0.y
        +(textureLod(uDye,vec2(h0.x,h1.y),lod)*g0.x+textureLod(uDye,h1,lod)*g1.x)*g1.y;
}
float fbm(vec2 p){ return .5*textureLod(uNoise,p,0.).r+.3*textureLod(uNoise,p*2.3+.17,0.).g+.2*textureLod(uNoise,p*5.1+.41,0.).b; }
void main(){
  vec4 d=bi(0.,vUv), s=bi(1.5,vUv), m=bi(3.5,vUv), w=bi(5.,vUv);
  vec2 asp=vec2(uRes.x/uRes.y,1.);
  // the body of the wash is soft; a dark rim forms just inside the wet edge
  vec4 body=mix(d,s,.45);
  float tot=s.r+s.g+s.b+s.a, tm=m.r+m.g+m.b+m.a;
  float rim=smoothstep(.015,.07,tot)*(1.-smoothstep(.09,.34,tot));
  float wob=fbm(vUv*asp*.9);
  vec4 D=body+uEdge*max(d-m,vec4(0.))+uHalo*m+uHalo2*w;
  D*=1.+uRim*rim*smoothstep(.34,.62,wob);
  // pigment settles unevenly: slow mottling, then the tooth of the paper
  D*=1.+uMottle*(fbm(vUv*asp*.22+.3)-.5)*2.;
  vec2 gp=gl_FragCoord.xy/512.;
  float tooth=textureLod(uNoise,gp,0.).r*.55+textureLod(uNoise,gp*.41+.13,0.).g*.45-.5;
  D*=1.+uGrain*tooth*smoothstep(.0,.35,tot);
  D=max(D*uDen,vec4(0.));
  // saturate softly, so overlaps deepen without ever going to black
  float t2=D.r+D.g+D.b+D.a;
  D*=uMax*(1.-exp(-t2/uMax))/max(t2,1e-4);
  vec3 od=uA[0]*D.r+uA[1]*D.g+uA[2]*D.b+uA[3]*D.a;
  vec3 c=l2s(s2l(uPaper)*exp(-od));
  c+=(textureLod(uNoise,gl_FragCoord.xy/256.,0.).b-.5)/255.;
  o=vec4(c,1.);
}`,
}

// Absorbance per unit of pigment, red green blue. Thin washes stay luminous and
// shift hue the way real paint does, because colour is light taken away.
export const PIGMENTS = {
  ultramarine: [3.3, 2.65, 0.5],
  indigo: [2.7, 2.1, 1.05],
  prussian: [3.5, 1.5, 0.85],
  phthalo: [3.6, 1.15, 1.0],
  viridian: [3.4, 1.25, 2.1],
  alizarin: [1.0, 3.2, 2.0],
  perylene: [1.7, 3.0, 1.6],
  sienna: [0.6, 2.2, 3.2],
  sepia: [1.6, 2.1, 2.7],
  ochre: [0.35, 1.35, 3.0],
  payne: [2.1, 1.8, 1.45],
  rose: [0.2, 2.5, 1.0],
}

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src); gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.slice(0, 200))
  return s
}

function program(gl, vs, fsSrc) {
  const p = gl.createProgram()
  gl.attachShader(p, vs); gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fsSrc))
  gl.bindAttribLocation(p, 0, 'aPos'); gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p))
  const u = {}
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name) }
  return { p, u }
}

export class Water {
  constructor(canvas, opts = {}) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
    if (!gl) throw new Error('webgl2')
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) throw new Error('float targets')
    gl.getExtension('OES_texture_float_linear')
    this.gl = gl
    this.look = {
      paper: [1, 1, 1], pigments: [PIGMENTS.ultramarine, PIGMENTS.indigo, PIGMENTS.perylene, PIGMENTS.rose],
      edge: 0.5, rim: 1.1, halo: 0.16, halo2: 0.08, grain: 0.2, mottle: 0.34, max: 2.2, den: 1,
    }
    this.sim = { curl: 2.5, pressure: 0.8, iters: 22, buoy: 30, turb: 70, drag: 1.1, dyeDiss: 0.006, velDiss: 0.5, fibre: 0.95, ...opts.sim }
    this.simH = opts.simH || 256
    this.dyeH = opts.dyeH || 900
    this.dprMax = opts.dpr || 2
    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    this.P = Object.fromEntries(Object.entries(FS).map(([k, src]) => [k, program(gl, vs, src)]))
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    this.noise = this.makeNoise()
    this.t = 0; this.wake = [0, 0]; this.energy = 1; this.doses = []; this.shiftAcc = 0; this.shiftUv = 0
    this.held = null
    this.resize()
  }

  makeNoise() {
    const gl = this.gl, N = 256, d = new Uint8Array(N * N * 4)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 256
    const t = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, d)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    return t
  }

  fbo(w, h, ifmt, fmt, type, filter, mips) {
    const gl = this.gl, tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, null)
    if (mips) gl.generateMipmap(gl.TEXTURE_2D)
    const f = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, f)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('render target')
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
    return { tex, f, w, h, ts: [1 / w, 1 / h] }
  }

  pair(...a) {
    const x = this.fbo(...a), y = this.fbo(...a)
    return { read: x, write: y, swap() { const t = this.read; this.read = this.write; this.write = t } }
  }

  resize() {
    const gl = this.gl, c = this.canvas
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprMax)
    const W = Math.round(c.clientWidth * dpr), H = Math.round(c.clientHeight * dpr)
    if (W === this.W && H === this.H) return
    c.width = W; c.height = H; this.W = W; this.H = H
    const aspect = W / H
    if (this.dye && Math.abs(aspect - this.aspect) < 0.02) return
    this.aspect = aspect
    const land = W >= H
    const sw = land ? Math.round(this.simH * aspect) : this.simH, sh = land ? this.simH : Math.round(this.simH / aspect)
    const dw = land ? Math.round(this.dyeH * aspect) : this.dyeH, dh = land ? this.dyeH : Math.round(this.dyeH / aspect)
    const T = gl.HALF_FLOAT, L = gl.LINEAR
    this.vel = this.pair(sw, sh, gl.RG16F, gl.RG, T, L)
    this.prs = this.pair(sw, sh, gl.R16F, gl.RED, T, gl.NEAREST)
    this.dv = this.fbo(sw, sh, gl.R16F, gl.RED, T, gl.NEAREST)
    this.crl = this.fbo(sw, sh, gl.R16F, gl.RED, T, gl.NEAREST)
    this.dye = this.pair(dw, dh, gl.RGBA16F, gl.RGBA, T, L)
    this.tmp = this.pair(dw, dh, gl.RGBA16F, gl.RGBA, T, L)
    this.disp = this.fbo(dw, dh, gl.RGBA16F, gl.RGBA, T, L, true)
    this.simLow = this.fbo(sw, sh, gl.RGBA16F, gl.RGBA, T, L, true)
  }

  use(name) { const P = this.P[name]; this.gl.useProgram(P.p); return P.u }
  bind(unit, loc, tex) { const gl = this.gl; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc, unit) }
  draw(t) {
    const gl = this.gl
    if (t) { gl.bindFramebuffer(gl.FRAMEBUFFER, t.f); gl.viewport(0, 0, t.w, t.h) } else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, this.W, this.H) }
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  // One frame's worth of paint at a point. x, y in 0..1 from the top-left, r in
  // screen heights, c the pigment added this frame, water the outward push.
  // Negative water draws the wash back in, which is how scrolling up rewinds it.
  dose(x, y, r, c, water) { this.doses.push({ x, y, r, c, water }) }

  // Keep at least `target` pigment behind these rects so writing stays legible.
  hold(rects, mix, target, base = 0, heal = 0.16) { this.held = mix ? { rects, mix, target, base, heal } : null }

  // Multiply each pigment channel by a factor, to let an old colour dissolve.
  clearChannels(k) { this.clearing = k }

  // Draw the wash up from the bottom of the window, leaving a torn, wet edge.
  recede(y, k) { this.receding = { y, k } }

  // A clean sheet of paper and still water.
  clear() {
    const gl = this.gl
    gl.clearColor(0, 0, 0, 0)
    for (const t of [this.vel.read, this.vel.write, this.prs.read, this.prs.write, this.dye.read, this.dye.write, this.tmp.read, this.tmp.write]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.f)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    this.doses = []; this.held = null; this.receding = null; this.clearing = null; this.shiftAcc = 0; this.shiftUv = 0
  }

  // Cheaper settings for slower devices: fewer pixels first, then a coarser solve.
  degrade(tier) {
    this.dprMax = tier === 1 ? 1 : 0.8
    this.sim.iters = tier === 1 ? 16 : 12
    this.resize()
  }

  // Move pigment with the page, in whole dye texels so scrolling doesn't blur it.
  scroll(px) {
    this.shiftAcc += (px / this.canvas.clientHeight) * this.dye.read.h
    const n = Math.trunc(this.shiftAcc)
    this.shiftAcc -= n
    this.shiftUv += n / this.dye.read.h
  }

  stir(x, y, dx, dy, r = 0.0016) {
    const gl = this.gl, u = this.use('splat')
    this.bind(0, u.uTgt, this.vel.read.tex)
    gl.uniform2f(u.uP, x, 1 - y); gl.uniform3f(u.uC, dx, -dy, 0); gl.uniform1f(u.uR, r)
    gl.uniform1f(u.uAspect, this.aspect); gl.uniform1f(u.uRough, 0); gl.uniform1f(u.uSeed, 0)
    this.draw(this.vel.write); this.vel.swap()
  }

  step(dt) {
    const gl = this.gl, S = this.sim, ts = this.vel.read.ts
    this.t += dt
    gl.disable(gl.BLEND)
    let u
    const take = this.doses.splice(0, 8), N = take.length
    const Pa = new Float32Array(32), Ca = new Float32Array(32), Sa = new Float32Array(32)
    take.forEach((D, i) => {
      const y = 1 - D.y, r2 = D.r * D.r
      Pa.set([D.x, y, r2, 0], i * 4); Ca.set([D.c[0] || 0, D.c[1] || 0, D.c[2] || 0, D.c[3] || 0], i * 4); Sa.set([D.x, y, r2 * 1.4, D.water], i * 4)
    })
    if (N) {
      u = this.use('dose'); this.bind(0, u.uTgt, this.dye.read.tex); this.bind(1, u.uNoise, this.noise)
      gl.uniform4fv(u['uP[0]'], Pa); gl.uniform4fv(u['uC[0]'], Ca); gl.uniform1i(u.uN, N); gl.uniform1f(u.uAspect, this.aspect)
      this.draw(this.dye.write); this.dye.swap()
    }
    if (this.held) {
      const H = this.held, R = new Float32Array(32)
      H.rects.slice(0, 8).forEach((q, i) => R.set(q, i * 4))
      u = this.use('feed'); this.bind(0, u.uTgt, this.dye.read.tex); this.bind(1, u.uNoise, this.noise)
      gl.uniform4fv(u['uR[0]'], R); gl.uniform1i(u.uN, Math.min(H.rects.length, 8)); gl.uniform4fv(u.uC, H.mix)
      gl.uniform1f(u.uT, H.target); gl.uniform1f(u.uBase, H.base); gl.uniform1f(u.uRate, Math.min(dt * 1.6, 1)); gl.uniform1f(u.uHeal, H.heal); gl.uniform1f(u.uAspect, this.aspect)
      this.draw(this.dye.write); this.dye.swap()
    }
    if (this.clearing) {
      u = this.use('clear'); this.bind(0, u.uSrc, this.dye.read.tex); gl.uniform4fv(u.uK, this.clearing)
      this.draw(this.dye.write); this.dye.swap(); this.clearing = null
    }
    if (this.receding) {
      u = this.use('recede'); this.bind(0, u.uTgt, this.dye.read.tex); this.bind(1, u.uNoise, this.noise)
      gl.uniform1f(u.uY, 1 - this.receding.y); gl.uniform4fv(u.uK, this.receding.k); gl.uniform1f(u.uAspect, this.aspect)
      this.draw(this.dye.write); this.dye.swap(); this.receding = null
    }
    u = this.use('curl'); gl.uniform2fv(u.uTexel, ts); this.bind(0, u.uVel, this.vel.read.tex); this.draw(this.crl)
    u = this.use('vort'); gl.uniform2fv(u.uTexel, ts); this.bind(0, u.uVel, this.vel.read.tex); this.bind(1, u.uCurl, this.crl.tex)
    gl.uniform1f(u.uCurlK, S.curl); gl.uniform1f(u.uDt, dt); this.draw(this.vel.write); this.vel.swap()
    // pigment is heavier than water: this force is what makes plumes
    u = this.use('fade'); this.bind(0, u.uSrc, this.dye.read.tex); gl.uniform1f(u.uK, 1); this.draw(this.simLow)
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.simLow.tex); gl.generateMipmap(gl.TEXTURE_2D)
    u = this.use('force'); this.bind(0, u.uVel, this.vel.read.tex); this.bind(1, u.uDye, this.simLow.tex)
    gl.uniform1f(u.uB, S.buoy * this.energy); gl.uniform1f(u.uDt, dt); gl.uniform1f(u.uTime, this.t); gl.uniform1f(u.uTurb, S.turb * this.energy)
    gl.uniform1f(u.uDrag, S.drag); gl.uniform1f(u.uAspect, this.aspect); gl.uniform2fv(u.uWake, this.wake)
    this.draw(this.vel.write); this.vel.swap()
    u = this.use('div'); gl.uniform2fv(u.uTexel, ts); this.bind(0, u.uVel, this.vel.read.tex); this.bind(1, u.uNoise, this.noise)
    gl.uniform4fv(u['uS[0]'], Sa); gl.uniform1i(u.uN, N); gl.uniform1f(u.uAspect, this.aspect); this.draw(this.dv)
    u = this.use('fade'); this.bind(0, u.uSrc, this.prs.read.tex); gl.uniform1f(u.uK, S.pressure); this.draw(this.prs.write); this.prs.swap()
    u = this.use('pres'); gl.uniform2fv(u.uTexel, ts); this.bind(1, u.uDiv, this.dv.tex)
    for (let i = 0; i < S.iters; i++) { this.bind(0, u.uP, this.prs.read.tex); this.draw(this.prs.write); this.prs.swap() }
    u = this.use('grad'); gl.uniform2fv(u.uTexel, ts); this.bind(0, u.uP, this.prs.read.tex); this.bind(1, u.uVel, this.vel.read.tex)
    this.draw(this.vel.write); this.vel.swap()
    const sh = this.shiftUv; this.shiftUv = 0
    u = this.use('advect'); gl.uniform2fv(u.uTexel, ts); gl.uniform1f(u.uDt, dt); gl.uniform1f(u.uDiss, S.velDiss); gl.uniform2f(u.uShift, 0, sh)
    gl.uniform1f(u.uFibre, 0); gl.uniform2f(u.uFibreScale, 1, 1)
    this.bind(0, u.uVel, this.vel.read.tex); this.bind(1, u.uSrc, this.vel.read.tex); this.bind(2, u.uNoise, this.noise); this.draw(this.vel.write); this.vel.swap()
    // dye: forward, back, then correct the error so filaments survive
    const src = this.dye.read
    u = this.use('advect'); gl.uniform2fv(u.uTexel, ts); gl.uniform2f(u.uShift, 0, sh); gl.uniform1f(u.uDiss, 0); this.bind(0, u.uVel, this.vel.read.tex)
    gl.uniform1f(u.uFibre, S.fibre); gl.uniform2f(u.uFibreScale, src.w / 640, src.h / 640); this.bind(2, u.uNoise, this.noise)
    gl.uniform1f(u.uDt, dt); this.bind(1, u.uSrc, src.tex); this.draw(this.tmp.write); this.tmp.swap()
    gl.uniform1f(u.uDt, -dt); gl.uniform2f(u.uShift, 0, -sh); this.bind(1, u.uSrc, this.tmp.read.tex); this.draw(this.tmp.write)
    u = this.use('macc'); gl.uniform2fv(u.uTexel, ts); gl.uniform2fv(u.uDye, src.ts); gl.uniform2f(u.uShift, 0, sh); gl.uniform1f(u.uDt, dt); gl.uniform1f(u.uDiss, S.dyeDiss); gl.uniform1f(u.uK, 0.92)
    this.bind(0, u.uVel, this.vel.read.tex); this.bind(1, u.uSrc, src.tex); this.bind(2, u.uFwd, this.tmp.read.tex); this.bind(3, u.uBack, this.tmp.write.tex)
    this.draw(this.dye.write); this.dye.swap()
  }

  render() {
    const gl = this.gl, L = this.look
    let u = this.use('fade'); this.bind(0, u.uSrc, this.dye.read.tex); gl.uniform1f(u.uK, 1); this.draw(this.disp)
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.disp.tex); gl.generateMipmap(gl.TEXTURE_2D)
    u = this.use('render'); this.bind(0, u.uDye, this.disp.tex); this.bind(1, u.uNoise, this.noise)
    gl.uniform2f(u.uRes, this.W, this.H); gl.uniform2f(u.uDyeSize, this.disp.w, this.disp.h)
    gl.uniform3fv(u['uA[0]'], L.pigments.flat()); gl.uniform3fv(u.uPaper, L.paper)
    gl.uniform1f(u.uEdge, L.edge); gl.uniform1f(u.uRim, L.rim); gl.uniform1f(u.uHalo, L.halo); gl.uniform1f(u.uHalo2, L.halo2)
    gl.uniform1f(u.uGrain, L.grain); gl.uniform1f(u.uMottle, L.mottle); gl.uniform1f(u.uMax, L.max); gl.uniform1f(u.uDen, L.den)
    this.draw(null)
  }
}
