precision mediump float;  

attribute vec3 a_position;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewProjection;

#include<skeleton.vertex>

varying vec3 v_worldPosition;

void main(void) {

    vec4 position = vec4(a_position,1.0);

    position = skeletonAnimation(position);

    #ifdef HAS_PARTICLE_ANIMATOR
        position = particleAnimation(position);
    #endif

    vec4 worldPosition = u_modelMatrix * vec4(position, 1.0);
    gl_Position = u_viewProjection * worldPosition;
    v_worldPosition = worldPosition.xyz;
}