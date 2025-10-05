#version 300 es
precision highp float;
precision mediump sampler3D;
 
uniform vec3 lightInvDirW;
uniform vec3 grassColor;
uniform vec3 dirtColor;
uniform vec3 sandColor;

in vec3 vPositionL;
in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec2 vUv2;
in vec4 vColor;

out vec4 outColor;
 
void main() {
   vec3 color = vec3(1., 1., 1.);
   float sunLightFactor = (dot(vNormalW, lightInvDirW) + 1.) * 0.5;
   sunLightFactor = round(sunLightFactor * 6.) / 6.;

   float diff = vNormalW.y;
   if (diff > 0.9) {
      color = grassColor;
   }
   else {
      color = dirtColor;
   }

   if (vPositionW.y < 0.17) {
      color = sandColor;
   }

   // show grid
   float nrmzdX = vPositionW.x / 0.672;
   float nrmzdZ = vPositionW.z / 0.672;
   float dx = nrmzdX + 0.5 - floor(nrmzdX + 0.5);
   float dz = nrmzdZ + 0.5 - floor(nrmzdZ + 0.5);

   if (dx < 0.005 || dx > 0.995) {
      color = vec3(0., 0., 0.);
   }
   if (dz < 0.005 || dz > 0.995) {
      color = vec3(0., 0., 0.);
   }

   outColor = vec4(color * sunLightFactor, 1.);
}