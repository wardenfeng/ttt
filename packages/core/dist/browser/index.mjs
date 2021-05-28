/*!
 * @feng3d/core - v0.3.3
 *
 * @feng3d/core is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { shaderlib, RenderAtomic, CullFace, Index, Attribute, TextureFormat, TextureDataType, TextureMinFilter, TextureMagFilter, TextureWrap, TextureType, RenderMode, Shader, FrameBuffer, RenderBuffer, Texture, GL, BlendFactor } from '@feng3d/renderer';
import { globalEmitter, EventEmitter, event } from '@feng3d/event';
import { oav, ov } from '@feng3d/objectview';
import { serialize, serialization } from '@feng3d/serialization';
import { watch, watcher } from '@feng3d/watcher';
import { mathUtil, classUtils, __class__, dataTransform, lazy } from '@feng3d/polyfill';
import { Box3, Quaternion, Matrix4x4, Vector3, Ray3, Vector2, Color4, Rectangle, Color3, ColorKeywords, Vector4, Frustum, defaultRotationOrder, CoordinateSystem, RotationOrder, Plane } from '@feng3d/math';
import { loader, fs, pathUtils } from '@feng3d/filesystem';
import { task } from '@feng3d/task';
import { windowEventProxy } from '@feng3d/shortcut';

shaderlib.shaderConfig = {
    "shaders": {
        "color": {
            "fragment": "precision mediump float;\r\n\r\nuniform vec4 u_diffuseInput;\r\n\r\nvoid main() \r\n{\r\n    gl_FragColor = u_diffuseInput;\r\n}\r\n",
            "vertex": "attribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main()\r\n{\r\n    vec4 worldPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * worldPosition;\r\n}"
        },
        "mouse": {
            "fragment": "precision highp float;\r\n\r\nuniform int u_objectID;\r\n\r\nvoid main()\r\n{\r\n    //支持 255*255*255*255 个索引\r\n    const float invColor = 1.0/255.0;\r\n    float temp = float(u_objectID);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.x = fract(temp);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.y = fract(temp);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.z = fract(temp);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.w = fract(temp);\r\n}",
            "vertex": "attribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main()\r\n{\r\n    vec4 worldPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * worldPosition;\r\n}"
        },
        "outline": {
            "fragment": "precision mediump float;\r\n\r\nuniform vec4 u_outlineColor;\r\n\r\nvoid main() \r\n{\r\n    gl_FragColor = u_outlineColor;\r\n}",
            "vertex": "precision mediump float;  \r\n\r\n//坐标属性\r\nattribute vec3 a_position;\r\nattribute vec3 a_normal;\r\n\r\n#include<uv_pars_vert>\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_ITModelMatrix;\r\nuniform vec3 u_cameraPos;\r\nuniform mat4 u_viewProjection;\r\nuniform float u_scaleByDepth;\r\nuniform float u_outlineMorphFactor;\r\n\r\n#include<skeleton_pars_vert>\r\n#include<particle_pars_vert>\r\n\r\nuniform float u_outlineSize;\r\n\r\nvoid main() \r\n{\r\n    vec4 position = vec4(a_position, 1.0);\r\n\r\n    #include<uv_vert>\r\n\r\n    #include<skeleton_vert>\r\n    #include<particle_vert>\r\n    \r\n    vec3 normal = a_normal;\r\n\r\n    //全局坐标\r\n    vec4 worldPosition = u_modelMatrix * position;\r\n    //全局法线\r\n    vec3 globalNormal = normalize((u_ITModelMatrix * vec4(normal, 0.0)).xyz);\r\n\r\n    float depth = distance(worldPosition.xyz , u_cameraPos.xyz);\r\n    \r\n    vec3 offsetDir = mix(globalNormal, normalize(worldPosition.xyz), u_outlineMorphFactor);\r\n    //摄像机远近保持粗细一致\r\n    offsetDir = offsetDir * depth * u_scaleByDepth;\r\n    //描边宽度\r\n    offsetDir = offsetDir * u_outlineSize;\r\n\r\n    worldPosition.xyz = worldPosition.xyz + offsetDir;//\r\n\r\n    //计算投影坐标\r\n    gl_Position = u_viewProjection * worldPosition;\r\n}"
        },
        "Particles_Additive": {
            "fragment": "precision mediump float;\r\n\r\nvarying vec2 v_uv;\r\n\r\nuniform vec4 _TintColor;\r\nuniform sampler2D _MainTex;\r\nuniform vec4 _MainTex_ST;\r\n\r\n#include<particle_pars_frag>\r\n\r\nvoid main()\r\n{\r\n    vec4 finalColor = vec4(1.0, 1.0, 1.0, 1.0);\r\n\r\n    #include<particle_frag>\r\n\r\n    vec2 uv = v_uv;\r\n    uv = uv * _MainTex_ST.xy + _MainTex_ST.zw;\r\n    finalColor = 2.0 * finalColor * _TintColor * texture2D(_MainTex, uv);\r\n\r\n    gl_FragColor = finalColor;\r\n}",
            "vertex": "precision mediump float;  \r\n\r\n//坐标属性\r\nattribute vec3 a_position;\r\nattribute vec2 a_uv;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_ITModelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvarying vec2 v_uv;\r\n\r\n#include<particle_pars_vert>\r\n\r\nvoid main() \r\n{\r\n    vec4 position = vec4(a_position, 1.0);\r\n    //输出uv\r\n    v_uv = a_uv;\r\n    \r\n    #include<particle_vert>\r\n\r\n    //获取全局坐标\r\n    vec4 worldPosition = u_modelMatrix * position;\r\n    //计算投影坐标\r\n    gl_Position = u_viewProjection * worldPosition;\r\n}"
        },
        "Particles_AlphaBlendedPremultiply": {
            "fragment": "precision mediump float;\r\n\r\nvarying vec2 v_uv;\r\n\r\nuniform sampler2D _MainTex;\r\nuniform vec4 _MainTex_ST;\r\n\r\n#include<particle_pars_frag>\r\n\r\nvoid main()\r\n{\r\n    vec4 finalColor = vec4(1.0, 1.0, 1.0, 1.0);\r\n\r\n    #include<particle_frag>\r\n\r\n    vec2 uv = v_uv;\r\n    uv = uv * _MainTex_ST.xy + _MainTex_ST.zw;\r\n\r\n    finalColor = finalColor *  texture2D(_MainTex, uv) * finalColor.a;\r\n    gl_FragColor = finalColor;\r\n}",
            "vertex": "precision mediump float;  \r\n\r\n//坐标属性\r\nattribute vec3 a_position;\r\nattribute vec2 a_uv;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_ITModelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvarying vec2 v_uv;\r\n\r\n#include<particle_pars_vert>\r\n\r\nvoid main() \r\n{\r\n    vec4 position = vec4(a_position, 1.0);\r\n    //输出uv\r\n    v_uv = a_uv;\r\n    \r\n    #include<particle_vert>\r\n\r\n    //获取全局坐标\r\n    vec4 worldPosition = u_modelMatrix * position;\r\n    //计算投影坐标\r\n    gl_Position = u_viewProjection * worldPosition;\r\n}"
        },
        "point": {
            "fragment": "precision mediump float;\r\n\r\nvarying vec4 v_color;\r\nuniform vec4 u_color;\r\n\r\nvoid main() \r\n{\r\n    gl_FragColor = v_color * u_color;\r\n}\r\n",
            "vertex": "attribute vec3 a_position;\r\nattribute vec4 a_color;\r\n\r\nuniform float u_PointSize;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvarying vec4 v_color;\r\n\r\nvoid main() \r\n{\r\n    vec4 worldPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * worldPosition;\r\n    gl_PointSize = u_PointSize;\r\n\r\n    v_color = a_color;\r\n}"
        },
        "segment": {
            "fragment": "precision mediump float;\r\n\r\nvarying vec4 v_color;\r\n\r\nuniform vec4 u_segmentColor;\r\n\r\nvoid main() \r\n{\r\n    gl_FragColor = v_color * u_segmentColor;\r\n}",
            "vertex": "attribute vec3 a_position;\r\nattribute vec4 a_color;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvarying vec4 v_color;\r\n\r\nvoid main() \r\n{\r\n    gl_Position = u_viewProjection * u_modelMatrix * vec4(a_position, 1.0);\r\n    v_color = a_color;\r\n}"
        },
        "shadow": {
            "fragment": "precision mediump float;\r\n\r\nvarying vec3 v_worldPosition;\r\n\r\nuniform int u_lightType;\r\nuniform vec3 u_lightPosition;\r\nuniform float u_shadowCameraNear;\r\nuniform float u_shadowCameraFar;\r\n\r\n// @see https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/packing.glsl\r\nconst float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)\r\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );\r\nconst float ShiftRight8 = 1. / 256.;\r\nvec4 packDepthToRGBA( const in float v ) \r\n{\r\n\tvec4 r = vec4( fract( v * PackFactors ), v );\r\n\tr.yzw -= r.xyz * ShiftRight8; // tidy overflow\r\n\treturn r * PackUpscale;\r\n}\r\n\r\nvoid main() \r\n{\r\n    vec3 lightToPosition = (v_worldPosition - u_lightPosition);\r\n    float dp = ( length( lightToPosition ) - u_shadowCameraNear ) / ( u_shadowCameraFar - u_shadowCameraNear ); // need to clamp?\r\n    gl_FragColor = packDepthToRGBA( dp );\r\n}",
            "vertex": "precision mediump float;  \r\n\r\nattribute vec3 a_position;\r\n\r\n#include<uv_pars_vert>\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\n#include<skeleton_pars_vert>\r\n#include<particle_pars_vert>\r\n\r\nvarying vec3 v_worldPosition;\r\n\r\nvoid main() \r\n{\r\n    vec4 position = vec4(a_position, 1.0);\r\n\r\n    #include<uv_vert>\r\n\r\n    #include<skeleton_vert>\r\n    #include<particle_vert>\r\n\r\n    vec4 worldPosition = u_modelMatrix * position;\r\n    gl_Position = u_viewProjection * worldPosition;\r\n    v_worldPosition = worldPosition.xyz;\r\n}"
        },
        "skybox": {
            "fragment": "precision highp float;\r\n\r\nuniform samplerCube s_skyboxTexture;\r\nuniform vec3 u_cameraPos;\r\n\r\nvarying vec3 v_worldPos;\r\n\r\nvoid main()\r\n{\r\n    vec3 cameraDir = normalize(u_cameraPos.xyz - v_worldPos);\r\n    gl_FragColor = textureCube(s_skyboxTexture, -cameraDir);\r\n}",
            "vertex": "attribute vec3 a_position;\r\n\r\nuniform vec3 u_cameraPos;\r\nuniform mat4 u_viewProjection;\r\n\r\nuniform float u_skyBoxSize;\r\n\r\nvarying vec3 v_worldPos;\r\n\r\nvoid main()\r\n{\r\n    vec3 worldPos = a_position.xyz * u_skyBoxSize + u_cameraPos.xyz;\r\n    gl_Position = u_viewProjection * vec4(worldPos.xyz, 1.0);\r\n    v_worldPos = worldPos;\r\n}"
        },
        "standard": {
            "fragment": "precision mediump float;\r\n\r\nvarying vec2 v_uv;\r\nvarying vec3 v_worldPosition;\r\nuniform vec3 u_cameraPos;\r\n\r\n#include<color_pars_frag>\r\n\r\n#include<normal_pars_frag>\r\n#include<diffuse_pars_frag>\r\n#include<alphatest_pars_frag>\r\n\r\n#include<ambient_pars_frag>\r\n#include<specular_pars_frag>\r\n#include<lights_pars_frag>\r\n\r\n#include<envmap_pars_frag>\r\n#include<particle_pars_frag>\r\n#include<fog_pars_frag>\r\n\r\nvoid main()\r\n{\r\n    vec4 finalColor = vec4(1.0,1.0,1.0,1.0);\r\n\r\n    #include<color_frag>\r\n\r\n    #include<normal_frag>\r\n    #include<diffuse_frag>\r\n    #include<alphatest_frag>\r\n\r\n    #include<ambient_frag>\r\n    #include<specular_frag>\r\n    #include<lights_frag>\r\n\r\n    #include<envmap_frag>\r\n    #include<particle_frag>\r\n    #include<fog_frag>\r\n\r\n    gl_FragColor = finalColor;\r\n}",
            "vertex": "precision mediump float;  \r\n\r\n#include<position_pars_vert>\r\n#include<normal_pars_vert>\r\n#include<tangent_pars_vert>\r\n#include<color_pars_vert>\r\n//\r\n#include<skeleton_pars_vert>\r\n#include<particle_pars_vert>\r\n//\r\n#include<worldposition_pars_vert>\r\n#include<project_pars_vert>\r\n//\r\n#include<uv_pars_vert>\r\n#include<normalmap_pars_vert>\r\n//\r\n#include<lights_pars_vert>\r\n#include<pointsize_pars_vert>\r\n\r\nvoid main()\r\n{\r\n    // 初始化\r\n    #include<position_vert>\r\n    #include<normal_vert>\r\n    #include<tangent_vert>\r\n    #include<color_vert>\r\n    #include<uv_vert>\r\n    // 动画\r\n    #include<skeleton_vert>\r\n    #include<particle_vert>\r\n    // 投影\r\n    #include<worldposition_vert>\r\n    #include<project_vert>\r\n    // \r\n    #include<normalmap_vert>\r\n    //\r\n    #include<lights_vert>\r\n    #include<pointsize_vert>\r\n}"
        },
        "terrain": {
            "fragment": "precision mediump float;\r\n\r\nvarying vec2 v_uv;\r\nvarying vec3 v_worldPosition;\r\nuniform vec3 u_cameraPos;\r\n\r\n#include<normal_pars_frag>\r\n#include<diffuse_pars_frag>\r\n#include<alphatest_pars_frag>\r\n\r\n#include<terrain_pars_frag>\r\n\r\n#include<ambient_pars_frag>\r\n#include<specular_pars_frag>\r\n#include<lights_pars_frag>\r\n\r\n#include<envmap_pars_frag>\r\n#include<fog_pars_frag>\r\n\r\nvoid main()\r\n{\r\n    vec4 finalColor = vec4(1.0, 1.0, 1.0, 1.0);\r\n\r\n    #include<normal_frag>\r\n    #include<diffuse_frag>\r\n    #include<alphatest_frag>\r\n\r\n    #include<terrain_frag>\r\n\r\n    #include<ambient_frag>\r\n    #include<specular_frag>\r\n    #include<lights_frag>\r\n\r\n    #include<envmap_frag>\r\n    #include<fog_frag>\r\n\r\n    gl_FragColor = finalColor;\r\n}",
            "vertex": "precision mediump float;  \r\n\r\n#include<position_pars_vert>\r\n#include<normal_pars_vert>\r\n#include<tangent_pars_vert>\r\n#include<uv_pars_vert>\r\n//\r\n#include<worldposition_pars_vert>\r\n#include<project_pars_vert>\r\n//\r\n#include<normalmap_pars_vert>\r\n//\r\n#include<lights_pars_vert>\r\n#include<pointsize_pars_vert>\r\n\r\nvoid main() \r\n{\r\n    // 初始化\r\n    #include<position_vert>\r\n    #include<normal_vert>\r\n    #include<tangent_vert>\r\n    #include<uv_vert>\r\n    // 投影\r\n    #include<worldposition_vert>\r\n    #include<project_vert>\r\n    // \r\n    #include<normalmap_vert>\r\n    //\r\n    #include<lights_vert>\r\n    #include<pointsize_vert>\r\n}"
        },
        "texture": {
            "fragment": "precision mediump float;\r\n\r\nuniform sampler2D s_texture;\r\nvarying vec2 v_uv;\r\n\r\nuniform vec4 u_color;\r\n\r\nvoid main() {\r\n\r\n    vec4 color = texture2D(s_texture, v_uv);\r\n    gl_FragColor = color * u_color;\r\n}\r\n",
            "vertex": "attribute vec3 a_position;\r\nattribute vec2 a_uv;\r\n\r\nvarying vec2 v_uv;\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main() \r\n{\r\n    gl_Position = u_viewProjection * u_modelMatrix * vec4(a_position, 1.0);\r\n    v_uv = a_uv;\r\n}"
        },
        "water": {
            "fragment": "precision mediump float;  \r\n\r\nuniform vec3 u_cameraPos;\r\n\r\nvarying vec4 v_mirrorCoord;\r\nvarying vec4 v_worldPosition;\r\n\r\nuniform sampler2D s_mirrorSampler;\r\nuniform sampler2D s_normalSampler;\r\n\r\nuniform float u_alpha;\r\nuniform float u_time;\r\nuniform float u_size;\r\nuniform float u_distortionScale;\r\nuniform vec3 u_sunColor;\r\nuniform vec3 u_sunDirection;\r\nuniform vec3 u_waterColor;\r\n\r\nvec4 getNoise( vec2 uv ) \r\n{\r\n\tvec2 uv0 = ( uv / 103.0 ) + vec2(u_time / 17.0, u_time / 29.0);\r\n\tvec2 uv1 = uv / 107.0-vec2( u_time / -19.0, u_time / 31.0 );\r\n\tvec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( u_time / 101.0, u_time / 97.0 );\r\n\tvec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( u_time / 109.0, u_time / -113.0 );\r\n\tvec4 noise = texture2D( s_normalSampler, uv0 ) +\r\n\t\ttexture2D( s_normalSampler, uv1 ) +\r\n\t\ttexture2D( s_normalSampler, uv2 ) +\r\n\t\ttexture2D( s_normalSampler, uv3 );\r\n\treturn noise * 0.5 - 1.0;\r\n}\r\n\r\nvoid sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) \r\n{\r\n\tvec3 reflection = normalize( reflect( -u_sunDirection, surfaceNormal ) );\r\n\tfloat direction = max( 0.0, dot( eyeDirection, reflection ) );\r\n\tspecularColor += pow( direction, shiny ) * u_sunColor * spec;\r\n\tdiffuseColor += max( dot( u_sunDirection, surfaceNormal ), 0.0 ) * u_sunColor * diffuse;\r\n}\r\n\r\nvoid main() \r\n{\r\n\tvec4 noise = getNoise( v_worldPosition.xz * u_size );\r\n\tvec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );\r\n\tvec3 diffuseLight = vec3(0.0);\r\n\tvec3 specularLight = vec3(0.0);\r\n\tvec3 worldToEye = u_cameraPos-v_worldPosition.xyz;\r\n\tvec3 eyeDirection = normalize( worldToEye );\r\n\tsunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );\r\n\tfloat distance = length(worldToEye);\r\n\tvec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * u_distortionScale;\r\n\tvec3 reflectionSample = vec3( texture2D( s_mirrorSampler, v_mirrorCoord.xy / v_mirrorCoord.z + distortion ) );\r\n\tfloat theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );\r\n\tfloat rf0 = 0.3;\r\n\tfloat reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );\r\n\tvec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * u_waterColor;\r\n\r\n\tfloat shadowMask = 1.0;\r\n\t// float shadowMask = getShadowMask();\r\n\r\n\tvec3 albedo = mix( ( u_sunColor * diffuseLight * 0.3 + scatter ) * shadowMask, ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);\r\n\tvec3 outgoingLight = albedo;\r\n\tgl_FragColor = vec4( outgoingLight, u_alpha );\r\n\r\n\t// debug\r\n\t// gl_FragColor = texture2D( s_mirrorSampler, (v_mirrorCoord.xy / v_mirrorCoord.z + 1.0) / 2.0 );\r\n\t// gl_FragColor = vec4( reflectionSample, 1.0 );\r\n\t// gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\r\n}",
            "vertex": "attribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nuniform mat4 u_textureMatrix;\r\n\r\nvarying vec4 v_mirrorCoord;\r\nvarying vec4 v_worldPosition;\r\n\r\nvoid main() \r\n{\r\n\tvec4 position = vec4(a_position, 1.0);\r\n\t//获取全局坐标\r\n    vec4 worldPosition = u_modelMatrix * position;\r\n    //计算投影坐标\r\n    gl_Position = u_viewProjection * worldPosition;\r\n\t\r\n\tv_worldPosition = worldPosition;\r\n\tv_mirrorCoord = u_textureMatrix * worldPosition;\r\n}"
        },
        "wireframe": {
            "fragment": "precision mediump float;\r\n\r\nuniform vec4 u_wireframeColor;\r\n\r\nvoid main() \r\n{\r\n    gl_FragColor = u_wireframeColor;\r\n}",
            "vertex": "precision mediump float;  \r\n\r\nattribute vec3 a_position;\r\nattribute vec4 a_color;\r\n\r\n#include<uv_pars_vert>\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\n#include<skeleton_pars_vert>\r\n#include<particle_pars_vert>\r\n\r\nvoid main() \r\n{\r\n    vec4 position = vec4(a_position, 1.0);\r\n\r\n    #include<uv_vert>\r\n\r\n    #include<skeleton_vert>\r\n    #include<particle_vert>\r\n\r\n    gl_Position = u_viewProjection * u_modelMatrix * position;\r\n}"
        }
    },
    "modules": {
        "alphatest_frag": "if(diffuseColor.w < u_alphaThreshold) discard;",
        "alphatest_pars_frag": "uniform float u_alphaThreshold;",
        "ambient_frag": "//环境光\r\nvec3 ambientColor = u_ambient.w * u_ambient.xyz * u_sceneAmbientColor.xyz * u_sceneAmbientColor.w;\r\nambientColor = ambientColor * texture2D(s_ambient, v_uv).xyz;",
        "ambient_pars_frag": "uniform vec4 u_sceneAmbientColor;\r\n\r\n//环境\r\nuniform vec4 u_ambient;\r\nuniform sampler2D s_ambient;",
        "cartoon_pars_frag": "#ifdef IS_CARTOON\r\n    #ifdef cartoon_Anti_aliasing\r\n        #extension GL_OES_standard_derivatives : enable\r\n    #endif\r\n\r\n    uniform vec4 u_diffuseSegment;\r\n    uniform vec4 u_diffuseSegmentValue;\r\n    uniform float u_specularSegment;\r\n\r\n    //漫反射\r\n    float cartoonLightDiffuse(vec3 normal,vec3 lightDir)\r\n    {\r\n        float diff = dot(normal, lightDir);\r\n        diff = diff * 0.5 + 0.5;\r\n\r\n        #ifdef cartoon_Anti_aliasing\r\n            float w = fwidth(diff) * 2.0;\r\n            if (diff < u_diffuseSegment.x + w) \r\n            {\r\n                diff = mix(u_diffuseSegment.x, u_diffuseSegment.y, smoothstep(u_diffuseSegment.x - w, u_diffuseSegment.x + w, diff));\r\n            //  diff = mix(u_diffuseSegment.x, u_diffuseSegment.y, clamp(0.5 * (diff - u_diffuseSegment.x) / w, 0, 1));\r\n            } else if (diff < u_diffuseSegment.y + w) \r\n            {\r\n                diff = mix(u_diffuseSegment.y, u_diffuseSegment.z, smoothstep(u_diffuseSegment.y - w, u_diffuseSegment.y + w, diff));\r\n            //  diff = mix(u_diffuseSegment.y, u_diffuseSegment.z, clamp(0.5 * (diff - u_diffuseSegment.y) / w, 0, 1));\r\n            } else if (diff < u_diffuseSegment.z + w) \r\n            {\r\n                diff = mix(u_diffuseSegment.z, u_diffuseSegment.w, smoothstep(u_diffuseSegment.z - w, u_diffuseSegment.z + w, diff));\r\n            //  diff = mix(u_diffuseSegment.z, u_diffuseSegment.w, clamp(0.5 * (diff - u_diffuseSegment.z) / w, 0, 1));\r\n            } else \r\n            {\r\n                diff = u_diffuseSegment.w;\r\n            }\r\n        #else\r\n            if (diff < u_diffuseSegment.x) \r\n            {\r\n                diff = u_diffuseSegmentValue.x;\r\n            } else if (diff < u_diffuseSegment.y) \r\n            {\r\n                diff = u_diffuseSegmentValue.y;\r\n            } else if (diff < u_diffuseSegment.z) \r\n            {\r\n                diff = u_diffuseSegmentValue.z;\r\n            } else \r\n            {\r\n                diff = u_diffuseSegmentValue.w;\r\n            }\r\n        #endif\r\n\r\n        return diff;\r\n    }\r\n\r\n    //镜面反射漫反射\r\n    float cartoonLightSpecular(vec3 normal,vec3 lightDir,vec3 cameraDir,float glossiness)\r\n    {\r\n        vec3 halfVec = normalize(lightDir + cameraDir);\r\n        float specComp = max(dot(normal,halfVec),0.0);\r\n        specComp = pow(specComp, glossiness);\r\n\r\n        #ifdef cartoon_Anti_aliasing\r\n            float w = fwidth(specComp);\r\n            if (specComp < u_specularSegment + w) \r\n            {\r\n                specComp = mix(0.0, 1.0, smoothstep(u_specularSegment - w, u_specularSegment + w, specComp));\r\n                // specComp = smoothstep(u_specularSegment - w, u_specularSegment + w, specComp);\r\n            } else \r\n            {\r\n                specComp = 1.0;\r\n            }\r\n        #else\r\n            if(specComp < u_specularSegment)\r\n            {\r\n                specComp = 0.0;\r\n            }else\r\n            {\r\n                specComp = 1.0;\r\n            }\r\n        #endif\r\n\r\n        return specComp;\r\n    }\r\n#endif",
        "color_frag": "#ifdef HAS_a_color\r\nfinalColor = v_color * finalColor;\r\n#endif\r\n",
        "color_pars_frag": "#ifdef HAS_a_color\r\nvarying vec4 v_color;\r\n#endif\r\n",
        "color_pars_vert": "#ifdef HAS_a_color\r\nattribute vec4 a_color;\r\n\r\nvarying vec4 v_color;\r\n#endif\r\n",
        "color_vert": "#ifdef HAS_a_color\r\nv_color = a_color;\r\n#endif",
        "diffuse_frag": "//获取漫反射基本颜色\r\nvec4 diffuseColor = u_diffuse;\r\ndiffuseColor = finalColor * diffuseColor * texture2D(s_diffuse, v_uv);\r\n\r\nfinalColor = diffuseColor;",
        "diffuse_pars_frag": "//漫反射\r\nuniform vec4 u_diffuse;\r\nuniform sampler2D s_diffuse;",
        "envmap_frag": "finalColor = envmapMethod(finalColor);",
        "envmap_pars_frag": "uniform samplerCube s_envMap;\r\nuniform float u_reflectivity;\r\n\r\nvec4 envmapMethod(vec4 finalColor)\r\n{\r\n    vec3 cameraToVertex = normalize( v_worldPosition - u_cameraPos );\r\n    vec3 reflectVec = reflect( cameraToVertex, v_normal );\r\n    vec4 envColor = textureCube( s_envMap, reflectVec );\r\n    finalColor.xyz *= envColor.xyz * u_reflectivity;\r\n    return finalColor;\r\n}",
        "fog_frag": "finalColor = fogMethod(finalColor);",
        "fog_pars_frag": "#define FOGMODE_NONE    0.\r\n#define FOGMODE_EXP     1.\r\n#define FOGMODE_EXP2    2.\r\n#define FOGMODE_LINEAR  3.\r\n#define E 2.71828\r\n\r\nuniform float u_fogMode;\r\nuniform float u_fogMinDistance;\r\nuniform float u_fogMaxDistance;\r\nuniform float u_fogDensity;\r\nuniform vec3 u_fogColor;\r\n\r\nfloat CalcFogFactor(float fogDistance)\r\n{\r\n\tfloat fogCoeff = 1.0;\r\n\tif (FOGMODE_LINEAR == u_fogMode)\r\n\t{\r\n\t\tfogCoeff = (u_fogMaxDistance - fogDistance) / (u_fogMaxDistance - u_fogMinDistance);\r\n\t}\r\n\telse if (FOGMODE_EXP == u_fogMode)\r\n\t{\r\n\t\tfogCoeff = 1.0 / pow(E, fogDistance * u_fogDensity);\r\n\t}\r\n\telse if (FOGMODE_EXP2 == u_fogMode)\r\n\t{\r\n\t\tfogCoeff = 1.0 / pow(E, fogDistance * fogDistance * u_fogDensity * u_fogDensity);\r\n\t}\r\n\r\n\treturn clamp(fogCoeff, 0.0, 1.0);\r\n}\r\n\r\nvec4 fogMethod(vec4 color)\r\n{\r\n    vec3 fogDistance = u_cameraPos - v_worldPosition.xyz;\r\n\tfloat fog = CalcFogFactor(length(fogDistance));\r\n\tcolor.rgb = fog * color.rgb + (1.0 - fog) * u_fogColor;\r\n    return color;\r\n}",
        "lights_frag": "//渲染灯光\r\n#if NUM_LIGHT > 0\r\n    finalColor.xyz = lightShading(normal, diffuseColor.xyz, specularColor, ambientColor, glossiness);\r\n#endif",
        "lights_pars_frag": "#if NUM_POINTLIGHT > 0\r\n    // 点光源\r\n    struct PointLight\r\n    {\r\n        // 位置\r\n        vec3 position;\r\n        // 颜色\r\n        vec3 color;\r\n        // 强度\r\n        float intensity;\r\n        // 范围\r\n        float range;\r\n    };\r\n    // 点光源列表\r\n    uniform PointLight u_pointLights[NUM_POINTLIGHT];\r\n#endif\r\n\r\n#if NUM_SPOT_LIGHTS > 0\r\n    // 聚光灯\r\n    struct SpotLight\r\n    {\r\n        // 位置\r\n        vec3 position;\r\n        // 颜色\r\n        vec3 color;\r\n        // 强度\r\n        float intensity;\r\n        // 范围\r\n        float range;\r\n        // 方向\r\n        vec3 direction;\r\n        // 椎体cos值\r\n        float coneCos;\r\n        // 半影cos\r\n        float penumbraCos;\r\n    };\r\n    // 方向光源列表\r\n    uniform SpotLight u_spotLights[ NUM_SPOT_LIGHTS ];\r\n#endif\r\n\r\n#if NUM_DIRECTIONALLIGHT > 0\r\n    // 方向光源\r\n    struct DirectionalLight\r\n    {\r\n        // 方向\r\n        vec3 direction;\r\n        // 颜色\r\n        vec3 color;\r\n        // 强度\r\n        float intensity;\r\n    };\r\n    // 方向光源列表\r\n    uniform DirectionalLight u_directionalLights[ NUM_DIRECTIONALLIGHT ];\r\n#endif\r\n\r\n//卡通\r\n#include<cartoon_pars_frag>\r\n\r\n#include<shadowmap_pars_frag>\r\n\r\n//计算光照漫反射系数\r\nfloat calculateLightDiffuse(vec3 normal,vec3 lightDir)\r\n{\r\n    #ifdef IS_CARTOON\r\n        return cartoonLightDiffuse(normal,lightDir);\r\n    #else\r\n        return clamp(dot(normal,lightDir),0.0,1.0);\r\n    #endif\r\n}\r\n\r\n//计算光照镜面反射系数\r\nfloat calculateLightSpecular(vec3 normal,vec3 lightDir,vec3 viewDir,float glossiness)\r\n{\r\n    #ifdef IS_CARTOON\r\n        return cartoonLightSpecular(normal,lightDir,viewDir,glossiness);\r\n    #else\r\n        vec3 halfVec = normalize(lightDir + viewDir);\r\n        float specComp = max(dot(normal,halfVec),0.0);\r\n        specComp = pow(specComp, glossiness);\r\n\r\n        return specComp;\r\n    #endif\r\n}\r\n\r\n//根据距离计算衰减\r\nfloat computeDistanceLightFalloff(float lightDistance, float range)\r\n{\r\n    #ifdef USEPHYSICALLIGHTFALLOFF\r\n        float lightDistanceFalloff = 1.0 / ((lightDistance * lightDistance + 0.0001));\r\n    #else\r\n        float lightDistanceFalloff = max(0., 1.0 - lightDistance / range);\r\n    #endif\r\n    \r\n    return lightDistanceFalloff;\r\n}\r\n\r\n//渲染点光源\r\nvec3 lightShading(vec3 normal, vec3 diffuseColor, vec3 specularColor, vec3 ambientColor, float glossiness)\r\n{\r\n    //视线方向\r\n    vec3 viewDir = normalize(u_cameraPos - v_worldPosition);\r\n\r\n    vec3 resultColor = vec3(0.0,0.0,0.0);\r\n    \r\n    #if NUM_POINTLIGHT > 0\r\n        PointLight pointLight;\r\n        for(int i = 0;i<NUM_POINTLIGHT;i++)\r\n        {\r\n            pointLight = u_pointLights[i];\r\n            //\r\n            vec3 lightOffset = pointLight.position - v_worldPosition;\r\n            //光照方向\r\n            vec3 lightDir = normalize(lightOffset);\r\n            //灯光颜色\r\n            vec3 lightColor = pointLight.color;\r\n            //灯光强度\r\n            float lightIntensity = pointLight.intensity;\r\n            float falloff = computeDistanceLightFalloff(length(lightOffset), pointLight.range);\r\n            float diffuse = calculateLightDiffuse(normal, lightDir);\r\n            float specular = calculateLightSpecular(normal, lightDir, viewDir, glossiness);\r\n            float shadow = 1.0;\r\n            \r\n            resultColor += (diffuse * diffuseColor + specular * specularColor) * lightColor * lightIntensity * falloff * shadow;\r\n        }\r\n    #endif\r\n\r\n    #if NUM_POINTLIGHT_CASTSHADOW > 0\r\n        CastShadowPointLight castShadowPointLight;\r\n        for(int i = 0;i<NUM_POINTLIGHT_CASTSHADOW;i++)\r\n        {\r\n            castShadowPointLight = u_castShadowPointLights[i];\r\n            //\r\n            vec3 lightOffset = castShadowPointLight.position - v_worldPosition;\r\n            //光照方向\r\n            vec3 lightDir = normalize(lightOffset);\r\n            //灯光颜色\r\n            vec3 lightColor = castShadowPointLight.color;\r\n            //灯光强度\r\n            float lightIntensity = castShadowPointLight.intensity;\r\n            float falloff = computeDistanceLightFalloff(length(lightOffset), castShadowPointLight.range);\r\n            // 计算阴影\r\n            float shadow = getPointShadow( u_pointShadowMaps[ i ], castShadowPointLight.shadowType, castShadowPointLight.shadowMapSize, castShadowPointLight.shadowBias, castShadowPointLight.shadowRadius, -lightOffset, castShadowPointLight.shadowCameraNear, castShadowPointLight.shadowCameraFar );\r\n            float diffuse = calculateLightDiffuse(normal, lightDir);\r\n            float specular = calculateLightSpecular(normal, lightDir, viewDir, glossiness);\r\n            //\r\n            resultColor += (diffuse * diffuseColor + specular * specularColor) * lightColor * lightIntensity * falloff * shadow;\r\n        }\r\n    #endif\r\n\r\n    #if NUM_SPOT_LIGHTS > 0\r\n        SpotLight spotLight;\r\n        for(int i = 0; i < NUM_SPOT_LIGHTS; i++)\r\n        {\r\n            spotLight = u_spotLights[i];\r\n            //\r\n            vec3 lightOffset = spotLight.position - v_worldPosition;\r\n            //光照方向\r\n            vec3 lightDir = normalize(lightOffset);\r\n            float angleCos = dot(lightDir, -spotLight.direction);\r\n            if(angleCos > spotLight.coneCos)\r\n            {\r\n                float spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );\r\n                \r\n                //灯光颜色\r\n                vec3 lightColor = spotLight.color;\r\n                //灯光强度\r\n                float lightIntensity = spotLight.intensity;\r\n                float falloff = computeDistanceLightFalloff(length(lightOffset) * angleCos, spotLight.range);\r\n                float diffuse = calculateLightDiffuse(normal, lightDir);\r\n                float specular = calculateLightSpecular(normal, lightDir, viewDir, glossiness);\r\n                float shadow = 1.0;\r\n                \r\n                resultColor += (diffuse * diffuseColor + specular * specularColor) * lightColor * lightIntensity * falloff * shadow * spotEffect;\r\n            }            \r\n        }\r\n    #endif\r\n    \r\n    #if NUM_SPOT_LIGHTS_CASTSHADOW > 0\r\n        CastShadowSpotLight castShadowSpotLight;\r\n        for(int i = 0; i < NUM_SPOT_LIGHTS_CASTSHADOW; i++)\r\n        {\r\n            castShadowSpotLight = u_castShadowSpotLights[i];\r\n            //\r\n            vec3 lightOffset = castShadowSpotLight.position - v_worldPosition;\r\n            //光照方向\r\n            vec3 lightDir = normalize(lightOffset);\r\n            float angleCos = dot(lightDir, -castShadowSpotLight.direction);\r\n            if(angleCos > castShadowSpotLight.coneCos)\r\n            {\r\n                float spotEffect = smoothstep( castShadowSpotLight.coneCos, castShadowSpotLight.penumbraCos, angleCos );\r\n                \r\n                //灯光颜色\r\n                vec3 lightColor = castShadowSpotLight.color;\r\n                //灯光强度\r\n                float lightIntensity = castShadowSpotLight.intensity;\r\n                float falloff = computeDistanceLightFalloff(length(lightOffset) * angleCos, castShadowSpotLight.range);\r\n                float diffuse = calculateLightDiffuse(normal, lightDir);\r\n                float specular = calculateLightSpecular(normal, lightDir, viewDir, glossiness);\r\n                // 计算阴影\r\n                float shadow = getShadow( u_spotShadowMaps[i], castShadowSpotLight.shadowType, castShadowSpotLight.shadowMapSize, castShadowSpotLight.shadowBias, castShadowSpotLight.shadowRadius, v_spotShadowCoord[ i ], -lightOffset, castShadowSpotLight.shadowCameraNear, castShadowSpotLight.shadowCameraFar);\r\n                \r\n                resultColor += (diffuse * diffuseColor + specular * specularColor) * lightColor * lightIntensity * falloff * shadow * spotEffect;\r\n            }            \r\n        }\r\n    #endif\r\n\r\n    #if NUM_DIRECTIONALLIGHT > 0\r\n        DirectionalLight directionalLight;\r\n        for(int i = 0;i<NUM_DIRECTIONALLIGHT;i++)\r\n        {\r\n            directionalLight = u_directionalLights[i];\r\n            //光照方向\r\n            vec3 lightDir = normalize(-directionalLight.direction);\r\n            //灯光颜色\r\n            vec3 lightColor = directionalLight.color;\r\n            //灯光强度\r\n            float lightIntensity = directionalLight.intensity;\r\n\r\n            float falloff = 1.0;\r\n            float diffuse = calculateLightDiffuse(normal, lightDir);\r\n            float specular = calculateLightSpecular(normal, lightDir, viewDir, glossiness);\r\n            float shadow = 1.0;\r\n            //\r\n            resultColor += (diffuse * diffuseColor + specular * specularColor) * lightColor * lightIntensity * falloff * shadow;\r\n        }\r\n    #endif\r\n\r\n    #if NUM_DIRECTIONALLIGHT_CASTSHADOW > 0\r\n        CastShadowDirectionalLight castShadowDirectionalLight;\r\n        for(int i = 0;i<NUM_DIRECTIONALLIGHT_CASTSHADOW;i++)\r\n        {\r\n            castShadowDirectionalLight = u_castShadowDirectionalLights[i];\r\n            //\r\n            vec3 lightOffset = castShadowDirectionalLight.position - v_worldPosition;\r\n            //光照方向\r\n            vec3 lightDir = normalize(-castShadowDirectionalLight.direction);\r\n            //灯光颜色\r\n            vec3 lightColor = castShadowDirectionalLight.color;\r\n            //灯光强度\r\n            float lightIntensity = castShadowDirectionalLight.intensity;\r\n            // 计算阴影\r\n            float shadow = getShadow( u_directionalShadowMaps[i], castShadowDirectionalLight.shadowType, castShadowDirectionalLight.shadowMapSize, castShadowDirectionalLight.shadowBias, castShadowDirectionalLight.shadowRadius, v_directionalShadowCoord[ i ], -lightOffset, castShadowDirectionalLight.shadowCameraNear, castShadowDirectionalLight.shadowCameraFar);\r\n            \r\n            float falloff = 1.0;\r\n            float diffuse = calculateLightDiffuse(normal, lightDir);\r\n            float specular = calculateLightSpecular(normal, lightDir, viewDir, glossiness);\r\n            //\r\n            resultColor += (diffuse * diffuseColor + specular * specularColor) * lightColor * lightIntensity * falloff * shadow;\r\n        }\r\n    #endif\r\n\r\n    resultColor += ambientColor * diffuseColor;\r\n    return resultColor;\r\n}",
        "lights_pars_vert": "// 灯光声明\r\n\r\n#if NUM_DIRECTIONALLIGHT_CASTSHADOW > 0\r\n    // 方向光源投影矩阵列表\r\n    uniform mat4 u_directionalShadowMatrixs[ NUM_DIRECTIONALLIGHT_CASTSHADOW ];\r\n    // 方向光源投影uv列表\r\n    varying vec4 v_directionalShadowCoord[ NUM_DIRECTIONALLIGHT_CASTSHADOW ];\r\n#endif\r\n\r\n#if NUM_SPOT_LIGHTS_CASTSHADOW > 0\r\n    // 聚光灯投影矩阵列表\r\n    uniform mat4 u_spotShadowMatrix[ NUM_SPOT_LIGHTS_CASTSHADOW ];\r\n    // 聚光灯投影uv列表\r\n    varying vec4 v_spotShadowCoord[ NUM_SPOT_LIGHTS_CASTSHADOW ];\r\n#endif",
        "lights_vert": "#if NUM_DIRECTIONALLIGHT_CASTSHADOW > 0\r\n    for ( int i = 0; i < NUM_DIRECTIONALLIGHT_CASTSHADOW; i ++ ) \r\n    {\r\n        v_directionalShadowCoord[ i ] = u_directionalShadowMatrixs[ i ] * worldPosition;\r\n    }\r\n#endif\r\n\r\n#if NUM_SPOT_LIGHTS_CASTSHADOW > 0\r\n    for ( int i = 0; i < NUM_SPOT_LIGHTS_CASTSHADOW; i ++ ) \r\n    {\r\n        v_spotShadowCoord[ i ] = u_spotShadowMatrix[ i ] * worldPosition;\r\n    }\r\n#endif",
        "normalmap_pars_vert": "uniform mat4 u_ITModelMatrix;\r\n\r\nvarying vec3 v_normal;\r\nvarying vec3 v_tangent;\r\nvarying vec3 v_bitangent;",
        "normalmap_vert": "//计算法线\r\nv_normal = normalize((u_ITModelMatrix * vec4(normal, 0.0)).xyz);\r\nv_tangent = normalize((u_modelMatrix * vec4(tangent, 0.0)).xyz);\r\nv_bitangent = cross(v_normal, v_tangent);",
        "normal_frag": "//获取法线\r\nvec3 normal = texture2D(s_normal,v_uv).xyz * 2.0 - 1.0;\r\nnormal = normalize(normal.x * v_tangent + normal.y * v_bitangent + normal.z * v_normal);",
        "normal_pars_frag": "varying vec3 v_normal;\r\nvarying vec3 v_tangent;\r\nvarying vec3 v_bitangent;\r\n\r\n//法线贴图\r\nuniform sampler2D s_normal;",
        "normal_pars_vert": "attribute vec3 a_normal;",
        "normal_vert": "vec3 normal = a_normal;",
        "particle_frag": "#ifdef HAS_PARTICLE_ANIMATOR\r\n    finalColor = particleAnimation(finalColor);\r\n#endif",
        "particle_pars_frag": "#ifdef HAS_PARTICLE_ANIMATOR\r\n    varying vec4 v_particle_color;\r\n\r\n    vec4 particleAnimation(vec4 color) {\r\n\r\n        color.xyz = color.xyz * v_particle_color.xyz;\r\n        color.xyz = color.xyz * v_particle_color.www;\r\n        return color;\r\n    }\r\n#endif",
        "particle_pars_vert": "#ifdef HAS_PARTICLE_ANIMATOR\r\n    //\r\n    attribute vec3 a_particle_position;\r\n    attribute vec3 a_particle_scale;\r\n    attribute vec3 a_particle_rotation;\r\n    attribute vec4 a_particle_color;\r\n\r\n    #ifdef ENABLED_PARTICLE_SYSTEM_textureSheetAnimation\r\n        attribute vec4 a_particle_tilingOffset;\r\n        attribute vec2 a_particle_flipUV;\r\n    #endif\r\n\r\n    uniform mat3 u_particle_billboardMatrix;\r\n\r\n    varying vec4 v_particle_color;\r\n\r\n    #define RotationOrder_XYZ 0\r\n    #define RotationOrder_ZXY 1\r\n    #define RotationOrder_ZYX 2\r\n    #define RotationOrder_YXZ 3\r\n    #define RotationOrder_YZX 4\r\n    #define RotationOrder_XZY 5\r\n\r\n    mat3 makeParticleRotationMatrix(vec3 rotation)\r\n    {\r\n        float DEG2RAD = 3.1415926 / 180.0;\r\n        \r\n        float rx = rotation.x * DEG2RAD;\r\n        float ry = rotation.y * DEG2RAD;\r\n        float rz = rotation.z * DEG2RAD;\r\n\r\n        float sinX = sin(rx);\r\n        float cosX = cos(rx);\r\n        float sinY = sin(ry);\r\n        float cosY = cos(ry);\r\n        float sinZ = sin(rz);\r\n        float cosZ = cos(rz);\r\n\r\n        mat3 tmp;\r\n        #ifdef RotationOrder\r\n            #if RotationOrder == RotationOrder_XYZ\r\n                float ae = cosX * cosZ;\r\n                float af = cosX * sinZ;\r\n                float be = sinX * cosZ;\r\n                float bf = sinX * sinZ;\r\n\r\n                float te0 = cosY * cosZ;\r\n                float te4 = - cosY * sinZ;\r\n                float te8 = sinY;\r\n\r\n                float te1 = af + be * sinY;\r\n                float te5 = ae - bf * sinY;\r\n                float te9 = - sinX * cosY;\r\n\r\n                float te2 = bf - ae * sinY;\r\n                float te6 = be + af * sinY;\r\n                float te10 = cosX * cosY;\r\n            #endif\r\n            #if RotationOrder == RotationOrder_YXZ\r\n                float ce = cosY * cosZ;\r\n                float cf = cosY * sinZ;\r\n                float de = sinY * cosZ;\r\n                float df = sinY * sinZ;\r\n\r\n                float te0 = ce + df * sinX;\r\n                float te4 = de * sinX - cf;\r\n                float te8 = cosX * sinY;\r\n\r\n                float te1 = cosX * sinZ;\r\n                float te5 = cosX * cosZ;\r\n                float te9 = - sinX;\r\n\r\n                float te2 = cf * sinX - de;\r\n                float te6 = df + ce * sinX;\r\n                float te10 = cosX * cosY;\r\n            #endif\r\n            #if RotationOrder == RotationOrder_ZXY\r\n                float ce = cosY * cosZ;\r\n                float cf = cosY * sinZ;\r\n                float de = sinY * cosZ;\r\n                float df = sinY * sinZ;\r\n\r\n                float te0 = ce - df * sinX;\r\n                float te4 = - cosX * sinZ;\r\n                float te8 = de + cf * sinX;\r\n\r\n                float te1 = cf + de * sinX;\r\n                float te5 = cosX * cosZ;\r\n                float te9 = df - ce * sinX;\r\n\r\n                float te2 = - cosX * sinY;\r\n                float te6 = sinX;\r\n                float te10 = cosX * cosY;\r\n            #endif\r\n            #if RotationOrder == RotationOrder_ZYX\r\n                float ae = cosX * cosZ;\r\n                float af = cosX * sinZ;\r\n                float be = sinX * cosZ;\r\n                float bf = sinX * sinZ;\r\n\r\n                float te0 = cosY * cosZ;\r\n                float te4 = be * sinY - af;\r\n                float te8 = ae * sinY + bf;\r\n\r\n                float te1 = cosY * sinZ;\r\n                float te5 = bf * sinY + ae;\r\n                float te9 = af * sinY - be;\r\n\r\n                float te2 = - sinY;\r\n                float te6 = sinX * cosY;\r\n                float te10 = cosX * cosY;\r\n            #endif\r\n            #if RotationOrder == RotationOrder_YZX\r\n                float ac = cosX * cosY;\r\n                float ad = cosX * sinY;\r\n                float bc = sinX * cosY;\r\n                float bd = sinX * sinY;\r\n\r\n                float te0 = cosY * cosZ;\r\n                float te4 = bd - ac * sinZ;\r\n                float te8 = bc * sinZ + ad;\r\n\r\n                float te1 = sinZ;\r\n                float te5 = cosX * cosZ;\r\n                float te9 = - sinX * cosZ;\r\n\r\n                float te2 = - sinY * cosZ;\r\n                float te6 = ad * sinZ + bc;\r\n                float te10 = ac - bd * sinZ;\r\n            #endif\r\n            #if RotationOrder == RotationOrder_XZY\r\n                float ac = cosX * cosY;\r\n                float ad = cosX * sinY;\r\n                float bc = sinX * cosY;\r\n                float bd = sinX * sinY;\r\n\r\n                float te0 = cosY * cosZ;\r\n                float te4 = - sinZ;\r\n                float te8 = sinY * cosZ;\r\n\r\n                float te1 = ac * sinZ + bd;\r\n                float te5 = cosX * cosZ;\r\n                float te9 = ad * sinZ - bc;\r\n\r\n                float te2 = bc * sinZ - ad;\r\n                float te6 = sinX * cosZ;\r\n                float te10 = bd * sinZ + ac;\r\n            #endif\r\n        #else\r\n            // YXZ\r\n            float ce = cosY * cosZ;\r\n            float cf = cosY * sinZ;\r\n            float de = sinY * cosZ;\r\n            float df = sinY * sinZ;\r\n\r\n            float te0 = ce + df * sinX;\r\n            float te4 = de * sinX - cf;\r\n            float te8 = cosX * sinY;\r\n\r\n            float te1 = cosX * sinZ;\r\n            float te5 = cosX * cosZ;\r\n            float te9 = - sinX;\r\n\r\n            float te2 = cf * sinX - de;\r\n            float te6 = df + ce * sinX;\r\n            float te10 = cosX * cosY;\r\n        #endif\r\n        \r\n        tmp[0] = vec3(te0, te1, te2);\r\n        tmp[1] = vec3(te4, te5, te6);\r\n        tmp[2] = vec3(te8, te9, te10);\r\n        \r\n        return tmp;\r\n    }\r\n\r\n    vec4 particleAnimation(vec4 position) \r\n    {\r\n        // 计算缩放\r\n        position.xyz = position.xyz * a_particle_scale;\r\n\r\n        // 计算旋转\r\n        mat3 rMat = makeParticleRotationMatrix(a_particle_rotation);\r\n        position.xyz = rMat * position.xyz;\r\n        position.xyz = u_particle_billboardMatrix * position.xyz;\r\n\r\n        // 位移\r\n        position.xyz = position.xyz + a_particle_position;\r\n\r\n        // 颜色\r\n        v_particle_color = a_particle_color;\r\n\r\n        #ifdef ENABLED_PARTICLE_SYSTEM_textureSheetAnimation\r\n            if(a_particle_flipUV.x > 0.5) v_uv.x = 1.0 - v_uv.x;\r\n            if(a_particle_flipUV.y > 0.5) v_uv.y = 1.0 - v_uv.y;\r\n            v_uv = v_uv * a_particle_tilingOffset.xy + a_particle_tilingOffset.zw;\r\n        #endif\r\n        \r\n        return position;\r\n    }\r\n#endif",
        "particle_vert": "#ifdef HAS_PARTICLE_ANIMATOR\r\n    position = particleAnimation(position);\r\n#endif",
        "pointsize_pars_vert": "#ifdef IS_POINTS_MODE\r\n    uniform float u_PointSize;\r\n#endif",
        "pointsize_vert": "#ifdef IS_POINTS_MODE\r\n    gl_PointSize = u_PointSize;\r\n#endif",
        "position_pars_vert": "attribute vec3 a_position;",
        "position_vert": "vec4 position = vec4(a_position, 1.0);",
        "project_pars_vert": "uniform mat4 u_viewProjection;",
        "project_vert": "//计算投影坐标\r\ngl_Position = u_viewProjection * worldPosition;",
        "shadowmap_pars_frag": "#if (NUM_POINTLIGHT_CASTSHADOW > 0) ||  (NUM_DIRECTIONALLIGHT_CASTSHADOW > 0) ||  (NUM_SPOT_LIGHTS_CASTSHADOW > 0)\r\n    #if NUM_POINTLIGHT_CASTSHADOW > 0\r\n        // 投影的点光源\r\n        struct CastShadowPointLight\r\n        {\r\n            // 位置\r\n            vec3 position;\r\n            // 颜色\r\n            vec3 color;\r\n            // 强度\r\n            float intensity;\r\n            // 范围\r\n            float range;\r\n            // 阴影类型\r\n            int shadowType;\r\n            // 阴影偏差，用来解决判断是否为阴影时精度问题\r\n            float shadowBias;\r\n            // 阴影半径，边缘宽度\r\n            float shadowRadius;\r\n            // 阴影图尺寸\r\n            vec2 shadowMapSize;\r\n            float shadowCameraNear;\r\n            float shadowCameraFar;\r\n        };\r\n        // 投影的点光源列表\r\n        uniform CastShadowPointLight u_castShadowPointLights[NUM_POINTLIGHT_CASTSHADOW];\r\n        // 点光源阴影图\r\n        uniform sampler2D u_pointShadowMaps[NUM_POINTLIGHT_CASTSHADOW];\r\n    #endif\r\n\r\n    #if NUM_SPOT_LIGHTS_CASTSHADOW > 0\r\n        // 投影的聚光灯\r\n        struct CastShadowSpotLight\r\n        {\r\n            // 位置\r\n            vec3 position;\r\n            // 颜色\r\n            vec3 color;\r\n            // 强度\r\n            float intensity;\r\n            // 范围\r\n            float range;\r\n            // 方向\r\n            vec3 direction;\r\n            // 椎体cos值\r\n            float coneCos;\r\n            // 半影cos\r\n            float penumbraCos;\r\n\r\n            // 阴影类型\r\n            int shadowType;\r\n            // 阴影偏差，用来解决判断是否为阴影时精度问题\r\n            float shadowBias;\r\n            // 阴影半径，边缘宽度\r\n            float shadowRadius;\r\n            // 阴影图尺寸\r\n            vec2 shadowMapSize;\r\n            float shadowCameraNear;\r\n            float shadowCameraFar;\r\n        };\r\n        // 投影的投影的聚光灯列表\r\n        uniform CastShadowSpotLight u_castShadowSpotLights[NUM_SPOT_LIGHTS_CASTSHADOW];\r\n        // 投影的聚光灯阴影图\r\n        uniform sampler2D u_spotShadowMaps[NUM_SPOT_LIGHTS_CASTSHADOW];\r\n        // 方向光源投影uv列表\r\n        varying vec4 v_spotShadowCoord[ NUM_SPOT_LIGHTS_CASTSHADOW ];\r\n    #endif\r\n\r\n    #if NUM_DIRECTIONALLIGHT_CASTSHADOW > 0\r\n        // 投影的方向光源\r\n        struct CastShadowDirectionalLight\r\n        {\r\n            // 方向\r\n            vec3 direction;\r\n            // 颜色\r\n            vec3 color;\r\n            // 强度\r\n            float intensity;\r\n            // 阴影类型\r\n            int shadowType;\r\n            // 阴影偏差，用来解决判断是否为阴影时精度问题\r\n            float shadowBias;\r\n            // 阴影半径，边缘宽度\r\n            float shadowRadius;\r\n            // 阴影图尺寸\r\n            vec2 shadowMapSize;\r\n            // 位置\r\n            vec3 position;\r\n            float shadowCameraNear;\r\n            float shadowCameraFar;\r\n        };\r\n        // 投影的方向光源列表\r\n        uniform CastShadowDirectionalLight u_castShadowDirectionalLights[NUM_DIRECTIONALLIGHT_CASTSHADOW];\r\n        // 方向光源阴影图\r\n        uniform sampler2D u_directionalShadowMaps[NUM_DIRECTIONALLIGHT_CASTSHADOW];\r\n        // 方向光源投影uv列表\r\n        varying vec4 v_directionalShadowCoord[ NUM_DIRECTIONALLIGHT_CASTSHADOW ];\r\n    #endif\r\n\r\n    // @see https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/packing.glsl\r\n    const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)\r\n    const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );\r\n    const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\r\n    float unpackRGBAToDepth( const in vec4 v ) \r\n    {\r\n        return dot( v, UnpackFactors );\r\n    }\r\n\r\n    float texture2DCompare( sampler2D depths, vec2 uv, float compare ) \r\n    {\r\n        return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );\r\n    }\r\n\r\n    float texture2DShadowLerp( sampler2D depths, vec2 size, vec2 uv, float compare ) \r\n    {\r\n        const vec2 offset = vec2( 0.0, 1.0 );\r\n\r\n        vec2 texelSize = vec2( 1.0 ) / size;\r\n        vec2 centroidUV = floor( uv * size + 0.5 ) / size;\r\n\r\n        float lb = texture2DCompare( depths, centroidUV + texelSize * offset.xx, compare );\r\n        float lt = texture2DCompare( depths, centroidUV + texelSize * offset.xy, compare );\r\n        float rb = texture2DCompare( depths, centroidUV + texelSize * offset.yx, compare );\r\n        float rt = texture2DCompare( depths, centroidUV + texelSize * offset.yy, compare );\r\n\r\n        vec2 f = fract( uv * size + 0.5 );\r\n\r\n        float a = mix( lb, lt, f.y );\r\n        float b = mix( rb, rt, f.y );\r\n        float c = mix( a, b, f.x );\r\n\r\n        return c;\r\n    }\r\n\r\n    // 计算阴影值 @see https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/shadowmap_pars_fragment.glsl\r\n    float getShadow( sampler2D shadowMap, int shadowType, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, vec3 lightToPosition, float shadowCameraNear, float shadowCameraFar) \r\n    {\r\n        float shadow = 1.0;\r\n\r\n        shadowCoord.xy /= shadowCoord.w;\r\n        shadowCoord.xy = (shadowCoord.xy + 1.0) / 2.0;\r\n\r\n        // dp = normalized distance from light to fragment position\r\n        float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear ); // need to clamp?\r\n        dp += shadowBias;\r\n        shadowCoord.z = dp;\r\n\r\n        // if ( something && something ) breaks ATI OpenGL shader compiler\r\n        // if ( all( something, something ) ) using this instead\r\n\r\n        bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\r\n        bool inFrustum = all( inFrustumVec );\r\n\r\n        bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\r\n\r\n        bool frustumTest = all( frustumTestVec );\r\n\r\n        if ( frustumTest ) \r\n        {\r\n            if (shadowType == 2)\r\n            {\r\n                // PCF\r\n                vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\r\n\r\n                float dx0 = - texelSize.x * shadowRadius;\r\n                float dy0 = - texelSize.y * shadowRadius;\r\n                float dx1 = + texelSize.x * shadowRadius;\r\n                float dy1 = + texelSize.y * shadowRadius;\r\n\r\n                shadow = (\r\n                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\r\n                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\r\n                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\r\n                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\r\n                    texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\r\n                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\r\n                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\r\n                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\r\n                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\r\n                ) * ( 1.0 / 9.0 );\r\n            }\r\n            else if(shadowType == 3)\r\n            {\r\n                // PCF soft\r\n                vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\r\n\r\n                float dx0 = - texelSize.x * shadowRadius;\r\n                float dy0 = - texelSize.y * shadowRadius;\r\n                float dx1 = + texelSize.x * shadowRadius;\r\n                float dy1 = + texelSize.y * shadowRadius;\r\n\r\n                shadow = (\r\n                    texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\r\n                    texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\r\n                    texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\r\n                    texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\r\n                    texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy, shadowCoord.z ) +\r\n                    texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\r\n                    texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\r\n                    texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\r\n                    texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\r\n                ) * ( 1.0 / 9.0 );\r\n            }\r\n            else\r\n            {\r\n                shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );\r\n            }\r\n        }\r\n\r\n        return shadow;\r\n    }\r\n\r\n    // cubeToUV() maps a 3D direction vector suitable for cube texture mapping to a 2D\r\n    // vector suitable for 2D texture mapping. This code uses the following layout for the\r\n    // 2D texture:\r\n    //\r\n    // xzXZ\r\n    //  y Y\r\n    //\r\n    // Y - Positive y direction\r\n    // y - Negative y direction\r\n    // X - Positive x direction\r\n    // x - Negative x direction\r\n    // Z - Positive z direction\r\n    // z - Negative z direction\r\n    //\r\n    // Source and test bed:\r\n    // https://gist.github.com/tschw/da10c43c467ce8afd0c4\r\n\r\n    vec2 cubeToUV( vec3 v, float texelSizeY ) \r\n    {\r\n        // Number of texels to avoid at the edge of each square\r\n        vec3 absV = abs( v );\r\n\r\n        // Intersect unit cube\r\n        float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\r\n        absV *= scaleToCube;\r\n\r\n        // Apply scale to avoid seams\r\n\r\n        // two texels less per square (one texel will do for NEAREST)\r\n        v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\r\n\r\n        // Unwrap\r\n\r\n        // space: -1 ... 1 range for each square\r\n        //\r\n        // #X##\t\tdim    := ( 1/4 , 1/2 )\r\n        //  # #\t\tcenter := ( 1/2 , 1/2 )\r\n        vec2 planar;\r\n        float almostOne = 1.0 - 1.5 * texelSizeY;\r\n        if ( absV.z >= almostOne ) \r\n        {\r\n            if ( v.z > 0.0 )\r\n            {\r\n                planar.x = (0.5 + v.x * 0.5) * 0.25 + 0.75;\r\n                planar.y = (0.5 + v.y * 0.5) * 0.5 + 0.5;\r\n            }else\r\n            {\r\n                planar.x = (0.5 - v.x * 0.5) * 0.25 + 0.25;\r\n                planar.y = (0.5 + v.y * 0.5) * 0.5 + 0.5;\r\n            }\r\n        } else if ( absV.x >= almostOne ) \r\n        {\r\n            if( v.x > 0.0)\r\n            {\r\n                planar.x = (0.5 - v.z * 0.5) * 0.25 + 0.5;\r\n                planar.y = (0.5 + v.y * 0.5) * 0.5 + 0.5;\r\n            }else\r\n            {\r\n                planar.x = (0.5 + v.z * 0.5) * 0.25 + 0.0;\r\n                planar.y = (0.5 + v.y * 0.5) * 0.5 + 0.5;\r\n            }\r\n        } else if ( absV.y >= almostOne ) \r\n        {\r\n            if( v.y > 0.0)\r\n            {\r\n                planar.x = (0.5 - v.x * 0.5) * 0.25 + 0.75;\r\n                planar.y = (0.5 + v.z * 0.5) * 0.5 + 0.0;\r\n            }else\r\n            {\r\n                planar.x = (0.5 - v.x * 0.5) * 0.25 + 0.25;\r\n                planar.y = (0.5 - v.z * 0.5) * 0.5 + 0.0;\r\n            }\r\n        }\r\n        return planar;\r\n    }\r\n\r\n    float getPointShadow( sampler2D shadowMap, int shadowType, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec3 lightToPosition, float shadowCameraNear, float shadowCameraFar ) \r\n    {\r\n        vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );\r\n\r\n        // for point lights, the uniform @vShadowCoord is re-purposed to hold\r\n        // the vector from the light to the world-space position of the fragment.\r\n        // vec3 lightToPosition = shadowCoord.xyz;\r\n\r\n        // dp = normalized distance from light to fragment position\r\n        float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear ); // need to clamp?\r\n        dp += shadowBias;\r\n\r\n        // bd3D = base direction 3D\r\n        vec3 bd3D = normalize( lightToPosition );\r\n\r\n        if(shadowType == 2 || shadowType == 3)\r\n        {\r\n            vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;\r\n\r\n            return (\r\n                texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +\r\n                texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +\r\n                texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +\r\n                texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +\r\n                texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +\r\n                texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +\r\n                texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +\r\n                texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +\r\n                texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )\r\n            ) * ( 1.0 / 9.0 );\r\n        }else\r\n        {\r\n            return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );\r\n        }\r\n    }\r\n#endif",
        "skeleton_pars_vert": "#ifdef HAS_SKELETON_ANIMATION\r\n\r\n    attribute vec4 a_skinIndices;\r\n    attribute vec4 a_skinWeights;\r\n\r\n    #ifdef HAS_a_skinIndices1\r\n        attribute vec4 a_skinIndices1;\r\n        attribute vec4 a_skinWeights1;\r\n    #endif\r\n\r\n    #ifdef NUM_SKELETONJOINT\r\n        uniform mat4 u_skeletonGlobalMatriices[NUM_SKELETONJOINT];\r\n    #endif\r\n\r\n    vec4 skeletonAnimation(vec4 position) \r\n    {\r\n        vec4 totalPosition = vec4(0.0,0.0,0.0,1.0);\r\n        for(int i = 0; i < 4; i++)\r\n        {\r\n            totalPosition += u_skeletonGlobalMatriices[int(a_skinIndices[i])] * position * a_skinWeights[i];\r\n        }\r\n        #ifdef HAS_a_skinIndices1\r\n            for(int i = 0; i < 4; i++)\r\n            {\r\n                totalPosition += u_skeletonGlobalMatriices[int(a_skinIndices1[i])] * position * a_skinWeights1[i];\r\n            }\r\n        #endif\r\n        position.xyz = totalPosition.xyz;\r\n        return position;\r\n    }\r\n#endif",
        "skeleton_vert": "#ifdef HAS_SKELETON_ANIMATION\r\n    position = skeletonAnimation(position);\r\n#endif",
        "specular_frag": "//获取高光值\r\nfloat glossiness = u_glossiness;\r\n//获取镜面反射基本颜色\r\nvec3 specularColor = u_specular;\r\nvec4 specularMapColor = texture2D(s_specular, v_uv);\r\nspecularColor.xyz = specularMapColor.xyz;\r\nglossiness = glossiness * specularMapColor.w;",
        "specular_pars_frag": "//镜面反射\r\nuniform vec3 u_specular;\r\nuniform float u_glossiness;\r\nuniform sampler2D s_specular;",
        "tangent_pars_vert": "attribute vec3 a_tangent;",
        "tangent_vert": "vec3 tangent = a_tangent;",
        "terrainDefault_pars_frag": "uniform sampler2D s_splatTexture1;\r\nuniform sampler2D s_splatTexture2;\r\nuniform sampler2D s_splatTexture3;\r\n\r\nuniform sampler2D s_blendTexture;\r\nuniform vec4 u_splatRepeats;\r\n\r\nvec4 terrainMethod(vec4 diffuseColor,vec2 v_uv) \r\n{\r\n    vec4 blend = texture2D(s_blendTexture, v_uv);\r\n\r\n    vec2 t_uv = v_uv.xy * u_splatRepeats.y;\r\n    vec4 tColor = texture2D(s_splatTexture1, t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.x + diffuseColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.z;\r\n    tColor = texture2D(s_splatTexture2, t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.y + diffuseColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.w;\r\n    tColor = texture2D(s_splatTexture3, t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.z + diffuseColor;\r\n\r\n    return diffuseColor;\r\n}",
        "terrainMerge_pars_frag": "//代码实现lod以及线性插值 feng\r\n#extension GL_EXT_shader_texture_lod : enable\r\n#extension GL_OES_standard_derivatives : enable\r\n\r\n#define LOD_LINEAR\r\n\r\nuniform sampler2D s_splatMergeTexture;\r\nuniform sampler2D s_blendTexture;\r\nuniform vec4 u_splatRepeats;\r\n\r\nuniform vec2 u_imageSize;\r\nuniform vec4 u_tileOffset[3];\r\nuniform vec4 u_lod0vec;\r\nuniform vec2 u_tileSize;\r\nuniform float u_maxLod;\r\nuniform float u_scaleByDepth;\r\nuniform float u_uvPositionScale;\r\n\r\n\r\nvec4 terrainTexture2DLod(sampler2D s_splatMergeTexture,vec2 uv,float lod,vec4 offset){\r\n\r\n    //计算不同lod像素缩放以及起始坐标\r\n    vec4 lodvec = u_lod0vec;\r\n    lodvec.x = lodvec.x * pow(0.5,lod);\r\n    lodvec.y = lodvec.x * 2.0;\r\n    lodvec.z = 1.0 - lodvec.y;\r\n\r\n    //lod块尺寸\r\n    vec2 lodSize = u_imageSize * lodvec.xy;\r\n    vec2 lodPixelOffset = 1.0 / lodSize * 2.0;\r\n\r\n    // uv = uv - 1.0 / lodPixelOffset;\r\n    vec2 mixFactor = mod(uv, lodPixelOffset) / lodPixelOffset;\r\n\r\n    //lod块中像素索引\r\n    vec2 t_uv = fract(uv + lodPixelOffset * vec2(0.0, 0.0));\r\n    t_uv = t_uv * offset.xy + offset.zw;\r\n    //添加lod起始坐标\r\n    t_uv = t_uv * lodvec.xy + lodvec.zw;\r\n    //取整像素\r\n    t_uv = floor(t_uv * u_imageSize) / u_imageSize;\r\n    vec4 tColor00 = texture2D(s_splatMergeTexture,t_uv);\r\n\r\n    t_uv = fract(uv + lodPixelOffset * vec2(1.0, 0.0));\r\n    t_uv = t_uv * offset.xy + offset.zw;\r\n    //添加lod起始坐标\r\n    t_uv = t_uv * lodvec.xy + lodvec.zw;\r\n    //取整像素\r\n    t_uv = floor(t_uv * u_imageSize) / u_imageSize;\r\n    vec4 tColor10 = texture2D(s_splatMergeTexture,t_uv);\r\n\r\n    t_uv = fract(uv + lodPixelOffset * vec2(0.0, 1.0));\r\n    t_uv = t_uv * offset.xy + offset.zw;\r\n    //添加lod起始坐标\r\n    t_uv = t_uv * lodvec.xy + lodvec.zw;\r\n    //取整像素\r\n    t_uv = floor(t_uv * u_imageSize) / u_imageSize;\r\n    vec4 tColor01 = texture2D(s_splatMergeTexture,t_uv);\r\n\r\n    t_uv = fract(uv + lodPixelOffset * vec2(1.0, 1.0));\r\n    t_uv = t_uv * offset.xy + offset.zw;\r\n    //添加lod起始坐标\r\n    t_uv = t_uv * lodvec.xy + lodvec.zw;\r\n    //取整像素\r\n    t_uv = floor(t_uv * u_imageSize) / u_imageSize;\r\n    vec4 tColor11 = texture2D(s_splatMergeTexture,t_uv);\r\n\r\n    vec4 tColor0 = mix(tColor00,tColor10,mixFactor.x);\r\n    vec4 tColor1 = mix(tColor01,tColor11,mixFactor.x);\r\n    vec4 tColor = mix(tColor0,tColor1,mixFactor.y);\r\n\r\n    return tColor;\r\n\r\n    // return vec4(mixFactor.x,mixFactor.y,0.0,1.0);\r\n    // return vec4(mixFactor.x + 0.5,mixFactor.y + 0.5,0.0,1.0);\r\n}\r\n\r\n//参考 http://blog.csdn.net/cgwbr/article/details/6620318\r\n//计算MipMap层函数：\r\nfloat mipmapLevel(vec2 uv)\r\n{\r\n    vec2 dx = dFdx(uv);\r\n    vec2 dy = dFdy(uv);\r\n    float d = max(dot(dx, dx), dot(dy, dy));\r\n    return 0.5 * log2(d);\r\n}\r\n\r\n//根据距离以及法线计算MipMap层函数：\r\nfloat mipmapLevel1(vec2 uv)\r\n{\r\n    //视线方向\r\n    vec3 cameraDir = u_cameraPos - v_worldPosition.xyz;\r\n    float fogDistance = length(cameraDir);\r\n    float value = u_scaleByDepth * fogDistance * u_uvPositionScale;//uv变化率与距离成正比，0.001为顶点位置与uv的变化比率\r\n    cameraDir = normalize(cameraDir);\r\n    float dd = clamp(dot(cameraDir, v_normal),0.05,1.0);//取法线与视线余弦值的倒数，余弦值越大（朝向摄像机时uv变化程度越低）lod越小\r\n    value = value / dd;\r\n    value = value * 0.5;//还没搞懂0.5的来历\r\n    return log2(value);\r\n}\r\n\r\nvec4 terrainTexture2D(sampler2D s_splatMergeTexture, vec2 t_uv, float lod, vec4 offset){\r\n \r\n    #ifdef LOD_LINEAR\r\n        vec4 tColor = mix(terrainTexture2DLod(s_splatMergeTexture, t_uv, floor(lod), offset),terrainTexture2DLod(s_splatMergeTexture, t_uv, ceil(lod), offset), fract(lod));\r\n    #else\r\n        vec4 tColor = terrainTexture2DLod(s_splatMergeTexture, t_uv, ceil(lod), offset);\r\n    #endif\r\n\r\n    return tColor;\r\n}\r\n\r\nvec4 terrainMethod(vec4 diffuseColor, vec2 v_uv) \r\n{\r\n    float lod = 0.0;\r\n    vec4 blend = texture2D(s_blendTexture, v_uv);\r\n    for(int i = 0; i < 3; i++)\r\n    {\r\n        vec2 t_uv = v_uv * u_splatRepeats[i];\r\n        // lod = mipmapLevel(v_uv) + log2(u_tileSize.x * u_splatRepeats[i]);\r\n        lod = mipmapLevel1(v_uv) + log2(u_tileSize.x * u_splatRepeats[i]);\r\n        lod = clamp(lod, 0.0, u_maxLod);\r\n        vec4 tColor = terrainTexture2D(s_splatMergeTexture, t_uv, lod, u_tileOffset[i]);\r\n        diffuseColor = (tColor - diffuseColor) * blend[i] + diffuseColor;\r\n    }\r\n\r\n    // diffuseColor.xyz = vec3(1.0,0.0,0.0);\r\n    // diffuseColor.xyz = vec3(lod/u_maxLod,0.0,0.0);\r\n    // diffuseColor.xyz = vec3(floor(lod)/u_maxLod,0.0,0.0);\r\n    return diffuseColor;\r\n}",
        "terrain_frag": "diffuseColor = terrainMethod(diffuseColor, v_uv);",
        "terrain_pars_frag": "#ifdef USE_TERRAIN_MERGE\r\n    #include<terrainMerge_pars_frag>\r\n#else\r\n    #include<terrainDefault_pars_frag>\r\n#endif",
        "uv_pars_vert": "attribute vec2 a_uv;\r\n\r\nvarying vec2 v_uv;",
        "uv_vert": "v_uv = a_uv;\r\n#ifdef SCALEU\r\n    #ifdef SCALEV\r\n    v_uv = v_uv * vec2(SCALEU,SCALEV);\r\n    #endif\r\n#endif",
        "worldposition_pars_vert": "uniform mat4 u_modelMatrix;\r\n\r\nvarying vec3 v_worldPosition;",
        "worldposition_vert": "//获取全局坐标\r\nvec4 worldPosition = u_modelMatrix * position;\r\n//输出全局坐标\r\nv_worldPosition = worldPosition.xyz;"
    }
};

globalEmitter.on("asset.shaderChanged", function () {
    shaderlib.clearCache();
});

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        var arguments$1 = arguments;

        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments$1[i];
            for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p)) { t[p] = s[p]; } }
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) { if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        { t[p] = s[p]; } }
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        { for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                { t[p[i]] = s[p[i]]; }
        } }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") { r = Reflect.decorate(decorators, target, key, desc); }
    else { for (var i = decorators.length - 1; i >= 0; i--) { if (d = decorators[i]) { r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r; } } }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") { return Reflect.metadata(metadataKey, metadataValue); }
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) { throw t[1]; } return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) { throw new TypeError("Generator is already executing."); }
        while (_) { try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) { return t; }
            if (y = 0, t) { op = [op[0] & 2, t.value]; }
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) { _.ops.pop(); }
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; } }
        if (op[0] & 5) { throw op[1]; } return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) { k2 = k; }
    o[k2] = m[k];
}

function __exportStar(m, exports) {
    for (var p in m) { if (p !== "default" && !exports.hasOwnProperty(p)) { exports[p] = m[p]; } }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) { return m.call(o); }
    if (o && typeof o.length === "number") { return {
        next: function () {
            if (o && i >= o.length) { o = void 0; }
            return { value: o && o[i++], done: !o };
        }
    }; }
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) { return o; }
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) { ar.push(r.value); }
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) { m.call(i); }
        }
        finally { if (e) { throw e.error; } }
    }
    return ar;
}

function __spread() {
    var arguments$1 = arguments;

    for (var ar = [], i = 0; i < arguments.length; i++)
        { ar = ar.concat(__read(arguments$1[i])); }
    return ar;
}

function __spreadArrays() {
    var arguments$1 = arguments;

    for (var s = 0, i = 0, il = arguments.length; i < il; i++) { s += arguments$1[i].length; }
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        { for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            { r[k] = a[j]; } }
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) { throw new TypeError("Symbol.asyncIterator is not defined."); }
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) { resume(q[0][0], q[0][1]); } }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) { throw new TypeError("Symbol.asyncIterator is not defined."); }
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) { return mod; }
    var result = {};
    if (mod != null) { for (var k in mod) { if (Object.hasOwnProperty.call(mod, k)) { result[k] = mod[k]; } } }
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}

/**
 * 运行环境枚举
 */
var RunEnvironment;
(function (RunEnvironment) {
    /**
     * 在feng3d模式下运行
     */
    RunEnvironment[RunEnvironment["feng3d"] = 1] = "feng3d";
    /**
     * 运行在编辑器中
     */
    RunEnvironment[RunEnvironment["editor"] = 2] = "editor";
    /**
     * 在所有环境中运行
     */
    RunEnvironment[RunEnvironment["all"] = 255] = "all";
})(RunEnvironment || (RunEnvironment = {}));

/**
 * 在检查器中控制对象销毁、保存和可见性的位掩码。
 */
var HideFlags;
(function (HideFlags) {
    /**
     * 一个正常的,可见对象。这是默认的。
     */
    HideFlags[HideFlags["None"] = 0] = "None";
    /**
     * 不会出现在层次界面中。
     */
    HideFlags[HideFlags["HideInHierarchy"] = 1] = "HideInHierarchy";
    /**
     * 不会出现在检查器界面中。
     */
    HideFlags[HideFlags["HideInInspector"] = 2] = "HideInInspector";
    /**
     * 不会保存到编辑器中的场景中。
     */
    HideFlags[HideFlags["DontSaveInEditor"] = 4] = "DontSaveInEditor";
    /**
     * 在检查器中不可编辑。
     */
    HideFlags[HideFlags["NotEditable"] = 8] = "NotEditable";
    /**
     * 在构建播放器时对象不会被保存。
     */
    HideFlags[HideFlags["DontSaveInBuild"] = 16] = "DontSaveInBuild";
    /**
     * 对象不会被Resources.UnloadUnusedAssets卸载。
     */
    HideFlags[HideFlags["DontUnloadUnusedAsset"] = 32] = "DontUnloadUnusedAsset";
    /**
     * 不能被变换
     */
    HideFlags[HideFlags["DontTransform"] = 64] = "DontTransform";
    /**
     * 隐藏
     */
    HideFlags[HideFlags["Hide"] = 3] = "Hide";
    /**
     * 对象不会保存到场景中。加载新场景时不会被销毁。相当于DontSaveInBuild | HideFlags。DontSaveInEditor | HideFlags.DontUnloadUnusedAsset
     */
    HideFlags[HideFlags["DontSave"] = 20] = "DontSave";
    /**
     * 不显示在层次界面中，不保存到场景中，加载新场景时不会被销毁。
     */
    HideFlags[HideFlags["HideAndDontSave"] = 61] = "HideAndDontSave";
})(HideFlags || (HideFlags = {}));

/**
 * 所有feng3d对象的基类
 */
var Feng3dObject = /*@__PURE__*/(function (EventEmitter) {
    function Feng3dObject() {
        EventEmitter.call(this);
        /**
         * 隐藏标记，用于控制是否在层级界面、检查器显示，是否保存
         */
        this.hideFlags = HideFlags.None;
        this._disposed = false;
        Object.defineProperty(this, "uuid", { value: mathUtil.uuid() });
        Object.defineProperty(this, "disposed", { value: false, configurable: true });
        console.assert(!Feng3dObject.objectLib[this.uuid], "唯一标识符存在重复！？");
        Feng3dObject.objectLib[this.uuid] = this;
    }

    if ( EventEmitter ) Feng3dObject.__proto__ = EventEmitter;
    Feng3dObject.prototype = Object.create( EventEmitter && EventEmitter.prototype );
    Feng3dObject.prototype.constructor = Feng3dObject;

    var prototypeAccessors = { name: { configurable: true },disposed: { configurable: true } };
    /**
     * 名称
     */
    prototypeAccessors.name.get = function () {
        return this._name;
    };
    prototypeAccessors.name.set = function (v) {
        this._name = v;
    };
    /**
     * 是否已销毁
     */
    prototypeAccessors.disposed.get = function () { return this._disposed; };
    /**
     * 销毁
     */
    Feng3dObject.prototype.dispose = function dispose () {
        Object.defineProperty(this, "disposed", { value: true, configurable: false });
    };
    /**
     * 获取对象
     *
     * @param uuid 通用唯一标识符
     */
    Feng3dObject.getObject = function getObject (uuid) {
        return this.objectLib[uuid];
    };
    /**
     * 获取对象
     *
     * @param type
     */
    Feng3dObject.getObjects = function getObjects (type) {
        var this$1 = this;

        var objects = Object.keys(this.objectLib).map(function (v) { return this$1.objectLib[v]; });
        //
        var filterResult = objects;
        if (type) {
            filterResult = objects.filter(function (v) { return v instanceof type; });
        }
        return filterResult;
    };

    Object.defineProperties( Feng3dObject.prototype, prototypeAccessors );

    return Feng3dObject;
}(EventEmitter));
__decorate([
    serialize
], Feng3dObject.prototype, "hideFlags", void 0);
Object.defineProperty(Feng3dObject, "objectLib", { value: {} });
serialization.serializeHandlers.push(
// 处理 Feng3dObject
{
    priority: 0,
    handler: function (target, source, property) {
        var spv = source[property];
        if (spv instanceof Feng3dObject && (spv.hideFlags & HideFlags.DontSave)) {
            return true;
        }
        return false;
    }
});

/**
 * 组件信息属性常量，保存组件名称与组件依赖ComponentInfo，由 @RegisterComponent 装饰器进行填充。
 */
var __component__ = "__component__";
/**
 * 注册组件
 *
 * 使用 @RegisterComponent 在组件类定义上注册组件，配合扩展 ComponentMap 接口后可使用 Entity.getComponent 等方法。
 *
 * @param component 组件名称，默认使用类名称
 */
function RegisterComponent(component) {
    if ( component === void 0 ) component = {};

    return function (constructor) {
        var info = component;
        info.name = info.name || constructor.name;
        info.type = constructor;
        info.dependencies = info.dependencies || [];
        constructor.prototype[__component__] = info;
        if (Component._componentMap[info.name]) {
            console.warn(("重复定义组件" + (info.name) + "，" + (Component._componentMap[info.name]) + " " + constructor + " ！"));
        }
        else {
            Component._componentMap[info.name] = constructor;
        }
    };
}
function getComponentType(type) {
    return Component._componentMap[type];
}
/**
 * 组件
 *
 * 所有附加到Entity的基类。
 *
 * 注意，您的代码不会直接创建 Component，而是您编写脚本代码，然后将该脚本附加到 Entity。
 */
var Component = /*@__PURE__*/(function (Feng3dObject) {
    function Component() {
        Feng3dObject.call(this);
        this.onAny(this._onAnyListener, this);
    }

    if ( Feng3dObject ) Component.__proto__ = Feng3dObject;
    Component.prototype = Object.create( Feng3dObject && Feng3dObject.prototype );
    Component.prototype.constructor = Component;

    var prototypeAccessors = { entity: { configurable: true },name: { configurable: true },tag: { configurable: true } };
    /**
     * 获取组件依赖列表
     *
     * @param type 组件类定义
     */
    Component.getDependencies = function getDependencies (type) {
        var _a;
        var prototype = type.prototype;
        var dependencies = [];
        while (prototype) {
            dependencies = dependencies.concat(((_a = prototype[__component__]) === null || _a === void 0 ? void 0 : _a.dependencies) || []);
            prototype = prototype["__proto__"];
        }
        return dependencies;
    };
    /**
     * 判断组件是否为唯一组件。
     *
     * @param type 组件类定义
     */
    Component.isSingleComponent = function isSingleComponent (type) {
        var _a;
        var prototype = type.prototype;
        var isSingle = false;
        while (prototype && !isSingle) {
            isSingle = !!((_a = prototype[__component__]) === null || _a === void 0 ? void 0 : _a.single);
            prototype = prototype["__proto__"];
        }
        return isSingle;
    };
    //------------------------------------------
    // Variables
    //------------------------------------------
    /**
     * 此组件附加到的实体。组件总是附加到实体上。
     */
    prototypeAccessors.entity.get = function () {
        return this._entity;
    };
    prototypeAccessors.entity.set = function (v) {
        if (this._entity === v) {
            return;
        }
        console.assert(!this._entity, "组件无法再次加入其它Entity中!");
        this._entity = v;
    };
    /**
     * 名称。
     *
     * 组件与实体及所有附加组件使用相同的名称。
     */
    prototypeAccessors.name.get = function () {
        var _a;
        return (_a = this._entity) === null || _a === void 0 ? void 0 : _a.name;
    };
    prototypeAccessors.name.set = function (v) {
        this._entity.name = v;
    };
    /**
     * 此实体的标签。
     *
     * 可使用标签来识别实体。
     */
    prototypeAccessors.tag.get = function () {
        return this._entity.tag;
    };
    prototypeAccessors.tag.set = function (v) {
        this._entity.tag = v;
    };
    /**
     * 初始化组件
     *
     * 在添加到Entity时立即被调用。
     */
    Component.prototype.init = function init () {
    };
    /**
     * 获取指定位置索引的子组件
     * @param index			位置索引
     * @return				子组件
     */
    Component.prototype.getComponentAt = function getComponentAt (index) {
        return this.entity.getComponentAt(index);
    };
    /**
     * 添加指定组件类型到实体
     *
     * @type type 被添加组件
     */
    Component.prototype.addComponent = function addComponent (type, callback) {
        if ( callback === void 0 ) callback = null;

        return this.entity.addComponent(type, callback);
    };
    /**
     * 添加脚本
     * @param script   脚本路径
     */
    Component.prototype.addScript = function addScript (scriptName) {
        return this.entity.addScript(scriptName);
    };
    /**
     * 获取实体上第一个指定类型的组件，不存在时返回null
     *
     * @param type				类定义
     * @return                  返回指定类型组件
     */
    Component.prototype.getComponent = function getComponent (type) {
        return this.entity.getComponent(type);
    };
    /**
     * 获取实体上所有指定类型的组件数组
     *
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    Component.prototype.getComponents = function getComponents (type) {
        return this.entity.getComponents(type);
    };
    /**
     * 设置子组件的位置
     * @param component				子组件
     * @param index				位置索引
     */
    Component.prototype.setComponentIndex = function setComponentIndex (component, index) {
        this.entity.setComponentIndex(component, index);
    };
    /**
     * 设置组件到指定位置
     * @param component		被设置的组件
     * @param index			索引
     */
    Component.prototype.setComponentAt = function setComponentAt (component, index) {
        this.entity.setComponentAt(component, index);
    };
    /**
     * 移除组件
     * @param component 被移除组件
     */
    Component.prototype.removeComponent = function removeComponent (component) {
        this.entity.removeComponent(component);
    };
    /**
     * 获取组件在容器的索引位置
     * @param component			查询的组件
     * @return				    组件在容器的索引位置
     */
    Component.prototype.getComponentIndex = function getComponentIndex (component) {
        return this.entity.getComponentIndex(component);
    };
    /**
     * 移除组件
     * @param index		要删除的 Component 的子索引。
     */
    Component.prototype.removeComponentAt = function removeComponentAt (index) {
        return this.entity.removeComponentAt(index);
    };
    /**
     * 交换子组件位置
     * @param index1		第一个子组件的索引位置
     * @param index2		第二个子组件的索引位置
     */
    Component.prototype.swapComponentsAt = function swapComponentsAt (index1, index2) {
        this.swapComponentsAt(index1, index2);
    };
    /**
     * 交换子组件位置
     * @param a		第一个子组件
     * @param b		第二个子组件
     */
    Component.prototype.swapComponents = function swapComponents (a, b) {
        this.swapComponents(a, b);
    };
    /**
     * 销毁
     */
    Component.prototype.dispose = function dispose () {
        this._entity = null;
        this._disposed = true;
    };
    Component.prototype.beforeRender = function beforeRender (renderAtomic, scene, camera) {
    };
    /**
     * 监听对象的所有事件并且传播到所有组件中
     */
    Component.prototype._onAnyListener = function _onAnyListener (e) {
        if (this._entity)
            { this._entity.emitEvent(e); }
    };
    /**
     * 该方法仅在Entity中使用
     * @private
     *
     * @param entity 实体
     */
    Component.prototype._setEntity = function _setEntity (entity) {
        this._entity = entity;
    };

    Object.defineProperties( Component.prototype, prototypeAccessors );

    return Component;
}(Feng3dObject));
/**
 * 组件名称与类定义映射，由 @RegisterComponent 装饰器进行填充。
 * @private
 */
Component._componentMap = {};
__decorate([
    serialize
], Component.prototype, "entity", null);

/**
 * 资源扩展名
 */
var AssetType;
(function (AssetType) {
    /**
     * 文件夹
     */
    AssetType["folder"] = "folder";
    /**
     * 音频
     */
    AssetType["audio"] = "audio";
    /**
     * ts文件
     */
    AssetType["ts"] = "ts";
    /**
     * js文件
     */
    AssetType["js"] = "js";
    /**
     * 文本文件
     */
    AssetType["txt"] = "txt";
    /**
     * json文件
     */
    AssetType["json"] = "json";
    /**
     * OBJ模型资源附带的材质文件
     */
    AssetType["mtl"] = "mtl";
    /**
     * OBJ模型文件
     */
    AssetType["obj"] = "obj";
    /**
     * MD5模型文件
     */
    AssetType["md5mesh"] = "md5mesh";
    /**
     * MD5动画
     */
    AssetType["md5anim"] = "md5anim";
    /**
     * 魔兽MDL模型
     */
    AssetType["mdl"] = "mdl";
    // -- feng3d中的类型
    /**
     * 纹理
     */
    AssetType["texture"] = "texture";
    /**
     * 立方体纹理
     */
    AssetType["texturecube"] = "texturecube";
    /**
     * 材质
     */
    AssetType["material"] = "material";
    /**
     * 几何体
     */
    AssetType["geometry"] = "geometry";
    /**
     * 3d节点
     */
    AssetType["node3d"] = "node3d";
    /**
     * 场景
     */
    AssetType["scene"] = "scene";
    /**
     * 动画
     */
    AssetType["anim"] = "anim";
    /**
     * 着色器
     */
    AssetType["shader"] = "shader";
    /**
     * 脚本
     */
    AssetType["script"] = "script";
})(AssetType || (AssetType = {}));

/**
 * 轴对称包围盒
 *
 * 用于优化计算射线碰撞检测以及视锥剔除等。
 */
var BoundingBox = function BoundingBox(node3d) {
    this._selfLocalBounds = new Box3();
    this._selfWorldBounds = new Box3();
    this._worldBounds = new Box3();
    this._selfBoundsInvalid = true;
    this._selfWorldBoundsInvalid = true;
    this._worldBoundsInvalid = true;
    this._node3d = node3d;
    node3d.on("selfBoundsChanged", this._invalidateSelfLocalBounds, this);
    node3d.on("scenetransformChanged", this._invalidateSelfWorldBounds, this);
};

var prototypeAccessors = { selfLocalBounds: { configurable: true },selfWorldBounds: { configurable: true },worldBounds: { configurable: true } };
/**
 * 自身局部包围盒通常有Renderable组件提供
 */
prototypeAccessors.selfLocalBounds.get = function () {
    if (this._selfBoundsInvalid) {
        this._updateSelfBounds();
        this._selfBoundsInvalid = false;
    }
    return this._selfLocalBounds;
};
/**
 * 自身世界空间的包围盒
 */
prototypeAccessors.selfWorldBounds.get = function () {
    if (this._selfWorldBoundsInvalid) {
        this._updateSelfWorldBounds();
        this._selfWorldBoundsInvalid = false;
    }
    return this._selfWorldBounds;
};
/**
 * 世界包围盒
 */
prototypeAccessors.worldBounds.get = function () {
    if (this._worldBoundsInvalid) {
        this._updateWorldBounds();
        this._worldBoundsInvalid = false;
    }
    return this._worldBounds;
};
/**
 * 更新自身包围盒
 *
 * 自身包围盒通常有Renderable组件提供
 */
BoundingBox.prototype._updateSelfBounds = function _updateSelfBounds () {
    var bounds = this._selfLocalBounds.empty();
    // 获取对象上的包围盒
    var data = { bounds: [] };
    this._node3d.emit("getSelfBounds", data);
    data.bounds.forEach(function (b) {
        bounds.union(b);
    });
    if (bounds.isEmpty()) {
        bounds.min.setZero();
        bounds.max.setZero();
    }
};
/**
 * 更新自身世界包围盒
 */
BoundingBox.prototype._updateSelfWorldBounds = function _updateSelfWorldBounds () {
    this._selfWorldBounds.copy(this.selfLocalBounds).applyMatrix(this._node3d.localToWorldMatrix);
};
/**
 * 更新世界包围盒
 */
BoundingBox.prototype._updateWorldBounds = function _updateWorldBounds () {
        var this$1 = this;

    this._worldBounds.copy(this.selfWorldBounds);
    // 获取子对象的世界包围盒与自身世界包围盒进行合并
    this._node3d.children.forEach(function (element) {
        this$1._worldBounds.union(element.boundingBox.worldBounds);
    });
};
/**
 * 使自身包围盒失效
 */
BoundingBox.prototype._invalidateSelfLocalBounds = function _invalidateSelfLocalBounds () {
    if (this._selfBoundsInvalid)
        { return; }
    this._selfBoundsInvalid = true;
    this._invalidateSelfWorldBounds();
};
/**
 * 使自身世界包围盒失效
 */
BoundingBox.prototype._invalidateSelfWorldBounds = function _invalidateSelfWorldBounds () {
    if (this._selfWorldBoundsInvalid)
        { return; }
    this._selfWorldBoundsInvalid = true;
    this._invalidateWorldBounds();
};
/**
 * 使世界包围盒失效
 */
BoundingBox.prototype._invalidateWorldBounds = function _invalidateWorldBounds () {
    if (this._worldBoundsInvalid)
        { return; }
    this._worldBoundsInvalid = true;
    // 世界包围盒失效会影响父对象世界包围盒失效
    var parent = this._node3d.parent;
    if (!parent)
        { return; }
    parent.boundingBox._invalidateWorldBounds();
};

Object.defineProperties( BoundingBox.prototype, prototypeAccessors );

/**
 * 变换
 *
 * 物体的位置、旋转和比例。
 *
 * 场景中的每个对象都有一个变换。它用于存储和操作对象的位置、旋转和缩放。每个转换都可以有一个父元素，它允许您分层应用位置、旋转和缩放
 */
var Node3D = /*@__PURE__*/(function (Component) {
    function Node3D() {
        var this$1 = this;

        Component.call(this);
        this.assetType = AssetType.node3d;
        /**
         * 自身以及子对象是否支持鼠标拾取
         */
        this.mouseEnabled = true;
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._rx = 0;
        this._ry = 0;
        this._rz = 0;
        this._sx = 1;
        this._sy = 1;
        this._sz = 1;
        this._visible = true;
        this._globalVisible = false;
        this._globalVisibleInvalid = true;
        this._orientation = new Quaternion();
        this._matrix = new Matrix4x4();
        this._matrixInvalid = false;
        this._rotationMatrix = new Matrix4x4();
        this._rotationMatrixInvalid = false;
        this._localToWorldMatrix = new Matrix4x4();
        this._localToWorldMatrixInvalid = false;
        this._ITlocalToWorldMatrix = new Matrix4x4();
        this._ITlocalToWorldMatrixInvalid = false;
        this._worldToLocalMatrix = new Matrix4x4();
        this._worldToLocalMatrixInvalid = false;
        this._localToWorldRotationMatrix = new Matrix4x4();
        this._localToWorldRotationMatrixInvalid = false;
        this._children = [];
        this._renderAtomic = new RenderAtomic();
        this._renderAtomic.uniforms.u_modelMatrix = function () { return this$1.localToWorldMatrix; };
        this._renderAtomic.uniforms.u_ITModelMatrix = function () { return this$1.ITlocalToWorldMatrix; };
    }

    if ( Component ) Node3D.__proto__ = Component;
    Node3D.prototype = Object.create( Component && Component.prototype );
    Node3D.prototype.constructor = Node3D;

    var prototypeAccessors = { worldPosition: { configurable: true },x: { configurable: true },y: { configurable: true },z: { configurable: true },rx: { configurable: true },ry: { configurable: true },rz: { configurable: true },sx: { configurable: true },sy: { configurable: true },sz: { configurable: true },orientation: { configurable: true },visible: { configurable: true },globalVisible: { configurable: true },matrix: { configurable: true },rotationMatrix: { configurable: true },boundingBox: { configurable: true },parent: { configurable: true },scene: { configurable: true },children: { configurable: true },numChildren: { configurable: true },localToWorldMatrix: { configurable: true },ITlocalToWorldMatrix: { configurable: true },worldToLocalMatrix: { configurable: true },localToWorldRotationMatrix: { configurable: true },worldToLocalRotationMatrix: { configurable: true },isLoaded: { configurable: true } };
    /**
     * 世界坐标
     */
    prototypeAccessors.worldPosition.get = function () {
        return this.localToWorldMatrix.getPosition();
    };
    /**
     * X轴坐标。
     */
    prototypeAccessors.x.get = function () {
        return this._x;
    };
    prototypeAccessors.x.set = function (v) {
        if (this._x === v)
            { return; }
        this._x = v;
        this._positionChanged();
    };
    /**
     * Y轴坐标。
     */
    prototypeAccessors.y.get = function () {
        return this._y;
    };
    prototypeAccessors.y.set = function (v) {
        if (this._y === v)
            { return; }
        this._y = v;
        this._positionChanged();
    };
    /**
     * Z轴坐标。
     */
    prototypeAccessors.z.get = function () {
        return this._z;
    };
    prototypeAccessors.z.set = function (v) {
        if (this._z === v)
            { return; }
        this._z = v;
        this._positionChanged();
    };
    /**
     * X轴旋转角度。
     */
    prototypeAccessors.rx.get = function () {
        return this._rx;
    };
    prototypeAccessors.rx.set = function (v) {
        if (this._rx === v)
            { return; }
        this._rx = v;
        this._rotationChanged();
    };
    /**
     * Y轴旋转角度。
     */
    prototypeAccessors.ry.get = function () {
        return this._ry;
    };
    prototypeAccessors.ry.set = function (v) {
        if (this._ry === v)
            { return; }
        this._ry = v;
        this._rotationChanged();
    };
    /**
     * Z轴旋转角度。
     */
    prototypeAccessors.rz.get = function () {
        return this._rz;
    };
    prototypeAccessors.rz.set = function (v) {
        if (this._rz === v)
            { return; }
        this._rz = v;
        this._rotationChanged();
    };
    /**
     * X轴缩放。
     */
    prototypeAccessors.sx.get = function () {
        return this._sx;
    };
    prototypeAccessors.sx.set = function (v) {
        if (this._sx === v)
            { return; }
        this._sx = v;
        this._scaleChanged();
    };
    /**
     * Y轴缩放。
     */
    prototypeAccessors.sy.get = function () {
        return this._sy;
    };
    prototypeAccessors.sy.set = function (v) {
        if (this._sy === v)
            { return; }
        this._sy = v;
        this._scaleChanged();
    };
    /**
     * Z轴缩放。
     */
    prototypeAccessors.sz.get = function () {
        return this._sz;
    };
    prototypeAccessors.sz.set = function (v) {
        if (this._sz === v)
            { return; }
        this._sz = v;
        this._scaleChanged();
    };
    Node3D.prototype.getPosition = function getPosition (p) {
        if ( p === void 0 ) p = new Vector3();

        p.x = this._x;
        p.y = this._y;
        p.z = this._z;
        return p;
    };
    Node3D.prototype.setPosition = function setPosition (p) {
        this.x = p.x;
        this.y = p.y;
        this.z = p.z;
        return this;
    };
    Node3D.prototype.getRotation = function getRotation (p) {
        if ( p === void 0 ) p = new Vector3();

        p.x = this._rx;
        p.y = this._ry;
        p.z = this._rz;
        return p;
    };
    Node3D.prototype.setRotation = function setRotation (p) {
        this.rx = p.x;
        this.ry = p.y;
        this.rz = p.z;
        return this;
    };
    Node3D.prototype.getScale = function getScale (p) {
        if ( p === void 0 ) p = new Vector3();

        p.x = this._sx;
        p.y = this._sy;
        p.z = this._sz;
        return p;
    };
    /**
     * 本地四元素旋转
     */
    prototypeAccessors.orientation.get = function () {
        this._orientation.fromMatrix(this.matrix);
        return this._orientation;
    };
    prototypeAccessors.orientation.set = function (value) {
        var angles = value.toEulerAngles();
        angles.scaleNumber(mathUtil.RAD2DEG);
        this.rx = angles.x;
        this.ry = angles.y;
        this.rz = angles.z;
    };
    /**
     * 是否显示
     */
    prototypeAccessors.visible.get = function () {
        return this._visible;
    };
    prototypeAccessors.visible.set = function (v) {
        if (this._visible == v)
            { return; }
        this._visible = v;
        this._invalidateGlobalVisible();
    };
    /**
     * 全局是否可见
     */
    prototypeAccessors.globalVisible.get = function () {
        if (this._globalVisibleInvalid) {
            this._updateGlobalVisible();
            this._globalVisibleInvalid = false;
        }
        return this._globalVisible;
    };
    /**
     * 本地变换矩阵
     */
    prototypeAccessors.matrix.get = function () {
        if (this._matrixInvalid) {
            this._matrixInvalid = false;
            this._updateMatrix();
        }
        return this._matrix;
    };
    prototypeAccessors.matrix.set = function (v) {
        var trs = v.toTRS();
        this._x = trs[0].x;
        this._y = trs[0].y;
        this._z = trs[0].z;
        this._rx = trs[1].x;
        this._ry = trs[1].y;
        this._rz = trs[1].z;
        this._sx = trs[2].x;
        this._sy = trs[2].y;
        this._sz = trs[2].z;
        this._matrix.fromArray(v.elements);
        this._invalidateTransform();
        this._matrixInvalid = false;
    };
    /**
     * 本地旋转矩阵
     */
    prototypeAccessors.rotationMatrix.get = function () {
        if (this._rotationMatrixInvalid) {
            this._rotationMatrix.setRotation(tempVector3_1.set(this._rx, this._ry, this._rz));
            this._rotationMatrixInvalid = false;
        }
        return this._rotationMatrix;
    };
    /**
     * 轴对称包围盒
     */
    prototypeAccessors.boundingBox.get = function () {
        if (!this._boundingBox) {
            this._boundingBox = new BoundingBox(this);
        }
        return this._boundingBox;
    };
    prototypeAccessors.parent.get = function () {
        return this._parent;
    };
    prototypeAccessors.scene.get = function () {
        return this._scene;
    };
    /**
     * 子对象
     */
    prototypeAccessors.children.get = function () {
        return this._children.concat();
    };
    prototypeAccessors.children.set = function (value) {
        if (!value)
            { return; }
        for (var i = this._children.length - 1; i >= 0; i--) {
            this.removeChildAt(i);
        }
        for (var i = 0; i < value.length; i++) {
            this.addChild(value[i]);
        }
    };
    prototypeAccessors.numChildren.get = function () {
        return this._children.length;
    };
    Node3D.prototype.moveForward = function moveForward (distance) {
        this.translateLocal(Vector3.Z_AXIS, distance);
    };
    Node3D.prototype.moveBackward = function moveBackward (distance) {
        this.translateLocal(Vector3.Z_AXIS, -distance);
    };
    Node3D.prototype.moveLeft = function moveLeft (distance) {
        this.translateLocal(Vector3.X_AXIS, -distance);
    };
    Node3D.prototype.moveRight = function moveRight (distance) {
        this.translateLocal(Vector3.X_AXIS, distance);
    };
    Node3D.prototype.moveUp = function moveUp (distance) {
        this.translateLocal(Vector3.Y_AXIS, distance);
    };
    Node3D.prototype.moveDown = function moveDown (distance) {
        this.translateLocal(Vector3.Y_AXIS, -distance);
    };
    Node3D.prototype.translate = function translate (axis, distance) {
        var x = axis.x, y = axis.y, z = axis.z;
        var len = distance / Math.sqrt(x * x + y * y + z * z);
        this.x += x * len;
        this.y += y * len;
        this.z += z * len;
    };
    Node3D.prototype.translateLocal = function translateLocal (axis, distance) {
        var x = axis.x, y = axis.y, z = axis.z;
        var len = distance / Math.sqrt(x * x + y * y + z * z);
        var matrix = this.matrix.clone();
        matrix.prependTranslation(x * len, y * len, z * len);
        var p = matrix.getPosition();
        this.x = p.x;
        this.y = p.y;
        this.z = p.z;
        this._invalidateSceneTransform();
    };
    Node3D.prototype.pitch = function pitch (angle) {
        this.rotate(Vector3.X_AXIS, angle);
    };
    Node3D.prototype.yaw = function yaw (angle) {
        this.rotate(Vector3.Y_AXIS, angle);
    };
    Node3D.prototype.roll = function roll (angle) {
        this.rotate(Vector3.Z_AXIS, angle);
    };
    Node3D.prototype.rotateTo = function rotateTo (ax, ay, az) {
        this.rx = ax;
        this.ry = ay;
        this.rz = az;
    };
    /**
     * 绕指定轴旋转，不受位移与缩放影响
     * @param    axis               旋转轴
     * @param    angle              旋转角度
     * @param    pivotPoint         旋转中心点
     *
     */
    Node3D.prototype.rotate = function rotate (axis, angle, pivotPoint) {
        //转换位移
        var positionMatrix = Matrix4x4.fromPosition(this._x, this._y, this._z);
        positionMatrix.appendRotation(axis, angle, pivotPoint);
        var position = positionMatrix.getPosition();
        //转换旋转
        var rotationMatrix = Matrix4x4.fromRotation(this.rx, this.ry, this.rz);
        rotationMatrix.appendRotation(axis, angle, pivotPoint);
        var newrotation = rotationMatrix.toTRS()[1];
        var v = Math.round((newrotation.x - this.rx) / 180);
        if (v % 2 != 0) {
            newrotation.x += 180;
            newrotation.y = 180 - newrotation.y;
            newrotation.z += 180;
        }
        //
        var toRound = function (a, b, c) {
            if ( c === void 0 ) c = 360;

            return Math.round((b - a) / c) * c + a;
        };
        newrotation.x = toRound(newrotation.x, this.rx);
        newrotation.y = toRound(newrotation.y, this.ry);
        newrotation.z = toRound(newrotation.z, this.rz);
        //
        this.x = position.x;
        this.y = position.y;
        this.z = position.z;
        this.rx = newrotation.x;
        this.ry = newrotation.y;
        this.rz = newrotation.z;
        //
        this._invalidateSceneTransform();
    };
    /**
     * 看向目标位置
     *
     * @param target    目标位置
     * @param upAxis    向上朝向
     */
    Node3D.prototype.lookAt = function lookAt (target, upAxis) {
        this._updateMatrix();
        this._matrix.lookAt(target, upAxis);
        var trs = this._matrix.toTRS();
        //
        this._x = trs[0].x;
        this._y = trs[0].y;
        this._z = trs[0].z;
        this._rx = trs[1].x;
        this._ry = trs[1].y;
        this._rz = trs[1].z;
        this._sx = trs[2].x;
        this._sy = trs[2].y;
        this._sz = trs[2].z;
        //
        this._matrixInvalid = false;
    };
    /**
     * 将一个点从局部空间变换到世界空间的矩阵。
     */
    prototypeAccessors.localToWorldMatrix.get = function () {
        if (this._localToWorldMatrixInvalid) {
            this._localToWorldMatrixInvalid = false;
            this._updateLocalToWorldMatrix();
        }
        return this._localToWorldMatrix;
    };
    prototypeAccessors.localToWorldMatrix.set = function (value) {
        value = value.clone();
        this.parent && value.append(this.parent.worldToLocalMatrix);
        this.matrix = value;
    };
    /**
     * 本地转世界逆转置矩阵
     */
    prototypeAccessors.ITlocalToWorldMatrix.get = function () {
        if (this._ITlocalToWorldMatrixInvalid) {
            this._ITlocalToWorldMatrixInvalid = false;
            this._ITlocalToWorldMatrix.copy(this.localToWorldMatrix);
            this._ITlocalToWorldMatrix.invert().transpose();
        }
        return this._ITlocalToWorldMatrix;
    };
    /**
     * 将一个点从世界空间转换为局部空间的矩阵。
     */
    prototypeAccessors.worldToLocalMatrix.get = function () {
        if (this._worldToLocalMatrixInvalid) {
            this._worldToLocalMatrixInvalid = false;
            this._worldToLocalMatrix.copy(this.localToWorldMatrix).invert();
        }
        return this._worldToLocalMatrix;
    };
    prototypeAccessors.localToWorldRotationMatrix.get = function () {
        if (this._localToWorldRotationMatrixInvalid) {
            this._localToWorldRotationMatrix.copy(this.rotationMatrix);
            if (this.parent)
                { this._localToWorldRotationMatrix.append(this.parent.localToWorldRotationMatrix); }
            this._localToWorldRotationMatrixInvalid = false;
        }
        return this._localToWorldRotationMatrix;
    };
    prototypeAccessors.worldToLocalRotationMatrix.get = function () {
        var mat = this.localToWorldRotationMatrix.clone();
        mat.invert();
        return mat;
    };
    /**
     * 根据名称查找对象
     *
     * @param name 对象名称
     */
    Node3D.prototype.find = function find (name) {
        if (this.name == name)
            { return this; }
        for (var i = 0; i < this._children.length; i++) {
            var target = this._children[i].find(name);
            if (target)
                { return target; }
        }
        return null;
    };
    /**
     * 是否包含指定对象
     *
     * @param child 可能的子孙对象
     */
    Node3D.prototype.contains = function contains (child) {
        var checkitem = child;
        do {
            if (checkitem == this)
                { return true; }
            checkitem = checkitem.parent;
        } while (checkitem);
        return false;
    };
    /**
     * 添加子对象
     *
     * @param child 子对象
     */
    Node3D.prototype.addChild = function addChild (child) {
        if (child == null)
            { return; }
        if (child.parent == this) {
            // 把子对象移动到最后
            var childIndex = this._children.indexOf(child);
            if (childIndex != -1)
                { this._children.splice(childIndex, 1); }
            this._children.push(child);
        }
        else {
            if (child.contains(this)) {
                console.error("无法添加到自身中!");
                return;
            }
            if (child._parent)
                { child._parent.removeChild(child); }
            child._setParent(this);
            this._children.push(child);
            child.emit("added", { parent: this });
            this.emit("addChild", { child: child, parent: this }, true);
        }
        return child;
    };
    /**
     * 添加子对象
     *
     * @param children 子对象
     */
    Node3D.prototype.addChildren = function addChildren () {
        var children = [], len = arguments.length;
        while ( len-- ) children[ len ] = arguments[ len ];

        for (var i = 0; i < children.length; i++) {
            this.addChild(children[i]);
        }
    };
    /**
     * 移除自身
     */
    Node3D.prototype.remove = function remove () {
        if (this.parent)
            { this.parent.removeChild(this); }
    };
    /**
     * 移除所有子对象
     */
    Node3D.prototype.removeChildren = function removeChildren () {
        for (var i = this.numChildren - 1; i >= 0; i--) {
            this.removeChildAt(i);
        }
    };
    /**
     * 移除子对象
     *
     * @param child 子对象
     */
    Node3D.prototype.removeChild = function removeChild (child) {
        if (child == null)
            { return; }
        var childIndex = this._children.indexOf(child);
        if (childIndex != -1)
            { this.removeChildInternal(childIndex, child); }
    };
    /**
     * 删除指定位置的子对象
     *
     * @param index 需要删除子对象的所有
     */
    Node3D.prototype.removeChildAt = function removeChildAt (index) {
        var child = this._children[index];
        return this.removeChildInternal(index, child);
    };
    /**
     * 获取指定位置的子对象
     *
     * @param index
     */
    Node3D.prototype.getChildAt = function getChildAt (index) {
        index = index;
        return this._children[index];
    };
    /**
     * 获取子对象列表（备份）
     */
    Node3D.prototype.getChildren = function getChildren () {
        return this._children.concat();
    };
    /**
     * 将方向从局部空间转换到世界空间。
     *
     * @param direction 局部空间方向
     */
    Node3D.prototype.transformDirection = function transformDirection (direction) {
        direction = this.localToWolrdDirection(direction);
        return direction;
    };
    /**
     * 将方向从局部空间转换到世界空间。
     *
     * @param direction 局部空间方向
     */
    Node3D.prototype.localToWolrdDirection = function localToWolrdDirection (direction) {
        if (!this.parent)
            { return direction.clone(); }
        var matrix = this.parent.localToWorldRotationMatrix;
        direction = matrix.transformPoint3(direction);
        return direction;
    };
    /**
     * 将包围盒从局部空间转换到世界空间
     *
     * @param box 变换前的包围盒
     * @param out 变换之后的包围盒
     *
     * @returns 变换之后的包围盒
     */
    Node3D.prototype.localToWolrdBox = function localToWolrdBox (box, out) {
        if ( out === void 0 ) out = new Box3();

        if (!this.parent)
            { return out.copy(box); }
        var matrix = this.parent.localToWorldMatrix;
        box.applyMatrixTo(matrix, out);
        return out;
    };
    /**
     * 将位置从局部空间转换为世界空间。
     *
     * @param position 局部空间位置
     */
    Node3D.prototype.transformPoint = function transformPoint (position) {
        position = this.localToWorldPoint(position);
        return position;
    };
    /**
     * 将位置从局部空间转换为世界空间。
     *
     * @param position 局部空间位置
     */
    Node3D.prototype.localToWorldPoint = function localToWorldPoint (position) {
        if (!this.parent)
            { return position.clone(); }
        position = this.parent.localToWorldMatrix.transformPoint3(position);
        return position;
    };
    /**
     * 将向量从局部空间变换到世界空间。
     *
     * @param vector 局部空间向量
     */
    Node3D.prototype.transformVector = function transformVector (vector) {
        vector = this.localToWorldVector(vector);
        return vector;
    };
    /**
     * 将向量从局部空间变换到世界空间。
     *
     * @param vector 局部空间位置
     */
    Node3D.prototype.localToWorldVector = function localToWorldVector (vector) {
        if (!this.parent)
            { return vector.clone(); }
        var matrix = this.parent.localToWorldMatrix;
        vector = matrix.transformVector3(vector);
        return vector;
    };
    /**
     * Transforms a direction from world space to local space. The opposite of Transform.TransformDirection.
     *
     * 将一个方向从世界空间转换到局部空间。
     */
    Node3D.prototype.inverseTransformDirection = function inverseTransformDirection (direction) {
        direction = this.worldToLocalDirection(direction);
        return direction;
    };
    /**
     * 将一个方向从世界空间转换到局部空间。
     */
    Node3D.prototype.worldToLocalDirection = function worldToLocalDirection (direction) {
        if (!this.parent)
            { return direction.clone(); }
        var matrix = this.parent.localToWorldRotationMatrix.clone().invert();
        direction = matrix.transformPoint3(direction);
        return direction;
    };
    /**
     * 将位置从世界空间转换为局部空间。
     *
     * @param position 世界坐标系中位置
     */
    Node3D.prototype.worldToLocalPoint = function worldToLocalPoint (position, out) {
        if ( out === void 0 ) out = new Vector3();

        if (!this.parent)
            { return out.copy(position); }
        position = this.parent.worldToLocalMatrix.transformPoint3(position, out);
        return position;
    };
    /**
     * 将向量从世界空间转换为局部空间
     *
     * @param vector 世界坐标系中向量
     */
    Node3D.prototype.worldToLocalVector = function worldToLocalVector (vector) {
        if (!this.parent)
            { return vector.clone(); }
        vector = this.parent.worldToLocalMatrix.transformVector3(vector);
        return vector;
    };
    /**
     * 将 Ray3 从世界空间转换为局部空间。
     *
     * @param worldRay 世界空间射线。
     * @param localRay 局部空间射线。
     */
    Node3D.prototype.rayWorldToLocal = function rayWorldToLocal (worldRay, localRay) {
        if ( localRay === void 0 ) localRay = new Ray3();

        this.worldToLocalMatrix.transformRay(worldRay, localRay);
        return localRay;
    };
    /**
     * 从自身与子代（孩子，孩子的孩子，...）Entity 中获取所有指定类型的组件
     *
     * @param type		要检索的组件的类型。
     * @return			返回与给出类定义一致的组件
     */
    Node3D.prototype.getComponentsInChildren = function getComponentsInChildren (type, filter, result) {
        result = result || [];
        var findchildren = true;
        var cls = type;
        var components = this.entity.components;
        for (var i = 0, n = components.length; i < n; i++) {
            var item = components[i];
            if (!cls) {
                result.push(item);
            }
            else if (item instanceof cls) {
                if (filter) {
                    var filterresult = filter(item);
                    filterresult && filterresult.value && result.push(item);
                    findchildren = filterresult ? (filterresult && filterresult.findchildren) : false;
                }
                else {
                    result.push(item);
                }
            }
        }
        if (findchildren) {
            for (var i = 0, n = this.numChildren; i < n; i++) {
                this._children[i].getComponentsInChildren(type, filter, result);
            }
        }
        return result;
    };
    /**
     * 从父代（父亲，父亲的父亲，...）中获取组件
     *
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    Node3D.prototype.getComponentsInParents = function getComponentsInParents (type, result) {
        result = result || [];
        var parent = this.parent;
        while (parent) {
            var compnent = parent.getComponent(type);
            compnent && result.push(compnent);
            parent = parent.parent;
        }
        return result;
    };
    Node3D.prototype.beforeRender = function beforeRender (renderAtomic, scene, camera) {
        Object.assign(renderAtomic.uniforms, this._renderAtomic.uniforms);
    };
    /**
     * 销毁
     */
    Node3D.prototype.dispose = function dispose () {
        if (this.parent)
            { this.parent.removeChild(this); }
        for (var i = this._children.length - 1; i >= 0; i--) {
            this.removeChildAt(i);
        }
        Component.prototype.dispose.call(this);
    };
    Node3D.prototype.disposeWithChildren = function disposeWithChildren () {
        this.dispose();
        while (this.numChildren > 0)
            { this._children[0].dispose(); }
    };
    Node3D.prototype._positionChanged = function _positionChanged () {
        this._invalidateTransform();
    };
    Node3D.prototype._rotationChanged = function _rotationChanged () {
        this._invalidateTransform();
    };
    Node3D.prototype._scaleChanged = function _scaleChanged () {
        this._invalidateTransform();
    };
    Node3D.prototype._setParent = function _setParent (value) {
        this._parent = value;
        this.updateScene();
        this._invalidateSceneTransform();
    };
    Node3D.prototype.updateScene = function updateScene () {
        var _a;
        var newScene = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._scene;
        if (this._scene == newScene)
            { return; }
        if (this._scene) {
            this.emit("removedFromScene", this);
        }
        this._scene = newScene;
        if (this._scene) {
            this.emit("addedToScene", this);
        }
        this._updateChildrenScene();
    };
    /**
     * @private
     */
    Node3D.prototype._updateChildrenScene = function _updateChildrenScene () {
        for (var i = 0, n = this._children.length; i < n; i++) {
            this._children[i].updateScene();
        }
    };
    Node3D.prototype.removeChildInternal = function removeChildInternal (childIndex, child) {
        childIndex = childIndex;
        this._children.splice(childIndex, 1);
        child._setParent(null);
        child.emit("removed", { parent: this });
        this.emit("removeChild", { child: child, parent: this }, true);
    };
    Node3D.prototype._invalidateTransform = function _invalidateTransform () {
        if (this._matrixInvalid)
            { return; }
        this._matrixInvalid = true;
        this._rotationMatrixInvalid = true;
        this.emit("transformChanged", this);
        this._invalidateSceneTransform();
    };
    Node3D.prototype._invalidateSceneTransform = function _invalidateSceneTransform () {
        if (this._localToWorldMatrixInvalid)
            { return; }
        this._localToWorldMatrixInvalid = true;
        this._worldToLocalMatrixInvalid = true;
        this._ITlocalToWorldMatrixInvalid = true;
        this._localToWorldRotationMatrixInvalid = true;
        this.emit("scenetransformChanged", this);
        //
        if (this.entity) {
            for (var i = 0, n = this.numChildren; i < n; i++) {
                this.children[i]._invalidateSceneTransform();
            }
        }
    };
    Node3D.prototype._updateMatrix = function _updateMatrix () {
        this._matrix.fromTRS(tempVector3_1.set(this._x, this._y, this._z), tempVector3_2.set(this._rx, this._ry, this._rz), tempVector3_3.set(this._sx, this._sy, this._sz));
    };
    Node3D.prototype._updateLocalToWorldMatrix = function _updateLocalToWorldMatrix () {
        this._localToWorldMatrix.copy(this.matrix);
        if (this.parent)
            { this._localToWorldMatrix.append(this.parent.localToWorldMatrix); }
        this.emit("updateLocalToWorldMatrix", this);
        console.assert(!isNaN(this._localToWorldMatrix.elements[0]));
    };
    /**
     * 是否加载完成
     */
    prototypeAccessors.isLoaded.get = function () {
        if (!this.isSelfLoaded)
            { return false; }
        for (var i = 0; i < this.children.length; i++) {
            var element = this.children[i];
            if (!element.isLoaded)
                { return false; }
        }
        return true;
    };
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    Node3D.prototype.onLoadCompleted = function onLoadCompleted (callback) {
        var loadingNum = 0;
        if (!this.isSelfLoaded) {
            loadingNum++;
            this.onSelfLoadCompleted(function () {
                loadingNum--;
                if (loadingNum == 0)
                    { callback(); }
            });
        }
        for (var i = 0; i < this.children.length; i++) {
            var element = this.children[i];
            if (!element.isLoaded) {
                loadingNum++;
                element.onLoadCompleted(function () {
                    loadingNum--;
                    if (loadingNum == 0)
                        { callback(); }
                });
            }
        }
        if (loadingNum == 0)
            { callback(); }
    };
    Node3D.prototype._updateGlobalVisible = function _updateGlobalVisible () {
        var visible = this.visible;
        if (this.parent) {
            visible = visible && this.parent.globalVisible;
        }
        this._globalVisible = visible;
    };
    Node3D.prototype._invalidateGlobalVisible = function _invalidateGlobalVisible () {
        if (this._globalVisibleInvalid)
            { return; }
        this._globalVisibleInvalid = true;
        this._children.forEach(function (c) {
            c._invalidateGlobalVisible();
        });
    };
    /**
     * 申明冒泡函数
     * feng3d.__event_bubble_function__
     */
    Node3D.prototype.__event_bubble_function__ = function __event_bubble_function__ () {
        return [this.parent];
    };
    /**
     * @private
     * @param v
     */
    Node3D.prototype._setScene = function _setScene (v) {
        this._scene = v;
        this._updateChildrenScene();
    };

    Object.defineProperties( Node3D.prototype, prototypeAccessors );

    return Node3D;
}(Component));
__decorate([
    serialize
], Node3D.prototype, "prefabId", void 0);
__decorate([
    serialize
], Node3D.prototype, "assetId", void 0);
__decorate([
    serialize
], Node3D.prototype, "mouseEnabled", void 0);
__decorate([
    serialize,
    oav()
], Node3D.prototype, "x", null);
__decorate([
    serialize,
    oav()
], Node3D.prototype, "y", null);
__decorate([
    serialize,
    oav()
], Node3D.prototype, "z", null);
__decorate([
    serialize,
    oav()
], Node3D.prototype, "rx", null);
__decorate([
    serialize,
    oav()
], Node3D.prototype, "ry", null);
__decorate([
    serialize,
    oav()
], Node3D.prototype, "rz", null);
__decorate([
    serialize,
    oav()
], Node3D.prototype, "sx", null);
__decorate([
    serialize,
    oav()
], Node3D.prototype, "sy", null);
__decorate([
    serialize,
    oav()
], Node3D.prototype, "sz", null);
__decorate([
    serialize
], Node3D.prototype, "visible", null);
__decorate([
    serialize
], Node3D.prototype, "children", null);
Node3D = __decorate([
    RegisterComponent({ single: true })
], Node3D);
var tempVector3_1 = new Vector3();
var tempVector3_2 = new Vector3();
var tempVector3_3 = new Vector3();

/**
 * 3D组件
 *
 * 所有基于3D空间的组件均可继承于该组件。
 */
var Component3D = /*@__PURE__*/(function (Component) {
    function Component3D () {
        Component.apply(this, arguments);
    }

    if ( Component ) Component3D.__proto__ = Component;
    Component3D.prototype = Object.create( Component && Component.prototype );
    Component3D.prototype.constructor = Component3D;

    var prototypeAccessors = { node3d: { configurable: true } };

    prototypeAccessors.node3d.get = function () {
        var _a;
        return (_a = this._entity) === null || _a === void 0 ? void 0 : _a.getComponent(Node3D);
    };
    /**
     * Returns all components of Type type in the Entity.
     *
     * 返回 Entity 或其任何子项中类型为 type 的所有组件。
     *
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    Component3D.prototype.getComponentsInChildren = function getComponentsInChildren (type, filter, result) {
        return this.node3d.getComponentsInChildren(type, filter, result);
    };
    /**
     * 从父类中获取组件
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    Component3D.prototype.getComponentsInParents = function getComponentsInParents (type, result) {
        return this.node3d.getComponentsInParents(type, result);
    };

    Object.defineProperties( Component3D.prototype, prototypeAccessors );

    return Component3D;
}(Component));
Component3D = __decorate([
    RegisterComponent({ dependencies: [Node3D] })
], Component3D);

/**
 * 行为
 *
 * 可以控制开关的组件
 */
var Behaviour = /*@__PURE__*/(function (Component3D) {
    function Behaviour() {
        Component3D.apply(this, arguments);
        /**
         * 是否启用update方法
         */
        this.enabled = true;
        /**
         * 可运行环境
         */
        this.runEnvironment = RunEnvironment.all;
    }

    if ( Component3D ) Behaviour.__proto__ = Component3D;
    Behaviour.prototype = Object.create( Component3D && Component3D.prototype );
    Behaviour.prototype.constructor = Behaviour;

    var prototypeAccessors = { isVisibleAndEnabled: { configurable: true } };
    /**
     * Has the Behaviour had enabled called.
     * 是否所在GameObject显示且该行为已启动。
     */
    prototypeAccessors.isVisibleAndEnabled.get = function () {
        var _a;
        var v = this.enabled && ((_a = this.node3d) === null || _a === void 0 ? void 0 : _a.globalVisible);
        return v;
    };
    /**
     * 每帧执行
     */
    Behaviour.prototype.update = function update (interval) {
    };
    Behaviour.prototype.dispose = function dispose () {
        this.enabled = false;
        Component3D.prototype.dispose.call(this);
    };

    Object.defineProperties( Behaviour.prototype, prototypeAccessors );

    return Behaviour;
}(Component3D));
__decorate([
    oav(),
    serialize
], Behaviour.prototype, "enabled", void 0);
Behaviour = __decorate([
    RegisterComponent()
], Behaviour);

/**
 * 添加组件菜单
 *
 * 在组件类上新增 @AddComponentMenu("UI/Text") 可以把该组件添加到组件菜单上。
 *
 * @param path 组件菜单中路径
 * @param componentOrder 组件菜单中组件的顺序(从低到高)。
 */
function AddComponentMenu(path, componentOrder) {
    if ( componentOrder === void 0 ) componentOrder = 0;

    return function (target) {
        if (!menuConfig.component)
            { menuConfig.component = []; }
        menuConfig.component.push({ path: path, order: componentOrder, type: target["name"] });
        menuConfig.component.sort(function (a, b) { if (a.path < b.path)
            { return -1; } return 1; });
        menuConfig.component.sort(function (a, b) { return a.order - b.order; });
    };
}
/**
 * 菜单配置
 */
var menuConfig = {};

var AnimationClip = /*@__PURE__*/(function (Feng3dObject) {
    function AnimationClip() {
        Feng3dObject.apply(this, arguments);
        this.assetType = AssetType.anim;
        this.loop = true;
    }

    if ( Feng3dObject ) AnimationClip.__proto__ = Feng3dObject;
    AnimationClip.prototype = Object.create( Feng3dObject && Feng3dObject.prototype );
    AnimationClip.prototype.constructor = AnimationClip;

    var prototypeAccessors = { name: { configurable: true } };
    prototypeAccessors.name.get = function () {
        return this._name;
    };
    prototypeAccessors.name.set = function (v) {
        this._name = v;
    };

    Object.defineProperties( AnimationClip.prototype, prototypeAccessors );

    return AnimationClip;
}(Feng3dObject));
__decorate([
    oav(),
    serialize
], AnimationClip.prototype, "name", null);
__decorate([
    serialize
], AnimationClip.prototype, "length", void 0);
__decorate([
    oav(),
    serialize
], AnimationClip.prototype, "loop", void 0);
__decorate([
    serialize
], AnimationClip.prototype, "propertyClips", void 0);

var PropertyClip = function PropertyClip() {
    this._cacheValues = {};
};
PropertyClip.prototype.getValue = function getValue (cliptime, fps) {
        var this$1 = this;

    var frame = Math.round(fps * cliptime / 1000);
    if (this._cacheValues[frame] != undefined)
        { return this._cacheValues[frame]; }
    this._propertyValues = this._propertyValues || this.propertyValues.map(function (v) {
        return [v[0], this$1.getpropertyValue(v[1])];
    });
    var propertyValues = this._propertyValues;
    var propertyValue = propertyValues[0][1];
    if (cliptime <= propertyValues[0][0]) { }
    else if (cliptime >= propertyValues[propertyValues.length - 1][0])
        { propertyValue = propertyValues[propertyValues.length - 1][1]; }
    else {
        for (var j = 0; j < propertyValues.length - 1; j++) {
            if (propertyValues[j][0] <= cliptime && cliptime < propertyValues[j + 1][0]) {
                propertyValue = this.interpolation(propertyValues[j][1], propertyValues[j + 1][1], (cliptime - propertyValues[j][0]) / (propertyValues[j + 1][0] - propertyValues[j][0]));
                break;
            }
        }
    }
    this._cacheValues[frame] = propertyValue;
    return propertyValue;
};
PropertyClip.prototype.interpolation = function interpolation (prevalue, nextValue, factor) {
    var propertyValue;
    if (prevalue instanceof Quaternion) {
        propertyValue = prevalue.clone();
        propertyValue.lerp(prevalue, nextValue, factor);
    }
    else if (prevalue instanceof Vector3) {
        propertyValue = new Vector3(prevalue.x * (1 - factor) + nextValue.x * factor, prevalue.y * (1 - factor) + nextValue.y * factor, prevalue.z * (1 - factor) + nextValue.z * factor);
    }
    else {
        propertyValue = prevalue * (1 - factor) + nextValue * factor;
    }
    return propertyValue;
};
PropertyClip.prototype.getpropertyValue = function getpropertyValue (value) {
    if (this.type == "Number")
        { return value[0]; }
    if (this.type == "Vector3")
        { return Vector3.fromArray(value); }
    if (this.type == "Quaternion")
        { return Quaternion.fromArray(value); }
    console.error(("未处理 动画数据类型 " + (this.type)));
    console.error("");
};
__decorate([
    serialize
], PropertyClip.prototype, "path", void 0);
__decorate([
    serialize
], PropertyClip.prototype, "propertyName", void 0);
__decorate([
    serialize
], PropertyClip.prototype, "type", void 0);
__decorate([
    serialize
], PropertyClip.prototype, "propertyValues", void 0);
var PropertyClipPathItemType;
(function (PropertyClipPathItemType) {
    PropertyClipPathItemType[PropertyClipPathItemType["Entity"] = 0] = "Entity";
    PropertyClipPathItemType[PropertyClipPathItemType["Component"] = 1] = "Component";
})(PropertyClipPathItemType || (PropertyClipPathItemType = {}));

var Animation = /*@__PURE__*/(function (Behaviour) {
    function Animation() {
        Behaviour.apply(this, arguments);
        this.animations = [];
        /**
         * 动画事件，单位为ms
         */
        this.time = 0;
        this.isplaying = false;
        /**
         * 播放速度
         */
        this.playspeed = 1;
        this.num = 0;
        this._fps = 24;
        this._objectCache = new Map();
    }

    if ( Behaviour ) Animation.__proto__ = Behaviour;
    Animation.prototype = Object.create( Behaviour && Behaviour.prototype );
    Animation.prototype.constructor = Animation;

    var prototypeAccessors = { clipName: { configurable: true },frame: { configurable: true } };
    /**
     * 动作名称
     */
    prototypeAccessors.clipName.get = function () {
        return this.animation ? this.animation.name : null;
    };
    prototypeAccessors.frame.get = function () {
        if (!this.animation)
            { return -1; }
        var cycle = this.animation.length;
        var cliptime = (this.time % cycle + cycle) % cycle;
        var _frame = Math.round(this._fps * cliptime / 1000);
        return _frame;
    };
    Animation.prototype.update = function update (interval) {
        if (this.isplaying)
            { this.time += interval * this.playspeed; }
    };
    Animation.prototype.dispose = function dispose () {
        this.animation = null;
        this.animations = null;
        Behaviour.prototype.dispose.call(this);
    };
    Animation.prototype._updateAni = function _updateAni () {
        if (!this.animation)
            { return; }
        if ((this.num++) % 2 != 0)
            { return; }
        var cycle = this.animation.length;
        var cliptime = (this.time % cycle + cycle) % cycle;
        var propertyClips = this.animation.propertyClips;
        for (var i = 0; i < propertyClips.length; i++) {
            var propertyClip = propertyClips[i];
            var propertyValues = propertyClip.propertyValues;
            if (propertyValues.length == 0)
                { continue; }
            var propertyHost = this.getPropertyHost(propertyClip);
            if (!propertyHost)
                { continue; }
            propertyHost[propertyClip.propertyName] = propertyClip.getValue(cliptime, this._fps);
        }
    };
    Animation.prototype.getPropertyHost = function getPropertyHost (propertyClip) {
        if (propertyClip.cacheIndex && this._objectCache[propertyClip.cacheIndex])
            { return this._objectCache[propertyClip.cacheIndex]; }
        if (!propertyClip.cacheIndex)
            { propertyClip.cacheIndex = autoobjectCacheID++; }
        var propertyHost = this.node3d;
        var path = propertyClip.path;
        for (var i = 0; i < path.length; i++) {
            var element = path[i];
            switch (element[0]) {
                case PropertyClipPathItemType.Entity:
                    propertyHost = propertyHost.find(element[1]);
                    break;
                case PropertyClipPathItemType.Component:
                    var componentCls = getComponentType(element[1]);
                    propertyHost = propertyHost.getComponent(componentCls);
                    break;
                default:
                    console.error(("无法获取 PropertyHost " + element));
            }
            if (propertyHost == null)
                { return null; }
        }
        this._objectCache[propertyClip.cacheIndex] = propertyHost;
        return propertyHost;
    };
    Animation.prototype._onAnimationChanged = function _onAnimationChanged () {
        this.time = 0;
    };
    Animation.prototype._onTimeChanged = function _onTimeChanged () {
        this._updateAni();
    };

    Object.defineProperties( Animation.prototype, prototypeAccessors );

    return Animation;
}(Behaviour));
__decorate([
    oav({ component: "OAVDefault", componentParam: { dragparam: { accepttype: "animationclip", datatype: "animationclip" } } }),
    serialize,
    watch("_onAnimationChanged")
], Animation.prototype, "animation", void 0);
__decorate([
    oav({ component: "OAVArray", componentParam: { dragparam: { accepttype: "animationclip", datatype: "animationclip" }, defaultItem: function () { return new AnimationClip(); } } }),
    serialize
], Animation.prototype, "animations", void 0);
__decorate([
    oav(),
    watch("_onTimeChanged")
], Animation.prototype, "time", void 0);
__decorate([
    oav(),
    serialize
], Animation.prototype, "isplaying", void 0);
__decorate([
    oav(),
    serialize
], Animation.prototype, "playspeed", void 0);
Animation = __decorate([
    AddComponentMenu("Animator/Animation"),
    RegisterComponent()
], Animation);
var autoobjectCacheID = 1;

/**
 * 骨骼关节数据
 */
var SkeletonJoint = function SkeletonJoint() {
    /** 父关节索引 （-1说明本身是总父结点，这个序号其实就是行号了，譬如上面”origin“结点的序号就是0，无父结点； "body"结点序号是1，父结点序号是0，也就是说父结点是”origin“）*/
    this.parentIndex = -1;
    this.children = [];
};

var prototypeAccessors$1 = { invertMatrix: { configurable: true } };
prototypeAccessors$1.invertMatrix.get = function () {
    if (!this._invertMatrix)
        { this._invertMatrix = this.matrix.clone().invert(); }
    return this._invertMatrix;
};

Object.defineProperties( SkeletonJoint.prototype, prototypeAccessors$1 );
__decorate([
    serialize
], SkeletonJoint.prototype, "parentIndex", void 0);
__decorate([
    serialize
], SkeletonJoint.prototype, "name", void 0);
__decorate([
    serialize
], SkeletonJoint.prototype, "matrix", void 0);

/**
 * 3d对象脚本
 */
var ScriptComponent = /*@__PURE__*/(function (Behaviour) {
    function ScriptComponent() {
        Behaviour.apply(this, arguments);
        this.runEnvironment = RunEnvironment.feng3d;
        this._invalid = true;
        this.scriptInit = false;
    }

    if ( Behaviour ) ScriptComponent.__proto__ = Behaviour;
    ScriptComponent.prototype = Object.create( Behaviour && Behaviour.prototype );
    ScriptComponent.prototype.constructor = ScriptComponent;

    var prototypeAccessors = { scriptInstance: { configurable: true } };
    /**
     * 脚本对象
     */
    prototypeAccessors.scriptInstance.get = function () {
        if (this._invalid)
            { this._updateScriptInstance(); }
        return this._scriptInstance;
    };
    ScriptComponent.prototype.init = function init () {
        Behaviour.prototype.init.call(this);
        globalEmitter.on("asset.scriptChanged", this._invalidateScriptInstance, this);
    };
    ScriptComponent.prototype._updateScriptInstance = function _updateScriptInstance () {
        var oldInstance = this._scriptInstance;
        this._scriptInstance = null;
        if (!this.scriptName)
            { return; }
        var cls = classUtils.getDefinitionByName(this.scriptName, false);
        if (cls)
            { this._scriptInstance = new cls(); }
        else
            { console.warn(("无法初始化脚本 " + (this.scriptName))); }
        this.scriptInit = false;
        // 移除旧实例
        if (oldInstance) {
            // 如果两个类定义名称相同，则保留上个对象数据
            if (classUtils.getQualifiedClassName(oldInstance) == this.scriptName) {
                serialization.setValue(this._scriptInstance, oldInstance);
            }
            oldInstance.component = null;
            oldInstance.dispose();
        }
        this._invalid = false;
    };
    ScriptComponent.prototype._invalidateScriptInstance = function _invalidateScriptInstance () {
        this._invalid = true;
    };
    /**
     * 每帧执行
     */
    ScriptComponent.prototype.update = function update () {
        if (this.scriptInstance && !this.scriptInit) {
            this.scriptInstance.component = this;
            this.scriptInstance.init();
            this.scriptInit = true;
        }
        this.scriptInstance && this.scriptInstance.update();
    };
    /**
     * 销毁
     */
    ScriptComponent.prototype.dispose = function dispose () {
        this.enabled = false;
        if (this._scriptInstance) {
            this._scriptInstance.component = null;
            this._scriptInstance.dispose();
            this._scriptInstance = null;
        }
        Behaviour.prototype.dispose.call(this);
        globalEmitter.off("asset.scriptChanged", this._invalidateScriptInstance, this);
    };

    Object.defineProperties( ScriptComponent.prototype, prototypeAccessors );

    return ScriptComponent;
}(Behaviour));
__decorate([
    serialize,
    watch("_invalidateScriptInstance"),
    oav({ component: "OAVPick", componentParam: { accepttype: "file_script" } })
], ScriptComponent.prototype, "scriptName", void 0);
__decorate([
    serialize
], ScriptComponent.prototype, "scriptInstance", null);
ScriptComponent = __decorate([
    AddComponentMenu("Script/Script"),
    RegisterComponent()
], ScriptComponent);

/**
 * 实体，场景唯一存在的对象类型
 */
var Entity = /*@__PURE__*/(function (Feng3dObject) {
    function Entity() {
        Feng3dObject.call(this);
        //------------------------------------------
        // Protected Properties
        //------------------------------------------
        /**
         * 组件列表
         */
        this._components = [];
        this.name = "Entity";
        this.onAny(this._onAnyListener, this);
    }

    if ( Feng3dObject ) Entity.__proto__ = Feng3dObject;
    Entity.prototype = Object.create( Feng3dObject && Feng3dObject.prototype );
    Entity.prototype.constructor = Entity;

    var prototypeAccessors = { name: { configurable: true },numComponents: { configurable: true },components: { configurable: true },children: { configurable: true } };
    /**
     * 名称
     */
    prototypeAccessors.name.get = function () {
        return this._name;
    };
    prototypeAccessors.name.set = function (v) {
        this._name = v;
    };
    //------------------------------------------
    // Variables
    //------------------------------------------
    /**
     * 子组件个数
     */
    prototypeAccessors.numComponents.get = function () {
        return this._components.length;
    };
    prototypeAccessors.components.get = function () {
        return this._components.concat();
    };
    prototypeAccessors.components.set = function (value) {
        if (!value)
            { return; }
        for (var i = 0, n = value.length; i < n; i++) {
            var component = value[i];
            if (!component)
                { continue; }
            this.addComponentAt(value[i], this.numComponents);
        }
    };
    /**
     * 获取指定位置索引的子组件
     *
     * @param index			位置索引
     * @return				子组件
     */
    Entity.prototype.getComponentAt = function getComponentAt (index) {
        console.assert(index < this.numComponents, "给出索引超出范围");
        return this._components[index];
    };
    /**
     * 添加指定组件类型到实体
     *
     * @type type 被添加组件类定义
     */
    Entity.prototype.addComponent = function addComponent (type, callback) {
        var this$1 = this;

        var component = this.getComponent(type);
        if (component && Component.isSingleComponent(type)) {
            // alert(`The compnent ${param["name"]} can't be added because ${this.name} already contains the same component.`);
            return component;
        }
        var dependencies = Component.getDependencies(type);
        // 先添加依赖
        dependencies.forEach(function (dependency) {
            this$1.addComponent(dependency);
        });
        // 
        component = new type();
        this.addComponentAt(component, this._components.length);
        callback && callback(component);
        return component;
    };
    /**
     * 添加脚本
     *
     * @param script   脚本路径
     */
    Entity.prototype.addScript = function addScript (scriptName) {
        var scriptComponent = new ScriptComponent();
        scriptComponent.scriptName = scriptName;
        this.addComponentAt(scriptComponent, this._components.length);
        return scriptComponent;
    };
    /**
     * 获取实体上第一个指定类型的组件，不存在时返回null
     *
     * @param type				类定义
     * @return                  返回指定类型组件
     */
    Entity.prototype.getComponent = function getComponent (type) {
        var component = this.getComponents(type)[0];
        return component;
    };
    /**
     * 获取实体上所有指定类型的组件数组
     *
     * @param type		类定义
     * @return			返回与给出类定义一致的组件
     */
    Entity.prototype.getComponents = function getComponents (type) {
        console.assert(!!type, "类型不能为空！");
        var cls = type;
        if (!cls) {
            console.warn(("无法找到 " + (type.name) + " 组件类定义，请使用 @RegisterComponent() 在组件类上标记。"));
            return [];
        }
        var filterResult = this._components.filter(function (v) { return v instanceof cls; });
        return filterResult;
    };
    /**
     * 设置子组件的位置
     *
     * @param component				子组件
     * @param index				位置索引
     */
    Entity.prototype.setComponentIndex = function setComponentIndex (component, index) {
        console.assert(index >= 0 && index < this.numComponents, "给出索引超出范围");
        var oldIndex = this._components.indexOf(component);
        console.assert(oldIndex >= 0 && oldIndex < this.numComponents, "子组件不在容器内");
        this._components.splice(oldIndex, 1);
        this._components.splice(index, 0, component);
    };
    /**
     * 设置组件到指定位置
     *
     * @param component		被设置的组件
     * @param index			索引
     */
    Entity.prototype.setComponentAt = function setComponentAt (component, index) {
        if (this._components[index]) {
            this.removeComponentAt(index);
        }
        this.addComponentAt(component, index);
    };
    /**
     * 移除组件
     *
     * @param component 被移除组件
     */
    Entity.prototype.removeComponent = function removeComponent (component) {
        console.assert(this.hasComponent(component), "只能移除在容器中的组件");
        var index = this.getComponentIndex(component);
        this.removeComponentAt(index);
    };
    /**
     * 获取组件在容器的索引位置
     *
     * @param component			查询的组件
     * @return				    组件在容器的索引位置
     */
    Entity.prototype.getComponentIndex = function getComponentIndex (component) {
        console.assert(this._components.indexOf(component) != -1, "组件不在容器中");
        var index = this._components.indexOf(component);
        return index;
    };
    /**
     * 移除组件
     *
     * @param index		要删除的 Component 的子索引。
     */
    Entity.prototype.removeComponentAt = function removeComponentAt (index) {
        console.assert(index >= 0 && index < this.numComponents, "给出索引超出范围");
        var component = this._components.splice(index, 1)[0];
        //派发移除组件事件
        this.emit("removeComponent", { component: component, entity: this }, true);
        component.dispose();
        return component;
    };
    /**
     * 交换子组件位置
     *
     * @param index1		第一个子组件的索引位置
     * @param index2		第二个子组件的索引位置
     */
    Entity.prototype.swapComponentsAt = function swapComponentsAt (index1, index2) {
        console.assert(index1 >= 0 && index1 < this.numComponents, "第一个子组件的索引位置超出范围");
        console.assert(index2 >= 0 && index2 < this.numComponents, "第二个子组件的索引位置超出范围");
        var temp = this._components[index1];
        this._components[index1] = this._components[index2];
        this._components[index2] = temp;
    };
    /**
     * 交换子组件位置
     *
     * @param a		第一个子组件
     * @param b		第二个子组件
     */
    Entity.prototype.swapComponents = function swapComponents (a, b) {
        console.assert(this.hasComponent(a), "第一个子组件不在容器中");
        console.assert(this.hasComponent(b), "第二个子组件不在容器中");
        this.swapComponentsAt(this.getComponentIndex(a), this.getComponentIndex(b));
    };
    /**
     * 获取指定类型组件
     *
     * @param type 组件类型
     */
    Entity.prototype.getComponentsByType = function getComponentsByType (type) {
        var removeComponents = [];
        for (var i = 0; i < this._components.length; i++) {
            if (this._components[i] instanceof type)
                { removeComponents.push(this._components[i]); }
        }
        return removeComponents;
    };
    /**
     * 移除指定类型组件
     *
     * @param type 组件类型
     */
    Entity.prototype.removeComponentsByType = function removeComponentsByType (type) {
        var removeComponents = [];
        for (var i = this._components.length - 1; i >= 0; i--) {
            if (this._components[i].constructor == type)
                { removeComponents.push(this.removeComponentAt(i)); }
        }
        return removeComponents;
    };
    /**
     * 监听对象的所有事件并且传播到所有组件中
     */
    Entity.prototype._onAnyListener = function _onAnyListener (e) {
        this.components.forEach(function (element) {
            element.emitEvent(e);
        });
    };
    /**
     * 销毁
     */
    Entity.prototype.dispose = function dispose () {
        for (var i = this._components.length - 1; i >= 0; i--) {
            this.removeComponentAt(i);
        }
        Feng3dObject.prototype.dispose.call(this);
    };
    //------------------------------------------
    // Static Functions
    //------------------------------------------
    /**
     * 查找指定名称的实体
     *
     * @param name
     */
    Entity.find = function find (name) {
        var entitys = Feng3dObject.getObjects(Entity);
        var result = entitys.filter(function (v) { return !v.disposed && (v.name == name); });
        return result[0];
    };
    //------------------------------------------
    // Protected Functions
    //------------------------------------------
    //------------------------------------------
    // Private Properties
    //------------------------------------------
    //------------------------------------------
    // Private Methods
    //------------------------------------------
    /**
     * 判断是否拥有组件
     *
     * @param com	被检测的组件
     * @return		true：拥有该组件；false：不拥有该组件。
     */
    Entity.prototype.hasComponent = function hasComponent (com) {
        return this._components.indexOf(com) != -1;
    };
    /**
     * 添加组件到指定位置
     *
     * @param component		被添加的组件
     * @param index			插入的位置
     */
    Entity.prototype.addComponentAt = function addComponentAt (component, index) {
        if (component == null)
            { return; }
        console.assert(index >= 0 && index <= this.numComponents, "给出索引超出范围");
        if (this.hasComponent(component)) {
            index = Math.min(index, this._components.length - 1);
            this.setComponentIndex(component, index);
            return;
        }
        //组件唯一时移除同类型的组件
        var type = component.constructor;
        if (Component.isSingleComponent(type)) {
            var oldComponents = this.getComponentsByType(type);
            if (oldComponents.length > 0) {
                console.assert(oldComponents.length == 1);
                this.removeComponent(oldComponents[0]);
            }
        }
        this._components.splice(index, 0, component);
        component._setEntity(this);
        component.init();
        //派发添加组件事件
        this.emit("addComponent", { component: component, entity: this }, true);
    };
    /**
     * 为了兼容以往json序列化格式
     *
     * @deprecated
     */
    prototypeAccessors.children.set = function (v) {
        var this$1 = this;

        var node3ds = v.map(function (v) { return v.getComponent(Node3D); });
        var node3d = this.getComponent(Node3D);
        if (node3d) {
            node3d.children = node3ds;
        }
        else {
            var f = function (e) {
                if (e.data.entity == this$1 && e.data.component instanceof Node3D) {
                    e.data.component.children = node3ds;
                    this$1.off("addComponent", f);
                }
            };
            this.on("addComponent", f);
        }
        this._children = v;
    };
    /**
     * 创建指定类型的实体。
     *
     * @param type 实体类型。
     * @param param 实体参数。
     */
    Entity.createPrimitive = function createPrimitive (type, param) {
        var g = new Entity();
        g.name = type;
        var createHandler = this._registerPrimitives[type];
        if (createHandler != null)
            { createHandler(g); }
        serialization.setValue(g, param);
        return g.getComponent(Node3D);
    };
    /**
     * 注册原始实体，被注册后可以使用 Entity.createPrimitive 进行创建。
     *
     * @param type 原始实体类型。
     * @param handler 构建原始实体的函数。
     */
    Entity.registerPrimitive = function registerPrimitive (type, handler) {
        if (this._registerPrimitives[type])
            { console.warn(("重复注册原始实体 " + type + " ！")); }
        this._registerPrimitives[type] = handler;
    };

    Object.defineProperties( Entity.prototype, prototypeAccessors );

    return Entity;
}(Feng3dObject));
Entity._registerPrimitives = {};
__decorate([
    serialize,
    oav({ component: "OAVEntityName" })
], Entity.prototype, "name", null);
__decorate([
    serialize
], Entity.prototype, "tag", void 0);
__decorate([
    serialize,
    oav({ component: "OAVComponentList" })
], Entity.prototype, "components", null);

var SkeletonComponent = /*@__PURE__*/(function (Component3D) {
    function SkeletonComponent() {
        Component3D.apply(this, arguments);
        /** 骨骼关节数据列表 */
        this.joints = [];
        //
        this.isInitJoints = false;
    }

    if ( Component3D ) SkeletonComponent.__proto__ = Component3D;
    SkeletonComponent.prototype = Object.create( Component3D && Component3D.prototype );
    SkeletonComponent.prototype.constructor = SkeletonComponent;

    var prototypeAccessors = { globalMatrices: { configurable: true } };
    /**
     * 当前骨骼姿势的全局矩阵
     * @see #globalPose
     */
    prototypeAccessors.globalMatrices.get = function () {
        if (!this.isInitJoints) {
            this.initSkeleton();
            this.isInitJoints = true;
        }
        if (this._globalPropertiesInvalid) {
            this.updateGlobalProperties();
            this._globalPropertiesInvalid = false;
        }
        return this._globalMatrices;
    };
    SkeletonComponent.prototype.initSkeleton = function initSkeleton () {
        this.jointNode3Ds = [];
        this.jointNode3DMap = {};
        //
        this.createSkeletonNode3D();
        //
        this._globalPropertiesInvalid = true;
        this._jointsInvalid = [];
        this._globalMatrixsInvalid = [];
        this.globalMatrixs = [];
        this._globalMatrices = [];
        //
        var jointNum = this.joints.length;
        for (var i = 0; i < jointNum; i++) {
            this._jointsInvalid[i] = true;
            this._globalMatrixsInvalid[i] = true;
            this.globalMatrixs[i] = new Matrix4x4();
            this._globalMatrices[i] = new Matrix4x4();
        }
    };
    /**
     * 更新骨骼全局变换矩阵
     */
    SkeletonComponent.prototype.updateGlobalProperties = function updateGlobalProperties () {
        //姿势变换矩阵
        var joints = this.joints;
        var jointGameobjects = this.jointNode3Ds;
        var globalMatrixs = this.globalMatrixs;
        var _globalMatrixsInvalid = this._globalMatrixsInvalid;
        //遍历每个关节
        for (var i = 0; i < joints.length; ++i) {
            if (!this._jointsInvalid[i])
                { continue; }
            this._globalMatrices[i]
                .copy(globalMatrix(i))
                .prepend(joints[i].invertMatrix);
            this._jointsInvalid[i] = false;
        }
        function globalMatrix(index) {
            if (!_globalMatrixsInvalid[index])
                { return globalMatrixs[index]; }
            var jointPose = joints[index];
            var jointGameobject = jointGameobjects[index];
            globalMatrixs[index] = jointGameobject.matrix.clone();
            if (jointPose.parentIndex >= 0) {
                var parentGlobalMatrix = globalMatrix(jointPose.parentIndex);
                globalMatrixs[index].append(parentGlobalMatrix);
            }
            _globalMatrixsInvalid[index] = false;
            return globalMatrixs[index];
        }
    };
    SkeletonComponent.prototype.invalidjoint = function invalidjoint (jointIndex) {
        var this$1 = this;

        this._globalPropertiesInvalid = true;
        this._jointsInvalid[jointIndex] = true;
        this._globalMatrixsInvalid[jointIndex] = true;
        this.joints[jointIndex].children.forEach(function (element) {
            this$1.invalidjoint(element);
        });
    };
    SkeletonComponent.prototype.createSkeletonNode3D = function createSkeletonNode3D () {
        var skeleton = this;
        var joints = skeleton.joints;
        var jointNode3Ds = this.jointNode3Ds;
        var jointNode3DMap = this.jointNode3DMap;
        for (var i = 0; i < joints.length; i++) {
            createJoint(i);
        }
        function createJoint(i) {
            if (jointNode3Ds[i])
                { return jointNode3Ds[i]; }
            var skeletonJoint = joints[i];
            var parentNode3D;
            if (skeletonJoint.parentIndex != -1) {
                parentNode3D = createJoint(skeletonJoint.parentIndex);
                joints[skeletonJoint.parentIndex].children.push(i);
            }
            else {
                parentNode3D = skeleton.node3d;
            }
            var jointTransform = parentNode3D.find(skeletonJoint.name);
            if (!jointTransform) {
                var entity = new Entity();
                entity.name = skeletonJoint.name;
                entity.hideFlags = HideFlags.DontSave;
                jointTransform = entity.addComponent(Node3D);
                parentNode3D.addChild(jointTransform);
            }
            var node3d = jointTransform;
            var matrix = skeletonJoint.matrix;
            if (skeletonJoint.parentIndex != -1) {
                matrix = matrix.clone().append(joints[skeletonJoint.parentIndex].invertMatrix);
            }
            node3d.matrix = matrix;
            node3d.on("transformChanged", function () {
                skeleton.invalidjoint(i);
            });
            jointNode3Ds[i] = node3d;
            jointNode3DMap[skeletonJoint.name] = node3d;
            return jointTransform;
        }
    };

    Object.defineProperties( SkeletonComponent.prototype, prototypeAccessors );

    return SkeletonComponent;
}(Component3D));
__decorate([
    serialize,
    oav()
], SkeletonComponent.prototype, "joints", void 0);
SkeletonComponent = __decorate([
    RegisterComponent()
], SkeletonComponent);

/**
 * 资源数据
 *
 * 该对象可由资源文件中读取，或者保存为资源
 */
var AssetData = /*@__PURE__*/(function (Feng3dObject) {
    function AssetData () {
        Feng3dObject.apply(this, arguments);
    }

    if ( Feng3dObject ) AssetData.__proto__ = Feng3dObject;
    AssetData.prototype = Object.create( Feng3dObject && Feng3dObject.prototype );
    AssetData.prototype.constructor = AssetData;

    var prototypeAccessors = { name: { configurable: true },assetId: { configurable: true } };

    prototypeAccessors.name.get = function () {
        return this._name;
    };
    prototypeAccessors.name.set = function (v) { this._name = v; };
    /**
     * 资源编号
     */
    prototypeAccessors.assetId.get = function () {
        return this._assetId;
    };
    prototypeAccessors.assetId.set = function (v) {
        if (this._assetId == v)
            { return; }
        if (this._assetId != undefined) {
            console.error("不允许修改 assetId");
            return;
        }
        this._assetId = v;
    };
    /**
     * 新增资源数据
     *
     * @param assetId 资源编号
     * @param data 资源数据
     */
    AssetData.addAssetData = function addAssetData (assetId, data) {
        if (!data)
            { return; }
        if (this.assetMap.has(data) || this.idAssetMap.has(assetId)) {
            console.warn("同一个材质被保存在多个资源中！");
        }
        this.assetMap.set(data, assetId);
        this.idAssetMap.set(assetId, data);
        return data;
    };
    /**
     * 删除资源数据
     *
     * @param data 资源数据
     */
    AssetData.deleteAssetData = function deleteAssetData (data) {
        if (!data)
            { return; }
        console.assert(this.assetMap.has(data));
        var assetId = this.assetMap.get(data);
        this._delete(assetId, data);
    };
    AssetData.deleteAssetDataById = function deleteAssetDataById (assetId) {
        console.assert(this.idAssetMap.has(assetId));
        var data = this.idAssetMap.get(assetId);
        this._delete(assetId, data);
    };
    AssetData._delete = function _delete (assetId, data) {
        this.assetMap.delete(data);
        this.idAssetMap.delete(assetId);
    };
    /**
     * 判断是否为资源数据
     *
     * @param asset 可能的资源数据
     */
    AssetData.isAssetData = function isAssetData (asset) {
        if (!asset || asset.assetId == undefined)
            { return false; }
        if (asset instanceof AssetData)
            { return true; }
        if (classUtils.getDefaultInstanceByName(asset[__class__]) instanceof AssetData)
            { return true; }
    };
    /**
     * 序列化
     *
     * @param asset 资源数据
     */
    AssetData.serialize = function serialize (asset) {
        var obj = {};
        obj[__class__] = classUtils.getQualifiedClassName(asset);
        obj.assetId = asset.assetId;
        return obj;
    };
    /**
     * 反序列化
     *
     * @param object 资源对象
     */
    AssetData.deserialize = function deserialize (object) {
        var result = this.getLoadedAssetData(object.assetId);
        console.assert(!!result, ("资源 " + (object.assetId) + " 未加载，请使用 ReadRS.deserializeWithAssets 进行序列化包含加载的资源对象。"));
        return result;
    };
    /**
     * 获取已加载的资源数据
     *
     * @param assetId 资源编号
     */
    AssetData.getLoadedAssetData = function getLoadedAssetData (assetId) {
        return this.idAssetMap.get(assetId);
    };
    /**
     * 获取所有已加载资源数据
     */
    AssetData.getAllLoadedAssetDatas = function getAllLoadedAssetDatas () {
        return Map.getKeys(this.assetMap);
    };

    Object.defineProperties( AssetData.prototype, prototypeAccessors );

    return AssetData;
}(Feng3dObject));
/**
 * 资源属性标记名称
 */
AssetData.assetPropertySign = "assetId";
/**
 * 资源与编号对应表
 */
AssetData.assetMap = new Map();
/**
 * 编号与资源对应表
 */
AssetData.idAssetMap = new Map();
__decorate([
    serialize
], AssetData.prototype, "name", null);
__decorate([
    serialize
], AssetData.prototype, "assetId", null);
/**
 * 设置函数列表
 */
serialization.setValueHandlers.push(
// 处理资源
{
    priority: 0,
    handler: function (target, source, property, param) {
        var tpv = target[property];
        var spv = source[property];
        if (AssetData.isAssetData(spv)) {
            // 此处需要反序列化资源完整数据
            if (property == "__root__") {
                return false;
            }
            target[property] = AssetData.deserialize(spv);
            return true;
        }
        if (AssetData.isAssetData(tpv)) {
            if (spv.__class__ == null) {
                var className = classUtils.getQualifiedClassName(tpv);
                var inst = classUtils.getInstanceByName(className);
                param.serialization.setValue(inst, spv);
                target[property] = inst;
            }
            else {
                target[property] = param.serialization.deserialize(spv);
            }
            return true;
        }
        return false;
    }
});
serialization.serializeHandlers.push(
// 处理资源
{
    priority: 0,
    handler: function (target, source, property) {
        var spv = source[property];
        if (AssetData.isAssetData(spv)) {
            // 此处需要反序列化资源完整数据
            if (property == "__root__") {
                return false;
            }
            target[property] = AssetData.serialize(spv);
            return true;
        }
        return false;
    }
});
serialization.deserializeHandlers.push(
// 处理资源
{
    priority: 0,
    handler: function (target, source, property, param) {
        var tpv = target[property];
        var spv = source[property];
        if (AssetData.isAssetData(spv)) {
            // 此处需要反序列化资源完整数据
            if (property == "__root__") {
                return false;
            }
            target[property] = AssetData.deserialize(spv);
            return true;
        }
        if (AssetData.isAssetData(tpv)) {
            target[property] = param.serialization.deserialize(spv);
            return true;
        }
        return false;
    }
}, 
// 处理资源
{
    priority: 0,
    handler: function (target, source, property, param) {
        var tpv = target[property];
        var spv = source[property];
        if (AssetData.isAssetData(spv)) {
            // 此处需要反序列化资源完整数据
            if (property == "__root__") {
                return false;
            }
            target[property] = AssetData.deserialize(spv);
            return true;
        }
        if (AssetData.assetMap.has(tpv)) {
            target[property] = param.serialization.deserialize(spv);
            return true;
        }
        return false;
    }
});
serialization.differentHandlers.push(
// 资源
{
    priority: 0,
    handler: function (target, source, property, param) {
        var different = param.different;
        var tpv = target[property];
        if (AssetData.isAssetData(tpv)) {
            // 此处需要反序列化资源完整数据
            if (property == "__root__") {
                return false;
            }
            different[property] = AssetData.serialize(tpv);
            return true;
        }
        return false;
    }
});

var GeometryUtils = function GeometryUtils () {};

GeometryUtils.prototype.createIndices = function createIndices (positions) {
    var vertexNum = positions.length / 3;
    var indices = [];
    for (var i = 0; i < vertexNum; i++) {
        indices[i] = i;
    }
    return indices;
};
/**
 * 创建循环uv数据
 * @param positions 顶点数据
 */
GeometryUtils.prototype.createUVs = function createUVs (positions) {
    var idx = 0, uvIdx = 0;
    var target = [];
    var len = positions.length / 3 * 2;
    while (idx < len) {
        target[idx++] = uvIdx * .5;
        target[idx++] = 1.0 - (uvIdx & 1);
        if (++uvIdx == 3)
            { uvIdx = 0; }
    }
    return target;
};
/**
 * 计算顶点法线数据
 * @param indices 顶点索引
 * @param positions 顶点数据
 * @param useFaceWeights 是否使用面权重计算法线
 */
GeometryUtils.prototype.createVertexNormals = function createVertexNormals (indices, positions, useFaceWeights) {
        if ( useFaceWeights === void 0 ) useFaceWeights = false;

    var faceNormalsResult = this.createFaceNormals(indices, positions, useFaceWeights);
    var faceWeights = faceNormalsResult.faceWeights;
    var faceNormals = faceNormalsResult.faceNormals;
    var v1 = 0;
    var f1 = 0, f2 = 1, f3 = 2;
    var lenV = positions.length;
    var normalStride = 3;
    var normalOffset = 0;
    var normals = new Array(lenV);
    v1 = 0;
    while (v1 < lenV) {
        normals[v1] = 0.0;
        normals[v1 + 1] = 0.0;
        normals[v1 + 2] = 0.0;
        v1 += normalStride;
    }
    var i = 0, k = 0;
    var lenI = indices.length;
    var index = 0;
    var weight = 0;
    while (i < lenI) {
        weight = useFaceWeights ? faceWeights[k++] : 1;
        index = normalOffset + indices[i++] * normalStride;
        normals[index++] += faceNormals[f1] * weight;
        normals[index++] += faceNormals[f2] * weight;
        normals[index] += faceNormals[f3] * weight;
        index = normalOffset + indices[i++] * normalStride;
        normals[index++] += faceNormals[f1] * weight;
        normals[index++] += faceNormals[f2] * weight;
        normals[index] += faceNormals[f3] * weight;
        index = normalOffset + indices[i++] * normalStride;
        normals[index++] += faceNormals[f1] * weight;
        normals[index++] += faceNormals[f2] * weight;
        normals[index] += faceNormals[f3] * weight;
        f1 += 3;
        f2 += 3;
        f3 += 3;
    }
    v1 = normalOffset;
    while (v1 < lenV) {
        var vx = normals[v1];
        var vy = normals[v1 + 1];
        var vz = normals[v1 + 2];
        var d = 1.0 / Math.sqrt(vx * vx + vy * vy + vz * vz);
        normals[v1] = vx * d;
        normals[v1 + 1] = vy * d;
        normals[v1 + 2] = vz * d;
        v1 += normalStride;
    }
    return normals;
};
/**
 * 计算顶点切线数据
 * @param indices 顶点索引
 * @param positions 顶点数据
 * @param uvs uv数据
 * @param useFaceWeights 是否使用面权重计算切线数据
 */
GeometryUtils.prototype.createVertexTangents = function createVertexTangents (indices, positions, uvs, useFaceWeights) {
        if ( useFaceWeights === void 0 ) useFaceWeights = false;

    var faceTangentsResult = this.createFaceTangents(indices, positions, uvs, useFaceWeights);
    var faceWeights = faceTangentsResult.faceWeights;
    var faceTangents = faceTangentsResult.faceTangents;
    var i = 0;
    var lenV = positions.length;
    var tangentStride = 3;
    var tangentOffset = 0;
    var target = new Array(lenV);
    i = tangentOffset;
    while (i < lenV) {
        target[i] = 0.0;
        target[i + 1] = 0.0;
        target[i + 2] = 0.0;
        i += tangentStride;
    }
    var k = 0;
    var lenI = indices.length;
    var index = 0;
    var weight = 0;
    var f1 = 0, f2 = 1, f3 = 2;
    i = 0;
    while (i < lenI) {
        weight = useFaceWeights ? faceWeights[k++] : 1;
        index = tangentOffset + indices[i++] * tangentStride;
        target[index++] += faceTangents[f1] * weight;
        target[index++] += faceTangents[f2] * weight;
        target[index] += faceTangents[f3] * weight;
        index = tangentOffset + indices[i++] * tangentStride;
        target[index++] += faceTangents[f1] * weight;
        target[index++] += faceTangents[f2] * weight;
        target[index] += faceTangents[f3] * weight;
        index = tangentOffset + indices[i++] * tangentStride;
        target[index++] += faceTangents[f1] * weight;
        target[index++] += faceTangents[f2] * weight;
        target[index] += faceTangents[f3] * weight;
        f1 += 3;
        f2 += 3;
        f3 += 3;
    }
    i = tangentOffset;
    while (i < lenV) {
        var vx = target[i];
        var vy = target[i + 1];
        var vz = target[i + 2];
        var d = 1.0 / Math.sqrt(vx * vx + vy * vy + vz * vz);
        target[i] = vx * d;
        target[i + 1] = vy * d;
        target[i + 2] = vz * d;
        i += tangentStride;
    }
    return target;
};
/**
 * 计算面切线数据
 * @param indices 顶点索引数据
 * @param positions 顶点数据
 * @param uvs uv数据
 * @param useFaceWeights 是否计算面权重
 */
GeometryUtils.prototype.createFaceTangents = function createFaceTangents (indices, positions, uvs, useFaceWeights) {
        if ( useFaceWeights === void 0 ) useFaceWeights = false;

    var i = 0, k = 0;
    var index1 = 0, index2 = 0, index3 = 0;
    var len = indices.length;
    var ui = 0, vi = 0;
    var v0 = 0;
    var dv1 = 0, dv2 = 0;
    var denom = 0;
    var x0 = 0, y0 = 0, z0 = 0;
    var dx1 = 0, dy1 = 0, dz1 = 0;
    var dx2 = 0, dy2 = 0, dz2 = 0;
    var cx = 0, cy = 0, cz = 0;
    var posStride = 3;
    var posOffset = 0;
    var texStride = 2;
    var texOffset = 0;
    var faceTangents = new Array(indices.length);
    var faceWeights = [];
    while (i < len) {
        index1 = indices[i];
        index2 = indices[i + 1];
        index3 = indices[i + 2];
        ui = texOffset + index1 * texStride + 1;
        v0 = uvs[ui];
        ui = texOffset + index2 * texStride + 1;
        dv1 = uvs[ui] - v0;
        ui = texOffset + index3 * texStride + 1;
        dv2 = uvs[ui] - v0;
        vi = posOffset + index1 * posStride;
        x0 = positions[vi];
        y0 = positions[vi + 1];
        z0 = positions[vi + 2];
        vi = posOffset + index2 * posStride;
        dx1 = positions[vi] - x0;
        dy1 = positions[vi + 1] - y0;
        dz1 = positions[vi + 2] - z0;
        vi = posOffset + index3 * posStride;
        dx2 = positions[vi] - x0;
        dy2 = positions[vi + 1] - y0;
        dz2 = positions[vi + 2] - z0;
        cx = dv2 * dx1 - dv1 * dx2;
        cy = dv2 * dy1 - dv1 * dy2;
        cz = dv2 * dz1 - dv1 * dz2;
        denom = Math.sqrt(cx * cx + cy * cy + cz * cz);
        if (useFaceWeights) {
            var w = denom * 10000;
            if (w < 1)
                { w = 1; }
            faceWeights[k++] = w;
        }
        denom = 1 / denom;
        faceTangents[i++] = denom * cx;
        faceTangents[i++] = denom * cy;
        faceTangents[i++] = denom * cz;
    }
    return { faceTangents: faceTangents, faceWeights: faceWeights };
};
/**
 * 计算面法线数据
 * @param indices 顶点索引数据
 * @param positions 顶点数据
 * @param useFaceWeights 是否计算面权重
 */
GeometryUtils.prototype.createFaceNormals = function createFaceNormals (indices, positions, useFaceWeights) {
        if ( useFaceWeights === void 0 ) useFaceWeights = false;

    var i = 0, j = 0, k = 0;
    var index = 0;
    var len = indices.length;
    var x1 = 0, x2 = 0, x3 = 0;
    var y1 = 0, y2 = 0, y3 = 0;
    var z1 = 0, z2 = 0, z3 = 0;
    var dx1 = 0, dy1 = 0, dz1 = 0;
    var dx2 = 0, dy2 = 0, dz2 = 0;
    var cx = 0, cy = 0, cz = 0;
    var d = 0;
    var posStride = 3;
    var faceNormals = new Array(len);
    var faceWeights = [];
    while (i < len) {
        index = indices[i++] * posStride;
        x1 = positions[index];
        y1 = positions[index + 1];
        z1 = positions[index + 2];
        index = indices[i++] * posStride;
        x2 = positions[index];
        y2 = positions[index + 1];
        z2 = positions[index + 2];
        index = indices[i++] * posStride;
        x3 = positions[index];
        y3 = positions[index + 1];
        z3 = positions[index + 2];
        dx1 = x3 - x1;
        dy1 = y3 - y1;
        dz1 = z3 - z1;
        dx2 = x2 - x1;
        dy2 = y2 - y1;
        dz2 = z2 - z1;
        cx = dz1 * dy2 - dy1 * dz2;
        cy = dx1 * dz2 - dz1 * dx2;
        cz = dy1 * dx2 - dx1 * dy2;
        d = Math.sqrt(cx * cx + cy * cy + cz * cz);
        if (useFaceWeights) {
            var w = d * 10000;
            if (w < 1)
                { w = 1; }
            faceWeights[k++] = w;
        }
        d = 1 / d;
        faceNormals[j++] = cx * d;
        faceNormals[j++] = cy * d;
        faceNormals[j++] = cz * d;
    }
    return { faceNormals: faceNormals, faceWeights: faceWeights };
};
/**
 * 应用变换矩阵
 * @param matrix 变换矩阵
 * @param positions 顶点数据
 * @param normals 顶点法线数据
 * @param tangents 顶点切线数据
 */
GeometryUtils.prototype.applyTransformation = function applyTransformation (matrix, positions, normals, tangents) {
    var posStride = 3;
    var normalStride = 3;
    var tangentStride = 3;
    var len = positions.length / posStride;
    var i, i1, i2;
    var vector = new Vector3();
    var bakeNormals = normals != null;
    var bakeTangents = tangents != null;
    var invTranspose = new Matrix4x4();
    if (bakeNormals || bakeTangents) {
        invTranspose.copy(matrix);
        invTranspose.invert();
        invTranspose.transpose();
    }
    var vi0 = 0;
    var ni0 = 0;
    var ti0 = 0;
    for (i = 0; i < len; ++i) {
        i1 = vi0 + 1;
        i2 = vi0 + 2;
        // bake position
        vector.x = positions[vi0];
        vector.y = positions[i1];
        vector.z = positions[i2];
        vector = matrix.transformPoint3(vector);
        positions[vi0] = vector.x;
        positions[i1] = vector.y;
        positions[i2] = vector.z;
        vi0 += posStride;
        // bake normal
        if (bakeNormals) {
            i1 = ni0 + 1;
            i2 = ni0 + 2;
            vector.x = normals[ni0];
            vector.y = normals[i1];
            vector.z = normals[i2];
            vector = invTranspose.transformVector3(vector);
            vector.normalize();
            normals[ni0] = vector.x;
            normals[i1] = vector.y;
            normals[i2] = vector.z;
            ni0 += normalStride;
        }
        // bake tangent
        if (bakeTangents) {
            i1 = ti0 + 1;
            i2 = ti0 + 2;
            vector.x = tangents[ti0];
            vector.y = tangents[i1];
            vector.z = tangents[i2];
            vector = invTranspose.transformVector3(vector);
            vector.normalize();
            tangents[ti0] = vector.x;
            tangents[i1] = vector.y;
            tangents[i2] = vector.z;
            ti0 += tangentStride;
        }
    }
};
/**
 * 合并几何体
 * @param geometrys 几何体列表
 */
GeometryUtils.prototype.mergeGeometry = function mergeGeometry (geometrys) {
    // 此处存在隐患。
    // 优化方案，遍历所有几何体，找到所有共有属性后进行合并。
    var result = {};
    for (var i = 0; i < geometrys.length; i++) {
        var geometry = geometrys[i];
        if (i == 0) {
            result.indices = geometry.indices.concat();
            result.positions = geometry.positions.concat();
            geometry.uvs && (result.uvs = geometry.uvs.concat());
            geometry.normals && (result.normals = geometry.normals.concat());
            geometry.tangents && (result.tangents = geometry.tangents.concat());
        }
        else {
            var startIndex = result.positions.length / 3;
            geometry.indices.forEach(function (v) { return result.indices.push(v + startIndex); });
            geometry.positions.forEach(function (v) { return result.positions.push(v); });
            result.uvs && geometry.uvs.forEach(function (v) { return result.uvs.push(v); });
            result.normals && geometry.normals.forEach(function (v) { return result.normals.push(v); });
            result.tangents && geometry.tangents.forEach(function (v) { return result.tangents.push(v); });
        }
    }
    return result;
};
/**
 * 射线投影几何体
 * @param ray                       射线
 * @param shortestCollisionDistance 当前最短碰撞距离
 * @param cullFace                  裁剪面枚举
 *
 * @todo
 * @see 3D数学基础：图形与游戏开发 P278 是否可用该内容优化运算效率？
 *
 * @see 优化参考 three.js Ray.intersectTriangle
 */
GeometryUtils.prototype.raycast = function raycast (ray, indices, positions, uvs, shortestCollisionDistance, cullFace) {
        if ( shortestCollisionDistance === void 0 ) shortestCollisionDistance = Number.MAX_VALUE;
        if ( cullFace === void 0 ) cullFace = CullFace.NONE;

    if (cullFace == CullFace.FRONT_AND_BACK)
        { return null; }
    var t = 0;
    var i0 = 0, i1 = 0, i2 = 0;
    var rx = 0, ry = 0, rz = 0;
    var nx = 0, ny = 0, nz = 0;
    var cx = 0, cy = 0, cz = 0;
    var coeff = 0, u = 0, v = 0, w = 0;
    var p0x = 0, p0y = 0, p0z = 0;
    var p1x = 0, p1y = 0, p1z = 0;
    var p2x = 0, p2y = 0, p2z = 0;
    var s0x = 0, s0y = 0, s0z = 0;
    var s1x = 0, s1y = 0, s1z = 0;
    var nl = 0, nDotV = 0, D = 0, disToPlane = 0;
    var Q1Q2 = 0, Q1Q1 = 0, Q2Q2 = 0, RQ1 = 0, RQ2 = 0;
    var collisionTriangleIndex = -1;
    var numIndices = indices.length;
    var result = {};
    //遍历每个三角形 检测碰撞
    for (var index = 0; index < numIndices; index += 3) { // sweep all triangles
        //三角形三个顶点索引
        i0 = indices[index] * 3;
        i1 = indices[index + 1] * 3;
        i2 = indices[index + 2] * 3;
        //三角形三个顶点数据
        p0x = positions[i0];
        p0y = positions[i0 + 1];
        p0z = positions[i0 + 2];
        p1x = positions[i1];
        p1y = positions[i1 + 1];
        p1z = positions[i1 + 2];
        p2x = positions[i2];
        p2y = positions[i2 + 1];
        p2z = positions[i2 + 2];
        //计算出三角面的法线
        s0x = p1x - p0x; // s0 = p1 - p0
        s0y = p1y - p0y;
        s0z = p1z - p0z;
        s1x = p2x - p0x; // s1 = p2 - p0
        s1y = p2y - p0y;
        s1z = p2z - p0z;
        nx = s0y * s1z - s0z * s1y; // n = s0 x s1
        ny = s0z * s1x - s0x * s1z;
        nz = s0x * s1y - s0y * s1x;
        nl = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz); // normalize n 此处使用了开平方根，性能很差
        nx *= nl;
        ny *= nl;
        nz *= nl;
        //初始化射线数据
        var rayPosition = ray.origin;
        var rayDirection = ray.direction;
        //计算射线与法线的点积，不等于零表示射线所在直线与三角面相交
        nDotV = nx * rayDirection.x + ny * rayDirection.y + nz * rayDirection.z; // rayDirection . normal
        //判断射线是否与三角面相交
        if ((cullFace == CullFace.FRONT && nDotV > 0.0) || (cullFace == CullFace.BACK && nDotV < 0.0) || (cullFace == CullFace.NONE && nDotV != 0.0)) { // an intersection must exist
            //计算平面方程D值，参考Plane3D
            D = -(nx * p0x + ny * p0y + nz * p0z);
            //射线点到平面的距离
            disToPlane = -(nx * rayPosition.x + ny * rayPosition.y + nz * rayPosition.z + D);
            t = disToPlane / nDotV;
            //得到交点
            cx = rayPosition.x + t * rayDirection.x;
            cy = rayPosition.y + t * rayDirection.y;
            cz = rayPosition.z + t * rayDirection.z;
            //判断交点是否在三角形内( using barycentric coordinates )
            Q1Q2 = s0x * s1x + s0y * s1y + s0z * s1z;
            Q1Q1 = s0x * s0x + s0y * s0y + s0z * s0z;
            Q2Q2 = s1x * s1x + s1y * s1y + s1z * s1z;
            rx = cx - p0x;
            ry = cy - p0y;
            rz = cz - p0z;
            RQ1 = rx * s0x + ry * s0y + rz * s0z;
            RQ2 = rx * s1x + ry * s1y + rz * s1z;
            coeff = 1 / (Q1Q1 * Q2Q2 - Q1Q2 * Q1Q2);
            v = coeff * (Q2Q2 * RQ1 - Q1Q2 * RQ2);
            if (v < 0)
                { continue; }
            w = coeff * (-Q1Q2 * RQ1 + Q1Q1 * RQ2);
            if (w < 0)
                { continue; }
            u = 1 - v - w;
            //u v w都大于0表示点在三角形内 射线的坐标t大于0表示射线朝向三角面
            if (u >= 0 && t >= 0 && t < shortestCollisionDistance) {
                shortestCollisionDistance = t;
                collisionTriangleIndex = index / 3;
                result.rayEntryDistance = t;
                result.localPosition = new Vector3(cx, cy, cz);
                result.localNormal = new Vector3(nx, ny, nz);
                if (uvs) {
                    result.uv = getCollisionUV(indices, uvs, index, v, w, u);
                }
                result.index = index;
            }
        }
    }
    if (collisionTriangleIndex >= 0)
        { return result; }
    return null;
    /**
     * 获取碰撞uv
     * @param indices 顶点数据
     * @param uvs uv数据
     * @param triangleIndex 三角形所有
     * @param v
     * @param w
     * @param u
     * @param uvOffset
     * @param uvStride
     * @return 碰撞uv
     */
    function getCollisionUV(indices, uvs, triangleIndex, v, w, u) {
        var uIndex = indices[triangleIndex] * 2;
        var uv0x = uvs[uIndex];
        var uv0y = uvs[uIndex + 1];
        uIndex = indices[triangleIndex + 1] * 2;
        var uv1x = uvs[uIndex];
        var uv1y = uvs[uIndex + 1];
        uIndex = indices[triangleIndex + 2] * 2;
        var uv2x = uvs[uIndex];
        var uv2y = uvs[uIndex + 1];
        var uv = new Vector2();
        uv.x = u * uv0x + v * uv1x + w * uv2x;
        uv.y = u * uv0y + v * uv1y + w * uv2y;
        return uv;
    }
};
/**
 * 获取包围盒
 * @param positions 顶点数据
 */
GeometryUtils.prototype.getAABB = function getAABB (positions) {
    return Box3.formPositions(positions);
};
var geometryUtils = new GeometryUtils();

/**
 * 几何体
 */
var Geometry = /*@__PURE__*/(function (Feng3dObject) {
    function Geometry() {
        Feng3dObject.call(this);
        this.preview = "";
        this.assetType = AssetType.geometry;
        /**
         * 纹理U缩放，默认为1。
         */
        this.scaleU = 1;
        /**
         * 纹理V缩放，默认为1。
         */
        this.scaleV = 1;
        /**
         * 顶点索引缓冲
         */
        this._indexBuffer = new Index();
        /**
         * 属性数据列表
         */
        this._attributes = {
            a_position: new Attribute("a_position", [], 3),
            a_color: new Attribute("a_color", [], 4),
            a_uv: new Attribute("a_uv", [], 2),
            a_normal: new Attribute("a_normal", [], 3),
            a_tangent: new Attribute("a_tangent", [], 3),
            a_skinIndices: new Attribute("a_skinIndices", [], 4),
            a_skinWeights: new Attribute("a_skinWeights", [], 4),
            a_skinIndices1: new Attribute("a_skinIndices1", [], 4),
            a_skinWeights1: new Attribute("a_skinWeights1", [], 4),
        };
        this._geometryInvalid = true;
        this._useFaceWeights = false;
    }

    if ( Feng3dObject ) Geometry.__proto__ = Feng3dObject;
    Geometry.prototype = Object.create( Feng3dObject && Feng3dObject.prototype );
    Geometry.prototype.constructor = Geometry;

    var prototypeAccessors = { name: { configurable: true },geometryInfo: { configurable: true },indices: { configurable: true },positions: { configurable: true },colors: { configurable: true },uvs: { configurable: true },normals: { configurable: true },tangents: { configurable: true },skinIndices: { configurable: true },skinWeights: { configurable: true },skinIndices1: { configurable: true },skinWeights1: { configurable: true },numVertex: { configurable: true },numTriangles: { configurable: true },bounding: { configurable: true } };
    prototypeAccessors.name.get = function () {
        return this._name;
    };
    prototypeAccessors.name.set = function (v) {
        this._name = v;
    };
    /**
     * 几何体信息
     */
    prototypeAccessors.geometryInfo.get = function () {
        var str = [
            "Geometry Info",
            ("  Vertices    " + (this.numVertex)),
            ("  Triangles    " + (this.numTriangles)),
            ("  Attributes    " + (Object.keys(this._attributes).join(","))) ].join("\n");
        return str;
    };
    /**
     * 索引数据
     */
    prototypeAccessors.indices.get = function () {
        this.updateGrometry();
        return this._indexBuffer.indices;
    };
    /**
     * 更新顶点索引数据
     */
    prototypeAccessors.indices.set = function (value) {
        this._indexBuffer.indices = value;
    };
    /**
     * 坐标数据
     */
    prototypeAccessors.positions.get = function () {
        return this._attributes.a_position.data;
    };
    prototypeAccessors.positions.set = function (value) {
        this._attributes.a_position.data = value;
    };
    /**
     * 颜色数据
     */
    prototypeAccessors.colors.get = function () {
        return this._attributes.a_color.data;
    };
    prototypeAccessors.colors.set = function (value) {
        this._attributes.a_color.data = value;
    };
    /**
     * uv数据
     */
    prototypeAccessors.uvs.get = function () {
        return this._attributes.a_uv.data;
    };
    prototypeAccessors.uvs.set = function (value) {
        this._attributes.a_uv.data = value;
    };
    /**
     * 法线数据
     */
    prototypeAccessors.normals.get = function () {
        return this._attributes.a_normal.data;
    };
    prototypeAccessors.normals.set = function (value) {
        this._attributes.a_normal.data = value;
    };
    /**
     * 切线数据
     */
    prototypeAccessors.tangents.get = function () {
        return this._attributes.a_tangent.data;
    };
    prototypeAccessors.tangents.set = function (value) {
        this._attributes.a_tangent.data = value;
    };
    /**
     * 蒙皮索引，顶点关联的关节索引
     */
    prototypeAccessors.skinIndices.get = function () {
        return this._attributes.a_skinIndices.data;
    };
    prototypeAccessors.skinIndices.set = function (value) {
        this._attributes.a_skinIndices.data = value;
    };
    /**
     * 蒙皮权重，顶点关联的关节权重
     */
    prototypeAccessors.skinWeights.get = function () {
        return this._attributes.a_skinWeights.data;
    };
    prototypeAccessors.skinWeights.set = function (value) {
        this._attributes.a_skinWeights.data = value;
    };
    /**
     * 蒙皮索引，顶点关联的关节索引
     */
    prototypeAccessors.skinIndices1.get = function () {
        return this._attributes.a_skinIndices1.data;
    };
    prototypeAccessors.skinIndices1.set = function (value) {
        this._attributes.a_skinIndices1.data = value;
    };
    /**
     * 蒙皮权重，顶点关联的关节权重
     */
    prototypeAccessors.skinWeights1.get = function () {
        return this._attributes.a_skinWeights1.data;
    };
    prototypeAccessors.skinWeights1.set = function (value) {
        this._attributes.a_skinWeights1.data = value;
    };
    /**
     * 标记需要更新几何体，在更改几何体数据后需要调用该函数。
     */
    Geometry.prototype.invalidateGeometry = function invalidateGeometry () {
        this._geometryInvalid = true;
        this.invalidateBounds();
    };
    /**
     * 更新几何体
     */
    Geometry.prototype.updateGrometry = function updateGrometry () {
        if (this._geometryInvalid) {
            this._geometryInvalid = false;
            this.buildGeometry();
        }
    };
    /**
     * 构建几何体
     */
    Geometry.prototype.buildGeometry = function buildGeometry () {
    };
    /**
     * 顶点数量
     */
    prototypeAccessors.numVertex.get = function () {
        return this.positions.length / 3;
    };
    /**
     * 三角形数量
     */
    prototypeAccessors.numTriangles.get = function () {
        return this.indices.length / 3;
    };
    /**
     * 添加几何体
     * @param geometry          被添加的几何体
     * @param matrix         变换矩阵，把克隆被添加几何体的数据变换后再添加到该几何体中
     */
    Geometry.prototype.addGeometry = function addGeometry (geometry, matrix) {
        //更新几何体
        this.updateGrometry();
        geometry.updateGrometry();
        //变换被添加的几何体
        if (matrix != null) {
            geometry = geometry.clone();
            geometry.applyTransformation(matrix);
        }
        //如果自身为空几何体
        if (!this.indices) {
            this.cloneFrom(geometry);
            return;
        }
        //
        var attributes = this._attributes;
        var addAttributes = geometry._attributes;
        //当前顶点数量
        var oldNumVertex = this.numVertex;
        //合并索引
        var indices = this.indices;
        var targetIndices = geometry.indices;
        var totalIndices = indices.concat();
        for (var i = 0; i < targetIndices.length; i++) {
            totalIndices[indices.length + i] = targetIndices[i] + oldNumVertex;
        }
        this.indices = totalIndices;
        //合并后顶点数量
        var totalVertex = oldNumVertex + geometry.numVertex;
        //合并属性数据
        for (var attributeName in attributes) {
            var attribute = attributes[attributeName];
            var addAttribute = addAttributes[attributeName];
            //
            attribute.data = attribute.data.concat(addAttribute.data);
        }
    };
    /**
     * 应用变换矩阵
     * @param matrix 变换矩阵
     */
    Geometry.prototype.applyTransformation = function applyTransformation (matrix) {
        this.updateGrometry();
        var vertices = this.positions;
        var normals = this.normals;
        var tangents = this.tangents;
        geometryUtils.applyTransformation(matrix, vertices, normals, tangents);
        this.positions = vertices;
        this.normals = normals;
        this.tangents = tangents;
    };
    /**
     * 包围盒失效
     */
    Geometry.prototype.invalidateBounds = function invalidateBounds () {
        this._bounding = null;
        this.emit("boundsInvalid", this);
    };
    prototypeAccessors.bounding.get = function () {
        this.updateGrometry();
        if (!this._bounding) {
            var positions = this.positions;
            if (!positions || positions.length == 0)
                { return new Box3(); }
            this._bounding = Box3.formPositions(this.positions);
        }
        return this._bounding;
    };
    /**
     * 射线投影几何体
     * @param ray                           射线
     * @param shortestCollisionDistance     当前最短碰撞距离
     * @param cullFace                      裁剪面枚举
     */
    Geometry.prototype.raycast = function raycast (ray, shortestCollisionDistance, cullFace) {
        if ( shortestCollisionDistance === void 0 ) shortestCollisionDistance = Number.MAX_VALUE;
        if ( cullFace === void 0 ) cullFace = CullFace.NONE;

        var result = geometryUtils.raycast(ray, this.indices, this.positions, this.uvs, shortestCollisionDistance, cullFace);
        return result;
    };
    /**
     * 获取顶点列表
     *
     * @param result
     */
    Geometry.prototype.getVertices = function getVertices (result) {
        if ( result === void 0 ) result = [];

        var positions = this.positions;
        var result = [];
        for (var i = 0, n = positions.length; i < n; i += 3) {
            result.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));
        }
        return result;
    };
    Geometry.prototype.getFaces = function getFaces (result) {
        if ( result === void 0 ) result = [];

        var indices = this.indices;
        for (var i = 0, n = indices.length; i < n; i += 3) {
            result.push([indices[i], indices[i + 1], indices[i + 2]]);
        }
        return result;
    };
    /**
     * 克隆一个几何体
     */
    Geometry.prototype.clone = function clone () {
        var geometry = new Geometry();
        geometry.cloneFrom(this);
        return geometry;
    };
    /**
     * 从一个几何体中克隆数据
     */
    Geometry.prototype.cloneFrom = function cloneFrom (geometry) {
        geometry.updateGrometry();
        this.indices = geometry.indices.concat();
        for (var attributeName in geometry._attributes) {
            var attribute = this._attributes[attributeName];
            var addAttribute = geometry._attributes[attributeName];
            attribute.data = addAttribute.data.concat();
        }
    };
    Geometry.prototype.beforeRender = function beforeRender (renderAtomic) {
        this.updateGrometry();
        renderAtomic.indexBuffer = this._indexBuffer;
        for (var key in this._attributes) {
            if (this._attributes.hasOwnProperty(key)) {
                renderAtomic.attributes[key] = this._attributes[key];
            }
        }
        renderAtomic.shaderMacro.SCALEU = this.scaleU;
        renderAtomic.shaderMacro.SCALEV = this.scaleV;
    };
    /**
     * 清理数据
     */
    Geometry.prototype.clear = function clear () {
        for (var key in this._attributes) {
            var element = this._attributes[key];
            element.data = [];
        }
    };
    /**
     * 设置默认几何体
     *
     * @param name 默认几何体名称
     * @param geometry 默认几何体
     */
    Geometry.setDefault = function setDefault (name, geometry, param) {
        this._defaultGeometry[name] = geometry;
        if (param)
            { serialization.setValue(geometry, param); }
        serialization.setValue(geometry, { name: name, assetId: name, hideFlags: HideFlags.NotEditable });
        AssetData.addAssetData(name, geometry);
    };
    /**
     * 获取默认几何体
     *
     * @param name 默认几何体名称
     */
    Geometry.getDefault = function getDefault (name) {
        return this._defaultGeometry[name];
    };

    Object.defineProperties( Geometry.prototype, prototypeAccessors );

    return Geometry;
}(Feng3dObject));
Geometry._defaultGeometry = {};
__decorate([
    oav({ component: "OAVFeng3dPreView" })
], Geometry.prototype, "preview", void 0);
__decorate([
    oav()
], Geometry.prototype, "name", null);
__decorate([
    oav({ component: "OAVMultiText", priority: 10 })
], Geometry.prototype, "geometryInfo", null);
__decorate([
    oav({ tooltip: "标记需要更新几何体，在更改几何体数据后需要调用该函数。" })
], Geometry.prototype, "invalidateGeometry", null);
__decorate([
    serialize,
    oav()
], Geometry.prototype, "scaleU", void 0);
__decorate([
    serialize,
    oav()
], Geometry.prototype, "scaleV", void 0);

/**
 * 阴影类型
 */
var ShadowType;
(function (ShadowType) {
    /**
     * 没有阴影
     */
    ShadowType[ShadowType["No_Shadows"] = 0] = "No_Shadows";
    /**
     * 硬阴影
     */
    ShadowType[ShadowType["Hard_Shadows"] = 1] = "Hard_Shadows";
    /**
     * PCF 阴影
     */
    ShadowType[ShadowType["PCF_Shadows"] = 2] = "PCF_Shadows";
    /**
     * PCF 软阴影
     */
    ShadowType[ShadowType["PCF_Soft_Shadows"] = 3] = "PCF_Soft_Shadows";
})(ShadowType || (ShadowType = {}));

var LightPicker = function LightPicker(model) {
    this._model = model;
};
LightPicker.prototype.beforeRender = function beforeRender (renderAtomic) {
        var this$1 = this;

    var pointLights = [];
    var directionalLights = [];
    var spotLights = [];
    var scene = this._model.node3d.scene;
    if (scene) {
        pointLights = scene.activePointLights;
        directionalLights = scene.activeDirectionalLights;
        spotLights = scene.activeSpotLights;
    }
    renderAtomic.shaderMacro.NUM_LIGHT = pointLights.length + directionalLights.length + spotLights.length;
    //设置点光源数据
    var castShadowPointLights = [];
    var unCastShadowPointLights = [];
    var pointShadowMaps = [];
    pointLights.forEach(function (element) {
        if (!element.isVisibleAndEnabled)
            { return; }
        if (element.shadowType != ShadowType.No_Shadows && this$1._model.receiveShadows) {
            castShadowPointLights.push(element);
            pointShadowMaps.push(element.shadowMap);
        }
        else {
            unCastShadowPointLights.push(element);
        }
    });
    renderAtomic.shaderMacro.NUM_POINTLIGHT = unCastShadowPointLights.length;
    renderAtomic.shaderMacro.NUM_POINTLIGHT_CASTSHADOW = castShadowPointLights.length;
    //
    renderAtomic.uniforms.u_pointLights = unCastShadowPointLights;
    renderAtomic.uniforms.u_castShadowPointLights = castShadowPointLights;
    renderAtomic.uniforms.u_pointShadowMaps = pointShadowMaps;
    //设置聚光灯光源数据
    var castShadowSpotLights = [];
    var unCastShadowSpotLights = [];
    var spotShadowMaps = [];
    var spotShadowMatrix = [];
    spotLights.forEach(function (element) {
        if (!element.isVisibleAndEnabled)
            { return; }
        if (element.shadowType != ShadowType.No_Shadows && this$1._model.receiveShadows) {
            castShadowSpotLights.push(element);
            spotShadowMatrix.push(element.shadowCamera.viewProjection);
            spotShadowMaps.push(element.shadowMap);
        }
        else {
            unCastShadowSpotLights.push(element);
        }
    });
    renderAtomic.shaderMacro.NUM_SPOT_LIGHTS = unCastShadowSpotLights.length;
    renderAtomic.shaderMacro.NUM_SPOT_LIGHTS_CASTSHADOW = castShadowSpotLights.length;
    //
    renderAtomic.uniforms.u_spotLights = unCastShadowSpotLights;
    renderAtomic.uniforms.u_castShadowSpotLights = castShadowSpotLights;
    renderAtomic.uniforms.u_spotShadowMatrix = spotShadowMatrix;
    renderAtomic.uniforms.u_spotShadowMaps = spotShadowMaps;
    // 设置方向光源数据
    var castShadowDirectionalLights = [];
    var unCastShadowDirectionalLights = [];
    var directionalShadowMatrix = [];
    var directionalShadowMaps = [];
    directionalLights.forEach(function (element) {
        if (!element.isVisibleAndEnabled)
            { return; }
        if (element.shadowType != ShadowType.No_Shadows && this$1._model.receiveShadows) {
            castShadowDirectionalLights.push(element);
            directionalShadowMatrix.push(element.shadowCamera.viewProjection);
            directionalShadowMaps.push(element.shadowMap);
        }
        else {
            unCastShadowDirectionalLights.push(element);
        }
    });
    renderAtomic.shaderMacro.NUM_DIRECTIONALLIGHT = unCastShadowDirectionalLights.length;
    renderAtomic.shaderMacro.NUM_DIRECTIONALLIGHT_CASTSHADOW = castShadowDirectionalLights.length;
    //
    renderAtomic.uniforms.u_directionalLights = unCastShadowDirectionalLights;
    renderAtomic.uniforms.u_castShadowDirectionalLights = castShadowDirectionalLights;
    renderAtomic.uniforms.u_directionalShadowMatrixs = directionalShadowMatrix;
    renderAtomic.uniforms.u_directionalShadowMaps = directionalShadowMaps;
};

/**
 * 图片相关工具
 */
var ImageUtil = function ImageUtil(width, height, fillcolor) {
    if ( width === void 0 ) width = 1;
    if ( height === void 0 ) height = 1;
    if ( fillcolor === void 0 ) fillcolor = new Color4(0, 0, 0, 0);

    this.init(width, height, fillcolor);
};
/**
 * 获取图片数据
 * @param image 加载完成的图片元素
 */
ImageUtil.fromImage = function fromImage (image) {
    return new ImageUtil().fromImage(image);
};
/**
 * 初始化
 * @param width 宽度
 * @param height 高度
 * @param fillcolor 填充颜色
 */
ImageUtil.prototype.init = function init (width, height, fillcolor) {
        if ( width === void 0 ) width = 1;
        if ( height === void 0 ) height = 1;
        if ( fillcolor === void 0 ) fillcolor = new Color4(0, 0, 0, 0);

    this.imageData = new ImageData(width, height);
    this.fillRect(new Rectangle(0, 0, width, height), fillcolor);
};
/**
 * 获取图片数据
 * @param image 加载完成的图片元素
 */
ImageUtil.prototype.fromImage = function fromImage (image) {
    if (!image)
        { return null; }
    var canvasImg = document.createElement("canvas");
    canvasImg.width = image.width;
    canvasImg.height = image.height;
    var ctxt = canvasImg.getContext('2d');
    console.assert(!!ctxt);
    ctxt.drawImage(image, 0, 0);
    this.imageData = ctxt.getImageData(0, 0, image.width, image.height); //读取整张图片的像素。
    return this;
};
/**
 * 绘制图片数据指定位置颜色
 * @param x 图片数据x坐标
 * @param y 图片数据y坐标
 * @param color 颜色值
 */
ImageUtil.prototype.drawPixel = function drawPixel (x, y, color) {
    var oldColor = this.getPixel(x, y);
    oldColor.mix(color, color.a);
    this.setPixel(x, y, oldColor);
    return this;
};
/**
 * 获取图片指定位置颜色值
 * @param x 图片数据x坐标
 * @param y 图片数据y坐标
 */
ImageUtil.prototype.getPixel = function getPixel (x, y) {
    var pos = (x + y * this.imageData.width) * 4;
    var color = new Color4(this.imageData.data[pos] / 255, this.imageData.data[pos + 1] / 255, this.imageData.data[pos + 2] / 255, this.imageData.data[pos + 3] / 255);
    return color;
};
/**
 * 设置指定位置颜色值
 * @param imageData 图片数据
 * @param x 图片数据x坐标
 * @param y 图片数据y坐标
 * @param color 颜色值
 */
ImageUtil.prototype.setPixel = function setPixel (x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    var pos = (x + y * this.imageData.width) * 4;
    this.imageData.data[pos] = color.r * 255;
    this.imageData.data[pos + 1] = color.g * 255;
    this.imageData.data[pos + 2] = color.b * 255;
    this.imageData.data[pos + 3] = color.a * 255;
    return this;
};
/**
 * 清理图片数据
 * @param clearColor 清理时填充颜色
 */
ImageUtil.prototype.clear = function clear (clearColor) {
        if ( clearColor === void 0 ) clearColor = new Color4(0, 0, 0, 0);

    for (var i = 0; i < this.imageData.width; i++) {
        for (var j = 0; j < this.imageData.height; j++) {
            this.setPixel(i, j, clearColor);
        }
    }
};
/**
 * 填充矩形
 * @param rect 填充的矩形
 * @param fillcolor 填充颜色
 */
ImageUtil.prototype.fillRect = function fillRect (rect, fillcolor) {
        if ( fillcolor === void 0 ) fillcolor = new Color4();

    for (var i = rect.x > 0 ? rect.x : 0; i < this.imageData.width && i < rect.x + rect.width; i++) {
        for (var j = rect.y > 0 ? rect.y : 0; j < this.imageData.height && j < rect.y + rect.height; j++) {
            this.setPixel(i, j, fillcolor);
        }
    }
};
/**
 * 绘制线条
 * @param start 起始坐标
 * @param end 终止坐标
 * @param color 线条颜色
 */
ImageUtil.prototype.drawLine = function drawLine (start, end, color) {
    var length = end.subTo(start).length;
    var p = new Vector2();
    for (var i = 0; i <= length; i++) {
        start.lerpNumberTo(end, i / length, p);
        this.setPixel(p.x, p.y, color);
    }
    return this;
};
/**
 * 绘制点
 * @param x x坐标
 * @param y y坐标
 * @param color 颜色
 * @param size 尺寸
 */
ImageUtil.prototype.drawPoint = function drawPoint (x, y, color, size) {
        if ( size === void 0 ) size = 1;

    var half = Math.floor(size / 2);
    //
    var sx = x - half;
    if (sx < 0)
        { sx = 0; }
    var ex = x - half + size;
    if (ex > this.imageData.width)
        { ex = this.imageData.width; }
    var sy = y - half;
    if (sy < 0)
        { sy = 0; }
    var ey = y - half + size;
    if (ey > this.imageData.height)
        { ey = this.imageData.height; }
    //
    for (var i = sx; i < ex; i++) {
        for (var j = sy; j < ey; j++) {
            this.setPixel(i, j, color);
        }
    }
    return this;
};
/**
 * 绘制图片数据
 * @param imageData 图片数据
 * @param x x坐标
 * @param y y坐标
 */
ImageUtil.prototype.drawImageData = function drawImageData (imageData, x, y) {
    var rect = new Rectangle(0, 0, this.imageData.width, this.imageData.height).intersection(new Rectangle(x, y, imageData.width, imageData.height));
    var imageUtil = new ImageUtil();
    imageUtil.imageData = imageData;
    for (var i = rect.x; i < rect.x + rect.width; i++) {
        for (var j = rect.y; j < rect.y + rect.height; j++) {
            var c = imageUtil.getPixel(i - x, j - y);
            this.drawPixel(i, j, c);
        }
    }
    return this;
};
/**
 * 转换为DataUrl字符串数据
 */
ImageUtil.prototype.toDataURL = function toDataURL () {
    return dataTransform.imageDataToDataURL(this.imageData);
};
/**
 * 创建默认粒子贴图
 * @param size 尺寸
 */
ImageUtil.prototype.drawDefaultParticle = function drawDefaultParticle (size) {
        if ( size === void 0 ) size = 64;

    var imageData = new ImageData(size, size);
    var half = size / 2;
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var l = mathUtil.clamp(new Vector2(i - half, j - half).length, 0, half) / half;
            var f = 1 - l;
            f = f * f;
            var pos = (i + j * size) * 4;
            imageData.data[pos] = f * 255;
            imageData.data[pos + 1] = f * 255;
            imageData.data[pos + 2] = f * 255;
            imageData.data[pos + 3] = f * 255;
        }
    }
    this.imageData = imageData;
    return this;
};
/**
 * 创建颜色拾取矩形
 * @param color 基色
 * @param width 宽度
 * @param height 高度
 */
ImageUtil.prototype.drawColorPickerRect = function drawColorPickerRect (color) {
    Image;
    var leftTop = new Color3(1, 1, 1);
    var rightTop = new Color3().fromUnit(color);
    var leftBottom = new Color3(0, 0, 0);
    var rightBottom = new Color3(0, 0, 0);
    //
    for (var i = 0; i < this.imageData.width; i++) {
        for (var j = 0; j < this.imageData.height; j++) {
            var top = leftTop.mixTo(rightTop, i / this.imageData.width);
            var bottom = leftBottom.mixTo(rightBottom, i / this.imageData.width);
            var v = top.mixTo(bottom, j / this.imageData.height);
            this.setPixel(i, j, v.toColor4());
        }
    }
    return this;
};
ImageUtil.prototype.drawColorRect = function drawColorRect (color) {
    var colorHeight = Math.floor(this.imageData.height * 0.8);
    var alphaWidth = Math.floor(color.a * this.imageData.width);
    var color4 = color.clone();
    color4.a = 1;
    var white = new Color4(1, 1, 1);
    var black = new Color4(0, 0, 0);
    //
    for (var i = 0; i < this.imageData.width; i++) {
        for (var j = 0; j < this.imageData.height; j++) {
            //
            if (j <= colorHeight) {
                this.setPixel(i, j, color4);
            }
            else {
                this.setPixel(i, j, i < alphaWidth ? white : black);
            }
        }
    }
    return this;
};
/**
 *
 * @param gradient
 * @param dirw true为横向条带，否则纵向条带
 */
ImageUtil.prototype.drawMinMaxGradient = function drawMinMaxGradient (gradient, dirw) {
        if ( dirw === void 0 ) dirw = true;

    //
    for (var i = 0; i < this.imageData.width; i++) {
        for (var j = 0; j < this.imageData.height; j++) {
            var c = gradient.getValue(dirw ? i / (this.imageData.width - 1) : j / (this.imageData.height - 1));
            this.setPixel(i, j, c);
        }
    }
    return this;
};
/**
 * 绘制曲线
 * @param curve 曲线
 * @param between0And1 是否显示值在[0,1]区间，否则[-1,1]区间
 * @param color 曲线颜色
 */
ImageUtil.prototype.drawCurve = function drawCurve (curve, between0And1, color, rect) {
        if ( rect === void 0 ) rect = null;

    rect = rect || new Rectangle(0, 0, this.imageData.width, this.imageData.height);
    var range = between0And1 ? [1, 0] : [1, -1];
    var prepos = new Vector2();
    var curpos = new Vector2();
    //
    for (var i = 0; i < rect.width; i++) {
        //
        var y = curve.getValue(i / (rect.width - 1));
        y = mathUtil.mapLinear(y, range[0], range[1], 0, 1);
        var j = Math.round(y * (rect.height - 1));
        //
        curpos.x = rect.x + i;
        curpos.y = rect.y + j;
        if (i > 0) {
            this.drawLine(prepos, curpos, color);
        }
        prepos.x = curpos.x;
        prepos.y = curpos.y;
    }
    return this;
};
/**
 * 绘制双曲线
 * @param curve 曲线
 * @param curve1 曲线
 * @param between0And1  是否显示值在[0,1]区间，否则[-1,1]区间
 * @param curveColor 颜色
 */
ImageUtil.prototype.drawBetweenTwoCurves = function drawBetweenTwoCurves (curve, curve1, between0And1, curveColor, fillcolor, rect) {
        if ( curveColor === void 0 ) curveColor = new Color4();
        if ( fillcolor === void 0 ) fillcolor = new Color4(1, 1, 1, 0.5);
        if ( rect === void 0 ) rect = null;

    rect = rect || new Rectangle(0, 0, this.imageData.width, this.imageData.height);
    var range = between0And1 ? [1, 0] : [1, -1];
    var prepos0 = new Vector2();
    var curpos0 = new Vector2();
    var prepos1 = new Vector2();
    var curpos1 = new Vector2();
    //
    for (var i = 0; i < rect.width; i++) {
        //
        var y0 = curve.getValue(i / (rect.width - 1));
        var y1 = curve1.getValue(i / (rect.width - 1));
        y0 = mathUtil.mapLinear(y0, range[0], range[1], 0, 1);
        y1 = mathUtil.mapLinear(y1, range[0], range[1], 0, 1);
        y0 = Math.round(y0 * (rect.height - 1));
        y1 = Math.round(y1 * (rect.height - 1));
        curpos0.x = rect.x + i;
        curpos0.y = rect.y + y0;
        curpos1.x = rect.x + i;
        curpos1.y = rect.y + y1;
        this.drawLine(new Vector2(rect.x + i, rect.y + y0), new Vector2(rect.x + i, rect.y + y1), fillcolor);
        if (i > 0) {
            this.drawLine(prepos0, curpos0, curveColor);
            this.drawLine(prepos1, curpos1, curveColor);
        }
        prepos0.x = curpos0.x;
        prepos0.y = curpos0.y;
        prepos1.x = curpos1.x;
        prepos1.y = curpos1.y;
    }
    return this;
};
/**
 * 清理背景颜色，目前仅用于特定的抠图，例如 editor\resource\assets\3d\terrain\terrain_brushes.png
 * @param backColor 背景颜色
 */
ImageUtil.prototype.clearBackColor = function clearBackColor (backColor) {
    for (var i = 0; i < this.imageData.width; i++) {
        for (var j = 0; j < this.imageData.height; j++) {
            var t = this.getPixel(i, j);
            var a = 1 - t.r / backColor.r;
            t.r = t.g = t.b = 0;
            t.a = a;
            this.setPixel(i, j, t);
        }
    }
};

var ImageDatas;
(function (ImageDatas) {
    ImageDatas["black"] = "black";
    ImageDatas["white"] = "white";
    ImageDatas["red"] = "red";
    ImageDatas["green"] = "green";
    ImageDatas["blue"] = "blue";
    ImageDatas["defaultNormal"] = "defaultNormal";
    ImageDatas["defaultParticle"] = "defaultParticle";
})(ImageDatas || (ImageDatas = {}));
var imageDatas = {
    black: new ImageUtil(1, 1, Color4.fromUnit24(ColorKeywords.black)).imageData,
    white: new ImageUtil(1, 1, Color4.fromUnit24(ColorKeywords.white)).imageData,
    red: new ImageUtil(1, 1, Color4.fromUnit24(ColorKeywords.red)).imageData,
    green: new ImageUtil(1, 1, Color4.fromUnit24(ColorKeywords.green)).imageData,
    blue: new ImageUtil(1, 1, Color4.fromUnit24(ColorKeywords.blue)).imageData,
    defaultNormal: new ImageUtil(1, 1, Color4.fromUnit24(0x8080ff)).imageData,
    defaultParticle: new ImageUtil().drawDefaultParticle().imageData,
};
/**
 * 纹理信息
 */
var TextureInfo = /*@__PURE__*/(function (Feng3dObject) {
    function TextureInfo() {
        Feng3dObject.apply(this, arguments);
        /**
         * 格式
         */
        this.format = TextureFormat.RGBA;
        /**
         * 数据类型
         */
        this.type = TextureDataType.UNSIGNED_BYTE;
        /**
         * 是否生成mipmap
         */
        this.generateMipmap = false;
        /**
         * 对图像进行Y轴反转。默认值为false
         */
        this.flipY = false;
        /**
         * 将图像RGB颜色值得每一个分量乘以A。默认为false
         */
        this.premulAlpha = false;
        this.minFilter = TextureMinFilter.LINEAR;
        this.magFilter = TextureMagFilter.LINEAR;
        this._wrapS = TextureWrap.REPEAT;
        this._wrapT = TextureWrap.REPEAT;
        /**
         * 各向异性过滤。使用各向异性过滤能够使纹理的效果更好，但是会消耗更多的内存、CPU、GPU时间。默认为0。
         */
        this.anisotropy = 0;
        this.invalid = true;
        /**
         * 是否为渲染目标纹理
         */
        this.isRenderTarget = false;
        this.OFFSCREEN_WIDTH = 1024;
        this.OFFSCREEN_HEIGHT = 1024;
    }

    if ( Feng3dObject ) TextureInfo.__proto__ = Feng3dObject;
    TextureInfo.prototype = Object.create( Feng3dObject && Feng3dObject.prototype );
    TextureInfo.prototype.constructor = TextureInfo;

    var prototypeAccessors = { wrapS: { configurable: true },wrapT: { configurable: true },isPowerOfTwo: { configurable: true },activePixels: { configurable: true },dataURL: { configurable: true } };
    /**
     * 表示x轴的纹理的回环方式，就是当纹理的宽度小于需要贴图的平面的宽度的时候，平面剩下的部分应该p以何种方式贴图的问题。
     */
    prototypeAccessors.wrapS.get = function () {
        if (!this.isPowerOfTwo)
            { return TextureWrap.CLAMP_TO_EDGE; }
        return this._wrapS;
    };
    prototypeAccessors.wrapS.set = function (v) {
        this._wrapS = v;
    };
    /**
     * 表示y轴的纹理回环方式。 magFilter和minFilter表示过滤的方式，这是OpenGL的基本概念，我将在下面讲一下，目前你不用担心它的使用。当您不设置的时候，它会取默认值，所以，我们这里暂时不理睬他。
     */
    prototypeAccessors.wrapT.get = function () {
        if (!this.isPowerOfTwo)
            { return TextureWrap.CLAMP_TO_EDGE; }
        return this._wrapT;
    };
    prototypeAccessors.wrapT.set = function (v) {
        this._wrapT = v;
    };
    /**
     * 是否为2的幂贴图
     */
    prototypeAccessors.isPowerOfTwo.get = function () {
        if (this.isRenderTarget) {
            if (this.OFFSCREEN_WIDTH == 0 || !mathUtil.isPowerOfTwo(this.OFFSCREEN_WIDTH))
                { return false; }
            if (this.OFFSCREEN_HEIGHT == 0 || !mathUtil.isPowerOfTwo(this.OFFSCREEN_HEIGHT))
                { return false; }
            return true;
        }
        var pixels = this.activePixels;
        if (!pixels)
            { return false; }
        if (!Array.isArray(pixels))
            { pixels = [pixels]; }
        for (var i = 0; i < pixels.length; i++) {
            var element = pixels[i];
            if (element.width == 0 || !mathUtil.isPowerOfTwo(element.width))
                { return false; }
            if (element.height == 0 || !mathUtil.isPowerOfTwo(element.height))
                { return false; }
        }
        return true;
    };
    /**
     * 纹理尺寸
     */
    TextureInfo.prototype.getSize = function getSize () {
        if (this.isRenderTarget) {
            return new Vector2(this.OFFSCREEN_WIDTH, this.OFFSCREEN_HEIGHT);
        }
        var pixels = this.activePixels;
        if (!pixels)
            { new Vector2(1, 1); }
        if (!Array.isArray(pixels))
            { pixels = [pixels]; }
        if (pixels.length == 0)
            { return new Vector2(1, 1); }
        var pixel = pixels[0];
        return new Vector2(pixel.width, pixel.height);
    };
    /**
     * 判断数据是否满足渲染需求
     */
    TextureInfo.prototype.checkRenderData = function checkRenderData (pixels) {
        if (!pixels)
            { return false; }
        if (!Array.isArray(pixels))
            { pixels = [pixels]; }
        if (pixels.length == 0)
            { return false; }
        for (var i = 0; i < pixels.length; i++) {
            var element = pixels[i];
            if (!element)
                { return false; }
            if (element.width == 0)
                { return false; }
            if (element.height == 0)
                { return false; }
        }
        return true;
    };
    /**
     * 使纹理失效
     */
    TextureInfo.prototype.invalidate = function invalidate () {
        this.invalid = true;
    };
    prototypeAccessors.activePixels.get = function () {
        this.updateActivePixels();
        return this._activePixels;
    };
    /**
     *
     */
    prototypeAccessors.dataURL.get = function () {
        this.updateActivePixels();
        if (!this._dataURL) {
            if (this._activePixels instanceof ImageData)
                { this._dataURL = dataTransform.imageDataToDataURL(this._activePixels); }
            else if (this._activePixels instanceof HTMLImageElement)
                { this._dataURL = dataTransform.imageToDataURL(this._activePixels); }
            else if (this._activePixels instanceof HTMLCanvasElement)
                { this._dataURL = dataTransform.canvasToDataURL(this._activePixels); }
        }
        return this._dataURL;
    };
    TextureInfo.prototype.updateActivePixels = function updateActivePixels () {
        var old = this._activePixels;
        if (this.checkRenderData(this._pixels)) {
            this._activePixels = this._pixels;
        }
        else {
            if (Array.isArray(this.noPixels)) {
                this._activePixels = this.noPixels.map(function (v) { return imageDatas[v]; });
            }
            else {
                this._activePixels = imageDatas[this.noPixels];
            }
        }
        if (old != this._activePixels)
            { this._dataURL = null; }
    };

    Object.defineProperties( TextureInfo.prototype, prototypeAccessors );

    return TextureInfo;
}(Feng3dObject));
__decorate([
    serialize,
    oav({ component: "OAVEnum", componentParam: { enumClass: TextureFormat } }),
    watch("invalidate")
], TextureInfo.prototype, "format", void 0);
__decorate([
    serialize,
    oav({ component: "OAVEnum", componentParam: { enumClass: TextureDataType } }),
    watch("invalidate")
], TextureInfo.prototype, "type", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidate")
], TextureInfo.prototype, "generateMipmap", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidate")
], TextureInfo.prototype, "flipY", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidate")
], TextureInfo.prototype, "premulAlpha", void 0);
__decorate([
    serialize,
    oav({ component: "OAVEnum", componentParam: { enumClass: TextureMinFilter } })
], TextureInfo.prototype, "minFilter", void 0);
__decorate([
    serialize,
    oav({ component: "OAVEnum", componentParam: { enumClass: TextureMagFilter } })
], TextureInfo.prototype, "magFilter", void 0);
__decorate([
    serialize,
    oav({ component: "OAVEnum", componentParam: { enumClass: TextureWrap } })
], TextureInfo.prototype, "wrapS", null);
__decorate([
    serialize,
    oav({ component: "OAVEnum", componentParam: { enumClass: TextureWrap } })
], TextureInfo.prototype, "wrapT", null);
__decorate([
    serialize,
    oav()
], TextureInfo.prototype, "anisotropy", void 0);
__decorate([
    watch("invalidate")
], TextureInfo.prototype, "OFFSCREEN_WIDTH", void 0);
__decorate([
    watch("invalidate")
], TextureInfo.prototype, "OFFSCREEN_HEIGHT", void 0);

/**
 * 2D纹理
 */
var Texture2D = /*@__PURE__*/(function (TextureInfo) {
    function Texture2D() {
        TextureInfo.call(this);
        /**
         * 纹理类型
         */
        this.textureType = TextureType.TEXTURE_2D;
        this.assetType = AssetType.texture;
        /**
         * 当贴图数据未加载好等情况时代替使用
         */
        this.noPixels = ImageDatas.white;
        this._loadings = [];
    }

    if ( TextureInfo ) Texture2D.__proto__ = TextureInfo;
    Texture2D.prototype = Object.create( TextureInfo && TextureInfo.prototype );
    Texture2D.prototype.constructor = Texture2D;

    var prototypeAccessors = { isLoaded: { configurable: true },image: { configurable: true },source: { configurable: true } };
    /**
     * 是否已加载
     */
    prototypeAccessors.isLoaded.get = function () { return this._loadings.length == 0; };
    prototypeAccessors.image.get = function () {
        return this._pixels;
    };
    /**
     * 用于表示初始化纹理的数据来源
     */
    prototypeAccessors.source.get = function () {
        return this._source;
    };
    prototypeAccessors.source.set = function (v) {
        var this$1 = this;

        this._source = v;
        if (!v) {
            this._pixels = null;
            this.invalidate();
            return;
        }
        if (v.url) {
            this._loadings.push(v.url);
            loader.loadImage(v.url, function (img) {
                this$1._pixels = img;
                this$1.invalidate();
                Array.delete(this$1._loadings, v.url);
                this$1.onItemLoadCompleted();
            }, null, function (e) {
                console.error(e);
                Array.delete(this$1._loadings, v.url);
                this$1.onItemLoadCompleted();
            });
        }
    };
    Texture2D.prototype.onItemLoadCompleted = function onItemLoadCompleted () {
        if (this._loadings.length == 0)
            { this.emit("loadCompleted"); }
    };
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    Texture2D.prototype.onLoadCompleted = function onLoadCompleted (callback) {
        if (this.isLoaded) {
            callback();
            return;
        }
        this.once("loadCompleted", callback);
    };
    /**
     * 从url初始化纹理
     *
     * @param url 路径
     */
    Texture2D.fromUrl = function fromUrl (url) {
        var texture = new Texture2D();
        texture.source = { url: url };
        return texture;
    };

    Object.defineProperties( Texture2D.prototype, prototypeAccessors );

    return Texture2D;
}(TextureInfo));
__decorate([
    serialize
], Texture2D.prototype, "source", null);
Texture2D.white = serialization.setValue(new Texture2D(), { name: "white-Texture", noPixels: ImageDatas.white, hideFlags: HideFlags.NotEditable });
Texture2D.default = serialization.setValue(new Texture2D(), { name: "Default-Texture", hideFlags: HideFlags.NotEditable });
Texture2D.defaultNormal = serialization.setValue(new Texture2D(), { name: "Default-NormalTexture", noPixels: ImageDatas.defaultNormal, hideFlags: HideFlags.NotEditable });
Texture2D.defaultParticle = serialization.setValue(new Texture2D(), { name: "Default-ParticleTexture", noPixels: ImageDatas.defaultParticle, format: TextureFormat.RGBA, hideFlags: HideFlags.NotEditable });
AssetData.addAssetData("white-Texture", Texture2D.white);
AssetData.addAssetData("Default-Texture", Texture2D.default);
AssetData.addAssetData("Default-NormalTexture", Texture2D.defaultNormal);
AssetData.addAssetData("Default-ParticleTexture", Texture2D.defaultParticle);

/**
 * 立方体纹理
 */
var TextureCube = /*@__PURE__*/(function (TextureInfo) {
    function TextureCube() {
        TextureInfo.apply(this, arguments);
        this.textureType = TextureType.TEXTURE_CUBE_MAP;
        this.assetType = AssetType.texturecube;
        this.OAVCubeMap = "";
        this.noPixels = [ImageDatas.white, ImageDatas.white, ImageDatas.white, ImageDatas.white, ImageDatas.white, ImageDatas.white];
        this._pixels = [null, null, null, null, null, null];
        this._loading = [];
    }

    if ( TextureInfo ) TextureCube.__proto__ = TextureInfo;
    TextureCube.prototype = Object.create( TextureInfo && TextureInfo.prototype );
    TextureCube.prototype.constructor = TextureCube;

    var prototypeAccessors = { isLoaded: { configurable: true } };
    /**
     * 是否加载完成
     */
    prototypeAccessors.isLoaded.get = function () { return this._loading.length == 0; };
    TextureCube.prototype.setTexture2D = function setTexture2D (pos, texture) {
        if (this.rawData == null || this.rawData.type != "texture") {
            this.rawData = { type: "texture", textures: [] };
        }
        var index = TextureCube.ImageNames.indexOf(pos);
        this.rawData.textures[index] = texture;
        this._loadItemTexture(texture, index);
    };
    TextureCube.prototype.setTexture2DPath = function setTexture2DPath (pos, path) {
        if (this.rawData == null || this.rawData.type != "path") {
            this.rawData = { type: "path", paths: [] };
        }
        var index = TextureCube.ImageNames.indexOf(pos);
        this.rawData.paths[index] = path;
        this._loadItemImagePath(path, index);
    };
    TextureCube.prototype.getTextureImage = function getTextureImage (pos, callback) {
        if (!this.rawData) {
            callback();
            return;
        }
        var index = TextureCube.ImageNames.indexOf(pos);
        if (this.rawData.type == "texture") {
            var texture = this.rawData.textures[index];
            if (!texture) {
                callback();
                return;
            }
            ;
            texture.onLoadCompleted(function () {
                callback(texture.image);
            });
        }
        else if (this.rawData.type == "path") {
            var path = this.rawData.paths[index];
            if (!path) {
                callback();
                return;
            }
            fs.readImage(path, function (err, img) {
                callback(img);
            });
        }
    };
    TextureCube.prototype._rawDataChanged = function _rawDataChanged () {
        var this$1 = this;

        if (!this.rawData)
            { return; }
        if (this.rawData.type == "texture") {
            this.rawData.textures.forEach(function (v, index) {
                this$1._loadItemTexture(v, index);
            });
            this.invalidate();
        }
        else if (this.rawData.type == "path") {
            this.rawData.paths.forEach(function (v, index) {
                this$1._loadItemImagePath(v, index);
            });
        }
    };
    /**
     * 加载单个贴图
     *
     * @param texture 贴图
     * @param index 索引
     */
    TextureCube.prototype._loadItemTexture = function _loadItemTexture (texture, index) {
        var this$1 = this;

        if (texture == null)
            { return; }
        this._loading.push(texture);
        texture.onLoadCompleted(function () {
            if (this$1.rawData.type == "texture" && this$1.rawData.textures[index] == texture) {
                this$1._pixels[index] = texture.image;
                this$1.invalidate();
            }
            Array.delete(this$1._loading, texture);
            this$1._onItemLoadCompleted();
        });
    };
    /**
     * 加载单个图片
     *
     * @param imagepath 图片路径
     * @param index 索引
     */
    TextureCube.prototype._loadItemImagePath = function _loadItemImagePath (imagepath, index) {
        var this$1 = this;

        if (imagepath == null)
            { return; }
        this._loading.push(imagepath);
        fs.readImage(imagepath, function (err, img) {
            if (img != null && this$1.rawData.type == "path" && this$1.rawData.paths[index] == imagepath) {
                this$1._pixels[index] = img;
                this$1.invalidate();
            }
            Array.delete(this$1._loading, imagepath);
            this$1._onItemLoadCompleted();
        });
    };
    TextureCube.prototype._onItemLoadCompleted = function _onItemLoadCompleted () {
        if (this._loading.length == 0)
            { this.emit("loadCompleted"); }
    };
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    TextureCube.prototype.onLoadCompleted = function onLoadCompleted (callback) {
        if (this.isLoaded) {
            callback();
            return;
        }
        this.once("loadCompleted", callback);
    };

    Object.defineProperties( TextureCube.prototype, prototypeAccessors );

    return TextureCube;
}(TextureInfo));
TextureCube.ImageNames = ["positive_x_url", "positive_y_url", "positive_z_url", "negative_x_url", "negative_y_url", "negative_z_url"];
__decorate([
    oav({ component: "OAVCubeMap", priority: -1 })
], TextureCube.prototype, "OAVCubeMap", void 0);
__decorate([
    serialize,
    watch("_rawDataChanged")
], TextureCube.prototype, "rawData", void 0);
TextureCube.default = serialization.setValue(new TextureCube(), { name: "Default-TextureCube", hideFlags: HideFlags.NotEditable });
AssetData.addAssetData("Default-TextureCube", TextureCube.default);

/**
 * 材质
 */
var Material = /*@__PURE__*/(function (Feng3dObject) {
    function Material() {
        Feng3dObject.call(this);
        //
        this.renderAtomic = new RenderAtomic();
        this.preview = "";
        this._name = "";
        globalEmitter.on("asset.shaderChanged", this._onShaderChanged, this);
        this.shaderName = "standard";
    }

    if ( Feng3dObject ) Material.__proto__ = Feng3dObject;
    Material.prototype = Object.create( Feng3dObject && Feng3dObject.prototype );
    Material.prototype.constructor = Material;

    var prototypeAccessors = { name: { configurable: true },isLoaded: { configurable: true } };
    Material.create = function create (shaderName, uniforms, renderParams) {
        var material = new Material();
        material.init(shaderName, uniforms, renderParams);
        return material;
    };
    Material.prototype.init = function init (shaderName, uniforms, renderParams) {
        this.shaderName = shaderName;
        //
        uniforms && serialization.setValue(this.uniforms, uniforms);
        renderParams && serialization.setValue(this.renderParams, renderParams);
        return this;
    };
    prototypeAccessors.name.get = function () {
        return this._name;
    };
    prototypeAccessors.name.set = function (v) {
        this._name = v;
    };
    Material.prototype.beforeRender = function beforeRender (renderAtomic) {
        Object.assign(renderAtomic.uniforms, this.renderAtomic.uniforms);
        renderAtomic.shader = this.renderAtomic.shader;
        renderAtomic.renderParams = this.renderAtomic.renderParams;
        renderAtomic.shaderMacro.IS_POINTS_MODE = this.renderParams.renderMode == RenderMode.POINTS;
    };
    /**
     * 是否加载完成
     */
    prototypeAccessors.isLoaded.get = function () {
        var uniforms = this.uniforms;
        for (var key in uniforms) {
            var texture = uniforms[key];
            if (texture instanceof Texture2D || texture instanceof TextureCube) {
                if (!texture.isLoaded)
                    { return false; }
            }
        }
        return true;
    };
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    Material.prototype.onLoadCompleted = function onLoadCompleted (callback) {
        var loadingNum = 0;
        var uniforms = this.uniforms;
        for (var key in uniforms) {
            var texture = uniforms[key];
            if (texture instanceof Texture2D || texture instanceof TextureCube) {
                if (!texture.isLoaded) {
                    loadingNum++;
                    texture.on("loadCompleted", function () {
                        loadingNum--;
                        if (loadingNum == 0)
                            { callback(); }
                    });
                }
            }
        }
        if (loadingNum == 0)
            { callback(); }
    };
    Material.prototype._onShaderChanged = function _onShaderChanged () {
        var cls = shaderlib.shaderConfig.shaders[this.shaderName].cls;
        if (cls) {
            if (this.uniforms == null || this.uniforms.constructor != cls) {
                var newuniforms = new cls();
                this.uniforms = newuniforms;
            }
        }
        else {
            this.uniforms = {};
        }
        var renderParams = shaderlib.shaderConfig.shaders[this.shaderName].renderParams;
        renderParams && serialization.setValue(this.renderParams, renderParams);
        this.renderAtomic.shader = new Shader(this.shaderName);
    };
    Material.prototype._onUniformsChanged = function _onUniformsChanged () {
        this.renderAtomic.uniforms = this.uniforms;
    };
    Material.prototype._onRenderParamsChanged = function _onRenderParamsChanged () {
        this.renderAtomic.renderParams = this.renderParams;
    };
    /**
     * 设置默认材质
     *
     * 资源名称与材质名称相同，且无法在检查器界面中编辑。
     *
     * @param name 材质名称
     * @param material 材质数据
     */
    Material.setDefault = function setDefault (name, material) {
        var newMaterial = this._defaultMaterials[name] = new Material();
        serialization.setValue(newMaterial, material);
        serialization.setValue(newMaterial, { name: name, hideFlags: HideFlags.NotEditable });
        AssetData.addAssetData(name, newMaterial);
    };
    /**
     * 获取材质
     *
     * @param name 材质名称
     */
    Material.getDefault = function getDefault (name) {
        return this._defaultMaterials[name];
    };

    Object.defineProperties( Material.prototype, prototypeAccessors );

    return Material;
}(Feng3dObject));
Material._defaultMaterials = {};
__decorate([
    oav({ component: "OAVFeng3dPreView" })
], Material.prototype, "preview", void 0);
__decorate([
    oav({ component: "OAVMaterialName" }),
    serialize,
    watch("_onShaderChanged")
], Material.prototype, "shaderName", void 0);
__decorate([
    oav(),
    serialize
], Material.prototype, "name", null);
__decorate([
    serialize,
    oav({ component: "OAVObjectView" }),
    watch("_onUniformsChanged")
], Material.prototype, "uniforms", void 0);
__decorate([
    serialize,
    oav({ block: "渲染参数", component: "OAVObjectView" }),
    watch("_onRenderParamsChanged")
], Material.prototype, "renderParams", void 0);

/**
 * 可射线捕获
 */
var RayCastable = /*@__PURE__*/(function (Behaviour) {
    function RayCastable () {
        Behaviour.apply(this, arguments);
    }

    if ( Behaviour ) RayCastable.__proto__ = Behaviour;
    RayCastable.prototype = Object.create( Behaviour && Behaviour.prototype );
    RayCastable.prototype.constructor = RayCastable;

    var prototypeAccessors = { selfLocalBounds: { configurable: true },selfWorldBounds: { configurable: true } };

    prototypeAccessors.selfLocalBounds.get = function () {
        if (!this._selfLocalBounds)
            { this._updateBounds(); }
        return this._selfLocalBounds;
    };
    /**
     * 自身世界包围盒
     */
    prototypeAccessors.selfWorldBounds.get = function () {
        if (!this._selfWorldBounds)
            { this._updateWorldBounds(); }
        return this._selfWorldBounds;
    };
    /**
     * 与世界空间射线相交
     *
     * @param worldRay 世界空间射线
     *
     * @return 相交信息
     */
    RayCastable.prototype.worldRayIntersection = function worldRayIntersection (worldRay) {
        throw "请在子类中实现！";
    };
    RayCastable.prototype._onScenetransformChanged = function _onScenetransformChanged () {
        this._selfWorldBounds = null;
    };
    /**
     * 更新世界边界
     */
    RayCastable.prototype._updateWorldBounds = function _updateWorldBounds () {
        this._selfWorldBounds = this.selfLocalBounds.applyMatrixTo(this.node3d.localToWorldMatrix);
    };
    /**
     * 处理包围盒变换事件
     */
    RayCastable.prototype._onBoundsInvalid = function _onBoundsInvalid () {
        this._selfLocalBounds = null;
        this._selfWorldBounds = null;
        this.emit("selfBoundsChanged", this);
    };
    RayCastable.prototype._updateBounds = function _updateBounds () {
        throw "请在子类中实现！";
    };

    Object.defineProperties( RayCastable.prototype, prototypeAccessors );

    return RayCastable;
}(Behaviour));
RayCastable = __decorate([
    RegisterComponent()
], RayCastable);

/**
 * 可渲染组件
 *
 * General functionality for all renderers.
 *
 * A renderer is what makes an object appear on the screen. Use this class to access the renderer of any object, mesh or Particle System. Renderers can be disabled to make objects invisible (see enabled), and the materials can be accessed and modified through them (see material).
 *
 * See Also: Renderer components for meshes, particles, lines and trails.
 */
var Renderable = /*@__PURE__*/(function (RayCastable) {
    function Renderable() {
        RayCastable.call(this);
        this.renderAtomic = new RenderAtomic();
        /**
         * 几何体
         */
        this.geometry = Geometry.getDefault("Cube");
        this.castShadows = true;
        this.receiveShadows = true;
        this._lightPicker = new LightPicker(this);
    }

    if ( RayCastable ) Renderable.__proto__ = RayCastable;
    Renderable.prototype = Object.create( RayCastable && RayCastable.prototype );
    Renderable.prototype.constructor = Renderable;

    var prototypeAccessors = { material: { configurable: true },isLoaded: { configurable: true } };
    /**
     * 材质
     */
    prototypeAccessors.material.get = function () {
        return this._material || Material.getDefault("Default-Material");
    };
    prototypeAccessors.material.set = function (v) {
        this._material = v;
    };
    Renderable.prototype.init = function init () {
        RayCastable.prototype.init.call(this);
        this.on("scenetransformChanged", this._onScenetransformChanged, this);
        this.on("getSelfBounds", this._onGetSelfBounds, this);
    };
    /**
     * 渲染前执行函数
     *
     * 可用于渲染前收集渲染数据，或者更新显示效果等
     *
     * @param renderAtomic
     * @param scene
     * @param camera
     */
    Renderable.prototype.beforeRender = function beforeRender (renderAtomic, scene, camera) {
        var this$1 = this;

        //
        this.geometry.beforeRender(renderAtomic);
        this.material.beforeRender(renderAtomic);
        this._lightPicker.beforeRender(renderAtomic);
        this.entity.components.forEach(function (element) {
            if (element != this$1)
                { element.beforeRender(renderAtomic, scene, camera); }
        });
    };
    /**
     * 与世界空间射线相交
     *
     * @param worldRay 世界空间射线
     *
     * @return 相交信息
     */
    Renderable.prototype.worldRayIntersection = function worldRayIntersection (worldRay) {
        var localRay = this.node3d.rayWorldToLocal(worldRay);
        var pickingCollisionVO = this.localRayIntersection(localRay);
        return pickingCollisionVO;
    };
    /**
     * 与局部空间射线相交
     *
     * @param ray3D 局部空间射线
     *
     * @return 相交信息
     */
    Renderable.prototype.localRayIntersection = function localRayIntersection (localRay) {
        var localNormal = new Vector3();
        //检测射线与边界的碰撞
        var rayEntryDistance = this.selfLocalBounds.rayIntersection(localRay.origin, localRay.direction, localNormal);
        if (rayEntryDistance === Number.MAX_VALUE)
            { return null; }
        //保存碰撞数据
        var pickingCollisionVO = {
            node3d: this.node3d,
            localNormal: localNormal,
            localRay: localRay,
            rayEntryDistance: rayEntryDistance,
            rayOriginIsInsideBounds: rayEntryDistance == 0,
            geometry: this.geometry,
            cullFace: this.material.renderParams.cullFace,
        };
        return pickingCollisionVO;
    };
    /**
     * 是否加载完成
     */
    prototypeAccessors.isLoaded.get = function () {
        return this.material.isLoaded;
    };
    /**
     * 已加载完成或者加载完成时立即调用
     * @param callback 完成回调
     */
    Renderable.prototype.onLoadCompleted = function onLoadCompleted (callback) {
        if (this.isLoaded)
            { callback(); }
        this.material.onLoadCompleted(callback);
    };
    /**
     * 销毁
     */
    Renderable.prototype.dispose = function dispose () {
        this.geometry = null;
        this.material = null;
        RayCastable.prototype.dispose.call(this);
    };
    Renderable.prototype._onGeometryChanged = function _onGeometryChanged (property, oldValue, value) {
        if (oldValue) {
            oldValue.off("boundsInvalid", this._onBoundsInvalid, this);
        }
        if (value) {
            value.on("boundsInvalid", this._onBoundsInvalid, this);
        }
        this.geometry = this.geometry || Geometry.getDefault("Cube");
        this._onBoundsInvalid();
    };
    Renderable.prototype._updateBounds = function _updateBounds () {
        this._selfLocalBounds = this.geometry.bounding;
    };
    Renderable.prototype._onGetSelfBounds = function _onGetSelfBounds (event) {
        event.data.bounds.push(this.geometry.bounding);
    };

    Object.defineProperties( Renderable.prototype, prototypeAccessors );

    return Renderable;
}(RayCastable));
__decorate([
    oav({ component: "OAVPick", tooltip: "几何体，提供模型以形状", componentParam: { accepttype: "geometry", datatype: "geometry" } }),
    serialize,
    watch("_onGeometryChanged")
], Renderable.prototype, "geometry", void 0);
__decorate([
    oav({ component: "OAVPick", tooltip: "材质，提供模型以皮肤", componentParam: { accepttype: "material", datatype: "material" } }),
    serialize
], Renderable.prototype, "material", null);
__decorate([
    oav({ tooltip: "是否投射阴影" }),
    serialize
], Renderable.prototype, "castShadows", void 0);
__decorate([
    oav({ tooltip: "是否接受阴影" }),
    serialize
], Renderable.prototype, "receiveShadows", void 0);
Renderable = __decorate([
    RegisterComponent({ single: true })
], Renderable);
Object.defineProperty(Node3D.prototype, "isSelfLoaded", {
    get: function get() {
        var model = this.getComponent(Renderable);
        if (model)
            { return model.isLoaded; }
        return true;
    }
});
Node3D.prototype.onSelfLoadCompleted = function onSelfLoadCompleted(callback) {
    if (this.isSelfLoaded) {
        callback();
        return;
    }
    var model = this.getComponent(Renderable);
    if (model) {
        model.onLoadCompleted(callback);
    }
    else
        { callback(); }
};

var SkinnedMeshRenderer = /*@__PURE__*/(function (Renderable) {
    function SkinnedMeshRenderer() {
        Renderable.apply(this, arguments);
        this.cacheU_skeletonGlobalMatriices = {};
    }

    if ( Renderable ) SkinnedMeshRenderer.__proto__ = Renderable;
    SkinnedMeshRenderer.prototype = Object.create( Renderable && Renderable.prototype );
    SkinnedMeshRenderer.prototype.constructor = SkinnedMeshRenderer;

    var prototypeAccessors = { u_modelMatrix: { configurable: true },u_ITModelMatrix: { configurable: true },u_skeletonGlobalMatriices: { configurable: true } };
    /**
     * 创建一个骨骼动画类
     */
    SkinnedMeshRenderer.prototype.init = function init () {
        Renderable.prototype.init.call(this);
        this.hideFlags = HideFlags.DontTransform;
    };
    SkinnedMeshRenderer.prototype.beforeRender = function beforeRender (renderAtomic, scene, camera) {
        var this$1 = this;

        Renderable.prototype.beforeRender.call(this, renderAtomic, scene, camera);
        var frameId = null;
        var animation = this.getComponentsInParents(Animation)[0];
        if (animation) {
            frameId = animation.clipName + "&" + animation.frame;
        }
        renderAtomic.uniforms.u_modelMatrix = function () { return this$1.u_modelMatrix; };
        renderAtomic.uniforms.u_ITModelMatrix = function () { return this$1.u_ITModelMatrix; };
        //
        var skeletonGlobalMatriices = this.cacheU_skeletonGlobalMatriices[frameId];
        if (!skeletonGlobalMatriices) {
            skeletonGlobalMatriices = this.u_skeletonGlobalMatriices;
            if (frameId)
                { this.cacheU_skeletonGlobalMatriices[frameId] = skeletonGlobalMatriices; }
        }
        renderAtomic.uniforms.u_skeletonGlobalMatriices = skeletonGlobalMatriices;
        renderAtomic.shaderMacro.HAS_SKELETON_ANIMATION = true;
        renderAtomic.shaderMacro.NUM_SKELETONJOINT = this.skinSkeleton.joints.length;
    };
    /**
     * 销毁
     */
    SkinnedMeshRenderer.prototype.dispose = function dispose () {
        this.cacheSkeletonComponent = null;
        Renderable.prototype.dispose.call(this);
    };
    prototypeAccessors.u_modelMatrix.get = function () {
        if (this.cacheSkeletonComponent)
            { return this.cacheSkeletonComponent.node3d.localToWorldMatrix; }
        return this.node3d.localToWorldMatrix;
    };
    prototypeAccessors.u_ITModelMatrix.get = function () {
        if (this.cacheSkeletonComponent)
            { return this.cacheSkeletonComponent.node3d.ITlocalToWorldMatrix; }
        return this.node3d.ITlocalToWorldMatrix;
    };
    prototypeAccessors.u_skeletonGlobalMatriices.get = function () {
        if (!this.cacheSkeletonComponent) {
            var node3d = this.node3d;
            var skeletonComponent = null;
            while (node3d && !skeletonComponent) {
                skeletonComponent = node3d.getComponent(SkeletonComponent);
                node3d = node3d.parent;
            }
            this.cacheSkeletonComponent = skeletonComponent;
        }
        var skeletonGlobalMatriices = [];
        if (this.skinSkeleton && this.cacheSkeletonComponent) {
            var joints = this.skinSkeleton.joints;
            var globalMatrices = this.cacheSkeletonComponent.globalMatrices;
            for (var i = joints.length - 1; i >= 0; i--) {
                skeletonGlobalMatriices[i] = globalMatrices[joints[i][0]].clone();
                if (this.initMatrix) {
                    skeletonGlobalMatriices[i].prepend(this.initMatrix);
                }
            }
        }
        else {
            skeletonGlobalMatriices = defaultSkeletonGlobalMatriices;
        }
        return skeletonGlobalMatriices;
    };

    Object.defineProperties( SkinnedMeshRenderer.prototype, prototypeAccessors );

    return SkinnedMeshRenderer;
}(Renderable));
__decorate([
    serialize,
    oav()
], SkinnedMeshRenderer.prototype, "skinSkeleton", void 0);
__decorate([
    serialize
], SkinnedMeshRenderer.prototype, "initMatrix", void 0);
SkinnedMeshRenderer = __decorate([
    RegisterComponent({ single: true })
], SkinnedMeshRenderer);
var defaultSkeletonGlobalMatriices = (function () { var v = [new Matrix4x4()]; var i = 150; while (i-- > 1)
    { v.push(v[0]); } return v; })();
var SkinSkeleton = function SkinSkeleton() {
    /**
     * [在整个骨架中的编号，骨骼名称]
     */
    this.joints = [];
    /**
     * 当前模型包含骨骼数量
     */
    this.numJoint = 0;
};
__decorate([
    serialize
], SkinSkeleton.prototype, "joints", void 0);
__decorate([
    serialize
], SkinSkeleton.prototype, "numJoint", void 0);
var SkinSkeletonTemp = /*@__PURE__*/(function (SkinSkeleton) {
    function SkinSkeletonTemp() {
        SkinSkeleton.apply(this, arguments);
        /**
         * temp 解析时临时数据
         */
        this.cache_map = {};
    }

    if ( SkinSkeleton ) SkinSkeletonTemp.__proto__ = SkinSkeleton;
    SkinSkeletonTemp.prototype = Object.create( SkinSkeleton && SkinSkeleton.prototype );
    SkinSkeletonTemp.prototype.constructor = SkinSkeletonTemp;
    SkinSkeletonTemp.prototype.resetJointIndices = function resetJointIndices (jointIndices, skeleton) {
        var len = jointIndices.length;
        for (var i = 0; i < len; i++) {
            if (this.cache_map[jointIndices[i]] === undefined)
                { this.cache_map[jointIndices[i]] = this.numJoint++; }
            jointIndices[i] = this.cache_map[jointIndices[i]];
        }
        this.joints.length = 0;
        for (var key in this.cache_map) {
            if (this.cache_map.hasOwnProperty(key)) {
                this.joints[this.cache_map[key]] = [parseInt(key), skeleton.joints[key].name];
            }
        }
    };

    return SkinSkeletonTemp;
}(SkinSkeleton));

/**
 * 心跳计时器
 */
var Ticker = function Ticker() {
    /**
     * 帧率
     */
    this.frameRate = 60;
};
/**
 * 注册帧函数
 * @param func  执行方法
 * @param thisObject方法this指针
 * @param priority  执行优先级
 */
Ticker.prototype.onframe = function onframe (func, thisObject, priority) {
        var this$1 = this;
        if ( priority === void 0 ) priority = 0;

    this.on(function () { return 1000 / this$1.frameRate; }, func, thisObject, priority);
    return this;
};
/**
 * 下一帧执行方法
 * @param func  执行方法
 * @param thisObject方法this指针
 * @param priority  执行优先级
 */
Ticker.prototype.nextframe = function nextframe (func, thisObject, priority) {
        var this$1 = this;
        if ( priority === void 0 ) priority = 0;

    this.once(function () { return 1000 / this$1.frameRate; }, func, thisObject, priority);
    return this;
};
/**
 * 注销帧函数（只执行一次）
 * @param func  执行方法
 * @param thisObject方法this指针
 * @param priority  执行优先级
 */
Ticker.prototype.offframe = function offframe (func, thisObject) {
        var this$1 = this;

    this.off(function () { return 1000 / this$1.frameRate; }, func, thisObject);
    return this;
};
/**
 * 注册周期函数
 * @param interval  执行周期，以ms为单位
 * @param func  执行方法
 * @param thisObject方法this指针
 * @param priority  执行优先级
 */
Ticker.prototype.on = function on (interval, func, thisObject, priority) {
        if ( priority === void 0 ) priority = 0;

    addTickerFunc({ interval: interval, func: func, thisObject: thisObject, priority: priority, once: false });
    return this;
};
/**
 * 注册周期函数（只执行一次）
 * @param interval  执行周期，以ms为单位
 * @param func  执行方法
 * @param thisObject方法this指针
 * @param priority  执行优先级
 */
Ticker.prototype.once = function once (interval, func, thisObject, priority) {
        if ( priority === void 0 ) priority = 0;

    addTickerFunc({ interval: interval, func: func, thisObject: thisObject, priority: priority, once: true });
    return this;
};
/**
 * 注销周期函数
 * @param interval  执行周期，以ms为单位
 * @param func  执行方法
 * @param thisObject方法this指针
 */
Ticker.prototype.off = function off (interval, func, thisObject) {
    removeTickerFunc({ interval: interval, func: func, thisObject: thisObject });
    return this;
};
/**
 * 重复指定次数 执行函数
 * @param interval  执行周期，以ms为单位
 * @param 	repeatCount 执行次数
 * @param func  执行方法
 * @param thisObject方法this指针
 * @param priority  执行优先级
 */
Ticker.prototype.repeat = function repeat (interval, repeatCount, func, thisObject, priority) {
        if ( priority === void 0 ) priority = 0;

    repeatCount = ~~repeatCount;
    if (repeatCount < 1)
        { return; }
    var timer = new Timer(this, interval, repeatCount, func, thisObject, priority);
    return timer;
};
/**
 * 心跳计时器
 */
var ticker = new Ticker();
var Timer = function Timer(ticker, interval, repeatCount, func, thisObject, priority) {
    if ( priority === void 0 ) priority = 0;

    /**
     * 计时器从 0 开始后触发的总次数。
     */
    this.currentCount = 0;
    this.ticker = ticker;
    this.interval = interval;
    this.func = func;
    this.thisObject = thisObject;
    this.priority = priority;
};
/**
 * 如果计时器尚未运行，则启动计时器。
 */
Timer.prototype.start = function start () {
    this.ticker.on(this.interval, this.runfunc, this, this.priority);
    return this;
};
/**
 * 停止计时器。
 */
Timer.prototype.stop = function stop () {
    this.ticker.off(this.interval, this.runfunc, this);
    return this;
};
/**
 * 如果计时器正在运行，则停止计时器，并将 currentCount 属性设回为 0，这类似于秒表的重置按钮。
 */
Timer.prototype.reset = function reset () {
    this.stop();
    this.currentCount = 0;
    return this;
};
Timer.prototype.runfunc = function runfunc () {
    this.currentCount++;
    this.repeatCount--;
    this.func.call(this.thisObject, lazy.getvalue(this.interval));
    if (this.repeatCount < 1)
        { this.stop(); }
};
var tickerFuncs = [];
function addTickerFunc(item) {
    if (running) {
        affers.push([addTickerFunc, [item]]);
        return;
    }
    // removeTickerFunc(item);
    if (item.priority == undefined)
        { item.priority = 0; }
    item.runtime = Date.now() + lazy.getvalue(item.interval);
    tickerFuncs.push(item);
}
function removeTickerFunc(item) {
    if (running) {
        affers.push([removeTickerFunc, [item]]);
        return;
    }
    for (var i = tickerFuncs.length - 1; i >= 0; i--) {
        var element = tickerFuncs[i];
        if (lazy.getvalue(element.interval) == lazy.getvalue(item.interval)
            && element.func == item.func
            && element.thisObject == item.thisObject) {
            tickerFuncs.splice(i, 1);
        }
    }
}
var running = false;
var affers = [];
function runTickerFuncs() {
    running = true;
    //倒序，优先级高的排在后面
    tickerFuncs.sort(function (a, b) {
        return a.priority - b.priority;
    });
    var currenttime = Date.now();
    var needTickerFuncItems = [];
    for (var i = tickerFuncs.length - 1; i >= 0; i--) {
        var element = tickerFuncs[i];
        if (element.runtime < currenttime) {
            needTickerFuncItems.push(element);
            if (element.once) {
                tickerFuncs.splice(i, 1);
                continue;
            }
            element.runtime = nextRuntime(element.runtime, lazy.getvalue(element.interval));
        }
    }
    needTickerFuncItems.reverse();
    // 相同的函数只执行一个
    Array.unique(needTickerFuncItems, function (a, b) { return (a.func == b.func && a.thisObject == b.thisObject); });
    needTickerFuncItems.forEach(function (v) {
        // try
        // {
        v.func.call(v.thisObject, lazy.getvalue(v.interval));
        // } catch (error)
        // {
        //     console.warn(`${v.func} 方法执行错误，从 ticker 中移除`, error)
        //     var index = tickerFuncs.indexOf(v);
        //     if (index != -1) tickerFuncs.splice(index, 1);
        // }
    });
    running = false;
    for (var i$1 = 0; i$1 < affers.length; i$1++) {
        var affer = affers[i$1];
        affer[0].apply(null, affer[1]);
    }
    affers.length = 0;
    localrequestAnimationFrame(runTickerFuncs);
    function nextRuntime(runtime, interval) {
        return runtime + Math.ceil((currenttime - runtime) / interval) * interval;
    }
}
var localrequestAnimationFrame;
if (typeof requestAnimationFrame == "undefined") {
    var _global;
    var global;
    if (typeof window != "undefined") {
        _global = window;
        localrequestAnimationFrame =
            window["requestAnimationFrame"] ||
                window["webkitRequestAnimationFrame"] ||
                window["mozRequestAnimationFrame"] ||
                window["oRequestAnimationFrame"] ||
                window["msRequestAnimationFrame"];
    }
    else if (typeof global != "undefined") {
        _global = global;
    }
    if (localrequestAnimationFrame == undefined) {
        localrequestAnimationFrame = function (callback) {
            return _global.setTimeout(callback, 1000 / ticker.frameRate);
        };
    }
}
else {
    localrequestAnimationFrame = requestAnimationFrame;
}
runTickerFuncs();

function getAssetTypeClass(type) {
    return assetTypeClassMap[type];
}
function setAssetTypeClass(type, cls) {
    assetTypeClassMap[type] = cls;
}
var assetTypeClassMap = {};
/**
 * feng3d资源
 */
var FileAsset = function FileAsset() {
    /**
     * 是否已加载
     */
    this.isLoaded = false;
    /**
     * 是否正在加载中
     */
    this.isLoading = false;
};

var prototypeAccessors$2 = { extenson: { configurable: true },parentAsset: { configurable: true },fileName: { configurable: true },metaPath: { configurable: true },previewPath: { configurable: true } };
/**
 * 文件后缀
 */
prototypeAccessors$2.extenson.get = function () {
    console.assert(!!this.assetPath);
    var ext = pathUtils.extname(this.assetPath);
    return ext;
};
/**
 * 父资源
 */
prototypeAccessors$2.parentAsset.get = function () {
    var dir = pathUtils.dirname(this.assetPath);
    var parent = this.rs.getAssetByPath(dir);
    return parent;
};
/**
 * 文件名称
 *
 * 不包含后缀
 */
prototypeAccessors$2.fileName.get = function () {
    console.assert(!!this.assetPath);
    var fn = pathUtils.getName(this.assetPath);
    return fn;
};
/**
 * 初始化资源
 */
FileAsset.prototype.initAsset = function initAsset () {
};
/**
 * 获取资源数据
 *
 * @param callback 完成回调，当资源已加载时会立即调用回调，否则在资源加载完成后调用。
 */
FileAsset.prototype.getAssetData = function getAssetData (callback) {
        var this$1 = this;

    if (!this.isLoaded) {
        if (callback) {
            this.read(function (err) {
                console.assert(!err);
                this$1.getAssetData(callback);
            });
        }
        return null;
    }
    var assetData = this._getAssetData();
    callback && callback(assetData);
    return assetData;
};
/**
 * 资源已加载时获取资源数据，内部使用
 */
FileAsset.prototype._getAssetData = function _getAssetData () {
    return this.data;
};
/**
 * 读取资源
 *
 * @param callback 完成回调
 */
FileAsset.prototype.read = function read (callback) {
        var this$1 = this;

    if (this.isLoaded) {
        callback();
        return;
    }
    var eventtype = "loaded";
    event.once(this, eventtype, function () {
        this$1.isLoaded = true;
        this$1.isLoading = false;
        callback();
    });
    if (this.isLoading)
        { return; }
    this.isLoading = true;
    this.readMeta(function (err) {
        if (err) {
            event.emit(this$1, eventtype);
            return;
        }
        this$1.readFile(function (err) {
            event.emit(this$1, eventtype);
        });
    });
};
/**
 * 写入资源
 *
 * @param callback 完成回调
 */
FileAsset.prototype.write = function write (callback) {
        var this$1 = this;

    this.meta.mtimeMs = Date.now();
    this.writeMeta(function (err) {
        if (err) {
            callback && callback(err);
            return;
        }
        this$1.saveFile(function (err) {
            callback && callback(err);
        });
    });
};
/**
 * 删除资源
 *
 * @param callback 完成回调
 */
FileAsset.prototype.delete = function delete$1 (callback) {
        var this$1 = this;

    // 删除 meta 文件
    this.deleteMeta(function (err) {
        if (err) {
            callback && callback(err);
            return;
        }
        this$1.deleteFile(function (err) {
            // 删除映射
            this$1.rs.deleteAssetById(this$1.assetId);
            callback && callback();
        });
    });
};
/**
 * 读取资源预览图标
 *
 * @param callback 完成回调
 */
FileAsset.prototype.readPreview = function readPreview (callback) {
        var this$1 = this;

    if (this._preview) {
        callback(null, this._preview);
        return;
    }
    this.rs.fs.readImage(this.previewPath, function (err, image) {
        this$1._preview = image;
        callback(err, image);
    });
};
/**
 * 读取资源预览图标
 *
 * @param image 预览图
 * @param callback 完成回调
 */
FileAsset.prototype.writePreview = function writePreview (image, callback) {
    if (this._preview == image) {
        callback && callback(null);
        return;
    }
    this._preview = image;
    this.rs.fs.writeImage(this.previewPath, image, callback);
};
/**
 * 删除资源预览图标
 *
 * @param callback 完成回调
 */
FileAsset.prototype.deletePreview = function deletePreview (callback) {
    this.rs.fs.deleteFile(this.previewPath, callback);
};
/**
 * 删除文件
 *
 * @param callback 完成回调
 */
FileAsset.prototype.deleteFile = function deleteFile (callback) {
        var this$1 = this;

    this.rs.fs.deleteFile(this.assetPath, callback);
    // 延迟一帧判断该资源是否被删除，排除移动文件时出现的临时删除情况
    ticker.once(1000, function () {
        if (this$1.rs.getAssetById(this$1.assetId) == null) {
            this$1.deletePreview();
        }
    });
};
/**
 * 元标签路径
 */
prototypeAccessors$2.metaPath.get = function () {
    return this.assetPath + ".meta";
};
/**
 * 读取元标签
 *
 * @param callback 完成回调
 */
FileAsset.prototype.readMeta = function readMeta (callback) {
        var this$1 = this;

    this.rs.fs.readObject(this.metaPath, function (err, meta) {
        this$1.meta = meta;
        callback && callback(err);
    });
};
/**
 * 写元标签
 *
 * @param callback 完成回调
 */
FileAsset.prototype.writeMeta = function writeMeta (callback) {
    this.rs.fs.writeObject(this.metaPath, this.meta, callback);
};
/**
 * 删除元标签
 *
 * @param callback 完成回调
 */
FileAsset.prototype.deleteMeta = function deleteMeta (callback) {
    this.rs.fs.deleteFile(this.metaPath, callback);
};
/**
 * 预览图路径
 */
prototypeAccessors$2.previewPath.get = function () {
    return "previews/" + this.assetId + ".png";
};

Object.defineProperties( FileAsset.prototype, prototypeAccessors$2 );
__decorate([
    serialize
], FileAsset.prototype, "assetPath", void 0);
__decorate([
    serialize
], FileAsset.prototype, "assetId", void 0);

/**
 * 文件夹资源
 */
var FolderAsset = /*@__PURE__*/(function (FileAsset) {
    function FolderAsset() {
        FileAsset.apply(this, arguments);
        this.assetType = AssetType.folder;
    }

    if ( FileAsset ) FolderAsset.__proto__ = FileAsset;
    FolderAsset.prototype = Object.create( FileAsset && FileAsset.prototype );
    FolderAsset.prototype.constructor = FolderAsset;

    var prototypeAccessors = { childrenAssets: { configurable: true } };
    /**
     * 子资源列表
     */
    prototypeAccessors.childrenAssets.get = function () {
        var children = this.rs.getChildrenAssetByPath(this.assetPath);
        return children;
    };
    FolderAsset.prototype.initAsset = function initAsset () {
    };
    /**
     * 删除资源
     *
     * @param callback 完成回调
     */
    FolderAsset.prototype.delete = function delete$1 (callback) {
        FileAsset.prototype.delete.call(this, callback);
    };
    /**
     * 保存文件
     * @param callback 完成回调
     */
    FolderAsset.prototype.saveFile = function saveFile (callback) {
        this.rs.fs.mkdir(this.assetPath, callback);
    };
    /**
     * 读取文件
     * @param callback 完成回调
     */
    FolderAsset.prototype.readFile = function readFile (callback) {
        callback && callback(null);
    };

    Object.defineProperties( FolderAsset.prototype, prototypeAccessors );

    return FolderAsset;
}(FileAsset));
FolderAsset.extenson = "";
FolderAsset = __decorate([
    ov({ component: "OVFolderAsset" })
], FolderAsset);
setAssetTypeClass("folder", FolderAsset);

/**
 * .
 */
var CHAR_DOT = 46;
/**
 * :
 */
var CHAR_COLON = 58;
/**
 * ?
 */
var CHAR_QUESTION_MARK = 63;
/**
 * A
 */
var CHAR_UPPERCASE_A = 65;
/**
 * Z
 */
var CHAR_UPPERCASE_Z = 90;
/**
 * a
 */
var CHAR_LOWERCASE_A = 97;
/**
 * z
 */
var CHAR_LOWERCASE_Z = 122;
/**
 * /
 */
var CHAR_FORWARD_SLASH = 47;
/**
 * \
 */
var CHAR_BACKWARD_SLASH = 92;
/**
 * 未实现其功能
 */
var process = {
    platform: 'win32',
    env: {},
    cwd: function () { return ""; },
};
var ERR_INVALID_ARG_TYPE = /*@__PURE__*/(function (TypeError) {
    function ERR_INVALID_ARG_TYPE(name, expected, actual) {
        assert(typeof name === 'string', "'name' must be a string");
        // determiner: 'must be' or 'must not be'
        var determiner;
        if (typeof expected === 'string' && expected.startsWith('not ')) {
            determiner = 'must not be';
            expected = expected.replace(/^not /, '');
        }
        else {
            determiner = 'must be';
        }
        var msg;
        if (name.endsWith(' argument')) {
            // For cases like 'first argument'
            msg = "The " + name + " " + determiner + " " + (oneOf(expected, 'type'));
        }
        else {
            var type = name.includes('.') ? 'property' : 'argument';
            msg = "The \"" + name + "\" " + type + " " + determiner + " " + (oneOf(expected, 'type'));
        }
        // TODO(BridgeAR): Improve the output by showing `null` and similar.
        msg += ". Received type " + (typeof actual);
        TypeError.call(this, msg);
    }

    if ( TypeError ) ERR_INVALID_ARG_TYPE.__proto__ = TypeError;
    ERR_INVALID_ARG_TYPE.prototype = Object.create( TypeError && TypeError.prototype );
    ERR_INVALID_ARG_TYPE.prototype.constructor = ERR_INVALID_ARG_TYPE;

    return ERR_INVALID_ARG_TYPE;
}(TypeError));
function oneOf(expected, thing) {
    assert(typeof thing === 'string', '`thing` has to be of type string');
    if (Array.isArray(expected)) {
        var len = expected.length;
        assert(len > 0, 'At least one expected value needs to be specified');
        expected = expected.map(function (i) { return String(i); });
        if (len > 2) {
            return "one of " + thing + " " + (expected.slice(0, len - 1).join(', ')) + ", or " +
                expected[len - 1];
        }
        else if (len === 2) {
            return ("one of " + thing + " " + (expected[0]) + " or " + (expected[1]));
        }
        else {
            return ("of " + thing + " " + (expected[0]));
        }
    }
    else {
        return ("of " + thing + " " + (String(expected)));
    }
}
function assert(b, msg) {
    if (!b)
        { throw msg; }
}
function validateString(value, name) {
    if (typeof value !== 'string')
        { throw new ERR_INVALID_ARG_TYPE(name, 'string', value); }
}
function isPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}
function isPosixPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH;
}
function isWindowsDeviceRoot(code) {
    return code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z ||
        code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z;
}
// Resolves . and .. elements in a path with directory names
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
    var res = '';
    var lastSegmentLength = 0;
    var lastSlash = -1;
    var dots = 0;
    var code = -1;
    for (var i = 0; i <= path.length; ++i) {
        if (i < path.length)
            { code = path.charCodeAt(i); }
        else if (isPathSeparator(code))
            { break; }
        else
            { code = CHAR_FORWARD_SLASH; }
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) {
                // NOOP
            }
            else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 ||
                    res.charCodeAt(res.length - 1) !== CHAR_DOT ||
                    res.charCodeAt(res.length - 2) !== CHAR_DOT) {
                    if (res.length > 2) {
                        var lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = '';
                            lastSegmentLength = 0;
                        }
                        else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                    else if (res.length === 2 || res.length === 1) {
                        res = '';
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0)
                        { res += separator + ".."; }
                    else
                        { res = '..'; }
                    lastSegmentLength = 2;
                }
            }
            else {
                if (res.length > 0)
                    { res += separator + path.slice(lastSlash + 1, i); }
                else
                    { res = path.slice(lastSlash + 1, i); }
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        }
        else if (code === CHAR_DOT && dots !== -1) {
            ++dots;
        }
        else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep, pathObject) {
    var dir = pathObject.dir || pathObject.root;
    var base = pathObject.base ||
        ((pathObject.name || '') + (pathObject.ext || ''));
    if (!dir) {
        return base;
    }
    if (dir === pathObject.root) {
        return dir + base;
    }
    return dir + sep + base;
}
var Win32Path = function Win32Path() {
    this.sep = '\\';
    this.delimiter = ';';
    this.win32 = null;
    this.posix = null;
};
// path.resolve([from ...], to)
Win32Path.prototype.resolve = function resolve () {
        var arguments$1 = arguments;
        var pathSegments = [], len$1 = arguments.length;
        while ( len$1-- ) pathSegments[ len$1 ] = arguments[ len$1 ];

    var resolvedDevice = '';
    var resolvedTail = '';
    var resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1; i--) {
        var path;
        if (i >= 0) {
            path = arguments$1[i];
        }
        else if (!resolvedDevice) {
            path = process.cwd();
        }
        else {
            // Windows has the concept of drive-specific current working
            // directories. If we've resolved a drive letter but not yet an
            // absolute path, get cwd for that drive, or the process cwd if
            // the drive cwd is not available. We're sure the device is not
            // a UNC path at this points, because UNC paths are always absolute.
            path = process.env['=' + resolvedDevice] || process.cwd();
            // Verify that a cwd was found and that it actually points
            // to our drive. If not, default to the drive's root.
            if (path === undefined ||
                path.slice(0, 3).toLowerCase() !==
                    resolvedDevice.toLowerCase() + '\\') {
                path = resolvedDevice + '\\';
            }
        }
        validateString(path, 'path');
        // Skip empty entries
        if (path.length === 0) {
            continue;
        }
        var len = path.length;
        var rootEnd = 0;
        var device = '';
        var isAbsolute = false;
        var code = path.charCodeAt(0);
        // Try to match a root
        if (len > 1) {
            if (isPathSeparator(code)) {
                // Possible UNC root
                // If we started with a separator, we know we at least have an
                // absolute path of some kind (UNC or otherwise)
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    // Matched double path separator at beginning
                    var j = 2;
                    var last = j;
                    // Match 1 or more non-path separators
                    for (; j < len; ++j) {
                        if (isPathSeparator(path.charCodeAt(j)))
                            { break; }
                    }
                    if (j < len && j !== last) {
                        var firstPart = path.slice(last, j);
                        // Matched!
                        last = j;
                        // Match 1 or more path separators
                        for (; j < len; ++j) {
                            if (!isPathSeparator(path.charCodeAt(j)))
                                { break; }
                        }
                        if (j < len && j !== last) {
                            // Matched!
                            last = j;
                            // Match 1 or more non-path separators
                            for (; j < len; ++j) {
                                if (isPathSeparator(path.charCodeAt(j)))
                                    { break; }
                            }
                            if (j === len) {
                                // We matched a UNC root only
                                device = '\\\\' + firstPart + '\\' + path.slice(last);
                                rootEnd = j;
                            }
                            else if (j !== last) {
                                // We matched a UNC root with leftovers
                                device = '\\\\' + firstPart + '\\' + path.slice(last, j);
                                rootEnd = j;
                            }
                        }
                    }
                }
                else {
                    rootEnd = 1;
                }
            }
            else if (isWindowsDeviceRoot(code)) {
                // Possible device root
                if (path.charCodeAt(1) === CHAR_COLON) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            // Treat separator following drive name as an absolute path
                            // indicator
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        }
        else if (isPathSeparator(code)) {
            // `path` contains just a path separator
            rootEnd = 1;
            isAbsolute = true;
        }
        if (device.length > 0 &&
            resolvedDevice.length > 0 &&
            device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            // This path points to another device so it is not applicable
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = path.slice(rootEnd) + '\\' + resolvedTail;
            resolvedAbsolute = isAbsolute;
        }
        if (resolvedDevice.length > 0 && resolvedAbsolute) {
            break;
        }
    }
    // At this point the path should be resolved to a full absolute path,
    // but handle relative paths to be safe (might happen when process.cwd()
    // fails)
    // Normalize the tail path
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, '\\', isPathSeparator);
    return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) ||
        '.';
};
Win32Path.prototype.normalize = function normalize (path) {
    validateString(path, 'path');
    var len = path.length;
    if (len === 0)
        { return '.'; }
    var rootEnd = 0;
    var device;
    var isAbsolute = false;
    var code = path.charCodeAt(0);
    // Try to match a root
    if (len > 1) {
        if (isPathSeparator(code)) {
            // Possible UNC root
            // If we started with a separator, we know we at least have an absolute
            // path of some kind (UNC or otherwise)
            isAbsolute = true;
            if (isPathSeparator(path.charCodeAt(1))) {
                // Matched double path separator at beginning
                var j = 2;
                var last = j;
                // Match 1 or more non-path separators
                for (; j < len; ++j) {
                    if (isPathSeparator(path.charCodeAt(j)))
                        { break; }
                }
                if (j < len && j !== last) {
                    var firstPart = path.slice(last, j);
                    // Matched!
                    last = j;
                    // Match 1 or more path separators
                    for (; j < len; ++j) {
                        if (!isPathSeparator(path.charCodeAt(j)))
                            { break; }
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more non-path separators
                        for (; j < len; ++j) {
                            if (isPathSeparator(path.charCodeAt(j)))
                                { break; }
                        }
                        if (j === len) {
                            // We matched a UNC root only
                            // Return the normalized version of the UNC root since there
                            // is nothing left to process
                            return '\\\\' + firstPart + '\\' + path.slice(last) + '\\';
                        }
                        else if (j !== last) {
                            // We matched a UNC root with leftovers
                            device = '\\\\' + firstPart + '\\' + path.slice(last, j);
                            rootEnd = j;
                        }
                    }
                }
            }
            else {
                rootEnd = 1;
            }
        }
        else if (isWindowsDeviceRoot(code)) {
            // Possible device root
            if (path.charCodeAt(1) === CHAR_COLON) {
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        // Treat separator following drive name as an absolute path
                        // indicator
                        isAbsolute = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    }
    else if (isPathSeparator(code)) {
        // `path` contains just a path separator, exit early to avoid unnecessary
        // work
        return '\\';
    }
    var tail;
    if (rootEnd < len) {
        tail = normalizeString(path.slice(rootEnd), !isAbsolute, '\\', isPathSeparator);
    }
    else {
        tail = '';
    }
    if (tail.length === 0 && !isAbsolute)
        { tail = '.'; }
    if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1)))
        { tail += '\\'; }
    if (device === undefined) {
        if (isAbsolute) {
            if (tail.length > 0)
                { return '\\' + tail; }
            else
                { return '\\'; }
        }
        else if (tail.length > 0) {
            return tail;
        }
        else {
            return '';
        }
    }
    else if (isAbsolute) {
        if (tail.length > 0)
            { return device + '\\' + tail; }
        else
            { return device + '\\'; }
    }
    else if (tail.length > 0) {
        return device + tail;
    }
    else {
        return device;
    }
};
Win32Path.prototype.isAbsolute = function isAbsolute (path) {
    validateString(path, 'path');
    var len = path.length;
    if (len === 0)
        { return false; }
    var code = path.charCodeAt(0);
    if (isPathSeparator(code)) {
        return true;
    }
    else if (isWindowsDeviceRoot(code)) {
        // Possible device root
        if (len > 2 && path.charCodeAt(1) === CHAR_COLON) {
            if (isPathSeparator(path.charCodeAt(2)))
                { return true; }
        }
    }
    return false;
};
Win32Path.prototype.join = function join () {
        var arguments$1 = arguments;

    if (arguments.length === 0)
        { return '.'; }
    var joined;
    var firstPart;
    for (var i = 0; i < arguments.length; ++i) {
        var arg = arguments$1[i];
        validateString(arg, 'path');
        if (arg.length > 0) {
            if (joined === undefined)
                { joined = firstPart = arg; }
            else
                { joined += '\\' + arg; }
        }
    }
    if (joined === undefined)
        { return '.'; }
    // Make sure that the joined path doesn't start with two slashes, because
    // normalize() will mistake it for an UNC path then.
    //
    // This step is skipped when it is very clear that the user actually
    // intended to point at an UNC path. This is assumed when the first
    // non-empty string arguments starts with exactly two slashes followed by
    // at least one more non-slash character.
    //
    // Note that for normalize() to treat a path as an UNC path it needs to
    // have at least 2 components, so we don't filter for that here.
    // This means that the user can use join to construct UNC paths from
    // a server name and a share name; for example:
    //   path.join('//server', 'share') -> '\\\\server\\share\\')
    var needsReplace = true;
    var slashCount = 0;
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        var firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2)))
                        { ++slashCount; }
                    else {
                        // We matched a UNC path in the first part
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        // Find any more consecutive slashes we need to replace
        for (; slashCount < joined.length; ++slashCount) {
            if (!isPathSeparator(joined.charCodeAt(slashCount)))
                { break; }
        }
        // Replace the slashes if needed
        if (slashCount >= 2)
            { joined = '\\' + joined.slice(slashCount); }
    }
    return win32.normalize(joined);
};
// It will solve the relative path from `from` to `to`, for instance:
//  from = 'C:\\orandea\\test\\aaa'
//  to = 'C:\\orandea\\impl\\bbb'
// The output of the function should be: '..\\..\\impl\\bbb'
Win32Path.prototype.relative = function relative (from, to) {
    validateString(from, 'from');
    validateString(to, 'to');
    if (from === to)
        { return ''; }
    var fromOrig = win32.resolve(from);
    var toOrig = win32.resolve(to);
    if (fromOrig === toOrig)
        { return ''; }
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to)
        { return ''; }
    // Trim any leading backslashes
    var fromStart = 0;
    for (; fromStart < from.length; ++fromStart) {
        if (from.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH)
            { break; }
    }
    // Trim trailing backslashes (applicable to UNC paths only)
    var fromEnd = from.length;
    for (; fromEnd - 1 > fromStart; --fromEnd) {
        if (from.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH)
            { break; }
    }
    var fromLen = (fromEnd - fromStart);
    // Trim any leading backslashes
    var toStart = 0;
    for (; toStart < to.length; ++toStart) {
        if (to.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH)
            { break; }
    }
    // Trim trailing backslashes (applicable to UNC paths only)
    var toEnd = to.length;
    for (; toEnd - 1 > toStart; --toEnd) {
        if (to.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH)
            { break; }
    }
    var toLen = (toEnd - toStart);
    // Compare paths to find the longest common path from root
    var length = (fromLen < toLen ? fromLen : toLen);
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
                    // We get here if `from` is the exact base path for `to`.
                    // For example: from='C:\\foo\\bar'; to='C:\\foo\\bar\\baz'
                    return toOrig.slice(toStart + i + 1);
                }
                else if (i === 2) {
                    // We get here if `from` is the device root.
                    // For example: from='C:\\'; to='C:\\foo'
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
                    // We get here if `to` is the exact base path for `from`.
                    // For example: from='C:\\foo\\bar'; to='C:\\foo'
                    lastCommonSep = i;
                }
                else if (i === 2) {
                    // We get here if `to` is the device root.
                    // For example: from='C:\\foo\\bar'; to='C:\\'
                    lastCommonSep = 3;
                }
            }
            break;
        }
        var fromCode = from.charCodeAt(fromStart + i);
        var toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode)
            { break; }
        else if (fromCode === CHAR_BACKWARD_SLASH)
            { lastCommonSep = i; }
    }
    // We found a mismatch before the first common path separator was seen, so
    // return the original `to`.
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    var out = '';
    if (lastCommonSep === -1)
        { lastCommonSep = 0; }
    // Generate the relative path based on the path difference between `to` and
    // `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
        if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
            if (out.length === 0)
                { out += '..'; }
            else
                { out += '\\..'; }
        }
    }
    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
        { return out + toOrig.slice(toStart + lastCommonSep, toEnd); }
    else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH)
            { ++toStart; }
        return toOrig.slice(toStart, toEnd);
    }
};
Win32Path.prototype.toNamespacedPath = function toNamespacedPath (path) {
    // Note: this will *probably* throw somewhere.
    if (typeof path !== 'string')
        { return path; }
    if (path.length === 0) {
        return '';
    }
    var resolvedPath = win32.resolve(path);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
            // Possible UNC root
            if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
                var code = resolvedPath.charCodeAt(2);
                if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
                    // Matched non-long UNC root, convert the path to a long UNC path
                    return '\\\\?\\UNC\\' + resolvedPath.slice(2);
                }
            }
        }
        else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            // Possible device root
            if (resolvedPath.charCodeAt(1) === CHAR_COLON &&
                resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
                // Matched device root, convert the path to a long UNC path
                return '\\\\?\\' + resolvedPath;
            }
        }
    }
    return path;
};
Win32Path.prototype.dirname = function dirname (path) {
    validateString(path, 'path');
    var len = path.length;
    if (len === 0)
        { return '.'; }
    var rootEnd = -1;
    var end = -1;
    var matchedSlash = true;
    var offset = 0;
    var code = path.charCodeAt(0);
    // Try to match a root
    if (len > 1) {
        if (isPathSeparator(code)) {
            // Possible UNC root
            rootEnd = offset = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                // Matched double path separator at beginning
                var j = 2;
                var last = j;
                // Match 1 or more non-path separators
                for (; j < len; ++j) {
                    if (isPathSeparator(path.charCodeAt(j)))
                        { break; }
                }
                if (j < len && j !== last) {
                    // Matched!
                    last = j;
                    // Match 1 or more path separators
                    for (; j < len; ++j) {
                        if (!isPathSeparator(path.charCodeAt(j)))
                            { break; }
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more non-path separators
                        for (; j < len; ++j) {
                            if (isPathSeparator(path.charCodeAt(j)))
                                { break; }
                        }
                        if (j === len) {
                            // We matched a UNC root only
                            return path;
                        }
                        if (j !== last) {
                            // We matched a UNC root with leftovers
                            // Offset by 1 to include the separator after the UNC root to
                            // treat it as a "normal root" on top of a (UNC) root
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        }
        else if (isWindowsDeviceRoot(code)) {
            // Possible device root
            if (path.charCodeAt(1) === CHAR_COLON) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2)))
                        { rootEnd = offset = 3; }
                }
            }
        }
    }
    else if (isPathSeparator(code)) {
        // `path` contains just a path separator, exit early to avoid
        // unnecessary work
        return path;
    }
    for (var i = len - 1; i >= offset; --i) {
        if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        }
        else {
            // We saw the first non-path separator
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1)
            { return '.'; }
        else
            { end = rootEnd; }
    }
    return path.slice(0, end);
};
Win32Path.prototype.basename = function basename (path, ext) {
    if (ext !== undefined)
        { validateString(ext, 'ext'); }
    validateString(path, 'path');
    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;
    // Check for a drive letter prefix so as not to mistake the following
    // path separator as an extra separator at the end of the path that can be
    // disregarded
    if (path.length >= 2) {
        var drive = path.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path.charCodeAt(1) === CHAR_COLON)
                { start = 2; }
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path)
            { return ''; }
        var extIdx = ext.length - 1;
        var firstNonSlashEnd = -1;
        for (i = path.length - 1; i >= start; --i) {
            var code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            }
            else {
                if (firstNonSlashEnd === -1) {
                    // We saw the first non-path separator, remember this index in case
                    // we need it if the extension ends up not matching
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    // Try to match the explicit extension
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            // We matched the extension, so mark this as the end of our path
                            // component
                            end = i;
                        }
                    }
                    else {
                        // Extension does not match, so our result is the entire path
                        // component
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end)
            { end = firstNonSlashEnd; }
        else if (end === -1)
            { end = path.length; }
        return path.slice(start, end);
    }
    else {
        for (i = path.length - 1; i >= start; --i) {
            if (isPathSeparator(path.charCodeAt(i))) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            }
            else if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // path component
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1)
            { return ''; }
        return path.slice(start, end);
    }
};
Win32Path.prototype.extname = function extname (path) {
    validateString(path, 'path');
    var start = 0;
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    // Check for a drive letter prefix so as not to mistake the following
    // path separator as an extra separator at the end of the path that can be
    // disregarded
    if (path.length >= 2 &&
        path.charCodeAt(1) === CHAR_COLON &&
        isWindowsDeviceRoot(path.charCodeAt(0))) {
        start = startPart = 2;
    }
    for (var i = path.length - 1; i >= start; --i) {
        var code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            // We saw the first non-path separator, mark this as the end of our
            // extension
            matchedSlash = false;
            end = i + 1;
        }
        if (code === CHAR_DOT) {
            // If this is our first dot, mark it as the start of our extension
            if (startDot === -1)
                { startDot = i; }
            else if (preDotState !== 1)
                { preDotState = 1; }
        }
        else if (startDot !== -1) {
            // We saw a non-dot and non-path separator before our dot, so we should
            // have a good chance at having a non-empty extension
            preDotState = -1;
        }
    }
    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
            startDot === end - 1 &&
            startDot === startPart + 1)) {
        return '';
    }
    return path.slice(startDot, end);
};
Win32Path.prototype.format = function format (pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
        throw new ERR_INVALID_ARG_TYPE('pathObject', 'Object', pathObject);
    }
    return _format('\\', pathObject);
};
Win32Path.prototype.parse = function parse (path) {
    validateString(path, 'path');
    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0)
        { return ret; }
    var len = path.length;
    var rootEnd = 0;
    var code = path.charCodeAt(0);
    // Try to match a root
    if (len > 1) {
        if (isPathSeparator(code)) {
            // Possible UNC root
            rootEnd = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                // Matched double path separator at beginning
                var j = 2;
                var last = j;
                // Match 1 or more non-path separators
                for (; j < len; ++j) {
                    if (isPathSeparator(path.charCodeAt(j)))
                        { break; }
                }
                if (j < len && j !== last) {
                    // Matched!
                    last = j;
                    // Match 1 or more path separators
                    for (; j < len; ++j) {
                        if (!isPathSeparator(path.charCodeAt(j)))
                            { break; }
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more non-path separators
                        for (; j < len; ++j) {
                            if (isPathSeparator(path.charCodeAt(j)))
                                { break; }
                        }
                        if (j === len) {
                            // We matched a UNC root only
                            rootEnd = j;
                        }
                        else if (j !== last) {
                            // We matched a UNC root with leftovers
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        }
        else if (isWindowsDeviceRoot(code)) {
            // Possible device root
            if (path.charCodeAt(1) === CHAR_COLON) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        if (len === 3) {
                            // `path` contains just a drive root, exit early to avoid
                            // unnecessary work
                            ret.root = ret.dir = path;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                }
                else {
                    // `path` contains just a drive root, exit early to avoid
                    // unnecessary work
                    ret.root = ret.dir = path;
                    return ret;
                }
            }
        }
    }
    else if (isPathSeparator(code)) {
        // `path` contains just a path separator, exit early to avoid
        // unnecessary work
        ret.root = ret.dir = path;
        return ret;
    }
    if (rootEnd > 0)
        { ret.root = path.slice(0, rootEnd); }
    var startDot = -1;
    var startPart = rootEnd;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    // Get non-dir info
    for (; i >= rootEnd; --i) {
        code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            // We saw the first non-path separator, mark this as the end of our
            // extension
            matchedSlash = false;
            end = i + 1;
        }
        if (code === CHAR_DOT) {
            // If this is our first dot, mark it as the start of our extension
            if (startDot === -1)
                { startDot = i; }
            else if (preDotState !== 1)
                { preDotState = 1; }
        }
        else if (startDot !== -1) {
            // We saw a non-dot and non-path separator before our dot, so we should
            // have a good chance at having a non-empty extension
            preDotState = -1;
        }
    }
    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
            startDot === end - 1 &&
            startDot === startPart + 1)) {
        if (end !== -1) {
            ret.base = ret.name = path.slice(startPart, end);
        }
    }
    else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
        ret.ext = path.slice(startDot, end);
    }
    // If the directory is the root, use the entire root as the `dir` including
    // the trailing slash if any (`C:\abc` -> `C:\`). Otherwise, strip out the
    // trailing slash (`C:\abc\def` -> `C:\abc`).
    if (startPart > 0 && startPart !== rootEnd)
        { ret.dir = path.slice(0, startPart - 1); }
    else
        { ret.dir = ret.root; }
    return ret;
};
;
var PosixPath = function PosixPath() {
    this.sep = '/';
    this.delimiter = ':';
    this.win32 = null;
    this.posix = null;
};
// path.resolve([from ...], to)
PosixPath.prototype.resolve = function resolve () {
        var arguments$1 = arguments;
        var pathSegments = [], len = arguments.length;
        while ( len-- ) pathSegments[ len ] = arguments[ len ];

    var resolvedPath = '';
    var resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path;
        if (i >= 0)
            { path = arguments$1[i]; }
        else {
            path = process.cwd();
        }
        validateString(path, 'path');
        // Skip empty entries
        if (path.length === 0) {
            continue;
        }
        resolvedPath = path + '/' + resolvedPath;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, '/', isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0)
            { return '/' + resolvedPath; }
        else
            { return '/'; }
    }
    else if (resolvedPath.length > 0) {
        return resolvedPath;
    }
    else {
        return '.';
    }
};
PosixPath.prototype.normalize = function normalize (path) {
    validateString(path, 'path');
    if (path.length === 0)
        { return '.'; }
    var isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    var trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
    // Normalize the path
    path = normalizeString(path, !isAbsolute, '/', isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute)
        { path = '.'; }
    if (path.length > 0 && trailingSeparator)
        { path += '/'; }
    if (isAbsolute)
        { return '/' + path; }
    return path;
};
PosixPath.prototype.isAbsolute = function isAbsolute (path) {
    validateString(path, 'path');
    return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH;
};
PosixPath.prototype.join = function join () {
        var arguments$1 = arguments;

    if (arguments.length === 0)
        { return '.'; }
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
        var arg = arguments$1[i];
        validateString(arg, 'path');
        if (arg.length > 0) {
            if (joined === undefined)
                { joined = arg; }
            else
                { joined += '/' + arg; }
        }
    }
    if (joined === undefined)
        { return '.'; }
    return posix.normalize(joined);
};
PosixPath.prototype.relative = function relative (from, to) {
    validateString(from, 'from');
    validateString(to, 'to');
    if (from === to)
        { return ''; }
    from = posix.resolve(from);
    to = posix.resolve(to);
    if (from === to)
        { return ''; }
    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
        if (from.charCodeAt(fromStart) !== CHAR_FORWARD_SLASH)
            { break; }
    }
    var fromEnd = from.length;
    var fromLen = (fromEnd - fromStart);
    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
        if (to.charCodeAt(toStart) !== CHAR_FORWARD_SLASH)
            { break; }
    }
    var toEnd = to.length;
    var toLen = (toEnd - toStart);
    // Compare paths to find the longest common path from root
    var length = (fromLen < toLen ? fromLen : toLen);
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
                    // We get here if `from` is the exact base path for `to`.
                    // For example: from='/foo/bar'; to='/foo/bar/baz'
                    return to.slice(toStart + i + 1);
                }
                else if (i === 0) {
                    // We get here if `from` is the root
                    // For example: from='/'; to='/foo'
                    return to.slice(toStart + i);
                }
            }
            else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
                    // We get here if `to` is the exact base path for `from`.
                    // For example: from='/foo/bar/baz'; to='/foo/bar'
                    lastCommonSep = i;
                }
                else if (i === 0) {
                    // We get here if `to` is the root.
                    // For example: from='/foo'; to='/'
                    lastCommonSep = 0;
                }
            }
            break;
        }
        var fromCode = from.charCodeAt(fromStart + i);
        var toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode)
            { break; }
        else if (fromCode === CHAR_FORWARD_SLASH)
            { lastCommonSep = i; }
    }
    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
        if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (out.length === 0)
                { out += '..'; }
            else
                { out += '/..'; }
        }
    }
    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
        { return out + to.slice(toStart + lastCommonSep); }
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === CHAR_FORWARD_SLASH)
            { ++toStart; }
        return to.slice(toStart);
    }
};
PosixPath.prototype.toNamespacedPath = function toNamespacedPath (path) {
    // Non-op on posix systems
    return path;
};
PosixPath.prototype.dirname = function dirname (path) {
    validateString(path, 'path');
    if (path.length === 0)
        { return '.'; }
    var hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
        if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        }
        else {
            // We saw the first non-path separator
            matchedSlash = false;
        }
    }
    if (end === -1)
        { return hasRoot ? '/' : '.'; }
    if (hasRoot && end === 1)
        { return '//'; }
    return path.slice(0, end);
};
PosixPath.prototype.basename = function basename (path, ext) {
    if (ext !== undefined)
        { validateString(ext, 'ext'); }
    validateString(path, 'path');
    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path)
            { return ''; }
        var extIdx = ext.length - 1;
        var firstNonSlashEnd = -1;
        for (i = path.length - 1; i >= 0; --i) {
            var code = path.charCodeAt(i);
            if (code === CHAR_FORWARD_SLASH) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            }
            else {
                if (firstNonSlashEnd === -1) {
                    // We saw the first non-path separator, remember this index in case
                    // we need it if the extension ends up not matching
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    // Try to match the explicit extension
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            // We matched the extension, so mark this as the end of our path
                            // component
                            end = i;
                        }
                    }
                    else {
                        // Extension does not match, so our result is the entire path
                        // component
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end)
            { end = firstNonSlashEnd; }
        else if (end === -1)
            { end = path.length; }
        return path.slice(start, end);
    }
    else {
        for (i = path.length - 1; i >= 0; --i) {
            if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            }
            else if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // path component
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1)
            { return ''; }
        return path.slice(start, end);
    }
};
PosixPath.prototype.extname = function extname (path) {
    validateString(path, 'path');
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === CHAR_FORWARD_SLASH) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            // We saw the first non-path separator, mark this as the end of our
            // extension
            matchedSlash = false;
            end = i + 1;
        }
        if (code === CHAR_DOT) {
            // If this is our first dot, mark it as the start of our extension
            if (startDot === -1)
                { startDot = i; }
            else if (preDotState !== 1)
                { preDotState = 1; }
        }
        else if (startDot !== -1) {
            // We saw a non-dot and non-path separator before our dot, so we should
            // have a good chance at having a non-empty extension
            preDotState = -1;
        }
    }
    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
            startDot === end - 1 &&
            startDot === startPart + 1)) {
        return '';
    }
    return path.slice(startDot, end);
};
PosixPath.prototype.format = function format (pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
        throw new ERR_INVALID_ARG_TYPE('pathObject', 'Object', pathObject);
    }
    return _format('/', pathObject);
};
PosixPath.prototype.parse = function parse (path) {
    validateString(path, 'path');
    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0)
        { return ret; }
    var isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    var start;
    if (isAbsolute) {
        ret.root = '/';
        start = 1;
    }
    else {
        start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    // Get non-dir info
    for (; i >= start; --i) {
        var code = path.charCodeAt(i);
        if (code === CHAR_FORWARD_SLASH) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            // We saw the first non-path separator, mark this as the end of our
            // extension
            matchedSlash = false;
            end = i + 1;
        }
        if (code === CHAR_DOT) {
            // If this is our first dot, mark it as the start of our extension
            if (startDot === -1)
                { startDot = i; }
            else if (preDotState !== 1)
                { preDotState = 1; }
        }
        else if (startDot !== -1) {
            // We saw a non-dot and non-path separator before our dot, so we should
            // have a good chance at having a non-empty extension
            preDotState = -1;
        }
    }
    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
            startDot === end - 1 &&
            startDot === startPart + 1)) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute)
                { ret.base = ret.name = path.slice(1, end); }
            else
                { ret.base = ret.name = path.slice(startPart, end); }
        }
    }
    else {
        if (startPart === 0 && isAbsolute) {
            ret.name = path.slice(1, startDot);
            ret.base = path.slice(1, end);
        }
        else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0)
        { ret.dir = path.slice(0, startPart - 1); }
    else if (isAbsolute)
        { ret.dir = '/'; }
    return ret;
};
;
var win32 = new Win32Path();
var posix = new PosixPath();
posix.win32 = win32.win32 = win32;
posix.posix = win32.posix = posix;
// Legacy internal API, docs-only deprecated: DEP0080
// win32._makeLong = win32.toNamespacedPath;
// posix._makeLong = posix.toNamespacedPath;
// if (process.platform === 'win32')
//     module.exports = win32;
// else
//     module.exports = posix;
// 
/**
 * 路径
 *
 * 从nodeJs的path移植
 *
 * @see http://nodejs.cn/api/path.html
 * @see https://github.com/nodejs/node/blob/master/lib/path.js
 */
var path = process.platform === 'win32' ? win32 : posix;

/**
 * 可读资源系统
 */
var ReadRS = function ReadRS(fs) {
    this._rootPath = "Assets";
    /**
     * 资源编号映射
     */
    this._idMap = {};
    /**
     * 资源路径映射
     */
    this._pathMap = {};
    /**
     * 资源树保存路径
     */
    this.resources = "resource.json";
    this._fs = fs;
};

var prototypeAccessors$3 = { fs: { configurable: true },rootPath: { configurable: true },root: { configurable: true } };
/**
 * 文件系统
 */
prototypeAccessors$3.fs.get = function () { return this._fs || fs; };
/**
 * 根资源路径
 */
prototypeAccessors$3.rootPath.get = function () { return this._rootPath; };
/**
 * 根资源
 */
prototypeAccessors$3.root.get = function () { return this.getAssetByPath(this.rootPath); };
/**
 * 初始化
 *
 * @param callback 完成回调
 */
ReadRS.prototype.init = function init (callback) {
        var this$1 = this;

    this.fs.readObject(this.resources, function (err, object) {
        if (object) {
            var allAssets = serialization.deserialize(object);
            //
            allAssets.forEach(function (asset) {
                // 设置资源系统
                asset.rs = this$1;
                // 新增映射
                this$1.addAsset(asset);
            });
            callback();
        }
        else {
            this$1.createAsset(FolderAsset, this$1.rootPath, null, null, function (err, asset) {
                callback();
            });
        }
    });
};
/**
 * 新建资源
 *
 * @param cls 资源类定义
 * @param fileName 文件名称
 * @param value 初始数据
 * @param parent 所在文件夹，如果值为null时默认添加到根文件夹中
 * @param callback 完成回调函数
 */
ReadRS.prototype.createAsset = function createAsset (cls, fileName, value, parent, callback) {
    parent = parent || this.root;
    //
    var asset = new cls();
    var assetId = mathUtil.uuid();
    // 初始化
    asset.rs = this;
    serialization.setValue(asset, value);
    asset.assetId = assetId;
    asset.meta = { guid: assetId, mtimeMs: Date.now(), birthtimeMs: Date.now(), assetType: asset.assetType };
    asset.initAsset();
    AssetData.addAssetData(asset.assetId, asset.data);
    // 计算扩展名
    var extenson = path.extname(fileName);
    if (extenson == "")
        { extenson = cls["extenson"]; }
    console.assert(extenson != undefined, ("对象 " + cls + " 没有设置 extenson 值，参考 FolderAsset.extenson"));
    // 计算名称
    fileName = pathUtils.getName(fileName);
    // 设置默认名称
    fileName = fileName || "new " + asset.assetType;
    // 
    if (parent) {
        // 计算有效名称
        fileName = this.getValidChildName(parent, fileName);
        asset.assetPath = parent.assetPath + "/" + fileName + extenson;
    }
    else {
        asset.assetPath = fileName + extenson;
    }
    // 新增映射
    this.addAsset(asset);
    //
    asset.write(function (err) {
        callback && callback(null, asset);
    });
};
/**
 * 获取有效子文件名称
 *
 * @param parent 父文件夹
 * @param fileName 文件名称
 */
ReadRS.prototype.getValidChildName = function getValidChildName (parent, fileName) {
    var childrenNames = parent.childrenAssets.map(function (v) { return v.fileName; });
    var newName = fileName;
    var index = 1;
    while (childrenNames.indexOf(newName) != -1) {
        newName = fileName + index;
        index++;
    }
    return newName;
};
/**
 * 读取文件为资源对象
 * @param id 资源编号
 * @param callback 读取完成回调
 */
ReadRS.prototype.readAsset = function readAsset (id, callback) {
    var asset = this.getAssetById(id);
    if (!asset) {
        callback(new Error(("不存在资源 " + id)), asset);
        return;
    }
    asset.read(function (err) {
        if (asset)
            { AssetData.addAssetData(asset.assetId, asset.data); }
        callback(err, asset);
    });
};
/**
 * 读取资源数据
 *
 * @param id 资源编号
 * @param callback 完成回调
 */
ReadRS.prototype.readAssetData = function readAssetData (id, callback) {
    var asset = AssetData.getLoadedAssetData(id);
    if (asset) {
        callback(null, asset);
        return;
    }
    this.readAsset(id, function (err, asset) {
        callback(err, asset && asset.getAssetData());
    });
};
/**
 * 读取资源数据列表
 *
 * @param assetids 资源编号列表
 * @param callback 完成回调
 */
ReadRS.prototype.readAssetDatas = function readAssetDatas (assetids, callback) {
    var result = [];
    var fns = assetids.map(function (v) { return function (callback) {
        rs.readAssetData(v, function (err, data) {
            console.assert(!!data);
            result.push(data);
            callback();
        });
    }; });
    task.parallel(fns)(function () {
        console.assert(assetids.length == result.filter(function (v) { return v != null; }).length);
        callback(null, result);
    });
};
/**
 * 获取指定类型资源
 *
 * @param type 资源类型
 */
ReadRS.prototype.getAssetsByType = function getAssetsByType (type) {
        var this$1 = this;

    var assets = Object.keys(this._idMap).map(function (v) { return this$1._idMap[v]; });
    return assets.filter(function (v) { return v instanceof type; });
};
/**
 * 获取指定类型资源数据
 *
 * @param type 资源类型
 */
ReadRS.prototype.getLoadedAssetDatasByType = function getLoadedAssetDatasByType (type) {
    var assets = AssetData.getAllLoadedAssetDatas();
    return assets.filter(function (v) { return v instanceof type; });
};
/**
 * 获取指定编号资源
 *
 * @param id 资源编号
 */
ReadRS.prototype.getAssetById = function getAssetById (id) {
    return this._idMap[id];
};
/**
 * 获取指定路径资源
 *
 * @param path 资源路径
 */
ReadRS.prototype.getAssetByPath = function getAssetByPath (path) {
    return this._pathMap[path];
};
/**
 * 获取文件夹内子文件路径列表
 *
 * @param path 路径
 */
ReadRS.prototype.getChildrenPathsByPath = function getChildrenPathsByPath (path) {
    var paths = this.getAllPaths();
    var childrenPaths = paths.filter(function (v) {
        return pathUtils.dirname(v) == path;
    });
    return childrenPaths;
};
/**
 * 获取文件夹内子文件列表
 *
 * @param path 文件夹路径
 */
ReadRS.prototype.getChildrenAssetByPath = function getChildrenAssetByPath (path) {
        var this$1 = this;

    var childrenPaths = this.getChildrenPathsByPath(path);
    var children = childrenPaths.map(function (v) { return this$1.getAssetByPath(v); });
    return children;
};
/**
 * 新增资源
 *
 * @param asset 资源
 */
ReadRS.prototype.addAsset = function addAsset (asset) {
    this._idMap[asset.assetId] = asset;
    this._pathMap[asset.assetPath] = asset;
};
/**
 * 获取所有资源编号列表
 */
ReadRS.prototype.getAllIds = function getAllIds () {
    return Object.keys(this._idMap);
};
/**
 * 获取所有资源路径列表
 */
ReadRS.prototype.getAllPaths = function getAllPaths () {
    return Object.keys(this._pathMap);
};
/**
 * 获取所有资源
 */
ReadRS.prototype.getAllAssets = function getAllAssets () {
        var this$1 = this;

    var assets = this.getAllIds().map(function (v) { return this$1.getAssetById(v); });
    return assets;
};
/**
 * 删除指定编号的资源
 *
 * @param id 资源编号
 */
ReadRS.prototype.deleteAssetById = function deleteAssetById (id) {
    this.deleteAsset0(this.getAssetById(id));
};
/**
 * 删除指定路径的资源
 *
 * @param path 资源路径
 */
ReadRS.prototype.deleteAssetByPath = function deleteAssetByPath (path) {
    this.deleteAsset0(this._pathMap[path]);
};
/**
 * 删除资源
 *
 * @param asset 资源
 */
ReadRS.prototype.deleteAsset0 = function deleteAsset0 (asset) {
    delete this._idMap[asset.assetId];
    delete this._pathMap[asset.assetPath];
};
/**
 * 获取需要反序列化对象中的资源id列表
 */
ReadRS.prototype.getAssetsWithObject = function getAssetsWithObject (object, assetids) {
        var this$1 = this;
        if ( assetids === void 0 ) assetids = [];

    if (Object.isBaseType(object))
        { return []; }
    //
    if (AssetData.isAssetData(object))
        { assetids.push(object.assetId); }
    //
    if (Object.isObject(object) || Array.isArray(object)) {
        var keys = Object.keys(object);
        keys.forEach(function (k) {
            this$1.getAssetsWithObject(object[k], assetids);
        });
    }
    return assetids;
};
/**
 * 反序列化包含资源的对象
 *
 * @param object 反序列化的对象
 * @param callback 完成回调
 */
ReadRS.prototype.deserializeWithAssets = function deserializeWithAssets (object, callback) {
    // 获取所包含的资源列表
    var assetids = this.getAssetsWithObject(object);
    // 不需要加载本资源，移除自身资源
    Array.delete(assetids, object.assetId);
    // 加载包含的资源数据
    this.readAssetDatas(assetids, function (err, result) {
        // 创建资源数据实例
        var assetData = classUtils.getInstanceByName(object[__class__]);
        //默认反序列
        serialization.setValue(assetData, object);
        callback(assetData);
    });
};

Object.defineProperties( ReadRS.prototype, prototypeAccessors$3 );
/**
 * 默认资源系统
 */
var rs = new ReadRS();

/**
 * 可读写资源系统
 */
var ReadWriteRS = /*@__PURE__*/(function (ReadRS) {
    function ReadWriteRS(fs) {
        var this$1 = this;

        ReadRS.call(this, fs);
        /**
         * 延迟保存执行函数
         */
        this.laterSaveFunc = function (interval) { this$1.save(); };
        /**
         * 延迟保存，避免多次操作时频繁调用保存
         */
        this.laterSave = function () { ticker.nextframe(this$1.laterSaveFunc, this$1); };
    }

    if ( ReadRS ) ReadWriteRS.__proto__ = ReadRS;
    ReadWriteRS.prototype = Object.create( ReadRS && ReadRS.prototype );
    ReadWriteRS.prototype.constructor = ReadWriteRS;

    var prototypeAccessors = { fs: { configurable: true } };
    /**
     * 文件系统
     */
    prototypeAccessors.fs.get = function () { return this._fs; };
    /**
     * 在更改资源结构（新增，移动，删除）时会自动保存
     *
     * @param callback 完成回调
     */
    ReadWriteRS.prototype.save = function save (callback) {
        var allAssets = this.getAllAssets();
        var object = serialization.serialize(allAssets);
        this.fs.writeObject(this.resources, object, callback);
    };
    /**
     * 新建资源
     *
     * @param cls 资源类定义
     * @param fileName 文件名称
     * @param value 初始数据
     * @param parent 所在文件夹，如果值为null时默认添加到根文件夹中
     * @param callback 完成回调函数
     */
    ReadWriteRS.prototype.createAsset = function createAsset (cls, fileName, value, parent, callback) {
        var this$1 = this;

        // 新建资源
        ReadRS.prototype.createAsset.call(this, cls, fileName, value, parent, function (err, asset) {
            if (asset) {
                // 保存资源
                this$1.writeAsset(asset, function (err) {
                    callback && callback(err, asset);
                    // 保存资源库
                    this$1.laterSave();
                });
            }
            else {
                callback && callback(err, null);
            }
        });
    };
    /**
     * 写（保存）资源
     *
     * @param asset 资源对象
     * @param callback 完成回调
     */
    ReadWriteRS.prototype.writeAsset = function writeAsset (asset, callback) {
        asset.write(callback);
    };
    /**
     * 移动资源到指定文件夹
     *
     * @param asset 被移动资源
     * @param folder 目标文件夹
     * @param callback 完成回调
     */
    ReadWriteRS.prototype.moveAsset = function moveAsset (asset, folder, callback) {
        var this$1 = this;

        var filename = asset.fileName + asset.extenson;
        var cnames = folder.childrenAssets.map(function (v) { return v.fileName + v.extenson; });
        if (cnames.indexOf(filename) != -1) {
            callback && callback(new Error("目标文件夹中存在同名文件（夹），无法移动"));
            return;
        }
        var fp = folder;
        while (fp) {
            if (fp == asset) {
                callback && callback(new Error("无法移动达到子文件夹中"));
                return;
            }
            fp = fp.parentAsset;
        }
        // 获取需要移动的资源列表
        var assets = [asset];
        var index = 0;
        while (index < assets.length) {
            var ca = assets[index];
            if (ca instanceof FolderAsset) {
                assets = assets.concat(ca.childrenAssets);
            }
            index++;
        }
        // 最后根据 parentAsset 修复 childrenAssets
        var copyassets = assets.concat();
        // 移动最后一个资源
        var moveLastAsset = function () {
            if (assets.length == 0) {
                callback && callback(null);
                // 保存资源库
                this$1.laterSave();
                return;
            }
            var la = assets.pop();
            // 读取资源
            this$1.readAsset(la.assetId, function (err, a) {
                if (err) {
                    callback && callback(err);
                    return;
                }
                // 从原路径上删除资源
                this$1.deleteAsset(la, function (err) {
                    if (err) {
                        callback && callback(err);
                        return;
                    }
                    // 计算资源新路径
                    var np = la.fileName + la.extenson;
                    var p = la.parentAsset;
                    while (p) {
                        np = p.fileName + "/" + np;
                        p = p.parentAsset;
                    }
                    la.assetPath = np;
                    // 新增映射
                    this$1.addAsset(la);
                    // 保存资源到新路径
                    this$1.writeAsset(la, function (err) {
                        if (err) {
                            callback && callback(err);
                            return;
                        }
                        moveLastAsset();
                    });
                });
            });
        };
        moveLastAsset();
    };
    /**
     * 删除资源
     *
     * @param asset 资源
     * @param callback 完成回调
     */
    ReadWriteRS.prototype.deleteAsset = function deleteAsset (asset, callback) {
        var this$1 = this;

        // 获取需要移动的资源列表
        var assets = [asset];
        var index = 0;
        while (index < assets.length) {
            var ca = assets[index];
            if (ca instanceof FolderAsset) {
                assets = assets.concat(ca.childrenAssets);
            }
            index++;
        }
        // 删除最后一个资源
        var deleteLastAsset = function () {
            if (assets.length == 0) {
                callback && callback(null);
                // 保存资源库
                this$1.laterSave();
                return;
            }
            var la = assets.pop();
            la.delete(function () {
                AssetData.deleteAssetData(la.data);
                deleteLastAsset();
            });
        };
        deleteLastAsset();
    };

    Object.defineProperties( ReadWriteRS.prototype, prototypeAccessors );

    return ReadWriteRS;
}(ReadRS));

/**
 * 声音监听器
 */
var AudioListener = /*@__PURE__*/(function (Behaviour) {
    function AudioListener() {
        Behaviour.call(this);
        this.enabled = true;
        this._volume = 1;
        this.gain = audioCtx.createGain();
        this.gain.connect(audioCtx.destination);
        this._enabledChanged();
    }

    if ( Behaviour ) AudioListener.__proto__ = Behaviour;
    AudioListener.prototype = Object.create( Behaviour && Behaviour.prototype );
    AudioListener.prototype.constructor = AudioListener;

    var prototypeAccessors = { volume: { configurable: true } };
    /**
     * 音量
     */
    prototypeAccessors.volume.get = function () {
        return this._volume;
    };
    prototypeAccessors.volume.set = function (v) {
        this._volume = v;
        this.gain.gain.setTargetAtTime(v, audioCtx.currentTime, 0.01);
    };
    AudioListener.prototype.init = function init () {
        Behaviour.prototype.init.call(this);
        this.on("scenetransformChanged", this._onScenetransformChanged, this);
        this._onScenetransformChanged();
    };
    AudioListener.prototype._onScenetransformChanged = function _onScenetransformChanged () {
        var localToWorldMatrix = this.node3d.localToWorldMatrix;
        var position = localToWorldMatrix.getPosition();
        var forward = localToWorldMatrix.getAxisZ();
        var up = localToWorldMatrix.getAxisY();
        //
        var listener = audioCtx.listener;
        // feng3d中为左手坐标系，listener中使用的为右手坐标系，参考https://developer.mozilla.org/en-US/docs/Web/API/AudioListener
        if (listener.forwardX) {
            listener.positionX.setValueAtTime(position.x, audioCtx.currentTime);
            listener.positionY.setValueAtTime(position.y, audioCtx.currentTime);
            listener.positionZ.setValueAtTime(-position.z, audioCtx.currentTime);
            listener.forwardX.setValueAtTime(forward.x, audioCtx.currentTime);
            listener.forwardY.setValueAtTime(forward.y, audioCtx.currentTime);
            listener.forwardZ.setValueAtTime(-forward.z, audioCtx.currentTime);
            listener.upX.setValueAtTime(up.x, audioCtx.currentTime);
            listener.upY.setValueAtTime(up.y, audioCtx.currentTime);
            listener.upZ.setValueAtTime(-up.z, audioCtx.currentTime);
        }
        else {
            listener.setOrientation(forward.x, forward.y, -forward.z, up.x, up.y, -up.z);
            listener.setPosition(position.x, position.y, -position.z);
        }
    };
    AudioListener.prototype._enabledChanged = function _enabledChanged () {
        if (!this.gain)
            { return; }
        if (this.enabled) {
            globalGain.connect(this.gain);
        }
        else {
            globalGain.disconnect(this.gain);
        }
    };
    AudioListener.prototype.dispose = function dispose () {
        this.off("scenetransformChanged", this._onScenetransformChanged, this);
        Behaviour.prototype.dispose.call(this);
    };

    Object.defineProperties( AudioListener.prototype, prototypeAccessors );

    return AudioListener;
}(Behaviour));
__decorate([
    watch("_enabledChanged")
], AudioListener.prototype, "enabled", void 0);
__decorate([
    serialize,
    oav({ tooltip: "音量" })
], AudioListener.prototype, "volume", null);
AudioListener = __decorate([
    AddComponentMenu("Audio/AudioListener"),
    RegisterComponent()
], AudioListener);
var audioCtx = new AudioContext();
var globalGain = audioCtx.createGain();
// 新增无音Gain，避免没有AudioListener组件时暂停声音播放进度
var zeroGain = audioCtx.createGain();
zeroGain.connect(audioCtx.destination);
globalGain.connect(zeroGain);
zeroGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
//
var listener = audioCtx.listener;
audioCtx.createGain();
if (listener.forwardX) {
    listener.forwardX.value = 0;
    listener.forwardY.value = 0;
    listener.forwardZ.value = -1;
    listener.upX.value = 0;
    listener.upY.value = 1;
    listener.upZ.value = 0;
}
else {
    listener.setOrientation(0, 0, -1, 0, 1, 0);
}

/**
 * 音量与距离算法
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/distanceModel
 * @see https://mdn.github.io/webaudio-examples/panner-node/
 * @see https://github.com/mdn/webaudio-examples
 */
var DistanceModelType;
(function (DistanceModelType) {
    /**
     * 1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)
     */
    DistanceModelType["linear"] = "linear";
    /**
     * refDistance / (refDistance + rolloffFactor * (distance - refDistance))
     */
    DistanceModelType["inverse"] = "inverse";
    /**
     * pow(distance / refDistance, -rolloffFactor)
     */
    DistanceModelType["exponential"] = "exponential";
})(DistanceModelType || (DistanceModelType = {}));
/**
 * 声源
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
 */
var AudioSource = /*@__PURE__*/(function (Behaviour) {
    function AudioSource() {
        Behaviour.call(this);
        this.enabled = true;
        /**
         * 声音文件路径
         */
        this.url = "";
        this._loop = true;
        this._enablePosition = true;
        this.panner = createPanner();
        this.panningModel = 'HRTF';
        this.distanceModel = DistanceModelType.inverse;
        this.refDistance = 1;
        this.maxDistance = 10000;
        this.rolloffFactor = 1;
        this.coneInnerAngle = 360;
        this.coneOuterAngle = 0;
        this.coneOuterGain = 0;
        //
        this.gain = audioCtx.createGain();
        this.volume = 1;
        //
        this._enabledChanged();
        this._connect();
    }

    if ( Behaviour ) AudioSource.__proto__ = Behaviour;
    AudioSource.prototype = Object.create( Behaviour && Behaviour.prototype );
    AudioSource.prototype.constructor = AudioSource;

    var prototypeAccessors = { loop: { configurable: true },volume: { configurable: true },enablePosition: { configurable: true },coneInnerAngle: { configurable: true },coneOuterAngle: { configurable: true },coneOuterGain: { configurable: true },distanceModel: { configurable: true },maxDistance: { configurable: true },panningModel: { configurable: true },refDistance: { configurable: true },rolloffFactor: { configurable: true } };
    /**
     * 是否循环播放
     */
    prototypeAccessors.loop.get = function () {
        return this._loop;
    };
    prototypeAccessors.loop.set = function (v) {
        this._loop = v;
        if (this.source)
            { this.source.loop = v; }
    };
    /**
     * 音量
     */
    prototypeAccessors.volume.get = function () {
        return this._volume;
    };
    prototypeAccessors.volume.set = function (v) {
        this._volume = v;
        this.gain.gain.setTargetAtTime(v, audioCtx.currentTime, 0.01);
    };
    /**
     * 是否启用位置影响声音
     */
    prototypeAccessors.enablePosition.get = function () {
        return this._enablePosition;
    };
    prototypeAccessors.enablePosition.set = function (v) {
        this._disconnect();
        this._enablePosition = v;
        this._connect();
    };
    ;
    // @serialize
    // @oav()
    prototypeAccessors.coneInnerAngle.get = function () {
        return this._coneInnerAngle;
    };
    prototypeAccessors.coneInnerAngle.set = function (v) {
        this._coneInnerAngle = v;
        this.panner.coneInnerAngle = v;
    };
    // @serialize
    // @oav()
    prototypeAccessors.coneOuterAngle.get = function () {
        return this._coneOuterAngle;
    };
    prototypeAccessors.coneOuterAngle.set = function (v) {
        this._coneOuterAngle = v;
        this.panner.coneOuterAngle = v;
    };
    // @serialize
    // @oav()
    prototypeAccessors.coneOuterGain.get = function () {
        return this._coneOuterGain;
    };
    prototypeAccessors.coneOuterGain.set = function (v) {
        this._coneOuterGain = v;
        this.panner.coneOuterGain = v;
    };
    /**
     * 该接口的distanceModel属性PannerNode是一个枚举值，用于确定在音频源离开收听者时用于减少音频源音量的算法。
     *
     * 可能的值是：
     * * linear：根据以下公式计算由距离引起的增益的线性距离模型：
     *      1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)
     * * inverse：根据以下公式计算由距离引起的增益的反距离模型：
     *      refDistance / (refDistance + rolloffFactor * (distance - refDistance))
     * * exponential：按照下式计算由距离引起的增益的指数距离模型
     *      pow(distance / refDistance, -rolloffFactor)。
     *
     * inverse是的默认值distanceModel。
     */
    prototypeAccessors.distanceModel.get = function () {
        return this._distanceModel;
    };
    prototypeAccessors.distanceModel.set = function (v) {
        this._distanceModel = v;
        this.panner.distanceModel = v;
    };
    /**
     * 表示音频源和收听者之间的最大距离，之后音量不会再降低。该值仅由linear距离模型使用。默认值是10000。
     */
    prototypeAccessors.maxDistance.get = function () {
        return this._maxDistance;
    };
    prototypeAccessors.maxDistance.set = function (v) {
        this._maxDistance = v;
        this.panner.maxDistance = v;
    };
    // @serialize
    // @oav()
    prototypeAccessors.panningModel.get = function () {
        return this._panningModel;
    };
    prototypeAccessors.panningModel.set = function (v) {
        this._panningModel = v;
        this.panner.panningModel = v;
    };
    /**
     * 表示随着音频源远离收听者而减小音量的参考距离。此值由所有距离模型使用。默认值是1。
     */
    prototypeAccessors.refDistance.get = function () {
        return this._refDistance;
    };
    prototypeAccessors.refDistance.set = function (v) {
        this._refDistance = v;
        this.panner.refDistance = v;
    };
    /**
     * 描述了音源离开收听者音量降低的速度。此值由所有距离模型使用。默认值是1。
     */
    prototypeAccessors.rolloffFactor.get = function () {
        return this._rolloffFactor;
    };
    prototypeAccessors.rolloffFactor.set = function (v) {
        this._rolloffFactor = v;
        this.panner.rolloffFactor = v;
    };
    AudioSource.prototype.init = function init () {
        Behaviour.prototype.init.call(this);
        this.on("scenetransformChanged", this._onScenetransformChanged, this);
    };
    AudioSource.prototype.play = function play () {
        this.stop();
        if (this.buffer) {
            this.source = audioCtx.createBufferSource();
            this.source.buffer = this.buffer;
            this._connect();
            this.source.loop = this.loop;
            this.source.start(0);
        }
    };
    AudioSource.prototype.stop = function stop () {
        if (this.source) {
            this.source.stop(0);
            this._disconnect();
            this.source = null;
        }
    };
    AudioSource.prototype._onScenetransformChanged = function _onScenetransformChanged () {
        var localToWorldMatrix = this.node3d.localToWorldMatrix;
        var scenePosition = localToWorldMatrix.getPosition();
        //
        var panner = this.panner;
        // feng3d使用左手坐标系，panner使用右手坐标系，参考https://developer.mozilla.org/en-US/docs/Web/API/PannerNode
        if (panner.orientationX) {
            panner.positionX.value = scenePosition.x;
            panner.positionY.value = scenePosition.y;
            panner.positionZ.value = -scenePosition.z;
            panner.orientationX.value = 1;
            panner.orientationY.value = 0;
            panner.orientationZ.value = 0;
        }
        else {
            panner.setPosition(scenePosition.x, scenePosition.y, -scenePosition.z);
            panner.setOrientation(1, 0, 0);
        }
    };
    AudioSource.prototype._onUrlChanged = function _onUrlChanged () {
        var this$1 = this;

        this.stop();
        if (this.url) {
            var url = this.url;
            fs.readArrayBuffer(this.url, function (err, data) {
                if (err) {
                    console.warn(err);
                    return;
                }
                if (url != this$1.url)
                    { return; }
                audioCtx.decodeAudioData(data, function (buffer) {
                    this$1.buffer = buffer;
                });
            });
        }
    };
    AudioSource.prototype._connect = function _connect () {
        var arr = this._getAudioNodes();
        for (var i = 0; i < arr.length - 1; i++) {
            arr[i + 1].connect(arr[i]);
        }
    };
    AudioSource.prototype._disconnect = function _disconnect () {
        var arr = this._getAudioNodes();
        for (var i = 0; i < arr.length - 1; i++) {
            arr[i + 1].disconnect(arr[i]);
        }
    };
    AudioSource.prototype._getAudioNodes = function _getAudioNodes () {
        var arr = [];
        arr.push(this.gain);
        if (this._enablePosition)
            { arr.push(this.panner); }
        if (this.source)
            { arr.push(this.source); }
        return arr;
    };
    AudioSource.prototype._enabledChanged = function _enabledChanged () {
        if (!this.gain)
            { return; }
        if (this.enabled)
            { this.gain.connect(globalGain); }
        else
            { this.gain.disconnect(globalGain); }
    };
    AudioSource.prototype.dispose = function dispose () {
        this.off("scenetransformChanged", this._onScenetransformChanged, this);
        this._disconnect();
        Behaviour.prototype.dispose.call(this);
    };

    Object.defineProperties( AudioSource.prototype, prototypeAccessors );

    return AudioSource;
}(Behaviour));
__decorate([
    watch("_enabledChanged")
], AudioSource.prototype, "enabled", void 0);
__decorate([
    serialize,
    oav({ component: "OAVPick", tooltip: "声音文件路径", componentParam: { accepttype: "audio" } }),
    watch("_onUrlChanged")
], AudioSource.prototype, "url", void 0);
__decorate([
    serialize,
    oav({ tooltip: "是否循环播放" })
], AudioSource.prototype, "loop", null);
__decorate([
    serialize,
    oav({ tooltip: "音量" })
], AudioSource.prototype, "volume", null);
__decorate([
    serialize,
    oav({ tooltip: "是否启用位置影响声音" })
], AudioSource.prototype, "enablePosition", null);
__decorate([
    serialize,
    oav({ component: "OAVEnum", tooltip: "距离模式，距离影响声音的方式", componentParam: { enumClass: DistanceModelType } })
], AudioSource.prototype, "distanceModel", null);
__decorate([
    serialize,
    oav({ tooltip: "表示音频源和收听者之间的最大距离，之后音量不会再降低。该值仅由linear距离模型使用。默认值是10000。" })
], AudioSource.prototype, "maxDistance", null);
__decorate([
    serialize,
    oav({ tooltip: "表示随着音频源远离收听者而减小音量的参考距离。此值由所有距离模型使用。默认值是1。" })
], AudioSource.prototype, "refDistance", null);
__decorate([
    serialize,
    oav({ tooltip: "描述了音源离开收听者音量降低的速度。此值由所有距离模型使用。默认值是1。" })
], AudioSource.prototype, "rolloffFactor", null);
__decorate([
    oav()
], AudioSource.prototype, "play", null);
__decorate([
    oav()
], AudioSource.prototype, "stop", null);
AudioSource = __decorate([
    AddComponentMenu("Audio/AudioSource"),
    RegisterComponent()
], AudioSource);
function createPanner() {
    var panner = this.panner = audioCtx.createPanner();
    if (panner.orientationX) {
        panner.orientationX.value = 1;
        panner.orientationY.value = 0;
        panner.orientationZ.value = 0;
    }
    else {
        panner.setOrientation(1, 0, 0);
    }
    return panner;
}

/**
 * 摄像机投影类型
 */
var Projection;
(function (Projection) {
    /**
     * 透视投影
     */
    Projection[Projection["Perspective"] = 0] = "Perspective";
    /**
     * 正交投影
     */
    Projection[Projection["Orthographic"] = 1] = "Orthographic";
})(Projection || (Projection = {}));

/**
 * 摄像机镜头
 *
 * 镜头主要作用是投影以及逆投影。
 * 投影指的是从摄像机空间可视区域内的坐标投影至GPU空间可视区域内的坐标。
 *
 * 摄像机可视区域：由近、远，上，下，左，右组成的四棱柱
 * GPU空间可视区域：立方体 [(-1, -1, -1), (1, 1, 1)]
 *
 */
var LensBase = /*@__PURE__*/(function (Feng3dObject) {
    function LensBase(aspectRatio, near, far) {
        if ( aspectRatio === void 0 ) aspectRatio = 1;
        if ( near === void 0 ) near = 0.3;
        if ( far === void 0 ) far = 1000;

        Feng3dObject.call(this);
        //
        this._inverseMatrix = new Matrix4x4();
        this._invertMatrixInvalid = true;
        //
        this._matrix = new Matrix4x4();
        this._matrixInvalid = true;
        this.aspect = aspectRatio;
        this.near = near;
        this.far = far;
    }

    if ( Feng3dObject ) LensBase.__proto__ = Feng3dObject;
    LensBase.prototype = Object.create( Feng3dObject && Feng3dObject.prototype );
    LensBase.prototype.constructor = LensBase;

    var prototypeAccessors = { projectionType: { configurable: true },matrix: { configurable: true },inverseMatrix: { configurable: true } };
    /**
     * 摄像机投影类型
     */
    prototypeAccessors.projectionType.get = function () {
        return this._projectionType;
    };
    /**
     * 投影矩阵
     */
    prototypeAccessors.matrix.get = function () {
        if (this._matrixInvalid) {
            this._updateMatrix();
            this._matrixInvalid = false;
        }
        return this._matrix;
    };
    /**
     * 逆矩阵
     */
    prototypeAccessors.inverseMatrix.get = function () {
        if (this._invertMatrixInvalid) {
            this._updateInverseMatrix();
            this._invertMatrixInvalid = false;
        }
        return this._inverseMatrix;
    };
    /**
     * 摄像机空间坐标投影到GPU空间坐标
     * @param point3d 摄像机空间坐标
     * @param v GPU空间坐标
     * @return GPU空间坐标
     */
    LensBase.prototype.project = function project (point3d, v) {
        if ( v === void 0 ) v = new Vector3();

        var v4 = this.matrix.transformVector4(Vector4.fromVector3(point3d, 1));
        v4.toVector3(v);
        return v;
    };
    /**
     * GPU空间坐标投影到摄像机空间坐标
     * @param point3d GPU空间坐标
     * @param v 摄像机空间坐标（输出）
     * @returns 摄像机空间坐标
     */
    LensBase.prototype.unproject = function unproject (point3d, v) {
        if ( v === void 0 ) v = new Vector3();

        var v4 = this.inverseMatrix.transformVector4(Vector4.fromVector3(point3d, 1));
        v4.toVector3(v);
        return v;
    };
    /**
     * 逆投影求射线
     *
     * 通过GPU空间坐标x与y值求出摄像机空间坐标的射线
     *
     * @param x GPU空间坐标x值
     * @param y GPU空间坐标y值
     */
    LensBase.prototype.unprojectRay = function unprojectRay (x, y, ray) {
        if ( ray === void 0 ) ray = new Ray3();

        var p0 = this.unproject(new Vector3(x, y, 0));
        var p1 = this.unproject(new Vector3(x, y, 1));
        // 初始化射线
        ray.fromPosAndDir(p0, p1.sub(p0));
        // 获取z==0的点
        var sp = ray.getPointWithZ(0);
        ray.origin = sp;
        return ray;
    };
    /**
     * 指定深度逆投影
     *
     * 获取投影在指定GPU坐标且摄像机前方（深度）sZ处的点的3D坐标
     *
     * @param nX GPU空间坐标X
     * @param nY GPU空间坐标Y
     * @param sZ 到摄像机的距离
     * @param v 摄像机空间坐标（输出）
     * @return 摄像机空间坐标
     */
    LensBase.prototype.unprojectWithDepth = function unprojectWithDepth (nX, nY, sZ, v) {
        if ( v === void 0 ) v = new Vector3();

        return this.unprojectRay(nX, nY).getPointWithZ(sZ, v);
    };
    /**
     * 投影矩阵失效
     */
    LensBase.prototype.invalidate = function invalidate () {
        console.assert(!isNaN(this.aspect));
        this._matrixInvalid = true;
        this._invertMatrixInvalid = true;
        this.emit("lensChanged", this);
    };
    LensBase.prototype._updateInverseMatrix = function _updateInverseMatrix () {
        this._inverseMatrix.copy(this.matrix);
        this._inverseMatrix.invert();
    };

    Object.defineProperties( LensBase.prototype, prototypeAccessors );

    return LensBase;
}(Feng3dObject));
__decorate([
    serialize,
    oav(),
    watch("invalidate")
], LensBase.prototype, "near", void 0);
__decorate([
    watch("invalidate"),
    serialize,
    oav()
], LensBase.prototype, "far", void 0);
__decorate([
    watch("invalidate")
], LensBase.prototype, "aspect", void 0);

/**
 * 正射投影镜头
 */
var OrthographicLens = /*@__PURE__*/(function (LensBase) {
    function OrthographicLens(size, aspect, near, far) {
        if ( size === void 0 ) size = 1;
        if ( aspect === void 0 ) aspect = 1;
        if ( near === void 0 ) near = 0.3;
        if ( far === void 0 ) far = 1000;

        LensBase.call(this, aspect, near, far);
        this._projectionType = Projection.Orthographic;
        this.size = size;
    }

    if ( LensBase ) OrthographicLens.__proto__ = LensBase;
    OrthographicLens.prototype = Object.create( LensBase && LensBase.prototype );
    OrthographicLens.prototype.constructor = OrthographicLens;
    OrthographicLens.prototype._updateMatrix = function _updateMatrix () {
        this._matrix.setOrtho(-this.size, this.size, this.size, -this.size, this.near, this.far);
    };
    OrthographicLens.prototype.clone = function clone () {
        return new OrthographicLens(this.size, this.aspect, this.near, this.far);
    };

    return OrthographicLens;
}(LensBase));
__decorate([
    serialize,
    oav(),
    watch("invalidate")
], OrthographicLens.prototype, "size", void 0);

/**
 * 透视摄像机镜头
 */
var PerspectiveLens = /*@__PURE__*/(function (LensBase) {
    function PerspectiveLens(fov, aspect, near, far) {
        if ( fov === void 0 ) fov = 60;
        if ( aspect === void 0 ) aspect = 1;
        if ( near === void 0 ) near = 0.3;
        if ( far === void 0 ) far = 1000;

        LensBase.call(this, aspect, near, far);
        this._projectionType = Projection.Perspective;
        this.fov = fov;
    }

    if ( LensBase ) PerspectiveLens.__proto__ = LensBase;
    PerspectiveLens.prototype = Object.create( LensBase && LensBase.prototype );
    PerspectiveLens.prototype.constructor = PerspectiveLens;

    var prototypeAccessors = { focalLength: { configurable: true } };
    /**
     * 焦距
     */
    prototypeAccessors.focalLength.get = function () {
        return 1 / Math.tan(this.fov * Math.PI / 360);
    };
    prototypeAccessors.focalLength.set = function (value) {
        this.fov = Math.atan(1 / value) * 360 / Math.PI;
    };
    /**
     * 投影
     *
     * 摄像机空间坐标投影到GPU空间坐标
     *
     * @param point3d 摄像机空间坐标
     * @param v GPU空间坐标
     * @return GPU空间坐标
     */
    PerspectiveLens.prototype.project = function project (point3d, v) {
        if ( v === void 0 ) v = new Vector3();

        var v4 = this.matrix.transformVector4(Vector4.fromVector3(point3d, 1));
        // 透视投影结果中w!=1，需要标准化齐次坐标
        v4.scale(1 / v4.w);
        v4.toVector3(v);
        return v;
    };
    /**
     * 逆投影
     *
     * GPU空间坐标投影到摄像机空间坐标
     *
     * @param point3d GPU空间坐标
     * @param v 摄像机空间坐标（输出）
     * @returns 摄像机空间坐标
     */
    PerspectiveLens.prototype.unproject = function unproject (point3d, v) {
        if ( v === void 0 ) v = new Vector3();

        // ！！该计算过程需要参考或者研究透视投影矩阵
        // 初始化齐次坐标
        var p4 = Vector4.fromVector3(point3d, 1);
        // 逆投影求出深度值
        var v4 = this.inverseMatrix.transformVector4(p4);
        var sZ = 1 / v4.w;
        // 齐次坐标乘以深度值获取真实的投影结果
        var p44 = p4.scaleTo(sZ);
        // 计算逆投影
        var v44 = this.inverseMatrix.transformVector4(p44);
        // 输出3维坐标
        v44.toVector3(v);
        return v;
    };
    PerspectiveLens.prototype._updateMatrix = function _updateMatrix () {
        this._matrix.setPerspectiveFromFOV(this.fov, this.aspect, this.near, this.far);
    };
    PerspectiveLens.prototype.clone = function clone () {
        return new PerspectiveLens(this.fov, this.aspect, this.near, this.far);
    };

    Object.defineProperties( PerspectiveLens.prototype, prototypeAccessors );

    return PerspectiveLens;
}(LensBase));
__decorate([
    watch("invalidate"),
    serialize,
    oav()
], PerspectiveLens.prototype, "fov", void 0);

var Camera_1;
/**
 * 摄像机
 */
var Camera = Camera_1 = /*@__PURE__*/(function (Component3D) {
    function Camera() {
        Component3D.apply(this, arguments);
        //
        this._viewProjection = new Matrix4x4();
        this._viewProjectionInvalid = true;
        this._backups = { fov: 60, size: 1 };
        this._frustum = new Frustum();
        this._frustumInvalid = true;
    }

    if ( Component3D ) Camera.__proto__ = Component3D;
    Camera.prototype = Object.create( Component3D && Component3D.prototype );
    Camera.prototype.constructor = Camera;

    var prototypeAccessors = { projection: { configurable: true },lens: { configurable: true },viewProjection: { configurable: true },frustum: { configurable: true } };
    Camera.create = function create (name) {
        if ( name === void 0 ) name = "Camera";

        var entity = new Entity();
        entity.name = name;
        var camera = entity.addComponent(Camera_1);
        return camera;
    };
    prototypeAccessors.projection.get = function () {
        return this.lens && this.lens.projectionType;
    };
    prototypeAccessors.projection.set = function (v) {
        var projectionType = this.projection;
        if (projectionType == v)
            { return; }
        //
        var aspect = 1;
        var near = 0.3;
        var far = 1000;
        if (this.lens) {
            aspect = this.lens.aspect;
            near = this.lens.near;
            far = this.lens.far;
            serialization.setValue(this._backups, this.lens);
        }
        var fov = this._backups ? this._backups.fov : 60;
        var size = this._backups ? this._backups.size : 1;
        if (v == Projection.Perspective) {
            this.lens = new PerspectiveLens(fov, aspect, near, far);
        }
        else {
            this.lens = new OrthographicLens(size, aspect, near, far);
        }
    };
    /**
     * 镜头
     */
    prototypeAccessors.lens.get = function () {
        return this._lens;
    };
    prototypeAccessors.lens.set = function (v) {
        if (this._lens == v)
            { return; }
        if (this._lens) {
            this._lens.off("lensChanged", this.invalidateViewProjection, this);
        }
        this._lens = v;
        if (this._lens) {
            this._lens.on("lensChanged", this.invalidateViewProjection, this);
        }
        this.invalidateViewProjection();
        this.emit("refreshView");
        this.emit("lensChanged");
    };
    /**
     * 场景投影矩阵，世界空间转投影空间
     */
    prototypeAccessors.viewProjection.get = function () {
        if (this._viewProjectionInvalid) {
            //场景空间转摄像机空间
            this._viewProjection.copy(this.node3d.worldToLocalMatrix);
            //+摄像机空间转投影空间 = 场景空间转投影空间
            this._viewProjection.append(this.lens.matrix);
            this._viewProjectionInvalid = false;
        }
        return this._viewProjection;
    };
    /**
     * 获取摄像机的截头锥体
     */
    prototypeAccessors.frustum.get = function () {
        if (this._frustumInvalid) {
            this._frustum.fromMatrix(this.viewProjection);
            this._frustumInvalid = false;
        }
        return this._frustum;
    };
    /**
     * 创建一个摄像机
     */
    Camera.prototype.init = function init () {
        Component3D.prototype.init.call(this);
        this.lens = this.lens || new PerspectiveLens();
        //
        this.on("scenetransformChanged", this.invalidateViewProjection, this);
        this.invalidateViewProjection();
    };
    /**
     * 获取与坐标重叠的射线
     * @param x view3D上的X坐标
     * @param y view3D上的X坐标
     * @return
     */
    Camera.prototype.getRay3D = function getRay3D (x, y, ray3D) {
        if ( ray3D === void 0 ) ray3D = new Ray3();

        return this.lens.unprojectRay(x, y, ray3D).applyMatri4x4(this.node3d.localToWorldMatrix);
    };
    /**
     * 投影坐标（世界坐标转换为3D视图坐标）
     * @param point3d 世界坐标
     * @return 屏幕的绝对坐标
     */
    Camera.prototype.project = function project (point3d) {
        var v = this.lens.project(this.node3d.worldToLocalMatrix.transformPoint3(point3d));
        return v;
    };
    /**
     * 屏幕坐标投影到场景坐标
     * @param nX 屏幕坐标X ([0-width])
     * @param nY 屏幕坐标Y ([0-height])
     * @param sZ 到屏幕的距离
     * @param v 场景坐标（输出）
     * @return 场景坐标
     */
    Camera.prototype.unproject = function unproject (sX, sY, sZ, v) {
        if ( v === void 0 ) v = new Vector3();

        return this.node3d.localToWorldMatrix.transformPoint3(this.lens.unprojectWithDepth(sX, sY, sZ, v), v);
    };
    /**
     * 获取摄像机能够在指定深度处的视野；镜头在指定深度的尺寸。
     *
     * @param   depth   深度
     */
    Camera.prototype.getScaleByDepth = function getScaleByDepth (depth, dir) {
        if ( dir === void 0 ) dir = new Vector2(0, 1);

        var lt = this.unproject(-0.5 * dir.x, -0.5 * dir.y, depth);
        var rb = this.unproject(+0.5 * dir.x, +0.5 * dir.y, depth);
        var scale = lt.subTo(rb).length;
        return scale;
    };
    /**
     * 处理场景变换改变事件
     */
    Camera.prototype.invalidateViewProjection = function invalidateViewProjection () {
        this._viewProjectionInvalid = true;
        this._frustumInvalid = true;
    };

    Object.defineProperties( Camera.prototype, prototypeAccessors );

    return Camera;
}(Component3D));
__decorate([
    oav({ component: "OAVEnum", componentParam: { enumClass: Projection } })
], Camera.prototype, "projection", null);
__decorate([
    serialize,
    oav({ component: "OAVObjectView" })
], Camera.prototype, "lens", null);
Camera = Camera_1 = __decorate([
    AddComponentMenu("Rendering/Camera"),
    RegisterComponent({ single: true })
], Camera);
// 投影后可视区域
var visibleBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));
Entity.registerPrimitive("Camera", function (g) {
    g.addComponent(Camera);
});

var BillboardComponent = /*@__PURE__*/(function (Component3D) {
    function BillboardComponent () {
        Component3D.apply(this, arguments);
    }

    if ( Component3D ) BillboardComponent.__proto__ = Component3D;
    BillboardComponent.prototype = Object.create( Component3D && Component3D.prototype );
    BillboardComponent.prototype.constructor = BillboardComponent;

    BillboardComponent.prototype.init = function init () {
        Component3D.prototype.init.call(this);
        this.node3d.on("updateLocalToWorldMatrix", this._onUpdateLocalToWorldMatrix, this);
        this._invalidHoldSizeMatrix();
    };
    BillboardComponent.prototype._onCameraChanged = function _onCameraChanged (property, oldValue, value) {
        if (oldValue)
            { oldValue.off("scenetransformChanged", this._invalidHoldSizeMatrix, this); }
        if (value)
            { value.on("scenetransformChanged", this._invalidHoldSizeMatrix, this); }
        this._invalidHoldSizeMatrix();
    };
    BillboardComponent.prototype._invalidHoldSizeMatrix = function _invalidHoldSizeMatrix () {
        if (this._entity)
            { this.node3d["_invalidateSceneTransform"](); }
    };
    BillboardComponent.prototype._onUpdateLocalToWorldMatrix = function _onUpdateLocalToWorldMatrix () {
        var _localToWorldMatrix = this.node3d["_localToWorldMatrix"];
        if (_localToWorldMatrix && this.camera) {
            var camera = this.camera;
            var cameraPos = camera.node3d.worldPosition;
            var yAxis = camera.node3d.localToWorldMatrix.getAxisY();
            _localToWorldMatrix.lookAt(cameraPos, yAxis);
        }
    };
    BillboardComponent.prototype.dispose = function dispose () {
        this.camera = null;
        this.node3d.off("updateLocalToWorldMatrix", this._onUpdateLocalToWorldMatrix, this);
        Component3D.prototype.dispose.call(this);
    };

    return BillboardComponent;
}(Component3D));
__decorate([
    oav(),
    watch("_onCameraChanged")
], BillboardComponent.prototype, "camera", void 0);
BillboardComponent = __decorate([
    AddComponentMenu("Layout/BillboardComponent"),
    RegisterComponent()
], BillboardComponent);

/**
 * 参考
 */
var CartoonComponent = /*@__PURE__*/(function (Component) {
    function CartoonComponent() {
        Component.apply(this, arguments);
        this.outlineSize = 1;
        this.outlineColor = new Color4(0.2, 0.2, 0.2, 1.0);
        this.outlineMorphFactor = 0.0;
        /**
         * 半兰伯特值diff，分段值 4个(0.0,1.0)
         */
        this.diffuseSegment = new Vector4(0.1, 0.3, 0.6, 1.0);
        /**
         * 半兰伯特值diff，替换分段值 4个(0.0,1.0)
         */
        this.diffuseSegmentValue = new Vector4(0.1, 0.3, 0.6, 1.0);
        this.specularSegment = 0.5;
        this._cartoon_Anti_aliasing = false;
    }

    if ( Component ) CartoonComponent.__proto__ = Component;
    CartoonComponent.prototype = Object.create( Component && Component.prototype );
    CartoonComponent.prototype.constructor = CartoonComponent;

    var prototypeAccessors = { cartoon_Anti_aliasing: { configurable: true } };
    prototypeAccessors.cartoon_Anti_aliasing.get = function () {
        return this._cartoon_Anti_aliasing;
    };
    prototypeAccessors.cartoon_Anti_aliasing.set = function (value) {
        this._cartoon_Anti_aliasing = value;
    };
    CartoonComponent.prototype.beforeRender = function beforeRender (renderAtomic, scene, camera) {
        renderAtomic.uniforms.u_diffuseSegment = this.diffuseSegment;
        renderAtomic.uniforms.u_diffuseSegmentValue = this.diffuseSegmentValue;
        renderAtomic.uniforms.u_specularSegment = this.specularSegment;
        //
        renderAtomic.uniforms.u_outlineSize = this.outlineSize;
        renderAtomic.uniforms.u_outlineColor = this.outlineColor;
        renderAtomic.uniforms.u_outlineMorphFactor = this.outlineMorphFactor;
    };

    Object.defineProperties( CartoonComponent.prototype, prototypeAccessors );

    return CartoonComponent;
}(Component));
__decorate([
    oav(),
    serialize
], CartoonComponent.prototype, "outlineSize", void 0);
__decorate([
    oav(),
    serialize
], CartoonComponent.prototype, "outlineColor", void 0);
__decorate([
    oav(),
    serialize
], CartoonComponent.prototype, "outlineMorphFactor", void 0);
__decorate([
    oav(),
    serialize
], CartoonComponent.prototype, "diffuseSegment", void 0);
__decorate([
    oav(),
    serialize
], CartoonComponent.prototype, "diffuseSegmentValue", void 0);
__decorate([
    oav(),
    serialize
], CartoonComponent.prototype, "specularSegment", void 0);
__decorate([
    oav(),
    serialize
], CartoonComponent.prototype, "cartoon_Anti_aliasing", null);
CartoonComponent = __decorate([
    AddComponentMenu("Rendering/CartoonComponent"),
    RegisterComponent()
], CartoonComponent);

/**
 * Graphics 类包含一组可用来创建矢量形状的方法。
 */
var Graphics = /*@__PURE__*/(function (Component) {
    function Graphics() {
        Component.call(this);
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context2D = this.canvas.getContext('2d');
        //
        watchContext2D(this.context2D);
    }

    if ( Component ) Graphics.__proto__ = Component;
    Graphics.prototype = Object.create( Component && Component.prototype );
    Graphics.prototype.constructor = Graphics;
    Graphics.prototype.draw = function draw (width, height, callback) {
        var this$1 = this;

        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var ctxt = canvas.getContext('2d');
        callback(ctxt);
        dataTransform.canvasToImage(canvas, "png", 1, function (img) {
            this$1.image = img;
        });
        return this;
    };

    return Graphics;
}(Component));
function watchContext2D(context2D, watchFuncs) {
    if ( watchFuncs === void 0 ) watchFuncs = ["rect"];

    watchFuncs.forEach(function (v) {
        var oldFunc = context2D[v];
        context2D[v] = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            oldFunc.apply(context2D, args);
            // 标记更改
            context2D["__changed"] = true;
        };
    });
}
// var ctxts = [];
// var num = 100;
// for (var i = 0; i < num; i++)
// {
//     var canvas = document.createElement("canvas");
//     canvas.width = 100;
//     canvas.height = 100;
//     var ctxt = canvas.getContext('2d');
//     ctxts.push(ctxt);
// }

var HoldSizeComponent = /*@__PURE__*/(function (Component3D) {
    function HoldSizeComponent() {
        Component3D.apply(this, arguments);
        /**
         * 保持缩放尺寸
         */
        this.holdSize = 1;
    }

    if ( Component3D ) HoldSizeComponent.__proto__ = Component3D;
    HoldSizeComponent.prototype = Object.create( Component3D && Component3D.prototype );
    HoldSizeComponent.prototype.constructor = HoldSizeComponent;
    HoldSizeComponent.prototype.init = function init () {
        this.node3d.on("updateLocalToWorldMatrix", this._onUpdateLocalToWorldMatrix, this);
    };
    HoldSizeComponent.prototype.dispose = function dispose () {
        this.camera = null;
        this.node3d.off("updateLocalToWorldMatrix", this._onUpdateLocalToWorldMatrix, this);
        Component3D.prototype.dispose.call(this);
    };
    HoldSizeComponent.prototype._onCameraChanged = function _onCameraChanged (property, oldValue, value) {
        if (oldValue)
            { oldValue.off("scenetransformChanged", this._invalidateSceneTransform, this); }
        if (value)
            { value.on("scenetransformChanged", this._invalidateSceneTransform, this); }
        this._invalidateSceneTransform();
    };
    HoldSizeComponent.prototype._invalidateSceneTransform = function _invalidateSceneTransform () {
        if (this._entity)
            { this.node3d["_invalidateSceneTransform"](); }
    };
    HoldSizeComponent.prototype._onUpdateLocalToWorldMatrix = function _onUpdateLocalToWorldMatrix () {
        var _localToWorldMatrix = this.node3d["_localToWorldMatrix"];
        if (this.holdSize && this.camera && _localToWorldMatrix) {
            var depthScale = this._getDepthScale(this.camera);
            var vec = _localToWorldMatrix.toTRS();
            vec[2].scaleNumber(depthScale * this.holdSize);
            _localToWorldMatrix.fromTRS(vec[0], vec[1], vec[2]);
            console.assert(!isNaN(_localToWorldMatrix.elements[0]));
        }
    };
    HoldSizeComponent.prototype._getDepthScale = function _getDepthScale (camera) {
        var cameraTranform = camera.node3d.localToWorldMatrix;
        var distance = this.node3d.worldPosition.subTo(cameraTranform.getPosition());
        if (distance.length == 0)
            { distance.x = 1; }
        var depth = distance.dot(cameraTranform.getAxisZ());
        var scale = camera.getScaleByDepth(depth);
        //限制在放大缩小100倍之间，否则容易出现矩阵不可逆问题
        scale = Math.max(Math.min(100, scale), 0.01);
        return scale;
    };

    return HoldSizeComponent;
}(Component3D));
__decorate([
    oav(),
    watch("_invalidateSceneTransform")
], HoldSizeComponent.prototype, "holdSize", void 0);
__decorate([
    oav(),
    watch("_onCameraChanged")
], HoldSizeComponent.prototype, "camera", void 0);
HoldSizeComponent = __decorate([
    AddComponentMenu("Layout/HoldSizeComponent"),
    RegisterComponent()
], HoldSizeComponent);

var OutLineComponent = /*@__PURE__*/(function (Component) {
    function OutLineComponent() {
        Component.apply(this, arguments);
        this.size = 1;
        this.color = new Color4(0.2, 0.2, 0.2, 1.0);
        this.outlineMorphFactor = 0.0;
    }

    if ( Component ) OutLineComponent.__proto__ = Component;
    OutLineComponent.prototype = Object.create( Component && Component.prototype );
    OutLineComponent.prototype.constructor = OutLineComponent;
    OutLineComponent.prototype.beforeRender = function beforeRender (renderAtomic, scene, camera) {
        renderAtomic.uniforms.u_outlineSize = this.size;
        renderAtomic.uniforms.u_outlineColor = this.color;
        renderAtomic.uniforms.u_outlineMorphFactor = this.outlineMorphFactor;
    };

    return OutLineComponent;
}(Component));
__decorate([
    oav(),
    serialize
], OutLineComponent.prototype, "size", void 0);
__decorate([
    oav(),
    serialize
], OutLineComponent.prototype, "color", void 0);
__decorate([
    oav(),
    serialize
], OutLineComponent.prototype, "outlineMorphFactor", void 0);
OutLineComponent = __decorate([
    AddComponentMenu("Rendering/OutLineComponent"),
    RegisterComponent()
], OutLineComponent);

/**
 * 线框组件，将会对拥有该组件的对象绘制线框
 */
var WireframeComponent = /*@__PURE__*/(function (Component3D) {
    function WireframeComponent() {
        Component3D.apply(this, arguments);
        this.color = new Color4(125 / 255, 176 / 255, 250 / 255);
    }

    if ( Component3D ) WireframeComponent.__proto__ = Component3D;
    WireframeComponent.prototype = Object.create( Component3D && Component3D.prototype );
    WireframeComponent.prototype.constructor = WireframeComponent;

    return WireframeComponent;
}(Component3D));
__decorate([
    oav()
], WireframeComponent.prototype, "color", void 0);
WireframeComponent = __decorate([
    RegisterComponent()
], WireframeComponent);

var ControllerBase = function ControllerBase(node3d) {
    this.targetNode = node3d;
};

var prototypeAccessors$4 = { targetNode: { configurable: true } };
/**
 * 手动应用更新到目标3D对象
 */
ControllerBase.prototype.update = function update (interpolate) {
        if ( interpolate === void 0 ) interpolate = true;

    throw new Error("Abstract method");
};
prototypeAccessors$4.targetNode.get = function () {
    return this._targetNode;
};
prototypeAccessors$4.targetNode.set = function (val) {
    this._targetNode = val;
};

Object.defineProperties( ControllerBase.prototype, prototypeAccessors$4 );

/**
 * FPS模式控制器
 */
var FPSController = /*@__PURE__*/(function (Behaviour) {
    function FPSController() {
        Behaviour.apply(this, arguments);
        /**
         * 加速度
         */
        this.acceleration = 0.001;
        this.runEnvironment = RunEnvironment.feng3d;
        this.ischange = false;
    }

    if ( Behaviour ) FPSController.__proto__ = Behaviour;
    FPSController.prototype = Object.create( Behaviour && Behaviour.prototype );
    FPSController.prototype.constructor = FPSController;

    var prototypeAccessors = { auto: { configurable: true } };
    prototypeAccessors.auto.get = function () {
        return this._auto;
    };
    prototypeAccessors.auto.set = function (value) {
        if (this._auto == value)
            { return; }
        if (this._auto) {
            windowEventProxy.off("mousedown", this.onMousedown, this);
            windowEventProxy.off("mouseup", this.onMouseup, this);
            this.onMouseup();
        }
        this._auto = value;
        if (this._auto) {
            windowEventProxy.on("mousedown", this.onMousedown, this);
            windowEventProxy.on("mouseup", this.onMouseup, this);
        }
    };
    FPSController.prototype.init = function init () {
        Behaviour.prototype.init.call(this);
        this.keyDirectionDic = {};
        this.keyDirectionDic["a"] = new Vector3(-1, 0, 0); //左
        this.keyDirectionDic["d"] = new Vector3(1, 0, 0); //右
        this.keyDirectionDic["w"] = new Vector3(0, 0, 1); //前
        this.keyDirectionDic["s"] = new Vector3(0, 0, -1); //后
        this.keyDirectionDic["e"] = new Vector3(0, 1, 0); //上
        this.keyDirectionDic["q"] = new Vector3(0, -1, 0); //下
        this.keyDownDic = {};
        this.auto = true;
    };
    FPSController.prototype.onMousedown = function onMousedown () {
        this.ischange = true;
        this.preMousePoint = null;
        this.mousePoint = null;
        this.velocity = new Vector3();
        this.keyDownDic = {};
        windowEventProxy.on("keydown", this.onKeydown, this);
        windowEventProxy.on("keyup", this.onKeyup, this);
        windowEventProxy.on("mousemove", this.onMouseMove, this);
    };
    FPSController.prototype.onMouseup = function onMouseup () {
        this.ischange = false;
        this.preMousePoint = null;
        this.mousePoint = null;
        windowEventProxy.off("keydown", this.onKeydown, this);
        windowEventProxy.off("keyup", this.onKeyup, this);
        windowEventProxy.off("mousemove", this.onMouseMove, this);
    };
    /**
     * 销毁
     */
    FPSController.prototype.dispose = function dispose () {
        this.auto = false;
    };
    /**
     * 手动应用更新到目标3D对象
     */
    FPSController.prototype.update = function update () {
        if (!this.ischange)
            { return; }
        if (this.mousePoint && this.preMousePoint) {
            //计算旋转
            var offsetPoint = this.mousePoint.subTo(this.preMousePoint);
            offsetPoint.x *= 0.15;
            offsetPoint.y *= 0.15;
            // this.targetObject.node3d.rotate(Vector3.X_AXIS, offsetPoint.y, this.targetObject.node3d.position);
            // this.targetObject.node3d.rotate(Vector3.Y_AXIS, offsetPoint.x, this.targetObject.node3d.position);
            var matrix = this.node3d.localToWorldMatrix;
            matrix.appendRotation(matrix.getAxisX(), offsetPoint.y, matrix.getPosition());
            var up = Vector3.Y_AXIS.clone();
            if (matrix.getAxisY().dot(up) < 0) {
                up.scaleNumber(-1);
            }
            matrix.appendRotation(up, offsetPoint.x, matrix.getPosition());
            this.node3d.localToWorldMatrix = matrix;
            //
            this.preMousePoint = this.mousePoint;
            this.mousePoint = null;
        }
        //计算加速度
        var accelerationVec = new Vector3();
        for (var key in this.keyDirectionDic) {
            if (this.keyDownDic[key] == true) {
                var element = this.keyDirectionDic[key];
                accelerationVec.add(element);
            }
        }
        accelerationVec.scaleNumber(this.acceleration);
        //计算速度
        this.velocity.add(accelerationVec);
        var right = this.node3d.matrix.getAxisX();
        var up = this.node3d.matrix.getAxisY();
        var forward = this.node3d.matrix.getAxisZ();
        right.scaleNumber(this.velocity.x);
        up.scaleNumber(this.velocity.y);
        forward.scaleNumber(this.velocity.z);
        //计算位移
        var displacement = right.clone();
        displacement.add(up);
        displacement.add(forward);
        this.node3d.x += displacement.x;
        this.node3d.y += displacement.y;
        this.node3d.z += displacement.z;
    };
    /**
     * 处理鼠标移动事件
     */
    FPSController.prototype.onMouseMove = function onMouseMove (event) {
        this.mousePoint = new Vector2(event.data.clientX, event.data.clientY);
        if (this.preMousePoint == null) {
            this.preMousePoint = this.mousePoint;
            this.mousePoint = null;
        }
    };
    /**
     * 键盘按下事件
     */
    FPSController.prototype.onKeydown = function onKeydown (event) {
        var boardKey = String.fromCharCode(event.data.keyCode).toLocaleLowerCase();
        if (this.keyDirectionDic[boardKey] == null)
            { return; }
        if (!this.keyDownDic[boardKey])
            { this.stopDirectionVelocity(this.keyDirectionDic[boardKey]); }
        this.keyDownDic[boardKey] = true;
    };
    /**
     * 键盘弹起事件
     */
    FPSController.prototype.onKeyup = function onKeyup (event) {
        var boardKey = String.fromCharCode(event.data.keyCode).toLocaleLowerCase();
        if (this.keyDirectionDic[boardKey] == null)
            { return; }
        this.keyDownDic[boardKey] = false;
        this.stopDirectionVelocity(this.keyDirectionDic[boardKey]);
    };
    /**
     * 停止xyz方向运动
     * @param direction     停止运动的方向
     */
    FPSController.prototype.stopDirectionVelocity = function stopDirectionVelocity (direction) {
        if (direction == null)
            { return; }
        if (direction.x != 0) {
            this.velocity.x = 0;
        }
        if (direction.y != 0) {
            this.velocity.y = 0;
        }
        if (direction.z != 0) {
            this.velocity.z = 0;
        }
    };

    Object.defineProperties( FPSController.prototype, prototypeAccessors );

    return FPSController;
}(Behaviour));
__decorate([
    oav()
], FPSController.prototype, "acceleration", void 0);
FPSController = __decorate([
    AddComponentMenu("Controller/FPSController"),
    RegisterComponent()
], FPSController);

var LookAtController = /*@__PURE__*/(function (ControllerBase) {
    function LookAtController(node3d, Node3D) {
        ControllerBase.call(this, node3d);
        this._origin = new Vector3(0.0, 0.0, 0.0);
        this._upAxis = Vector3.Y_AXIS;
        this._pos = new Vector3();
        if (Node3D)
            { this.lookAtObject = Node3D; }
        else
            { this.lookAtPosition = new Vector3(); }
    }

    if ( ControllerBase ) LookAtController.__proto__ = ControllerBase;
    LookAtController.prototype = Object.create( ControllerBase && ControllerBase.prototype );
    LookAtController.prototype.constructor = LookAtController;

    var prototypeAccessors = { upAxis: { configurable: true },lookAtPosition: { configurable: true },lookAtObject: { configurable: true } };
    prototypeAccessors.upAxis.get = function () {
        return this._upAxis;
    };
    prototypeAccessors.upAxis.set = function (upAxis) {
        this._upAxis = upAxis;
    };
    prototypeAccessors.lookAtPosition.get = function () {
        return this._lookAtPosition;
    };
    prototypeAccessors.lookAtPosition.set = function (val) {
        this._lookAtPosition = val;
    };
    prototypeAccessors.lookAtObject.get = function () {
        return this._lookAtNode3D;
    };
    prototypeAccessors.lookAtObject.set = function (value) {
        if (this._lookAtNode3D == value)
            { return; }
        this._lookAtNode3D = value;
    };
    LookAtController.prototype.update = function update (interpolate) {
        if ( interpolate === void 0 ) interpolate = true;

        if (this._targetNode) {
            if (this._lookAtPosition) {
                this._targetNode.lookAt(this.lookAtPosition, this._upAxis);
            }
            else if (this._lookAtNode3D) {
                this._pos = this._lookAtNode3D.getPosition();
                this._targetNode.lookAt(this._pos, this._upAxis);
            }
        }
    };

    Object.defineProperties( LookAtController.prototype, prototypeAccessors );

    return LookAtController;
}(ControllerBase));

var HoverController = /*@__PURE__*/(function (LookAtController) {
    function HoverController(node3d, lookAtObject, panAngle, tiltAngle, distance, minTiltAngle, maxTiltAngle, minPanAngle, maxPanAngle, steps, yFactor, wrapPanAngle) {
        if ( panAngle === void 0 ) panAngle = 0;
        if ( tiltAngle === void 0 ) tiltAngle = 90;
        if ( distance === void 0 ) distance = 1000;
        if ( minTiltAngle === void 0 ) minTiltAngle = -90;
        if ( maxTiltAngle === void 0 ) maxTiltAngle = 90;
        if ( minPanAngle === void 0 ) minPanAngle = NaN;
        if ( maxPanAngle === void 0 ) maxPanAngle = NaN;
        if ( steps === void 0 ) steps = 8;
        if ( yFactor === void 0 ) yFactor = 2;
        if ( wrapPanAngle === void 0 ) wrapPanAngle = false;

        LookAtController.call(this, node3d, lookAtObject);
        this._currentPanAngle = 0;
        this._currentTiltAngle = 90;
        this._panAngle = 0;
        this._tiltAngle = 90;
        this._distance = 1000;
        this._minPanAngle = -Infinity;
        this._maxPanAngle = Infinity;
        this._minTiltAngle = -90;
        this._maxTiltAngle = 90;
        this._steps = 8;
        this._yFactor = 2;
        this._wrapPanAngle = false;
        this.distance = distance;
        this.panAngle = panAngle;
        this.tiltAngle = tiltAngle;
        this.minPanAngle = minPanAngle || -Infinity;
        this.maxPanAngle = maxPanAngle || Infinity;
        this.minTiltAngle = minTiltAngle;
        this.maxTiltAngle = maxTiltAngle;
        this.steps = steps;
        this.yFactor = yFactor;
        this.wrapPanAngle = wrapPanAngle;
        this._currentPanAngle = this._panAngle;
        this._currentTiltAngle = this._tiltAngle;
    }

    if ( LookAtController ) HoverController.__proto__ = LookAtController;
    HoverController.prototype = Object.create( LookAtController && LookAtController.prototype );
    HoverController.prototype.constructor = HoverController;

    var prototypeAccessors = { steps: { configurable: true },panAngle: { configurable: true },tiltAngle: { configurable: true },distance: { configurable: true },minPanAngle: { configurable: true },maxPanAngle: { configurable: true },minTiltAngle: { configurable: true },maxTiltAngle: { configurable: true },yFactor: { configurable: true },wrapPanAngle: { configurable: true } };
    prototypeAccessors.steps.get = function () {
        return this._steps;
    };
    prototypeAccessors.steps.set = function (val) {
        val = (val < 1) ? 1 : val;
        if (this._steps == val)
            { return; }
        this._steps = val;
        this.update();
    };
    prototypeAccessors.panAngle.get = function () {
        return this._panAngle;
    };
    prototypeAccessors.panAngle.set = function (val) {
        val = Math.max(this._minPanAngle, Math.min(this._maxPanAngle, val));
        if (this._panAngle == val)
            { return; }
        this._panAngle = val;
        this.update();
    };
    prototypeAccessors.tiltAngle.get = function () {
        return this._tiltAngle;
    };
    prototypeAccessors.tiltAngle.set = function (val) {
        val = Math.max(this._minTiltAngle, Math.min(this._maxTiltAngle, val));
        if (this._tiltAngle == val)
            { return; }
        this._tiltAngle = val;
        this.update();
    };
    prototypeAccessors.distance.get = function () {
        return this._distance;
    };
    prototypeAccessors.distance.set = function (val) {
        if (this._distance == val)
            { return; }
        this._distance = val;
        this.update();
    };
    prototypeAccessors.minPanAngle.get = function () {
        return this._minPanAngle;
    };
    prototypeAccessors.minPanAngle.set = function (val) {
        if (this._minPanAngle == val)
            { return; }
        this._minPanAngle = val;
        this.panAngle = Math.max(this._minPanAngle, Math.min(this._maxPanAngle, this._panAngle));
    };
    prototypeAccessors.maxPanAngle.get = function () {
        return this._maxPanAngle;
    };
    prototypeAccessors.maxPanAngle.set = function (val) {
        if (this._maxPanAngle == val)
            { return; }
        this._maxPanAngle = val;
        this.panAngle = Math.max(this._minPanAngle, Math.min(this._maxPanAngle, this._panAngle));
    };
    prototypeAccessors.minTiltAngle.get = function () {
        return this._minTiltAngle;
    };
    prototypeAccessors.minTiltAngle.set = function (val) {
        if (this._minTiltAngle == val)
            { return; }
        this._minTiltAngle = val;
        this.tiltAngle = Math.max(this._minTiltAngle, Math.min(this._maxTiltAngle, this._tiltAngle));
    };
    prototypeAccessors.maxTiltAngle.get = function () {
        return this._maxTiltAngle;
    };
    prototypeAccessors.maxTiltAngle.set = function (val) {
        if (this._maxTiltAngle == val)
            { return; }
        this._maxTiltAngle = val;
        this.tiltAngle = Math.max(this._minTiltAngle, Math.min(this._maxTiltAngle, this._tiltAngle));
    };
    prototypeAccessors.yFactor.get = function () {
        return this._yFactor;
    };
    prototypeAccessors.yFactor.set = function (val) {
        if (this._yFactor == val)
            { return; }
        this._yFactor = val;
        this.update();
    };
    prototypeAccessors.wrapPanAngle.get = function () {
        return this._wrapPanAngle;
    };
    prototypeAccessors.wrapPanAngle.set = function (val) {
        if (this._wrapPanAngle == val)
            { return; }
        this._wrapPanAngle = val;
        this.update();
    };
    HoverController.prototype.update = function update (interpolate) {
        if ( interpolate === void 0 ) interpolate = true;

        if (this._tiltAngle != this._currentTiltAngle || this._panAngle != this._currentPanAngle) {
            if (this._wrapPanAngle) {
                if (this._panAngle < 0) {
                    this._currentPanAngle += this._panAngle % 360 + 360 - this._panAngle;
                    this._panAngle = this._panAngle % 360 + 360;
                }
                else {
                    this._currentPanAngle += this._panAngle % 360 - this._panAngle;
                    this._panAngle = this._panAngle % 360;
                }
                while (this._panAngle - this._currentPanAngle < -180)
                    { this._currentPanAngle -= 360; }
                while (this._panAngle - this._currentPanAngle > 180)
                    { this._currentPanAngle += 360; }
            }
            if (interpolate) {
                this._currentTiltAngle += (this._tiltAngle - this._currentTiltAngle) / (this.steps + 1);
                this._currentPanAngle += (this._panAngle - this._currentPanAngle) / (this.steps + 1);
            }
            else {
                this._currentPanAngle = this._panAngle;
                this._currentTiltAngle = this._tiltAngle;
            }
            if ((Math.abs(this.tiltAngle - this._currentTiltAngle) < 0.01) && (Math.abs(this._panAngle - this._currentPanAngle) < 0.01)) {
                this._currentTiltAngle = this._tiltAngle;
                this._currentPanAngle = this._panAngle;
            }
        }
        if (!this._targetNode)
            { return; }
        if (this._lookAtPosition) {
            this._pos.x = this._lookAtPosition.x;
            this._pos.y = this._lookAtPosition.y;
            this._pos.z = this._lookAtPosition.z;
        }
        else if (this._lookAtNode3D) {
            if (this._targetNode.parent && this._lookAtNode3D.parent) {
                if (this._targetNode.parent != this._lookAtNode3D.parent) {
                    this._pos.x = this._lookAtNode3D.worldPosition.x;
                    this._pos.y = this._lookAtNode3D.worldPosition.y;
                    this._pos.z = this._lookAtNode3D.worldPosition.z;
                    this._targetNode.parent.worldToLocalMatrix.transformPoint3(this._pos, this._pos);
                }
                else {
                    this._lookAtNode3D.getPosition(this._pos);
                }
            }
            else if (this._lookAtNode3D.scene) {
                this._pos.x = this._lookAtNode3D.worldPosition.x;
                this._pos.y = this._lookAtNode3D.worldPosition.y;
                this._pos.z = this._lookAtNode3D.worldPosition.z;
            }
            else {
                this._lookAtNode3D.getPosition(this._pos);
            }
        }
        else {
            this._pos.x = this._origin.x;
            this._pos.y = this._origin.y;
            this._pos.z = this._origin.z;
        }
        this._targetNode.x = this._pos.x + this._distance * Math.sin(this._currentPanAngle * mathUtil.DEG2RAD) * Math.cos(this._currentTiltAngle * mathUtil.DEG2RAD);
        this._targetNode.z = this._pos.z + this._distance * Math.cos(this._currentPanAngle * mathUtil.DEG2RAD) * Math.cos(this._currentTiltAngle * mathUtil.DEG2RAD);
        this._targetNode.y = this._pos.y + this._distance * Math.sin(this._currentTiltAngle * mathUtil.DEG2RAD) * this._yFactor;
        LookAtController.prototype.update.call(this);
    };

    Object.defineProperties( HoverController.prototype, prototypeAccessors );

    return HoverController;
}(LookAtController));

var MeshRenderer_1;
/**
 * 网格渲染器
 */
var MeshRenderer = MeshRenderer_1 = /*@__PURE__*/(function (Renderable) {
    function MeshRenderer () {
        Renderable.apply(this, arguments);
    }

    if ( Renderable ) MeshRenderer.__proto__ = Renderable;
    MeshRenderer.prototype = Object.create( Renderable && Renderable.prototype );
    MeshRenderer.prototype.constructor = MeshRenderer;

    MeshRenderer.create = function create (name, callback) {
        if ( name === void 0 ) name = "Mesh";

        var entity = new Entity();
        entity.name = name;
        var meshRenderer = entity.addComponent(MeshRenderer_1, callback);
        return meshRenderer;
    };

    return MeshRenderer;
}(Renderable));
MeshRenderer = MeshRenderer_1 = __decorate([
    RegisterComponent()
], MeshRenderer);

/**
 * 射线投射拾取器
 */
var Raycaster = function Raycaster () {};

Raycaster.prototype.pick = function pick (ray3D, transforms) {
    if (transforms.length == 0)
        { return null; }
    var pickingCollisionVOs = transforms.reduce(function (pv, node3d) {
        var model = node3d.getComponent(RayCastable);
        var pickingCollisionVO = model && model.worldRayIntersection(ray3D);
        if (pickingCollisionVO)
            { pv.push(pickingCollisionVO); }
        return pv;
    }, []);
    if (pickingCollisionVOs.length == 0)
        { return null; }
    // 根据与包围盒距离进行排序
    pickingCollisionVOs.sort(function (a, b) { return a.rayEntryDistance - b.rayEntryDistance; });
    var shortestCollisionDistance = Number.MAX_VALUE;
    var bestCollisionVO = null;
    var collisionVOs = [];
    for (var i = 0; i < pickingCollisionVOs.length; ++i) {
        var pickingCollisionVO = pickingCollisionVOs[i];
        if (bestCollisionVO == null || pickingCollisionVO.rayEntryDistance < bestCollisionVO.rayEntryDistance) {
            var result = pickingCollisionVO.geometry.raycast(pickingCollisionVO.localRay, shortestCollisionDistance, pickingCollisionVO.cullFace);
            if (result) {
                pickingCollisionVO.rayEntryDistance = result.rayEntryDistance;
                pickingCollisionVO.index = result.index;
                pickingCollisionVO.localNormal = result.localNormal;
                pickingCollisionVO.localPosition = result.localPosition;
                pickingCollisionVO.uv = result.uv;
                //
                shortestCollisionDistance = pickingCollisionVO.rayEntryDistance;
                collisionVOs.push(pickingCollisionVO);
                bestCollisionVO = pickingCollisionVO;
            }
        }
    }
    return bestCollisionVO;
};
/**
 * 获取射线穿过的实体
 * @param ray3D 射线
 * @param node3ds 实体列表
 * @return
 */
Raycaster.prototype.pickAll = function pickAll (ray3D, node3ds) {
    if (node3ds.length == 0)
        { return []; }
    var pickingCollisionVOs = node3ds.reduce(function (pv, node3d) {
        var model = node3d.getComponent(RayCastable);
        var pickingCollisionVO = model && model.worldRayIntersection(ray3D);
        if (pickingCollisionVO)
            { pv.push(pickingCollisionVO); }
        return pv;
    }, []);
    if (pickingCollisionVOs.length == 0)
        { return []; }
    var collisionVOs = pickingCollisionVOs.filter(function (v) {
        var result = v.geometry.raycast(v.localRay, Number.MAX_VALUE, v.cullFace);
        if (result) {
            v.rayEntryDistance = result.rayEntryDistance;
            v.index = result.index;
            v.localNormal = result.localNormal;
            v.localPosition = result.localPosition;
            v.uv = result.uv;
            return true;
        }
        return false;
    });
    return collisionVOs;
};
/**
 * 射线投射拾取器
 */
var raycaster = new Raycaster();

/**
 * 鼠标事件管理
 */
var Mouse3DManager = function Mouse3DManager(mouseInput, viewport) {
    this._mouseEventTypes = [];
    //
    this.mouseInput = mouseInput;
    this.viewport = viewport;
};

var prototypeAccessors$5 = { selectedTransform: { configurable: true } };
prototypeAccessors$5.selectedTransform.get = function () {
    return this._selectedTransform;
};
prototypeAccessors$5.selectedTransform.set = function (v) {
    this.setSelectedNode3D(v);
};
/**
 * 拾取
 * @param scene 场景
 * @param camera 摄像机
 */
Mouse3DManager.prototype.pick = function pick (view, scene, camera) {
    if (this._mouseEventTypes.length == 0)
        { return; }
    //计算得到鼠标射线相交的物体
    var pickingCollisionVO = raycaster.pick(view.mouseRay3D, scene.mouseCheckObjects);
    var node3d = pickingCollisionVO === null || pickingCollisionVO === void 0 ? void 0 : pickingCollisionVO.node3d;
    return node3d;
};
Mouse3DManager.prototype._mouseInputChanged = function _mouseInputChanged (property, oldValue, newValue) {
        var this$1 = this;

    if (oldValue) {
        mouseEventTypes.forEach(function (element) {
            oldValue.off(element, this$1.onMouseEvent, this$1);
        });
    }
    if (newValue) {
        mouseEventTypes.forEach(function (element) {
            newValue.on(element, this$1.onMouseEvent, this$1);
        });
    }
};
Mouse3DManager.prototype.dispatch = function dispatch (type) {
    if (this.viewport) {
        var bound = lazy.getvalue(this.viewport);
        if (!bound.contains(windowEventProxy.clientX, windowEventProxy.clientY))
            { return; }
    }
    if (this._mouseEventTypes.indexOf(type) == -1)
        { this._mouseEventTypes.push(type); }
};
/**
 * 监听鼠标事件收集事件类型
 */
Mouse3DManager.prototype.onMouseEvent = function onMouseEvent (event) {
    this.dispatch(event.type);
};
/**
 * 设置选中对象
 */
Mouse3DManager.prototype.setSelectedNode3D = function setSelectedNode3D (value) {
        var this$1 = this;

    if (this._selectedTransform != value) {
        if (this._selectedTransform)
            { this._selectedTransform.emit("mouseout", null, true); }
        if (value)
            { value.emit("mouseover", null, true); }
    }
    this._selectedTransform = value;
    this._mouseEventTypes.forEach(function (element) {
        switch (element) {
            case "mousedown":
                if (this$1.preMouseDownNode3D != this$1._selectedTransform) {
                    this$1.node3DClickNum = 0;
                    this$1.preMouseDownNode3D = this$1._selectedTransform;
                }
                this$1._selectedTransform && this$1._selectedTransform.emit(element, null, true);
                break;
            case "mouseup":
                if (this$1._selectedTransform == this$1.preMouseDownNode3D) {
                    this$1.node3DClickNum++;
                }
                else {
                    this$1.node3DClickNum = 0;
                    this$1.preMouseDownNode3D = null;
                }
                this$1._selectedTransform && this$1._selectedTransform.emit(element, null, true);
                break;
            case "mousemove":
                this$1._selectedTransform && this$1._selectedTransform.emit(element, null, true);
                break;
            case "click":
                if (this$1.node3DClickNum > 0)
                    { this$1._selectedTransform && this$1._selectedTransform.emit(element, null, true); }
                break;
            case "dblclick":
                if (this$1.node3DClickNum > 1) {
                    this$1._selectedTransform && this$1._selectedTransform.emit(element, null, true);
                    this$1.node3DClickNum = 0;
                }
                break;
        }
    });
    this._mouseEventTypes.length = 0;
};

Object.defineProperties( Mouse3DManager.prototype, prototypeAccessors$5 );
__decorate([
    watch("_mouseInputChanged")
], Mouse3DManager.prototype, "mouseInput", void 0);
/**
 * 鼠标事件输入
 */
var MouseInput = /*@__PURE__*/(function (EventEmitter) {
    function MouseInput() {
        EventEmitter.apply(this, arguments);
        /**
         * 是否启动
         */
        this.enable = true;
        /**
         * 是否捕获鼠标移动
         */
        this.catchMouseMove = false;
    }

    if ( EventEmitter ) MouseInput.__proto__ = EventEmitter;
    MouseInput.prototype = Object.create( EventEmitter && EventEmitter.prototype );
    MouseInput.prototype.constructor = MouseInput;
    /**
     * 将事件调度到事件流中. 事件目标是对其调用 dispatchEvent() 方法的 IEvent 对象。
     * @param type                      事件的类型。类型区分大小写。
     * @param data                      事件携带的自定义数据。
     * @param bubbles                   表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
     */
    MouseInput.prototype.emit = function emit (type, data, bubbles) {
        if ( bubbles === void 0 ) bubbles = false;

        if (!this.enable)
            { return null; }
        if (!this.catchMouseMove && type == "mousemove")
            { return null; }
        return EventEmitter.prototype.emit.call(this, type, data, bubbles);
    };
    /**
     * 派发事件
     * @param event   事件对象
     */
    MouseInput.prototype.emitEvent = function emitEvent (event) {
        if (!this.enable)
            { return false; }
        if (!this.catchMouseMove && event.type == "mousemove")
            { return false; }
        return EventEmitter.prototype.emitEvent.call(this, event);
    };

    return MouseInput;
}(EventEmitter));
/**
 * 鼠标事件列表
 */
var mouseEventTypes = [
    "mouseout",
    "mouseover",
    "mousemove",
    "mousedown",
    "mouseup",
    "click",
    "middlemousedown",
    "middlemouseup",
    "middleclick",
    "rightmousedown",
    "rightmouseup",
    "rightclick",
    "dblclick" ];
/**
 * Window鼠标事件输入
 */
var WindowMouseInput = /*@__PURE__*/(function (MouseInput) {
    function WindowMouseInput() {
        MouseInput.call(this);
        windowEventProxy.on("click", this.onMouseEvent, this);
        windowEventProxy.on("dblclick", this.onMouseEvent, this);
        windowEventProxy.on("mousedown", this.onMouseEvent, this);
        windowEventProxy.on("mouseup", this.onMouseEvent, this);
        windowEventProxy.on("mousemove", this.onMouseEvent, this);
    }

    if ( MouseInput ) WindowMouseInput.__proto__ = MouseInput;
    WindowMouseInput.prototype = Object.create( MouseInput && MouseInput.prototype );
    WindowMouseInput.prototype.constructor = WindowMouseInput;
    /**
     * 监听鼠标事件收集事件类型
     */
    WindowMouseInput.prototype.onMouseEvent = function onMouseEvent (event) {
        var type = event.type;
        // 处理鼠标中键与右键
        if (event.data instanceof MouseEvent) {
            if (["click", "mousedown", "mouseup"].indexOf(event.type) != -1) {
                type = ["", "middle", "right"][event.data.button] + event.type;
            }
        }
        this.emit(type, { mouseX: event.data.clientX, mouseY: event.data.clientY });
    };

    return WindowMouseInput;
}(MouseInput));

/**
 * 3d对象脚本
 */
var Script = function Script() {
};

var prototypeAccessors$6 = { entity: { configurable: true },node3d: { configurable: true } };
/**
 * The game object this component is attached to. A component is always attached to a game object.
 */
prototypeAccessors$6.entity.get = function () {
    return this.component.entity;
};
/**
 * The Transform attached to this Entity (null if there is none attached).
 */
prototypeAccessors$6.node3d.get = function () {
    return this.component.node3d;
};
/**
 * Use this for initialization
 */
Script.prototype.init = function init () {
};
/**
 * Update is called once per frame
 * 每帧执行一次
 */
Script.prototype.update = function update () {
};
/**
 * 销毁
 */
Script.prototype.dispose = function dispose () {
};

Object.defineProperties( Script.prototype, prototypeAccessors$6 );

var TransformLayout_1;
/**
 * 变换布局
 *
 * 提供了比Transform更加适用于2D元素的API
 *
 * 通过修改Transform的数值实现
 */
var TransformLayout = TransformLayout_1 = /*@__PURE__*/(function (Component3D) {
    function TransformLayout() {
        Component3D.call(this);
        this._position = new Vector3();
        this._size = new Vector3(1, 1, 1);
        this._leftTop = new Vector3(0, 0, 0);
        this._rightBottom = new Vector3(0, 0, 0);
        /**
         * 最小锚点，父Transform2D中左上角锚定的规范化位置。
         */
        this.anchorMin = new Vector3(0.5, 0.5, 0.5);
        /**
         * 最大锚点，父Transform2D中左上角锚定的规范化位置。
         */
        this.anchorMax = new Vector3(0.5, 0.5, 0.5);
        /**
         * The normalized position in this RectTransform that it rotates around.
         */
        this.pivot = new Vector3(0.5, 0.5, 0.5);
        /**
         * 布局是否失效
         */
        this._layoutInvalid = true;
        watcher.watch(this._position, "x", this._invalidateLayout, this);
        watcher.watch(this._position, "y", this._invalidateLayout, this);
        watcher.watch(this._position, "z", this._invalidateLayout, this);
        watcher.watch(this.anchorMin, "x", this._invalidateLayout, this);
        watcher.watch(this.anchorMin, "y", this._invalidateLayout, this);
        watcher.watch(this.anchorMin, "z", this._invalidateLayout, this);
        watcher.watch(this.anchorMax, "x", this._invalidateLayout, this);
        watcher.watch(this.anchorMax, "y", this._invalidateLayout, this);
        watcher.watch(this.anchorMax, "z", this._invalidateLayout, this);
        //
        watcher.watch(this._leftTop, "x", this._invalidateSize, this);
        watcher.watch(this._leftTop, "y", this._invalidateSize, this);
        watcher.watch(this._leftTop, "z", this._invalidateSize, this);
        watcher.watch(this._rightBottom, "x", this._invalidateSize, this);
        watcher.watch(this._rightBottom, "y", this._invalidateSize, this);
        watcher.watch(this._rightBottom, "z", this._invalidateSize, this);
        //
        watcher.watch(this._size, "x", this._invalidateSize, this);
        watcher.watch(this._size, "y", this._invalidateSize, this);
        watcher.watch(this._size, "z", this._invalidateSize, this);
        watcher.watch(this.pivot, "x", this._invalidatePivot, this);
        watcher.watch(this.pivot, "y", this._invalidatePivot, this);
        watcher.watch(this.pivot, "z", this._invalidatePivot, this);
        //
        this.on("added", this._onAdded, this);
        this.on("removed", this._onRemoved, this);
    }

    if ( Component3D ) TransformLayout.__proto__ = Component3D;
    TransformLayout.prototype = Object.create( Component3D && Component3D.prototype );
    TransformLayout.prototype.constructor = TransformLayout;

    var prototypeAccessors = { position: { configurable: true },size: { configurable: true },leftTop: { configurable: true },rightBottom: { configurable: true } };
    TransformLayout.prototype._onAdded = function _onAdded (event) {
        event.data.parent.on("sizeChanged", this._invalidateLayout, this);
        event.data.parent.on("pivotChanged", this._invalidateLayout, this);
        this._invalidateLayout();
    };
    TransformLayout.prototype._onRemoved = function _onRemoved (event) {
        event.data.parent.off("sizeChanged", this._invalidateLayout, this);
        event.data.parent.off("pivotChanged", this._invalidateLayout, this);
    };
    /**
     * 位移
     */
    prototypeAccessors.position.get = function () {
        this._updateLayout();
        return this._position;
    };
    prototypeAccessors.position.set = function (v) { this._position.copy(v); };
    /**
     * 尺寸，宽高。
     */
    prototypeAccessors.size.get = function () {
        this._updateLayout();
        return this._size;
    };
    prototypeAccessors.size.set = function (v) { this._size.copy(v); };
    /**
     * 与最小最大锚点形成的边框的left、right、top、bottom距离。当 anchorMin.x != anchorMax.x 时对 layout.x layout.y 赋值生效，当 anchorMin.y != anchorMax.y 时对 layout.z layout.w 赋值生效，否则赋值无效，自动被覆盖。
     */
    prototypeAccessors.leftTop.get = function () {
        return this._leftTop;
    };
    prototypeAccessors.leftTop.set = function (v) {
        this._leftTop.copy(v);
    };
    /**
     * 与最小最大锚点形成的边框的left、right、top、bottom距离。当 anchorMin.x != anchorMax.x 时对 layout.x layout.y 赋值生效，当 anchorMin.y != anchorMax.y 时对 layout.z layout.w 赋值生效，否则赋值无效，自动被覆盖。
     */
    prototypeAccessors.rightBottom.get = function () {
        return this._rightBottom;
    };
    prototypeAccessors.rightBottom.set = function (v) {
        this._rightBottom.copy(v);
    };
    TransformLayout.prototype.beforeRender = function beforeRender (renderAtomic, scene, camera) {
        // renderAtomic.uniforms.u_rect = this.rect;
    };
    TransformLayout.prototype._updateLayout = function _updateLayout () {
        var _a, _b;
        if (!this._layoutInvalid)
            { return; }
        var transformLayout = (_b = (_a = this.node3d) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.getComponent(TransformLayout_1);
        if (!transformLayout)
            { return; }
        // 中心点基于anchorMin的坐标
        var position = this._position;
        // 尺寸
        var size = this._size;
        var leftTop = this._leftTop;
        var rightBottom = this._rightBottom;
        // 最小锚点
        var anchorMin = this.anchorMin.clone();
        // 最大锚点
        var anchorMax = this.anchorMax.clone();
        var pivot = this.pivot.clone();
        // 父对象显示区域宽高
        var parentSize = transformLayout.size;
        var parentPivot = transformLayout.pivot;
        // 锚点在父Transform2D中锚定的 leftRightTopBottom 位置。
        var anchorLeftTop = new Vector3(anchorMin.x * parentSize.x - parentPivot.x * parentSize.x, anchorMin.y * parentSize.y - parentPivot.y * parentSize.y, anchorMin.z * parentSize.z - parentPivot.z * parentSize.z);
        var anchorRightBottom = new Vector3(anchorMax.x * parentSize.x - parentPivot.x * parentSize.x, anchorMax.y * parentSize.y - parentPivot.y * parentSize.y, anchorMax.z * parentSize.z - parentPivot.z * parentSize.z);
        if (anchorMin.x == anchorMax.x) {
            leftTop.x = (-pivot.x * size.x + position.x) - anchorLeftTop.x;
            rightBottom.x = anchorRightBottom.x - (size.x - pivot.x * size.x + position.x);
        }
        else {
            size.x = (anchorRightBottom.x - rightBottom.x) - (anchorLeftTop.x + leftTop.x);
            position.x = leftTop.x + pivot.x * size.x;
        }
        if (anchorMin.y == anchorMax.y) {
            leftTop.y = (-pivot.y * size.y + position.y) - anchorLeftTop.y;
            rightBottom.y = anchorRightBottom.y - (size.y - pivot.y * size.y + position.y);
        }
        else {
            size.y = (anchorRightBottom.y - rightBottom.y) - (anchorLeftTop.y + leftTop.y);
            position.y = leftTop.y + pivot.y * size.y;
        }
        if (anchorMin.z == anchorMax.z) {
            leftTop.z = (-pivot.z * size.z + position.z) - anchorLeftTop.z;
            rightBottom.z = anchorRightBottom.z - (size.z - pivot.z * size.z + position.z);
        }
        else {
            size.z = (anchorRightBottom.z - rightBottom.z) - (anchorLeftTop.z + leftTop.z);
            position.z = leftTop.z + pivot.z * size.z;
        }
        //
        this.node3d.x = anchorLeftTop.x + position.x;
        this.node3d.y = anchorLeftTop.y + position.y;
        this.node3d.z = anchorLeftTop.z + position.z;
        //
        this._layoutInvalid = false;
        ticker.offframe(this._updateLayout, this);
    };
    TransformLayout.prototype._invalidateLayout = function _invalidateLayout () {
        this._layoutInvalid = true;
        ticker.onframe(this._updateLayout, this);
    };
    TransformLayout.prototype._invalidateSize = function _invalidateSize () {
        this._invalidateLayout();
        this.emit("sizeChanged", this);
    };
    TransformLayout.prototype._invalidatePivot = function _invalidatePivot () {
        this._invalidateLayout();
        this.emit("pivotChanged", this);
    };

    Object.defineProperties( TransformLayout.prototype, prototypeAccessors );

    return TransformLayout;
}(Component3D));
__decorate([
    oav({ tooltip: "当anchorMin.x == anchorMax.x时对position.x赋值生效，当 anchorMin.y == anchorMax.y 时对position.y赋值生效，否则赋值无效，自动被覆盖。", componentParam: { step: 1, stepScale: 1, stepDownup: 1 } }),
    serialize
], TransformLayout.prototype, "position", null);
__decorate([
    oav({ tooltip: "宽度，不会影响到缩放值。当 anchorMin.x == anchorMax.x 时对 size.x 赋值生效，当anchorMin.y == anchorMax.y时对 size.y 赋值生效，否则赋值无效，自动被覆盖。", componentParam: { step: 1, stepScale: 1, stepDownup: 1 } }),
    serialize
], TransformLayout.prototype, "size", null);
__decorate([
    oav({ tooltip: "与最小最大锚点形成的边框的left、right、top、bottom距离。当 anchorMin.x != anchorMax.x 时对 layout.x layout.y 赋值生效，当 anchorMin.y != anchorMax.y 时对 layout.z layout.w 赋值生效，否则赋值无效，自动被覆盖。", componentParam: { step: 1, stepScale: 1, stepDownup: 1 } }),
    serialize
], TransformLayout.prototype, "leftTop", null);
__decorate([
    oav({ tooltip: "与最小最大锚点形成的边框的left、right、top、bottom距离。当 anchorMin.x != anchorMax.x 时对 layout.x layout.y 赋值生效，当 anchorMin.y != anchorMax.y 时对 layout.z layout.w 赋值生效，否则赋值无效，自动被覆盖。", componentParam: { step: 1, stepScale: 1, stepDownup: 1 } }),
    serialize
], TransformLayout.prototype, "rightBottom", null);
__decorate([
    oav({ tooltip: "父Transform2D中左上角锚定的规范化位置。", componentParam: { step: 0.01, stepScale: 0.01, stepDownup: 0.01 } }),
    serialize
], TransformLayout.prototype, "anchorMin", void 0);
__decorate([
    oav({ tooltip: "最大锚点，父Transform2D中左上角锚定的规范化位置。", componentParam: { step: 0.01, stepScale: 0.01, stepDownup: 0.01 } }),
    serialize
], TransformLayout.prototype, "anchorMax", void 0);
__decorate([
    oav({ tooltip: "中心点" }),
    serialize
], TransformLayout.prototype, "pivot", void 0);
TransformLayout = TransformLayout_1 = __decorate([
    AddComponentMenu("Layout/TransformLayout"),
    RegisterComponent({ single: true })
], TransformLayout);

/**
 * 平面几何体
 */
var PlaneGeometry = /*@__PURE__*/(function (Geometry) {
    function PlaneGeometry() {
        Geometry.apply(this, arguments);
        /**
         * 宽度
         */
        this.width = 1;
        /**
         * 高度
         */
        this.height = 1;
        /**
         * 横向分割数
         */
        this.segmentsW = 1;
        /**
         * 纵向分割数
         */
        this.segmentsH = 1;
        /**
         * 是否朝上
         */
        this.yUp = true;
        this._name = "Plane";
    }

    if ( Geometry ) PlaneGeometry.__proto__ = Geometry;
    PlaneGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    PlaneGeometry.prototype.constructor = PlaneGeometry;
    /**
     * 构建几何体数据
     */
    PlaneGeometry.prototype.buildGeometry = function buildGeometry () {
        var vertexPositionData = this.buildPosition();
        this.positions = vertexPositionData;
        var vertexNormalData = this.buildNormal();
        this.normals = vertexNormalData;
        var vertexTangentData = this.buildTangent();
        this.tangents = vertexTangentData;
        var uvData = this.buildUVs();
        this.uvs = uvData;
        var indices = this.buildIndices();
        this.indices = indices;
    };
    /**
     * 构建顶点坐标
     * @param this.width 宽度
     * @param this.height 高度
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    PlaneGeometry.prototype.buildPosition = function buildPosition () {
        var vertexPositionData = [];
        var x, y;
        var positionIndex = 0;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                x = (xi / this.segmentsW - .5) * this.width;
                y = (yi / this.segmentsH - .5) * this.height;
                //设置坐标数据
                vertexPositionData[positionIndex++] = x;
                if (this.yUp) {
                    vertexPositionData[positionIndex++] = 0;
                    vertexPositionData[positionIndex++] = y;
                }
                else {
                    vertexPositionData[positionIndex++] = y;
                    vertexPositionData[positionIndex++] = 0;
                }
            }
        }
        return vertexPositionData;
    };
    /**
     * 构建顶点法线
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    PlaneGeometry.prototype.buildNormal = function buildNormal () {
        var vertexNormalData = [];
        var normalIndex = 0;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                //设置法线数据
                vertexNormalData[normalIndex++] = 0;
                if (this.yUp) {
                    vertexNormalData[normalIndex++] = 1;
                    vertexNormalData[normalIndex++] = 0;
                }
                else {
                    vertexNormalData[normalIndex++] = 0;
                    vertexNormalData[normalIndex++] = 1;
                }
            }
        }
        return vertexNormalData;
    };
    /**
     * 构建顶点切线
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    PlaneGeometry.prototype.buildTangent = function buildTangent () {
        var vertexTangentData = [];
        var tangentIndex = 0;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                if (this.yUp) {
                    vertexTangentData[tangentIndex++] = 1;
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = 0;
                }
                else {
                    vertexTangentData[tangentIndex++] = -1;
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = 0;
                }
            }
        }
        return vertexTangentData;
    };
    /**
     * 构建顶点索引
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    PlaneGeometry.prototype.buildIndices = function buildIndices () {
        var indices = [];
        var tw = this.segmentsW + 1;
        var numIndices = 0;
        var base;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                //生成索引数据
                if (xi != this.segmentsW && yi != this.segmentsH) {
                    base = xi + yi * tw;
                    if (this.yUp) {
                        indices[numIndices++] = base;
                        indices[numIndices++] = base + tw;
                        indices[numIndices++] = base + tw + 1;
                        indices[numIndices++] = base;
                        indices[numIndices++] = base + tw + 1;
                        indices[numIndices++] = base + 1;
                    }
                    else {
                        indices[numIndices++] = base;
                        indices[numIndices++] = base + tw + 1;
                        indices[numIndices++] = base + tw;
                        indices[numIndices++] = base;
                        indices[numIndices++] = base + 1;
                        indices[numIndices++] = base + tw + 1;
                    }
                }
            }
        }
        return indices;
    };
    /**
     * 构建uv
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     */
    PlaneGeometry.prototype.buildUVs = function buildUVs () {
        var data = [];
        var index = 0;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                if (this.yUp) {
                    data[index++] = xi / this.segmentsW;
                    data[index++] = 1 - yi / this.segmentsH;
                }
                else {
                    data[index++] = 1 - xi / this.segmentsW;
                    data[index++] = 1 - yi / this.segmentsH;
                }
            }
        }
        return data;
    };

    return PlaneGeometry;
}(Geometry));
__decorate([
    oav(),
    serialize,
    watch("invalidateGeometry")
], PlaneGeometry.prototype, "width", void 0);
__decorate([
    oav(),
    serialize,
    watch("invalidateGeometry")
], PlaneGeometry.prototype, "height", void 0);
__decorate([
    oav(),
    serialize,
    watch("invalidateGeometry")
], PlaneGeometry.prototype, "segmentsW", void 0);
__decorate([
    oav(),
    serialize,
    watch("invalidateGeometry")
], PlaneGeometry.prototype, "segmentsH", void 0);
__decorate([
    oav(),
    serialize,
    watch("invalidateGeometry")
], PlaneGeometry.prototype, "yUp", void 0);
Geometry.setDefault("Plane", new PlaneGeometry(), { width: 10, height: 10 });
Entity.registerPrimitive("Plane", function (g) {
    g.addComponent(MeshRenderer).geometry = Geometry.getDefault("Plane");
});

/**
 * 渲染目标纹理
 */
var RenderTargetTexture2D = /*@__PURE__*/(function (Texture2D) {
    function RenderTargetTexture2D() {
        Texture2D.apply(this, arguments);
        this.OFFSCREEN_WIDTH = 1024;
        this.OFFSCREEN_HEIGHT = 1024;
        this.format = TextureFormat.RGBA;
        this.minFilter = TextureMinFilter.NEAREST;
        this.magFilter = TextureMagFilter.NEAREST;
        this.isRenderTarget = true;
    }

    if ( Texture2D ) RenderTargetTexture2D.__proto__ = Texture2D;
    RenderTargetTexture2D.prototype = Object.create( Texture2D && Texture2D.prototype );
    RenderTargetTexture2D.prototype.constructor = RenderTargetTexture2D;

    return RenderTargetTexture2D;
}(Texture2D));
__decorate([
    watch("invalidate")
], RenderTargetTexture2D.prototype, "OFFSCREEN_WIDTH", void 0);
__decorate([
    watch("invalidate")
], RenderTargetTexture2D.prototype, "OFFSCREEN_HEIGHT", void 0);

/**
 * 帧缓冲对象
 */
var FrameBufferObject = function FrameBufferObject(width, height) {
    if ( width === void 0 ) width = 1024;
    if ( height === void 0 ) height = 1024;

    this.OFFSCREEN_WIDTH = 1024;
    this.OFFSCREEN_HEIGHT = 1024;
    /**
     * 是否失效
     */
    this._invalid = true;
    this.frameBuffer = new FrameBuffer();
    this.texture = new RenderTargetTexture2D();
    this.depthBuffer = new RenderBuffer();
    this.OFFSCREEN_WIDTH = width;
    this.OFFSCREEN_HEIGHT = height;
};
FrameBufferObject.active = function active (gl, frameBufferObject) {
    if (frameBufferObject._invalid) {
        frameBufferObject._invalid = false;
        this.clear(frameBufferObject);
    }
    gl.cache.frameBufferObjects = gl.cache.frameBufferObjects || new Map();
    var obj = gl.cache.frameBufferObjects.get(frameBufferObject);
    if (!obj) {
        var framebuffer = FrameBuffer.active(gl, frameBufferObject.frameBuffer);
        var texture = Texture.active(gl, frameBufferObject.texture);
        var depthBuffer = RenderBuffer.active(gl, frameBufferObject.depthBuffer);
        // 绑定帧缓冲区对象
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        // 设置颜色关联对象
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        // 设置深度关联对象
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
        // 检查Framebuffer状态
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            alert('Frame buffer object is incomplete: ' + e.toString());
            return null;
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        obj = { framebuffer: framebuffer, texture: texture, depthBuffer: depthBuffer };
        gl.cache.frameBufferObjects.set(frameBufferObject, obj);
    }
    else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, obj.framebuffer);
    }
    return obj;
};
FrameBufferObject.prototype.deactive = function deactive (gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
/**
 * 使失效
 */
FrameBufferObject.prototype.invalidate = function invalidate () {
    this._invalid = true;
};
FrameBufferObject.prototype.invalidateSize = function invalidateSize () {
    if (this.texture) {
        this.texture.OFFSCREEN_WIDTH = this.OFFSCREEN_WIDTH;
        this.texture.OFFSCREEN_HEIGHT = this.OFFSCREEN_HEIGHT;
    }
    if (this.depthBuffer) {
        this.depthBuffer.OFFSCREEN_WIDTH = this.OFFSCREEN_WIDTH;
        this.depthBuffer.OFFSCREEN_HEIGHT = this.OFFSCREEN_HEIGHT;
    }
    this._invalid = true;
};
FrameBufferObject.clear = function clear (frameBufferObject) {
    GL.glList.forEach(function (gl) {
        gl.cache.frameBufferObjects = gl.cache.frameBufferObjects || new Map();
        var buffer = gl.cache.frameBufferObjects.get(frameBufferObject);
        if (buffer) {
            gl.cache.frameBufferObjects.delete(frameBufferObject);
        }
    });
};
__decorate([
    watch("invalidateSize")
], FrameBufferObject.prototype, "OFFSCREEN_WIDTH", void 0);
__decorate([
    watch("invalidateSize")
], FrameBufferObject.prototype, "OFFSCREEN_HEIGHT", void 0);
__decorate([
    watch("invalidate")
], FrameBufferObject.prototype, "frameBuffer", void 0);
__decorate([
    watch("invalidate")
], FrameBufferObject.prototype, "texture", void 0);
__decorate([
    watch("invalidate")
], FrameBufferObject.prototype, "depthBuffer", void 0);

/**
 * 灯光类型

 */
var LightType;
(function (LightType) {
    /**
     * 方向光
     */
    LightType[LightType["Directional"] = 0] = "Directional";
    /**
     * 点光
     */
    LightType[LightType["Point"] = 1] = "Point";
    /**
     * 聚光灯
     */
    LightType[LightType["Spot"] = 2] = "Spot";
})(LightType || (LightType = {}));

/**
 * 灯光
 */
var Light = /*@__PURE__*/(function (Behaviour) {
    function Light() {
        Behaviour.call(this);
        /**
         * 颜色
         */
        this.color = new Color3();
        /**
         * 光照强度
         */
        this.intensity = 1;
        /**
         * 阴影类型
         */
        this.shadowType = ShadowType.No_Shadows;
        /**
         * 阴影偏差，用来解决判断是否为阴影时精度问题
         */
        this.shadowBias = -0.005;
        /**
         * 阴影半径，边缘宽度
         */
        this.shadowRadius = 1;
        /**
         * 帧缓冲对象，用于处理光照阴影贴图渲染
         */
        this.frameBufferObject = new FrameBufferObject();
        this.debugShadowMap = false;
        this.shadowCamera = serialization.setValue(new Entity(), { name: "LightShadowCamera" }).addComponent(Camera);
    }

    if ( Behaviour ) Light.__proto__ = Behaviour;
    Light.prototype = Object.create( Behaviour && Behaviour.prototype );
    Light.prototype.constructor = Light;

    var prototypeAccessors = { position: { configurable: true },direction: { configurable: true },shadowCameraNear: { configurable: true },shadowCameraFar: { configurable: true },shadowMapSize: { configurable: true },shadowMap: { configurable: true } };
    /**
     * 光源位置
     */
    prototypeAccessors.position.get = function () {
        return this.node3d.worldPosition;
    };
    /**
     * 光照方向
     */
    prototypeAccessors.direction.get = function () {
        return this.node3d.localToWorldMatrix.getAxisZ();
    };
    /**
     * 阴影近平面距离
     */
    prototypeAccessors.shadowCameraNear.get = function () {
        return this.shadowCamera.lens.near;
    };
    /**
     * 阴影近平面距离
     */
    prototypeAccessors.shadowCameraFar.get = function () {
        return this.shadowCamera.lens.far;
    };
    /**
     * 阴影图尺寸
     */
    prototypeAccessors.shadowMapSize.get = function () {
        return this.shadowMap.getSize();
    };
    prototypeAccessors.shadowMap.get = function () {
        return this.frameBufferObject.texture;
    };
    Light.prototype.updateDebugShadowMap = function updateDebugShadowMap (scene, viewCamera) {
        var model = this.debugShadowMapModel;
        if (!model) {
            var entity = new Entity();
            entity.name = "debugShadowMapObject";
            model = entity.addComponent(MeshRenderer);
            model.geometry = Geometry.getDefault("Plane");
            model.hideFlags = HideFlags.Hide | HideFlags.DontSave;
            model.node3d.mouseEnabled = false;
            model.addComponent(BillboardComponent);
            //材质
            model.geometry = serialization.setValue(new PlaneGeometry(), { width: this.lightType == LightType.Point ? 1 : 0.5, height: 0.5, segmentsW: 1, segmentsH: 1, yUp: false });
            var textureMaterial = model.material = serialization.setValue(new Material(), { shaderName: "texture", uniforms: { s_texture: this.frameBufferObject.texture } });
            //
            // textureMaterial.uniforms.s_texture.url = 'Assets/pz.jpg';
            // textureMaterial.uniforms.u_color.setTo(1.0, 0.0, 0.0, 1.0);
            textureMaterial.renderParams.enableBlend = true;
            textureMaterial.renderParams.sfactor = BlendFactor.ONE;
            textureMaterial.renderParams.dfactor = BlendFactor.ZERO;
        }
        var depth = viewCamera.lens.near * 2;
        var position = viewCamera.node3d.worldPosition.addTo(viewCamera.node3d.localToWorldMatrix.getAxisZ().scaleNumberTo(depth));
        model.node3d.x = position.x;
        model.node3d.y = position.y;
        model.node3d.z = position.z;
        var billboardComponent = model.getComponent(BillboardComponent);
        billboardComponent.camera = viewCamera;
        if (this.debugShadowMap) {
            scene.node3d.addChild(model.node3d);
        }
        else {
            model.node3d.remove();
        }
    };

    Object.defineProperties( Light.prototype, prototypeAccessors );

    return Light;
}(Behaviour));
__decorate([
    serialize
], Light.prototype, "lightType", void 0);
__decorate([
    oav(),
    serialize
], Light.prototype, "color", void 0);
__decorate([
    oav(),
    serialize
], Light.prototype, "intensity", void 0);
__decorate([
    oav({ component: "OAVEnum", componentParam: { enumClass: ShadowType } }),
    serialize
], Light.prototype, "shadowType", void 0);
__decorate([
    oav({ tooltip: "是否调试阴影图" })
], Light.prototype, "debugShadowMap", void 0);

var DirectionalLight_1;
/**
 * 方向光源
 */
var DirectionalLight = DirectionalLight_1 = /*@__PURE__*/(function (Light) {
    function DirectionalLight() {
        Light.call(this);
        this.lightType = LightType.Directional;
    }

    if ( Light ) DirectionalLight.__proto__ = Light;
    DirectionalLight.prototype = Object.create( Light && Light.prototype );
    DirectionalLight.prototype.constructor = DirectionalLight;

    var prototypeAccessors = { position: { configurable: true } };
    DirectionalLight.create = function create (name) {
        if ( name === void 0 ) name = "DirectionalLight";

        var entity = new Entity();
        entity.name = name;
        var directionalLight = entity.addComponent(DirectionalLight_1);
        return directionalLight;
    };
    /**
     * 光源位置
     */
    prototypeAccessors.position.get = function () {
        return this.shadowCamera.node3d.worldPosition;
    };
    /**
     * 通过视窗摄像机进行更新
     * @param viewCamera 视窗摄像机
     */
    DirectionalLight.prototype.updateShadowByCamera = function updateShadowByCamera (scene, viewCamera, models) {
        var worldBounds = models.reduce(function (pre, i) {
            var box = i.node3d.boundingBox.worldBounds;
            if (!pre)
                { return box.clone(); }
            pre.union(box);
            return pre;
        }, null) || new Box3(new Vector3(), new Vector3(1, 1, 1));
        // 
        var center = worldBounds.getCenter();
        var radius = worldBounds.getSize().length / 2;
        // 
        var position = center.addTo(this.direction.scaleNumberTo(radius + this.shadowCameraNear).negate());
        this.shadowCamera.node3d.x = position.x;
        this.shadowCamera.node3d.y = position.y;
        this.shadowCamera.node3d.z = position.z;
        this.shadowCamera.node3d.lookAt(center, this.shadowCamera.node3d.matrix.getAxisY());
        //
        if (!this.orthographicLens) {
            this.shadowCamera.lens = this.orthographicLens = new OrthographicLens(radius, 1, this.shadowCameraNear, this.shadowCameraNear + radius * 2);
        }
        else {
            serialization.setValue(this.orthographicLens, { size: radius, near: this.shadowCameraNear, far: this.shadowCameraNear + radius * 2 });
        }
    };

    Object.defineProperties( DirectionalLight.prototype, prototypeAccessors );

    return DirectionalLight;
}(Light));
DirectionalLight = DirectionalLight_1 = __decorate([
    AddComponentMenu("Rendering/DirectionalLight"),
    RegisterComponent()
], DirectionalLight);
Entity.registerPrimitive("Directional light", function (g) {
    g.addComponent(DirectionalLight);
});

/**
 * 前向渲染器
 */
var ForwardRenderer = function ForwardRenderer () {};

ForwardRenderer.prototype.draw = function draw (gl, scene, camera) {
    var blenditems = scene.getPickCache(camera).blenditems;
    var unblenditems = scene.getPickCache(camera).unblenditems;
    var uniforms = {};
    //
    uniforms.u_projectionMatrix = camera.lens.matrix;
    uniforms.u_viewProjection = camera.viewProjection;
    uniforms.u_viewMatrix = camera.node3d.worldToLocalMatrix;
    uniforms.u_cameraMatrix = camera.node3d.localToWorldMatrix;
    uniforms.u_cameraPos = camera.node3d.worldPosition;
    uniforms.u_skyBoxSize = camera.lens.far / Math.sqrt(3);
    uniforms.u_scaleByDepth = camera.getScaleByDepth(1);
    uniforms.u_sceneAmbientColor = scene.ambientColor;
    var ctime = (Date.now() / 1000) % 3600;
    uniforms._Time = new Vector4(ctime / 20, ctime, ctime * 2, ctime * 3);
    unblenditems.concat(blenditems).forEach(function (renderable) {
        //绘制
        var renderAtomic = renderable.renderAtomic;
        for (var key in uniforms) {
            renderAtomic.uniforms[key] = uniforms[key];
        }
        //
        renderAtomic.uniforms.u_mvMatrix = function () {
            return lazy.getvalue(renderAtomic.uniforms.u_modelMatrix).clone().append(lazy.getvalue(renderAtomic.uniforms.u_viewMatrix));
        };
        renderAtomic.uniforms.u_ITMVMatrix = function () {
            return lazy.getvalue(renderAtomic.uniforms.u_mvMatrix).clone().invert().transpose();
        };
        renderAtomic.shaderMacro.RotationOrder = defaultRotationOrder;
        renderable.beforeRender(renderAtomic, scene, camera);
        gl.render(renderAtomic);
    });
};
/**
 * 前向渲染器
 */
var forwardRenderer = new ForwardRenderer();

/**
 * 轮廓渲染器
 */
var OutlineRenderer = function OutlineRenderer () {};

OutlineRenderer.prototype.init = function init () {
    if (!this.renderAtomic) {
        this.renderAtomic = new RenderAtomic();
        var renderParams = this.renderAtomic.renderParams;
        renderParams.enableBlend = false;
        renderParams.cullFace = CullFace.FRONT;
        this.renderAtomic.shader = new Shader("outline");
    }
};
OutlineRenderer.prototype.draw = function draw (gl, scene, camera) {
    var unblenditems = scene.getPickCache(camera).unblenditems;
    this.init();
    for (var i = 0; i < unblenditems.length; i++) {
        var renderable = unblenditems[i];
        if (renderable.getComponent(OutLineComponent) || renderable.getComponent(CartoonComponent)) {
            var renderAtomic = renderable.renderAtomic;
            renderable.beforeRender(renderAtomic, scene, camera);
            this.renderAtomic.next = renderAtomic;
            gl.render(this.renderAtomic);
        }
    }
};
/**
 * 轮廓渲染器
 */
var outlineRenderer = new OutlineRenderer();

var ShadowRenderer = function ShadowRenderer() {
    this.renderAtomic = new RenderAtomic();
};
/**
 * 渲染
 */
ShadowRenderer.prototype.draw = function draw (gl, scene, camera) {
    var pointLights = scene.activePointLights.filter(function (i) { return i.shadowType != ShadowType.No_Shadows; });
    for (var i = 0; i < pointLights.length; i++) {
        pointLights[i].updateDebugShadowMap(scene, camera);
        this.drawForPointLight(gl, pointLights[i], scene, camera);
    }
    var spotLights = scene.activeSpotLights.filter(function (i) { return i.shadowType != ShadowType.No_Shadows; });
    for (var i = 0; i < spotLights.length; i++) {
        spotLights[i].updateDebugShadowMap(scene, camera);
        this.drawForSpotLight(gl, spotLights[i], scene, camera);
    }
    var directionalLights = scene.activeDirectionalLights.filter(function (i) { return i.shadowType != ShadowType.No_Shadows; });
    for (var i = 0; i < directionalLights.length; i++) {
        directionalLights[i].updateDebugShadowMap(scene, camera);
        this.drawForDirectionalLight(gl, directionalLights[i], scene, camera);
    }
};
ShadowRenderer.prototype.drawForSpotLight = function drawForSpotLight (gl, light, scene, camera) {
        var this$1 = this;

    FrameBufferObject.active(gl, light.frameBufferObject);
    //
    gl.viewport(0, 0, light.frameBufferObject.OFFSCREEN_WIDTH, light.frameBufferObject.OFFSCREEN_HEIGHT);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var shadowCamera = light.shadowCamera;
    shadowCamera.node3d.localToWorldMatrix = light.node3d.localToWorldMatrix;
    var renderAtomic = this.renderAtomic;
    // 获取影响阴影图的渲染对象
    var models = scene.getModelsByCamera(shadowCamera);
    // 筛选投射阴影的渲染对象
    var castShadowsModels = models.filter(function (i) { return i.castShadows; });
    //
    renderAtomic.renderParams.useViewPort = true;
    renderAtomic.renderParams.viewPort = new Rectangle(0, 0, light.frameBufferObject.OFFSCREEN_WIDTH, light.frameBufferObject.OFFSCREEN_HEIGHT);
    //
    renderAtomic.uniforms.u_projectionMatrix = shadowCamera.lens.matrix;
    renderAtomic.uniforms.u_viewProjection = shadowCamera.viewProjection;
    renderAtomic.uniforms.u_viewMatrix = shadowCamera.node3d.worldToLocalMatrix;
    renderAtomic.uniforms.u_cameraMatrix = shadowCamera.node3d.localToWorldMatrix;
    renderAtomic.uniforms.u_cameraPos = shadowCamera.node3d.worldPosition;
    //
    renderAtomic.uniforms.u_lightType = light.lightType;
    renderAtomic.uniforms.u_lightPosition = light.position;
    renderAtomic.uniforms.u_shadowCameraNear = light.shadowCameraNear;
    renderAtomic.uniforms.u_shadowCameraFar = light.shadowCameraFar;
    castShadowsModels.forEach(function (renderable) {
        this$1.drawGameObject(gl, renderable, scene, camera);
    });
    light.frameBufferObject.deactive(gl);
};
ShadowRenderer.prototype.drawForPointLight = function drawForPointLight (gl, light, scene, camera) {
        var this$1 = this;

    FrameBufferObject.active(gl, light.frameBufferObject);
    //
    gl.viewport(0, 0, light.frameBufferObject.OFFSCREEN_WIDTH, light.frameBufferObject.OFFSCREEN_HEIGHT);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var vpWidth = light.shadowMapSize.x;
    var vpHeight = light.shadowMapSize.y;
    // These viewports map a cube-map onto a 2D texture with the
    // following orientation:
    //
    //  xzXZ
    //   y Y
    //
    // X - Positive x direction
    // x - Negative x direction
    // Y - Positive y direction
    // y - Negative y direction
    // Z - Positive z direction
    // z - Negative z direction
    // positive X
    cube2DViewPorts[0].init(vpWidth * 2, vpHeight, vpWidth, vpHeight);
    // negative X
    cube2DViewPorts[1].init(0, vpHeight, vpWidth, vpHeight);
    // positive Z
    cube2DViewPorts[2].init(vpWidth * 3, vpHeight, vpWidth, vpHeight);
    // negative Z
    cube2DViewPorts[3].init(vpWidth, vpHeight, vpWidth, vpHeight);
    // positive Y
    cube2DViewPorts[4].init(vpWidth * 3, 0, vpWidth, vpHeight);
    // negative Y
    cube2DViewPorts[5].init(vpWidth, 0, vpWidth, vpHeight);
    var shadowCamera = light.shadowCamera;
    shadowCamera.node3d.x = light.node3d.x;
    shadowCamera.node3d.y = light.node3d.y;
    shadowCamera.node3d.z = light.node3d.z;
    var renderAtomic = this.renderAtomic;
    for (var face = 0; face < 6; face++) {
        shadowCamera.node3d.lookAt(light.position.addTo(cubeDirections[face]), cubeUps[face]);
        // 获取影响阴影图的渲染对象
        var models = scene.getModelsByCamera(shadowCamera);
        // 筛选投射阴影的渲染对象
        var castShadowsModels = models.filter(function (i) { return i.castShadows; });
        //
        renderAtomic.renderParams.useViewPort = true;
        renderAtomic.renderParams.viewPort = cube2DViewPorts[face];
        //
        renderAtomic.uniforms.u_projectionMatrix = shadowCamera.lens.matrix;
        renderAtomic.uniforms.u_viewProjection = shadowCamera.viewProjection;
        renderAtomic.uniforms.u_viewMatrix = shadowCamera.node3d.worldToLocalMatrix;
        renderAtomic.uniforms.u_cameraMatrix = shadowCamera.node3d.localToWorldMatrix;
        renderAtomic.uniforms.u_cameraPos = shadowCamera.node3d.worldPosition;
        //
        renderAtomic.uniforms.u_lightType = light.lightType;
        renderAtomic.uniforms.u_lightPosition = light.position;
        renderAtomic.uniforms.u_shadowCameraNear = light.shadowCameraNear;
        renderAtomic.uniforms.u_shadowCameraFar = light.shadowCameraFar;
        castShadowsModels.forEach(function (renderable) {
            this$1.drawGameObject(gl, renderable, scene, camera);
        });
    }
    light.frameBufferObject.deactive(gl);
};
ShadowRenderer.prototype.drawForDirectionalLight = function drawForDirectionalLight (gl, light, scene, camera) {
        var this$1 = this;

    // 获取影响阴影图的渲染对象
    var models = scene.getPickByDirectionalLight(light);
    // 筛选投射阴影的渲染对象
    var castShadowsModels = models.filter(function (i) { return i.castShadows; });
    light.updateShadowByCamera(scene, camera, models);
    FrameBufferObject.active(gl, light.frameBufferObject);
    //
    gl.viewport(0, 0, light.frameBufferObject.OFFSCREEN_WIDTH, light.frameBufferObject.OFFSCREEN_HEIGHT);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var shadowCamera = light.shadowCamera;
    var renderAtomic = this.renderAtomic;
    //
    renderAtomic.renderParams.useViewPort = true;
    renderAtomic.renderParams.viewPort = new Rectangle(0, 0, light.frameBufferObject.OFFSCREEN_WIDTH, light.frameBufferObject.OFFSCREEN_HEIGHT);
    //
    renderAtomic.uniforms.u_projectionMatrix = shadowCamera.lens.matrix;
    renderAtomic.uniforms.u_viewProjection = shadowCamera.viewProjection;
    renderAtomic.uniforms.u_viewMatrix = shadowCamera.node3d.worldToLocalMatrix;
    renderAtomic.uniforms.u_cameraMatrix = shadowCamera.node3d.localToWorldMatrix;
    renderAtomic.uniforms.u_cameraPos = shadowCamera.node3d.worldPosition;
    //
    renderAtomic.uniforms.u_lightType = light.lightType;
    renderAtomic.uniforms.u_lightPosition = shadowCamera.node3d.worldPosition;
    renderAtomic.uniforms.u_shadowCameraNear = light.shadowCameraNear;
    renderAtomic.uniforms.u_shadowCameraFar = light.shadowCameraFar;
    //
    castShadowsModels.forEach(function (renderable) {
        this$1.drawGameObject(gl, renderable, scene, camera);
    });
    light.frameBufferObject.deactive(gl);
};
/**
 * 绘制3D对象
 */
ShadowRenderer.prototype.drawGameObject = function drawGameObject (gl, renderable, scene, camera) {
    var renderAtomic = renderable.renderAtomic;
    renderable.beforeRender(renderAtomic, scene, camera);
    renderAtomic.shadowShader = renderAtomic.shadowShader || new Shader("shadow");
    //
    this.renderAtomic.next = renderAtomic;
    this.renderAtomic.renderParams.cullFace = renderAtomic.renderParams.cullFace;
    // 使用shadowShader
    this.renderAtomic.shader = renderAtomic.shadowShader;
    gl.render(this.renderAtomic);
    this.renderAtomic.shader = null;
};
/**
 * 阴影图渲染器
 */
var shadowRenderer = new ShadowRenderer();
var cube2DViewPorts = [
    new Rectangle(), new Rectangle(), new Rectangle(),
    new Rectangle(), new Rectangle(), new Rectangle()
];
var cubeUps = [
    new Vector3(0, 1, 0), new Vector3(0, 1, 0), new Vector3(0, 1, 0),
    new Vector3(0, 1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1)
];
var cubeDirections = [
    new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 0, 1),
    new Vector3(0, 0, -1), new Vector3(0, 1, 0), new Vector3(0, -1, 0)
];

var WireframeRenderer = function WireframeRenderer () {};

WireframeRenderer.prototype.init = function init () {
    if (!this.renderAtomic) {
        this.renderAtomic = new RenderAtomic();
        var renderParams = this.renderAtomic.renderParams;
        renderParams.renderMode = RenderMode.LINES;
        // renderParams.depthMask = false;
    }
};
/**
 * 渲染
 */
WireframeRenderer.prototype.draw = function draw (gl, scene, camera) {
        var this$1 = this;

    var unblenditems = scene.getPickCache(camera).unblenditems;
    var wireframes = unblenditems.reduce(function (pv, cv) { var wireframe = cv.getComponent(WireframeComponent); if (wireframe)
        { pv.push({ wireframe: wireframe, renderable: cv }); } return pv; }, []);
    if (wireframes.length == 0)
        { return; }
    wireframes.forEach(function (element) {
        this$1.drawGameObject(gl, element.renderable, scene, camera, element.wireframe.color); //
    });
};
/**
 * 绘制3D对象
 */
WireframeRenderer.prototype.drawGameObject = function drawGameObject (gl, renderable, scene, camera, wireframeColor) {
        if ( wireframeColor === void 0 ) wireframeColor = new Color4();

    var renderAtomic = renderable.renderAtomic;
    renderable.beforeRender(renderAtomic, scene, camera);
    var renderMode = lazy.getvalue(renderAtomic.renderParams.renderMode);
    if (renderMode == RenderMode.POINTS
        || renderMode == RenderMode.LINES
        || renderMode == RenderMode.LINE_LOOP
        || renderMode == RenderMode.LINE_STRIP)
        { return; }
    this.init();
    var uniforms = this.renderAtomic.uniforms;
    //
    uniforms.u_projectionMatrix = camera.lens.matrix;
    uniforms.u_viewProjection = camera.viewProjection;
    uniforms.u_viewMatrix = camera.node3d.worldToLocalMatrix;
    uniforms.u_cameraMatrix = camera.node3d.localToWorldMatrix;
    uniforms.u_cameraPos = camera.node3d.worldPosition;
    uniforms.u_skyBoxSize = camera.lens.far / Math.sqrt(3);
    uniforms.u_scaleByDepth = camera.getScaleByDepth(1);
    //
    this.renderAtomic.next = renderAtomic;
    //
    var oldIndexBuffer = renderAtomic.indexBuffer;
    if (oldIndexBuffer.count < 3)
        { return; }
    if (!renderAtomic.wireframeindexBuffer || renderAtomic.wireframeindexBuffer.count != 2 * oldIndexBuffer.count) {
        var wireframeindices = [];
        var indices = lazy.getvalue(oldIndexBuffer.indices);
        for (var i = 0; i < indices.length; i += 3) {
            wireframeindices.push(indices[i], indices[i + 1], indices[i], indices[i + 2], indices[i + 1], indices[i + 2]);
        }
        renderAtomic.wireframeindexBuffer = new Index();
        renderAtomic.wireframeindexBuffer.indices = wireframeindices;
    }
    renderAtomic.wireframeShader = renderAtomic.wireframeShader || new Shader("wireframe");
    this.renderAtomic.indexBuffer = renderAtomic.wireframeindexBuffer;
    this.renderAtomic.uniforms.u_wireframeColor = wireframeColor;
    //
    this.renderAtomic.shader = renderAtomic.wireframeShader;
    gl.render(this.renderAtomic);
    this.renderAtomic.shader = null;
    //
};
/**
 * 线框渲染器
 */
var wireframeRenderer = new WireframeRenderer();

/**
 * 点光源
 */
var PointLight = /*@__PURE__*/(function (Light) {
    function PointLight() {
        Light.call(this);
        this.lightType = LightType.Point;
        this._range = 10;
        this.shadowCamera.lens = new PerspectiveLens(90, 1, 0.1, this.range);
    }

    if ( Light ) PointLight.__proto__ = Light;
    PointLight.prototype = Object.create( Light && Light.prototype );
    PointLight.prototype.constructor = PointLight;

    var prototypeAccessors = { range: { configurable: true },shadowMapSize: { configurable: true } };
    /**
     * 光照范围
     */
    prototypeAccessors.range.get = function () {
        return this._range;
    };
    prototypeAccessors.range.set = function (v) {
        if (this._range == v)
            { return; }
        this._range = v;
        this.invalidRange();
    };
    /**
     * 阴影图尺寸
     */
    prototypeAccessors.shadowMapSize.get = function () {
        return this.shadowMap.getSize().multiply(new Vector2(1 / 4, 1 / 2));
    };
    PointLight.prototype.invalidRange = function invalidRange () {
        if (this.shadowCamera)
            { this.shadowCamera.lens.far = this.range; }
    };

    Object.defineProperties( PointLight.prototype, prototypeAccessors );

    return PointLight;
}(Light));
__decorate([
    oav(),
    serialize
], PointLight.prototype, "range", null);
PointLight = __decorate([
    AddComponentMenu("Rendering/PointLight"),
    RegisterComponent()
], PointLight);
Entity.registerPrimitive("Point light", function (g) {
    g.addComponent(PointLight);
});

/**
 * 聚光灯光源
 */
var SpotLight = /*@__PURE__*/(function (Light) {
    function SpotLight() {
        Light.call(this);
        this.lightType = LightType.Spot;
        /**
         * 光照范围
         */
        this.range = 10;
        /**
         *
         */
        this.angle = 60;
        /**
         * 半影.
         */
        this.penumbra = 0;
        this.perspectiveLens = this.shadowCamera.lens = new PerspectiveLens(this.angle, 1, 0.1, this.range);
    }

    if ( Light ) SpotLight.__proto__ = Light;
    SpotLight.prototype = Object.create( Light && Light.prototype );
    SpotLight.prototype.constructor = SpotLight;

    var prototypeAccessors = { coneCos: { configurable: true },penumbraCos: { configurable: true } };
    /**
     * 椎体cos值
     */
    prototypeAccessors.coneCos.get = function () {
        return Math.cos(this.angle * 0.5 * mathUtil.DEG2RAD);
    };
    prototypeAccessors.penumbraCos.get = function () {
        return Math.cos(this.angle * 0.5 * mathUtil.DEG2RAD * (1 - this.penumbra));
    };
    SpotLight.prototype._invalidRange = function _invalidRange () {
        if (this.shadowCamera)
            { this.shadowCamera.lens.far = this.range; }
    };
    SpotLight.prototype._invalidAngle = function _invalidAngle () {
        if (this.perspectiveLens)
            { this.perspectiveLens.fov = this.angle; }
    };

    Object.defineProperties( SpotLight.prototype, prototypeAccessors );

    return SpotLight;
}(Light));
__decorate([
    oav(),
    serialize,
    watch("_invalidRange")
], SpotLight.prototype, "range", void 0);
__decorate([
    oav(),
    serialize,
    watch("_invalidAngle")
], SpotLight.prototype, "angle", void 0);
__decorate([
    oav(),
    serialize
], SpotLight.prototype, "penumbra", void 0);
SpotLight = __decorate([
    RegisterComponent()
], SpotLight);
Entity.registerPrimitive("Spot light", function (g) {
    g.addComponent(SpotLight);
});

/**
 * 天空盒组件
 */
var SkyBox = /*@__PURE__*/(function (Component3D) {
    function SkyBox() {
        Component3D.apply(this, arguments);
        this.s_skyboxTexture = TextureCube.default;
    }

    if ( Component3D ) SkyBox.__proto__ = Component3D;
    SkyBox.prototype = Object.create( Component3D && Component3D.prototype );
    SkyBox.prototype.constructor = SkyBox;
    SkyBox.prototype.beforeRender = function beforeRender (renderAtomic, scene, camera) {
        var this$1 = this;

        renderAtomic.uniforms.s_skyboxTexture = function () { return this$1.s_skyboxTexture; };
    };

    return SkyBox;
}(Component3D));
__decorate([
    serialize,
    oav({ component: "OAVPick", componentParam: { accepttype: "texturecube", datatype: "texturecube" } })
], SkyBox.prototype, "s_skyboxTexture", void 0);
SkyBox = __decorate([
    AddComponentMenu("SkyBox/SkyBox"),
    RegisterComponent()
], SkyBox);

/**
 * 场景拾取缓存
 */
var ScenePickCache = function ScenePickCache(scene, camera) {
    this.scene = scene;
    this.camera = camera;
};

var prototypeAccessors$7 = { activeModels: { configurable: true },blenditems: { configurable: true },unblenditems: { configurable: true } };
/**
 * 获取需要渲染的对象
 *
 * #### 渲染需求条件
 * 1. visible == true
 * 1. 在摄像机视锥内
 * 1. model.enabled == true
 *
 * @param gameObject
 * @param camera
 */
prototypeAccessors$7.activeModels.get = function () {
    if (this._activeModels)
        { return this._activeModels; }
    var models = this._activeModels = [];
    var frustum = this.camera.frustum;
    var node3ds = [this.scene.node3d];
    while (node3ds.length > 0) {
        var node3d = node3ds.pop();
        if (!node3d.visible)
            { continue; }
        var model = node3d.getComponent(Renderable);
        if (model && model.enabled) {
            if (model.selfWorldBounds) {
                if (frustum.intersectsBox(model.selfWorldBounds))
                    { models.push(model); }
            }
        }
        node3ds = node3ds.concat(node3d.children);
    }
    return models;
};
/**
 * 半透明渲染对象
 */
prototypeAccessors$7.blenditems.get = function () {
    if (this._blenditems)
        { return this._blenditems; }
    var models = this.activeModels;
    var camerapos = this.camera.node3d.worldPosition;
    var blenditems = this._blenditems = models.filter(function (item) {
        return item.material.renderParams.enableBlend;
    }).sort(function (b, a) { return a.node3d.worldPosition.subTo(camerapos).lengthSquared - b.node3d.worldPosition.subTo(camerapos).lengthSquared; });
    return blenditems;
};
/**
 * 半透明渲染对象
 */
prototypeAccessors$7.unblenditems.get = function () {
    if (this._unblenditems)
        { return this._unblenditems; }
    var models = this.activeModels;
    var camerapos = this.camera.node3d.worldPosition;
    var unblenditems = this._unblenditems = models.filter(function (item) {
        return !item.material.renderParams.enableBlend;
    }).sort(function (a, b) { return a.node3d.worldPosition.subTo(camerapos).lengthSquared - b.node3d.worldPosition.subTo(camerapos).lengthSquared; });
    return unblenditems;
};
ScenePickCache.prototype.clear = function clear () {
    this._blenditems = null;
    this._unblenditems = null;
    this._activeModels = null;
};

Object.defineProperties( ScenePickCache.prototype, prototypeAccessors$7 );

/**
 * 3D场景
 */
var Scene = /*@__PURE__*/(function (Component3D) {
    function Scene() {
        Component3D.apply(this, arguments);
        /**
         * 背景颜色
         */
        this.background = new Color4(0, 0, 0, 1);
        /**
         * 环境光强度
         */
        this.ambientColor = new Color4();
        /**
         * 指定所运行环境
         *
         * 控制运行符合指定环境场景中所有 Behaviour.update 方法
         *
         * 用于处理某些脚本只在在feng3d引擎或者编辑器中运行的问题。例如 FPSController 默认只在feng3d中运行，在编辑器模式下不会运行。
         */
        this.runEnvironment = RunEnvironment.feng3d;
        this._pickMap = new Map();
    }

    if ( Component3D ) Scene.__proto__ = Component3D;
    Scene.prototype = Object.create( Component3D && Component3D.prototype );
    Scene.prototype.constructor = Scene;

    var prototypeAccessors = { models: { configurable: true },visibleAndEnabledModels: { configurable: true },skyBoxs: { configurable: true },activeSkyBoxs: { configurable: true },directionalLights: { configurable: true },activeDirectionalLights: { configurable: true },pointLights: { configurable: true },activePointLights: { configurable: true },spotLights: { configurable: true },activeSpotLights: { configurable: true },animations: { configurable: true },activeAnimations: { configurable: true },behaviours: { configurable: true },activeBehaviours: { configurable: true },mouseCheckObjects: { configurable: true } };
    Scene.prototype.init = function init () {
        Component3D.prototype.init.call(this);
        this.entity.hideFlags = this.entity.hideFlags | HideFlags.Hide;
        this.entity.hideFlags = this.entity.hideFlags | HideFlags.DontTransform;
        //
        this.node3d._setScene(this);
    };
    Scene.prototype.update = function update (interval) {
        var this$1 = this;

        interval = interval || (1000 / ticker.frameRate);
        this._mouseCheckTransforms = null;
        this._models = null;
        this._visibleAndEnabledModels = null;
        this._skyBoxs = null;
        this._activeSkyBoxs = null;
        this._directionalLights = null;
        this._activeDirectionalLights = null;
        this._pointLights = null;
        this._activePointLights = null;
        this._spotLights = null;
        this._activeSpotLights = null;
        this._animations = null;
        this._activeAnimations = null;
        this._behaviours = null;
        this._activeBehaviours = null;
        // 每帧清理拾取缓存
        this._pickMap.forEach(function (item) { return item.clear(); });
        this.behaviours.forEach(function (element) {
            if (element.isVisibleAndEnabled && Boolean(this$1.runEnvironment & element.runEnvironment))
                { element.update(interval); }
        });
    };
    /**
     * 所有 Model
     */
    prototypeAccessors.models.get = function () {
        this._models = this._models || this.node3d.getComponentsInChildren(Renderable);
        return this._models;
    };
    /**
     * 所有 可见且开启的 Model
     */
    prototypeAccessors.visibleAndEnabledModels.get = function () {
        return this._visibleAndEnabledModels = this._visibleAndEnabledModels || this.models.filter(function (i) { return i.isVisibleAndEnabled; });
    };
    /**
     * 所有 SkyBox
     */
    prototypeAccessors.skyBoxs.get = function () {
        this._skyBoxs = this._skyBoxs || this.node3d.getComponentsInChildren(SkyBox);
        return this._skyBoxs;
    };
    prototypeAccessors.activeSkyBoxs.get = function () {
        return this._activeSkyBoxs = this._activeSkyBoxs || this.skyBoxs.filter(function (i) { return i.node3d.globalVisible; });
    };
    prototypeAccessors.directionalLights.get = function () {
        return this._directionalLights = this._directionalLights || this.node3d.getComponentsInChildren(DirectionalLight);
    };
    prototypeAccessors.activeDirectionalLights.get = function () {
        return this._activeDirectionalLights = this._activeDirectionalLights || this.directionalLights.filter(function (i) { return i.isVisibleAndEnabled; });
    };
    prototypeAccessors.pointLights.get = function () {
        return this._pointLights = this._pointLights || this.node3d.getComponentsInChildren(PointLight);
    };
    prototypeAccessors.activePointLights.get = function () {
        return this._activePointLights = this._activePointLights || this.pointLights.filter(function (i) { return i.isVisibleAndEnabled; });
    };
    prototypeAccessors.spotLights.get = function () {
        return this._spotLights = this._spotLights || this.node3d.getComponentsInChildren(SpotLight);
    };
    prototypeAccessors.activeSpotLights.get = function () {
        return this._activeSpotLights = this._activeSpotLights || this.spotLights.filter(function (i) { return i.isVisibleAndEnabled; });
    };
    prototypeAccessors.animations.get = function () {
        return this._animations = this._animations || this.node3d.getComponentsInChildren(Animation);
    };
    prototypeAccessors.activeAnimations.get = function () {
        return this._activeAnimations = this._activeAnimations || this.animations.filter(function (i) { return i.isVisibleAndEnabled; });
    };
    prototypeAccessors.behaviours.get = function () {
        this._behaviours = this._behaviours || this.node3d.getComponentsInChildren(Behaviour);
        return this._behaviours;
    };
    prototypeAccessors.activeBehaviours.get = function () {
        return this._activeBehaviours = this._activeBehaviours || this.behaviours.filter(function (i) { return i.isVisibleAndEnabled; });
    };
    prototypeAccessors.mouseCheckObjects.get = function () {
        if (this._mouseCheckTransforms)
            { return this._mouseCheckTransforms; }
        var checkList = this.node3d.getChildren();
        this._mouseCheckTransforms = [];
        var i = 0;
        //获取所有需要拾取的对象并分层存储
        while (i < checkList.length) {
            var checkObject = checkList[i++];
            if (checkObject.mouseEnabled) {
                if (checkObject.getComponents(Renderable)) {
                    this._mouseCheckTransforms.push(checkObject);
                }
                checkList = checkList.concat(checkObject.getChildren());
            }
        }
        return this._mouseCheckTransforms;
    };
    /**
     * 获取拾取缓存
     * @param camera
     */
    Scene.prototype.getPickCache = function getPickCache (camera) {
        if (this._pickMap.get(camera))
            { return this._pickMap.get(camera); }
        var pick = new ScenePickCache(this, camera);
        this._pickMap.set(camera, pick);
        return pick;
    };
    /**
     * 获取接收光照渲染对象列表
     * @param light
     */
    Scene.prototype.getPickByDirectionalLight = function getPickByDirectionalLight (light) {
        var openlist = [this.node3d];
        var targets = [];
        while (openlist.length > 0) {
            var item = openlist.shift();
            if (!item.visible)
                { continue; }
            var model = item.getComponent(Renderable);
            if (model && (model.castShadows || model.receiveShadows)
                && !model.material.renderParams.enableBlend
                && model.material.renderParams.renderMode == RenderMode.TRIANGLES) {
                targets.push(model);
            }
            item.children.forEach(function (element) {
                openlist.push(element);
            });
        }
        return targets;
    };
    /**
     * 获取 可被摄像机看见的 Model 列表
     * @param camera
     */
    Scene.prototype.getModelsByCamera = function getModelsByCamera (camera) {
        var frustum = camera.frustum;
        var results = this.visibleAndEnabledModels.filter(function (i) {
            var model = i.getComponent(Renderable);
            if (model.selfWorldBounds) {
                if (frustum.intersectsBox(model.selfWorldBounds))
                    { return true; }
            }
            return false;
        });
        return results;
    };

    Object.defineProperties( Scene.prototype, prototypeAccessors );

    return Scene;
}(Component3D));
__decorate([
    serialize,
    oav()
], Scene.prototype, "background", void 0);
__decorate([
    serialize,
    oav()
], Scene.prototype, "ambientColor", void 0);
Scene = __decorate([
    RegisterComponent({ single: true })
], Scene);

/**
 * 天空盒渲染器
 */
var SkyBoxRenderer = function SkyBoxRenderer () {};

SkyBoxRenderer.prototype.init = function init () {
    if (!this.renderAtomic) {
        var renderAtomic = this.renderAtomic = new RenderAtomic();
        //八个顶点，32个number
        var vertexPositionData = [
            -1, 1, -1,
            1, 1, -1,
            1, 1, 1,
            -1, 1, 1,
            -1, -1, -1,
            1, -1, -1,
            1, -1, 1,
            -1, -1, 1 //
        ];
        renderAtomic.attributes.a_position = new Attribute("a_position", vertexPositionData, 3);
        //6个面，12个三角形，36个顶点索引
        var indices = [
            0, 1, 2, 2, 3, 0,
            6, 5, 4, 4, 7, 6,
            2, 6, 7, 7, 3, 2,
            4, 5, 1, 1, 0, 4,
            4, 0, 3, 3, 7, 4,
            2, 1, 5, 5, 6, 2 //
        ];
        renderAtomic.indexBuffer = new Index();
        renderAtomic.indexBuffer.indices = indices;
        //
        var renderParams = renderAtomic.renderParams;
        renderParams.cullFace = CullFace.NONE;
        //
        renderAtomic.shader = new Shader("skybox");
    }
};
/**
 * 绘制场景中天空盒
 * @param gl
 * @param scene 场景
 * @param camera 摄像机
 */
SkyBoxRenderer.prototype.draw = function draw (gl, scene, camera) {
    var skybox = scene.activeSkyBoxs[0];
    this.drawSkyBox(gl, skybox, scene, camera);
};
/**
 * 绘制天空盒
 * @param gl
 * @param skybox 天空盒
 * @param camera 摄像机
 */
SkyBoxRenderer.prototype.drawSkyBox = function drawSkyBox (gl, skybox, scene, camera) {
    if (!skybox)
        { return; }
    this.init();
    //
    skybox.beforeRender(this.renderAtomic, scene, camera);
    //
    this.renderAtomic.uniforms.u_viewProjection = camera.viewProjection;
    this.renderAtomic.uniforms.u_viewMatrix = camera.node3d.worldToLocalMatrix;
    this.renderAtomic.uniforms.u_cameraMatrix = camera.node3d.localToWorldMatrix;
    this.renderAtomic.uniforms.u_cameraPos = camera.node3d.worldPosition;
    this.renderAtomic.uniforms.u_skyBoxSize = camera.lens.far / Math.sqrt(3);
    gl.render(this.renderAtomic);
};
/**
 * 天空盒渲染器
 */
var skyboxRenderer = new SkyBoxRenderer();

/**
 * 视图
 */
var View = /*@__PURE__*/(function (Feng3dObject) {
    function View(canvas, scene, camera, contextAttributes) {
        var this$1 = this;

        Feng3dObject.call(this);
        this._contextAttributes = { stencil: true };
        this._mousePos = new Vector2();
        this._viewRect = new Rectangle();
        this.contextLost = false;
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "glcanvas";
            canvas.style.position = "fixed";
            canvas.style.left = "0px";
            canvas.style.top = "0px";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            document.body.appendChild(canvas);
        }
        console.assert(canvas instanceof HTMLCanvasElement, "canvas参数必须为 HTMLCanvasElement 类型！");
        this.canvas = canvas;
        if (contextAttributes) {
            Object.assign(this._contextAttributes, contextAttributes);
        }
        canvas.addEventListener("webglcontextlost", function (event) {
            event.preventDefault();
            this$1.contextLost = true;
            console.log('GraphicsDevice: WebGL context lost.');
        }, false);
        canvas.addEventListener("webglcontextrestored", function () {
            this$1.contextLost = false;
            console.log('GraphicsDevice: WebGL context restored.');
        }, false);
        this.scene = scene || serialization.setValue(new Entity(), { name: "scene" }).addComponent(Scene);
        this.camera = camera;
        this.start();
        this.mouse3DManager = new Mouse3DManager(new WindowMouseInput(), function () { return this$1.viewRect; });
    }

    if ( Feng3dObject ) View.__proto__ = Feng3dObject;
    View.prototype = Object.create( Feng3dObject && Feng3dObject.prototype );
    View.prototype.constructor = View;

    var prototypeAccessors = { camera: { configurable: true },root: { configurable: true },gl: { configurable: true },mousePos: { configurable: true },viewRect: { configurable: true },mouseRay3D: { configurable: true } };
    /**
     * 摄像机
     */
    prototypeAccessors.camera.get = function () {
        if (!this._camera) {
            var cameras = this.scene.getComponentsInChildren(Camera);
            if (cameras.length == 0) {
                this._camera = serialization.setValue(new Entity(), { name: "defaultCamera" }).addComponent(Camera);
                this.scene.node3d.addChild(this._camera.node3d);
            }
            else {
                this._camera = cameras[0];
            }
        }
        return this._camera;
    };
    prototypeAccessors.camera.set = function (v) {
        this._camera = v;
    };
    /**
     * 根结点
     */
    prototypeAccessors.root.get = function () {
        return this.scene.node3d;
    };
    prototypeAccessors.gl.get = function () {
        if (!this.canvas.gl)
            { this.canvas.gl = GL.getGL(this.canvas, this._contextAttributes); }
        return this.canvas.gl;
    };
    /**
     * 鼠标在3D视图中的位置
     */
    prototypeAccessors.mousePos.get = function () {
        var clientRect = this.canvas.getBoundingClientRect();
        this._mousePos.x = windowEventProxy.clientX - clientRect.left;
        this._mousePos.y = windowEventProxy.clientY - clientRect.top;
        return this._mousePos;
    };
    /**
     * 视窗区域
     */
    prototypeAccessors.viewRect.get = function () {
        var clientRect = this.canvas.getBoundingClientRect();
        this._viewRect.x = clientRect.left;
        this._viewRect.y = clientRect.top;
        this._viewRect.width = clientRect.width;
        this._viewRect.height = clientRect.height;
        return this._viewRect;
    };
    /**
     * 获取鼠标射线（与鼠标重叠的摄像机射线）
     */
    prototypeAccessors.mouseRay3D.get = function () {
        var gpuPos = this.screenToGpuPosition(this.mousePos);
        this._mouseRay3D = this.camera.getRay3D(gpuPos.x, gpuPos.y);
        return this._mouseRay3D;
    };
    /**
     * 修改canvas尺寸
     * @param width 宽度
     * @param height 高度
     */
    View.prototype.setSize = function setSize (width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
    };
    View.prototype.start = function start () {
        ticker.onframe(this.update, this);
    };
    View.prototype.stop = function stop () {
        ticker.offframe(this.update, this);
    };
    View.prototype.update = function update (interval) {
        this.render(interval);
        this.mouse3DManager.selectedTransform = this.selectedTransform;
    };
    /**
     * 绘制场景
     */
    View.prototype.render = function render (interval) {
        if (!this.scene)
            { return; }
        if (this.contextLost)
            { return; }
        this.scene.update(interval);
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        if (this.canvas.width * this.canvas.height == 0)
            { return; }
        this.camera.lens.aspect = this.viewRect.width / this.viewRect.height;
        this.scene.mouseRay3D = this.mouseRay3D;
        // 默认渲染
        this.gl.colorMask(true, true, true, true);
        this.gl.clearColor(this.scene.background.r, this.scene.background.g, this.scene.background.b, this.scene.background.a);
        this.gl.clearStencil(0);
        this.gl.clearDepth(1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
        // 鼠标拾取渲染
        this.selectedTransform = this.mouse3DManager.pick(this, this.scene, this.camera);
        //绘制阴影图
        shadowRenderer.draw(this.gl, this.scene, this.camera);
        skyboxRenderer.draw(this.gl, this.scene, this.camera);
        // 默认渲染
        forwardRenderer.draw(this.gl, this.scene, this.camera);
        outlineRenderer.draw(this.gl, this.scene, this.camera);
        wireframeRenderer.draw(this.gl, this.scene, this.camera);
    };
    /**
     * 屏幕坐标转GPU坐标
     * @param screenPos 屏幕坐标 (x: [0-width], y: [0 - height])
     * @return GPU坐标 (x: [-1, 1], y: [-1, 1])
     */
    View.prototype.screenToGpuPosition = function screenToGpuPosition (screenPos) {
        var gpuPos = new Vector2();
        gpuPos.x = (screenPos.x * 2 - this.viewRect.width) / this.viewRect.width;
        // 屏幕坐标与gpu中使用的坐标Y轴方向相反
        gpuPos.y = -(screenPos.y * 2 - this.viewRect.height) / this.viewRect.height;
        return gpuPos;
    };
    /**
     * 投影坐标（世界坐标转换为3D视图坐标）
     * @param point3d 世界坐标
     * @return 屏幕的绝对坐标
     */
    View.prototype.project = function project (point3d) {
        var v = this.camera.project(point3d);
        v.x = (v.x + 1.0) * this.viewRect.width / 2.0;
        v.y = (1.0 - v.y) * this.viewRect.height / 2.0;
        return v;
    };
    /**
     * 屏幕坐标投影到场景坐标
     * @param nX 屏幕坐标X ([0-width])
     * @param nY 屏幕坐标Y ([0-height])
     * @param sZ 到屏幕的距离
     * @param v 场景坐标（输出）
     * @return 场景坐标
     */
    View.prototype.unproject = function unproject (sX, sY, sZ, v) {
        if ( v === void 0 ) v = new Vector3();

        var gpuPos = this.screenToGpuPosition(new Vector2(sX, sY));
        return this.camera.unproject(gpuPos.x, gpuPos.y, sZ, v);
    };
    /**
     * 获取单位像素在指定深度映射的大小
     * @param   depth   深度
     */
    View.prototype.getScaleByDepth = function getScaleByDepth (depth, dir) {
        if ( dir === void 0 ) dir = new Vector2(0, 1);

        var scale = this.camera.getScaleByDepth(depth, dir);
        scale = scale / new Vector2(this.viewRect.width * dir.x, this.viewRect.height * dir.y).length;
        return scale;
    };
    /**
     * 获取屏幕区域内所有实体
     * @param start 起点
     * @param end 终点
     */
    View.prototype.getObjectsInGlobalArea = function getObjectsInGlobalArea (start, end) {
        var this$1 = this;

        var s = this.viewRect.clampPoint(start);
        var e = this.viewRect.clampPoint(end);
        s.sub(this.viewRect.topLeft);
        e.sub(this.viewRect.topLeft);
        var min = s.clone().min(e);
        var max = s.clone().max(e);
        var rect = new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);
        //
        var transforms = this.scene.getComponentsInChildren(Node3D).filter(function (t) {
            if (t == this$1.scene.node3d)
                { return false; }
            var m = t.getComponent(Renderable);
            if (m) {
                var include = m.selfWorldBounds.toPoints().every(function (pos) {
                    var p = this$1.project(pos);
                    return rect.contains(p.x, p.y);
                });
                return include;
            }
            var p = this$1.project(t.worldPosition);
            return rect.contains(p.x, p.y);
        });
        return transforms;
    };
    View.createNewScene = function createNewScene () {
        var scene = serialization.setValue(new Entity(), { name: "Untitled" }).addComponent(Scene);
        scene.background.setTo(0.2784, 0.2784, 0.2784);
        scene.ambientColor.setTo(0.4, 0.4, 0.4);
        var camera = Camera.create("Main Camera");
        camera.entity.addComponent(AudioListener);
        camera.node3d.x = 0;
        camera.node3d.y = 1;
        camera.node3d.z = -10;
        scene.node3d.addChild(camera.node3d);
        var directionalLight = DirectionalLight.create("DirectionalLight");
        directionalLight.shadowType = ShadowType.Hard_Shadows;
        directionalLight.node3d.rx = 50;
        directionalLight.node3d.ry = -30;
        directionalLight.node3d.y = 3;
        scene.node3d.addChild(directionalLight.node3d);
        return scene;
    };

    Object.defineProperties( View.prototype, prototypeAccessors );

    return View;
}(Feng3dObject));
// var viewRect0 = { x: 0, y: 0, w: 400, h: 300 ;}

var CustomGeometry = /*@__PURE__*/(function (Geometry) {
    function CustomGeometry () {
        Geometry.apply(this, arguments);
    }

    if ( Geometry ) CustomGeometry.__proto__ = Geometry;
    CustomGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    CustomGeometry.prototype.constructor = CustomGeometry;

    var prototypeAccessors = { indices: { configurable: true },attributes: { configurable: true } };

    prototypeAccessors.indices.get = function () {
        this.updateGrometry();
        return this._indexBuffer.indices;
    };
    /**
     * 属性数据列表
     */
    prototypeAccessors.attributes.get = function () {
        return this._attributes;
    };
    prototypeAccessors.attributes.set = function (v) {
        this._attributes = v;
    };

    Object.defineProperties( CustomGeometry.prototype, prototypeAccessors );

    return CustomGeometry;
}(Geometry));
__decorate([
    serialize
], CustomGeometry.prototype, "indices", null);
__decorate([
    serialize
], CustomGeometry.prototype, "attributes", null);

/**
 * 点几何体
 */
var PointGeometry = /*@__PURE__*/(function (Geometry) {
    function PointGeometry() {
        Geometry.apply(this, arguments);
        /**
         * 点数据列表
         * 修改数组内数据时需要手动调用 invalidateGeometry();
         */
        this.points = [];
    }

    if ( Geometry ) PointGeometry.__proto__ = Geometry;
    PointGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    PointGeometry.prototype.constructor = PointGeometry;
    /**
     * 构建几何体
     */
    PointGeometry.prototype.buildGeometry = function buildGeometry () {
        var numPoints = this.points.length;
        var indices = [];
        var positionData = [];
        var normalData = [];
        var uvData = [];
        var colors = [];
        numPoints = Math.max(1, numPoints);
        for (var i = 0; i < numPoints; i++) {
            var element = this.points[i];
            var position = (element && element.position) || Vector3.ZERO;
            var color = (element && element.color) || Color4.WHITE;
            var normal = (element && element.normal) || Vector3.ZERO;
            var uv = (element && element.uv) || Vector2.ZERO;
            indices[i] = i;
            positionData.push(position.x, position.y, position.z);
            normalData.push(normal.x, normal.y, normal.z);
            uvData.push(uv.x, uv.y);
            colors.push(color.r, color.g, color.b, color.a);
        }
        this.positions = positionData;
        this.uvs = uvData;
        this.normals = normalData;
        this.indices = indices;
        this.colors = colors;
    };

    return PointGeometry;
}(Geometry));
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], PointGeometry.prototype, "points", void 0);

/**
 * 线段组件
 */
var SegmentGeometry = /*@__PURE__*/(function (Geometry) {
    function SegmentGeometry() {
        Geometry.call(this);
        this._name = "Segment";
        /**
         * 线段列表
         * 修改数组内数据时需要手动调用 invalidateGeometry();
         */
        this.segments = [];
    }

    if ( Geometry ) SegmentGeometry.__proto__ = Geometry;
    SegmentGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    SegmentGeometry.prototype.constructor = SegmentGeometry;
    /**
     * 添加线段
     *
     * @param segment 线段
     */
    SegmentGeometry.prototype.addSegment = function addSegment (segment) {
        var s = new Segment();
        serialization.setValue(s, segment);
        this.segments.push(s);
        this.invalidateGeometry();
    };
    /**
     * 更新几何体
     */
    SegmentGeometry.prototype.buildGeometry = function buildGeometry () {
        var numSegments = this.segments.length;
        var indices = [];
        var positionData = [];
        var colorData = [];
        for (var i = 0; i < numSegments; i++) {
            var element = this.segments[i];
            var start = element.start || Vector3.ZERO;
            var end = element.end || Vector3.ZERO;
            ;
            var startColor = element.startColor || Color4.WHITE;
            var endColor = element.endColor || Color4.WHITE;
            indices.push(i * 2, i * 2 + 1);
            positionData.push(start.x, start.y, start.z, end.x, end.y, end.z);
            colorData.push(startColor.r, startColor.g, startColor.b, startColor.a, endColor.r, endColor.g, endColor.b, endColor.a);
        }
        this.positions = positionData;
        this.colors = colorData;
        this.indices = indices;
    };

    return SegmentGeometry;
}(Geometry));
__decorate([
    serialize,
    oav({ component: "OAVArray", tooltip: "在指定时间进行额外发射指定数量的粒子", componentParam: { defaultItem: function () { return new Segment(); } } }),
    watch("invalidateGeometry")
], SegmentGeometry.prototype, "segments", void 0);
/**
 * 线段
 */
var Segment = function Segment() {
    /**
     * 起点坐标
     */
    this.start = new Vector3();
    /**
     * 终点坐标
     */
    this.end = new Vector3();
    /**
     * 起点颜色
     */
    this.startColor = new Color4();
    /**
     * 终点颜色
     */
    this.endColor = new Color4();
};
__decorate([
    serialize,
    oav({ tooltip: "起点坐标" })
], Segment.prototype, "start", void 0);
__decorate([
    serialize,
    oav({ tooltip: "终点坐标" })
], Segment.prototype, "end", void 0);
__decorate([
    serialize,
    oav({ tooltip: "起点颜色" })
], Segment.prototype, "startColor", void 0);
__decorate([
    serialize,
    oav({ tooltip: "终点颜色" })
], Segment.prototype, "endColor", void 0);
Entity.registerPrimitive("Segment", function (g) {
    var model = g.addComponent(MeshRenderer);
    model.geometry = new SegmentGeometry();
    model.material = Material.getDefault("Segment-Material");
});

var ColorUniforms = function ColorUniforms() {
    /**
     * 颜色
     */
    this.u_diffuseInput = new Color4();
};
__decorate([
    serialize,
    oav()
], ColorUniforms.prototype, "u_diffuseInput", void 0);
shaderlib.shaderConfig.shaders["color"].cls = ColorUniforms;

var PointUniforms = function PointUniforms() {
    /**
     * 颜色
     */
    this.u_color = new Color4();
    /**
     * 点绘制时点的尺寸
     */
    this.u_PointSize = 1;
};
__decorate([
    serialize,
    oav()
], PointUniforms.prototype, "u_color", void 0);
__decorate([
    serialize,
    oav()
], PointUniforms.prototype, "u_PointSize", void 0);
shaderlib.shaderConfig.shaders["point"].cls = PointUniforms;

/**
 * 线段材质
 * 目前webgl不支持修改线条宽度，参考：https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth
 */
var SegmentUniforms = function SegmentUniforms() {
    /**
     * 颜色
     */
    this.u_segmentColor = new Color4();
};
__decorate([
    serialize,
    oav()
], SegmentUniforms.prototype, "u_segmentColor", void 0);
shaderlib.shaderConfig.shaders["segment"].cls = SegmentUniforms;
shaderlib.shaderConfig.shaders["segment"].renderParams = { renderMode: RenderMode.LINES, enableBlend: true };
Material.setDefault("Segment-Material", { shaderName: "segment" });

/**
 * 雾模式
 */
var FogMode;
(function (FogMode) {
    FogMode[FogMode["NONE"] = 0] = "NONE";
    FogMode[FogMode["EXP"] = 1] = "EXP";
    FogMode[FogMode["EXP2"] = 2] = "EXP2";
    FogMode[FogMode["LINEAR"] = 3] = "LINEAR";
})(FogMode || (FogMode = {}));
var StandardUniforms = function StandardUniforms() {
    /**
     * 点绘制时点的尺寸
     */
    this.u_PointSize = 1;
    /**
     * 漫反射纹理
     */
    this.s_diffuse = Texture2D.default;
    /**
     * 基本颜色
     */
    this.u_diffuse = new Color4(1, 1, 1, 1);
    /**
     * 透明阈值，透明度小于该值的像素被片段着色器丢弃
     */
    this.u_alphaThreshold = 0;
    /**
     * 法线纹理
     */
    this.s_normal = Texture2D.defaultNormal;
    /**
     * 镜面反射光泽图
     */
    this.s_specular = Texture2D.default;
    /**
     * 镜面反射颜色
     */
    this.u_specular = new Color3();
    /**
     * 高光系数
     */
    this.u_glossiness = 50;
    /**
     * 环境纹理
     */
    this.s_ambient = Texture2D.default;
    /**
     * 环境光颜色
     */
    this.u_ambient = new Color4();
    /**
     * 环境映射贴图
     */
    this.s_envMap = TextureCube.default;
    /**
     * 反射率
     */
    this.u_reflectivity = 1;
    /**
     * 出现雾效果的最近距离
     */
    this.u_fogMinDistance = 0;
    /**
     * 最远距离
     */
    this.u_fogMaxDistance = 100;
    /**
     * 雾的颜色
     */
    this.u_fogColor = new Color3();
    /**
     * 雾的密度
     */
    this.u_fogDensity = 0.1;
    /**
     * 雾模式
     */
    this.u_fogMode = FogMode.NONE;
};
__decorate([
    serialize,
    oav()
], StandardUniforms.prototype, "u_PointSize", void 0);
__decorate([
    serialize,
    oav({ block: "diffuse" })
], StandardUniforms.prototype, "s_diffuse", void 0);
__decorate([
    serialize,
    oav({ block: "diffuse" })
], StandardUniforms.prototype, "u_diffuse", void 0);
__decorate([
    serialize,
    oav({ block: "diffuse" })
], StandardUniforms.prototype, "u_alphaThreshold", void 0);
__decorate([
    serialize,
    oav({ block: "normalMethod" })
], StandardUniforms.prototype, "s_normal", void 0);
__decorate([
    serialize,
    oav({ block: "specular" })
], StandardUniforms.prototype, "s_specular", void 0);
__decorate([
    serialize,
    oav({ block: "specular" })
], StandardUniforms.prototype, "u_specular", void 0);
__decorate([
    serialize,
    oav({ block: "specular" })
], StandardUniforms.prototype, "u_glossiness", void 0);
__decorate([
    serialize,
    oav({ block: "ambient" })
], StandardUniforms.prototype, "s_ambient", void 0);
__decorate([
    serialize,
    oav({ block: "ambient" })
], StandardUniforms.prototype, "u_ambient", void 0);
__decorate([
    serialize,
    oav({ component: "OAVPick", block: "envMap", componentParam: { accepttype: "texturecube", datatype: "texturecube" } })
], StandardUniforms.prototype, "s_envMap", void 0);
__decorate([
    serialize,
    oav({ block: "envMap" })
], StandardUniforms.prototype, "u_reflectivity", void 0);
__decorate([
    serialize,
    oav({ block: "fog" })
], StandardUniforms.prototype, "u_fogMinDistance", void 0);
__decorate([
    serialize,
    oav({ block: "fog" })
], StandardUniforms.prototype, "u_fogMaxDistance", void 0);
__decorate([
    serialize,
    oav({ block: "fog" })
], StandardUniforms.prototype, "u_fogColor", void 0);
__decorate([
    serialize,
    oav({ block: "fog" })
], StandardUniforms.prototype, "u_fogDensity", void 0);
__decorate([
    serialize,
    oav({ block: "fog", component: "OAVEnum", componentParam: { enumClass: FogMode } })
], StandardUniforms.prototype, "u_fogMode", void 0);
shaderlib.shaderConfig.shaders["standard"].cls = StandardUniforms;
Material.setDefault("Default-Material", { shaderName: "standard" });

var TextureUniforms = function TextureUniforms() {
    /**
     * 颜色
     */
    this.u_color = new Color4();
    /**
     * 纹理数据
     */
    this.s_texture = Texture2D.default;
};
__decorate([
    serialize,
    oav()
], TextureUniforms.prototype, "u_color", void 0);
__decorate([
    oav(),
    serialize
], TextureUniforms.prototype, "s_texture", void 0);
shaderlib.shaderConfig.shaders["texture"].cls = TextureUniforms;

/**
 * 胶囊体几何体
 */
var CapsuleGeometry = /*@__PURE__*/(function (Geometry) {
    function CapsuleGeometry() {
        Geometry.apply(this, arguments);
        /**
         * 胶囊体半径
         */
        this.radius = 0.5;
        /**
         * 胶囊体高度
         */
        this.height = 1;
        /**
         * 横向分割数
         */
        this.segmentsW = 16;
        /**
         * 纵向分割数
         */
        this.segmentsH = 15;
        /**
         * 正面朝向 true:Y+ false:Z+
         */
        this.yUp = true;
        this._name = "Capsule";
    }

    if ( Geometry ) CapsuleGeometry.__proto__ = Geometry;
    CapsuleGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    CapsuleGeometry.prototype.constructor = CapsuleGeometry;
    /**
     * 构建几何体数据
     * @param radius 胶囊体半径
     * @param height 胶囊体高度
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     * @param yUp 正面朝向 true:Y+ false:Z+
     */
    CapsuleGeometry.prototype.buildGeometry = function buildGeometry () {
        var vertexPositionData = [];
        var vertexNormalData = [];
        var vertexTangentData = [];
        var startIndex;
        var index = 0;
        var comp1, comp2, t1, t2;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            startIndex = index;
            var horangle = Math.PI * yi / this.segmentsH;
            var z = -this.radius * Math.cos(horangle);
            var ringradius = this.radius * Math.sin(horangle);
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                var verangle = 2 * Math.PI * xi / this.segmentsW;
                var x = ringradius * Math.cos(verangle);
                var y = ringradius * Math.sin(verangle);
                var normLen = 1 / Math.sqrt(x * x + y * y + z * z);
                var tanLen = Math.sqrt(y * y + x * x);
                var offset = yi > this.segmentsH / 2 ? this.height / 2 : -this.height / 2;
                if (this.yUp) {
                    t1 = 0;
                    t2 = tanLen > .007 ? x / tanLen : 0;
                    comp1 = -z;
                    comp2 = y;
                }
                else {
                    t1 = tanLen > .007 ? x / tanLen : 0;
                    t2 = 0;
                    comp1 = y;
                    comp2 = z;
                }
                if (xi == this.segmentsW) {
                    vertexPositionData[index] = vertexPositionData[startIndex];
                    vertexPositionData[index + 1] = vertexPositionData[startIndex + 1];
                    vertexPositionData[index + 2] = vertexPositionData[startIndex + 2];
                    vertexNormalData[index] = (vertexNormalData[startIndex] + x * normLen) * 0.5;
                    vertexNormalData[index + 1] = (vertexNormalData[startIndex + 1] + comp1 * normLen) * 0.5;
                    vertexNormalData[index + 2] = (vertexNormalData[startIndex + 2] + comp2 * normLen) * 0.5;
                    vertexTangentData[index] = (vertexTangentData[startIndex] + tanLen > .007 ? -y / tanLen : 1) * 0.5;
                    vertexTangentData[index + 1] = (vertexTangentData[startIndex + 1] + t1) * 0.5;
                    vertexTangentData[index + 2] = (vertexTangentData[startIndex + 2] + t2) * 0.5;
                }
                else {
                    vertexPositionData[index] = x;
                    vertexPositionData[index + 1] = this.yUp ? comp1 - offset : comp1;
                    vertexPositionData[index + 2] = this.yUp ? comp2 : comp2 + offset;
                    vertexNormalData[index] = x * normLen;
                    vertexNormalData[index + 1] = comp1 * normLen;
                    vertexNormalData[index + 2] = comp2 * normLen;
                    vertexTangentData[index] = tanLen > .007 ? -y / tanLen : 1;
                    vertexTangentData[index + 1] = t1;
                    vertexTangentData[index + 2] = t2;
                }
                if (xi > 0 && yi > 0) {
                    if (yi == this.segmentsH) {
                        vertexPositionData[index] = vertexPositionData[startIndex];
                        vertexPositionData[index + 1] = vertexPositionData[startIndex + 1];
                        vertexPositionData[index + 2] = vertexPositionData[startIndex + 2];
                    }
                }
                index += 3;
            }
        }
        this.positions = vertexPositionData;
        this.normals = vertexNormalData;
        this.tangents = vertexTangentData;
        var uvData = this.buildUVs();
        this.uvs = uvData;
        this.buildIndices();
    };
    /**
     * 构建顶点索引
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     * @param yUp 正面朝向 true:Y+ false:Z+
     */
    CapsuleGeometry.prototype.buildIndices = function buildIndices () {
        var indices = [];
        var numIndices = 0;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                if (xi > 0 && yi > 0) {
                    var a = (this.segmentsW + 1) * yi + xi;
                    var b = (this.segmentsW + 1) * yi + xi - 1;
                    var c = (this.segmentsW + 1) * (yi - 1) + xi - 1;
                    var d = (this.segmentsW + 1) * (yi - 1) + xi;
                    if (yi == this.segmentsH) {
                        indices[numIndices++] = a;
                        indices[numIndices++] = c;
                        indices[numIndices++] = d;
                    }
                    else if (yi == 1) {
                        indices[numIndices++] = a;
                        indices[numIndices++] = b;
                        indices[numIndices++] = c;
                    }
                    else {
                        indices[numIndices++] = a;
                        indices[numIndices++] = b;
                        indices[numIndices++] = c;
                        indices[numIndices++] = a;
                        indices[numIndices++] = c;
                        indices[numIndices++] = d;
                    }
                }
            }
        }
        this.indices = indices;
    };
    /**
     * 构建uv
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     */
    CapsuleGeometry.prototype.buildUVs = function buildUVs () {
        var data = [];
        var index = 0;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                data[index++] = xi / this.segmentsW;
                data[index++] = yi / this.segmentsH;
            }
        }
        return data;
    };

    return CapsuleGeometry;
}(Geometry));
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CapsuleGeometry.prototype, "radius", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CapsuleGeometry.prototype, "height", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CapsuleGeometry.prototype, "segmentsW", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CapsuleGeometry.prototype, "segmentsH", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CapsuleGeometry.prototype, "yUp", void 0);
Geometry.setDefault("Capsule", new CapsuleGeometry());
Entity.registerPrimitive("Capsule", function (g) {
    g.addComponent(MeshRenderer).geometry = Geometry.getDefault("Capsule");
});

/**
 * 圆柱体几何体
 * @author DawnKing 2016-09-12
 */
var CylinderGeometry = /*@__PURE__*/(function (Geometry) {
    function CylinderGeometry() {
        Geometry.apply(this, arguments);
        /**
         * 顶部半径
         */
        this.topRadius = 0.5;
        /**
         * 底部半径
         */
        this.bottomRadius = 0.5;
        /**
         * 高度
         */
        this.height = 2;
        /**
         * 横向分割数
         */
        this.segmentsW = 16;
        /**
         * 纵向分割数
         */
        this.segmentsH = 1;
        /**
         * 顶部是否封口
         */
        this.topClosed = true;
        /**
         * 底部是否封口
         */
        this.bottomClosed = true;
        /**
         * 侧面是否封口
         */
        this.surfaceClosed = true;
        /**
         * 是否朝上
         */
        this.yUp = true;
        this._name = "Cylinder";
    }

    if ( Geometry ) CylinderGeometry.__proto__ = Geometry;
    CylinderGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    CylinderGeometry.prototype.constructor = CylinderGeometry;
    /**
     * 构建几何体数据
     */
    CylinderGeometry.prototype.buildGeometry = function buildGeometry () {
        var i, j, index = 0;
        var x, y, z, radius, revolutionAngle = 0;
        var dr, latNormElev, latNormBase;
        var comp1, comp2;
        var startIndex = 0;
        var t1, t2;
        var vertexPositionData = [];
        var vertexNormalData = [];
        var vertexTangentData = [];
        var revolutionAngleDelta = 2 * Math.PI / this.segmentsW;
        // 顶部
        if (this.topClosed && this.topRadius > 0) {
            z = -0.5 * this.height;
            for (i = 0; i <= this.segmentsW; ++i) {
                // 中心顶点
                if (this.yUp) {
                    t1 = 1;
                    t2 = 0;
                    comp1 = -z;
                    comp2 = 0;
                }
                else {
                    t1 = 0;
                    t2 = -1;
                    comp1 = 0;
                    comp2 = z;
                }
                addVertex(0, comp1, comp2, 0, t1, t2, 1, 0, 0);
                // 旋转顶点
                revolutionAngle = i * revolutionAngleDelta;
                x = this.topRadius * Math.cos(revolutionAngle);
                y = this.topRadius * Math.sin(revolutionAngle);
                if (this.yUp) {
                    comp1 = -z;
                    comp2 = y;
                }
                else {
                    comp1 = y;
                    comp2 = z;
                }
                if (i == this.segmentsW) {
                    addVertex(vertexPositionData[startIndex + 3], vertexPositionData[startIndex + 4], vertexPositionData[startIndex + 5], 0, t1, t2, 1, 0, 0);
                }
                else {
                    addVertex(x, comp1, comp2, 0, t1, t2, 1, 0, 0);
                }
            }
        }
        // 底部
        if (this.bottomClosed && this.bottomRadius > 0) {
            z = 0.5 * this.height;
            startIndex = index;
            for (i = 0; i <= this.segmentsW; ++i) {
                // 中心顶点
                if (this.yUp) {
                    t1 = -1;
                    t2 = 0;
                    comp1 = -z;
                    comp2 = 0;
                }
                else {
                    t1 = 0;
                    t2 = 1;
                    comp1 = 0;
                    comp2 = z;
                }
                addVertex(0, comp1, comp2, 0, t1, t2, 1, 0, 0);
                // 旋转顶点
                revolutionAngle = i * revolutionAngleDelta;
                x = this.bottomRadius * Math.cos(revolutionAngle);
                y = this.bottomRadius * Math.sin(revolutionAngle);
                if (this.yUp) {
                    comp1 = -z;
                    comp2 = y;
                }
                else {
                    comp1 = y;
                    comp2 = z;
                }
                if (i == this.segmentsW) {
                    addVertex(x, vertexPositionData[startIndex + 1], vertexPositionData[startIndex + 2], 0, t1, t2, 1, 0, 0);
                }
                else {
                    addVertex(x, comp1, comp2, 0, t1, t2, 1, 0, 0);
                }
            }
        }
        // 侧面
        dr = this.bottomRadius - this.topRadius;
        latNormElev = dr / this.height;
        latNormBase = (latNormElev == 0) ? 1 : this.height / dr;
        if (this.surfaceClosed) {
            var a, b, c, d;
            var na0, na1, naComp1, naComp2;
            for (j = 0; j <= this.segmentsH; ++j) {
                radius = this.topRadius - ((j / this.segmentsH) * (this.topRadius - this.bottomRadius));
                z = -(this.height / 2) + (j / this.segmentsH * this.height);
                startIndex = index;
                for (i = 0; i <= this.segmentsW; ++i) {
                    revolutionAngle = i * revolutionAngleDelta;
                    x = radius * Math.cos(revolutionAngle);
                    y = radius * Math.sin(revolutionAngle);
                    na0 = latNormBase * Math.cos(revolutionAngle);
                    na1 = latNormBase * Math.sin(revolutionAngle);
                    if (this.yUp) {
                        t1 = 0;
                        t2 = -na0;
                        comp1 = -z;
                        comp2 = y;
                        naComp1 = latNormElev;
                        naComp2 = na1;
                    }
                    else {
                        t1 = -na0;
                        t2 = 0;
                        comp1 = y;
                        comp2 = z;
                        naComp1 = na1;
                        naComp2 = latNormElev;
                    }
                    if (i == this.segmentsW) {
                        addVertex(vertexPositionData[startIndex], vertexPositionData[startIndex + 1], vertexPositionData[startIndex + 2], na0, latNormElev, na1, na1, t1, t2);
                    }
                    else {
                        addVertex(x, comp1, comp2, na0, naComp1, naComp2, -na1, t1, t2);
                    }
                }
            }
        }
        this.positions = vertexPositionData;
        this.normals = vertexNormalData;
        this.tangents = vertexTangentData;
        function addVertex(px, py, pz, nx, ny, nz, tx, ty, tz) {
            vertexPositionData[index] = px;
            vertexPositionData[index + 1] = py;
            vertexPositionData[index + 2] = pz;
            vertexNormalData[index] = nx;
            vertexNormalData[index + 1] = ny;
            vertexNormalData[index + 2] = nz;
            vertexTangentData[index] = tx;
            vertexTangentData[index + 1] = ty;
            vertexTangentData[index + 2] = tz;
            index += 3;
        }
        //
        var uvData = this.buildUVs();
        this.uvs = uvData;
        var indices = this.buildIndices();
        this.indices = indices;
    };
    /**
     * 构建顶点索引
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     * @param yUp 正面朝向 true:Y+ false:Z+
     */
    CylinderGeometry.prototype.buildIndices = function buildIndices () {
        var i, j, index = 0;
        var indices = [];
        var numIndices = 0;
        // 顶部
        if (this.topClosed && this.topRadius > 0) {
            for (i = 0; i <= this.segmentsW; ++i) {
                index += 2;
                if (i > 0)
                    { addTriangleClockWise(index - 1, index - 3, index - 2); }
            }
        }
        // 底部
        if (this.bottomClosed && this.bottomRadius > 0) {
            for (i = 0; i <= this.segmentsW; ++i) {
                index += 2;
                if (i > 0)
                    { addTriangleClockWise(index - 2, index - 3, index - 1); }
            }
        }
        // 侧面
        if (this.surfaceClosed) {
            var a, b, c, d;
            for (j = 0; j <= this.segmentsH; ++j) {
                for (i = 0; i <= this.segmentsW; ++i) {
                    index++;
                    if (i > 0 && j > 0) {
                        a = index - 1;
                        b = index - 2;
                        c = b - this.segmentsW - 1;
                        d = a - this.segmentsW - 1;
                        addTriangleClockWise(a, b, c);
                        addTriangleClockWise(a, c, d);
                    }
                }
            }
        }
        return indices;
        function addTriangleClockWise(cwVertexIndex0, cwVertexIndex1, cwVertexIndex2) {
            indices[numIndices++] = cwVertexIndex0;
            indices[numIndices++] = cwVertexIndex1;
            indices[numIndices++] = cwVertexIndex2;
        }
    };
    /**
     * 构建uv
     * @param segmentsW 横向分割数
     * @param segmentsH 纵向分割数
     */
    CylinderGeometry.prototype.buildUVs = function buildUVs () {
        var i, j;
        var x, y, revolutionAngle;
        var data = [];
        var revolutionAngleDelta = 2 * Math.PI / this.segmentsW;
        var index = 0;
        // 顶部
        if (this.topClosed) {
            for (i = 0; i <= this.segmentsW; ++i) {
                revolutionAngle = i * revolutionAngleDelta;
                x = 0.5 + 0.5 * -Math.cos(revolutionAngle);
                y = 0.5 + 0.5 * Math.sin(revolutionAngle);
                // 中心顶点
                data[index++] = 0.5;
                data[index++] = 0.5;
                // 旋转顶点
                data[index++] = x;
                data[index++] = y;
            }
        }
        // 底部
        if (this.bottomClosed) {
            for (i = 0; i <= this.segmentsW; ++i) {
                revolutionAngle = i * revolutionAngleDelta;
                x = 0.5 + 0.5 * Math.cos(revolutionAngle);
                y = 0.5 + 0.5 * Math.sin(revolutionAngle);
                // 中心顶点
                data[index++] = 0.5;
                data[index++] = 0.5;
                // 旋转顶点
                data[index++] = x;
                data[index++] = y;
            }
        }
        // 侧面
        if (this.surfaceClosed) {
            for (j = 0; j <= this.segmentsH; ++j) {
                for (i = 0; i <= this.segmentsW; ++i) {
                    // 旋转顶点
                    data[index++] = (i / this.segmentsW);
                    data[index++] = (j / this.segmentsH);
                }
            }
        }
        return data;
    };

    return CylinderGeometry;
}(Geometry));
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CylinderGeometry.prototype, "topRadius", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CylinderGeometry.prototype, "bottomRadius", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CylinderGeometry.prototype, "height", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CylinderGeometry.prototype, "segmentsW", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CylinderGeometry.prototype, "segmentsH", void 0);
__decorate([
    oav(),
    serialize,
    watch("invalidateGeometry")
], CylinderGeometry.prototype, "topClosed", void 0);
__decorate([
    oav(),
    serialize,
    watch("invalidateGeometry")
], CylinderGeometry.prototype, "bottomClosed", void 0);
__decorate([
    oav(),
    serialize,
    watch("invalidateGeometry")
], CylinderGeometry.prototype, "surfaceClosed", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CylinderGeometry.prototype, "yUp", void 0);
Geometry.setDefault("Cylinder", new CylinderGeometry());
Entity.registerPrimitive("Cylinder", function (g) {
    g.addComponent(MeshRenderer).geometry = Geometry.getDefault("Cylinder");
});

/**
 * 圆锥体

 */
var ConeGeometry = /*@__PURE__*/(function (CylinderGeometry) {
    function ConeGeometry() {
        CylinderGeometry.apply(this, arguments);
        this.__class__ = "feng3d.ConeGeometry";
        this._name = "Cone";
        /**
         * 底部半径 private
         */
        this.topRadius = 0;
        /**
         * 顶部是否封口 private
         */
        this.topClosed = false;
        /**
         * 侧面是否封口 private
         */
        this.surfaceClosed = true;
    }

    if ( CylinderGeometry ) ConeGeometry.__proto__ = CylinderGeometry;
    ConeGeometry.prototype = Object.create( CylinderGeometry && CylinderGeometry.prototype );
    ConeGeometry.prototype.constructor = ConeGeometry;

    return ConeGeometry;
}(CylinderGeometry));
Geometry.setDefault("Cone", new ConeGeometry());
Entity.registerPrimitive("Cone", function (g) {
    g.addComponent(MeshRenderer).geometry = Geometry.getDefault("Cone");
});

/**
 * 立（长）方体几何体
 */
var CubeGeometry = /*@__PURE__*/(function (Geometry) {
    function CubeGeometry() {
        Geometry.apply(this, arguments);
        this._name = "Cube";
        /**
         * 宽度
         */
        this.width = 1;
        /**
         * 高度
         */
        this.height = 1;
        /**
         * 深度
         */
        this.depth = 1;
        /**
         * 宽度方向分割数
         */
        this.segmentsW = 1;
        /**
         * 高度方向分割数
         */
        this.segmentsH = 1;
        /**
         * 深度方向分割数
         */
        this.segmentsD = 1;
        /**
         * 是否为6块贴图，默认true。
         */
        this.tile6 = false;
    }

    if ( Geometry ) CubeGeometry.__proto__ = Geometry;
    CubeGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    CubeGeometry.prototype.constructor = CubeGeometry;
    CubeGeometry.prototype.buildGeometry = function buildGeometry () {
        var vertexPositionData = this.buildPosition();
        this.positions = vertexPositionData;
        var vertexNormalData = this.buildNormal();
        this.normals = vertexNormalData;
        var vertexTangentData = this.buildTangent();
        this.tangents = vertexTangentData;
        var uvData = this.buildUVs();
        this.uvs = uvData;
        var indices = this.buildIndices();
        this.indices = indices;
    };
    /**
     * 构建坐标
     * @param   width           宽度
     * @param   height          高度
     * @param   depth           深度
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     */
    CubeGeometry.prototype.buildPosition = function buildPosition () {
        var vertexPositionData = [];
        var i, j;
        var hw, hh, hd; // halves
        var dw, dh, dd; // deltas
        var outer_pos;
        // Indices
        var positionIndex = 0;
        // half cube dimensions
        hw = this.width / 2;
        hh = this.height / 2;
        hd = this.depth / 2;
        // Segment dimensions
        dw = this.width / this.segmentsW;
        dh = this.height / this.segmentsH;
        dd = this.depth / this.segmentsD;
        for (i = 0; i <= this.segmentsW; i++) {
            outer_pos = -hw + i * dw;
            for (j = 0; j <= this.segmentsH; j++) {
                // front
                vertexPositionData[positionIndex++] = outer_pos;
                vertexPositionData[positionIndex++] = -hh + j * dh;
                vertexPositionData[positionIndex++] = -hd;
                // back
                vertexPositionData[positionIndex++] = outer_pos;
                vertexPositionData[positionIndex++] = -hh + j * dh;
                vertexPositionData[positionIndex++] = hd;
            }
        }
        for (i = 0; i <= this.segmentsW; i++) {
            outer_pos = -hw + i * dw;
            for (j = 0; j <= this.segmentsD; j++) {
                // top
                vertexPositionData[positionIndex++] = outer_pos;
                vertexPositionData[positionIndex++] = hh;
                vertexPositionData[positionIndex++] = -hd + j * dd;
                // bottom
                vertexPositionData[positionIndex++] = outer_pos;
                vertexPositionData[positionIndex++] = -hh;
                vertexPositionData[positionIndex++] = -hd + j * dd;
            }
        }
        for (i = 0; i <= this.segmentsD; i++) {
            outer_pos = hd - i * dd;
            for (j = 0; j <= this.segmentsH; j++) {
                // left
                vertexPositionData[positionIndex++] = -hw;
                vertexPositionData[positionIndex++] = -hh + j * dh;
                vertexPositionData[positionIndex++] = outer_pos;
                // right
                vertexPositionData[positionIndex++] = hw;
                vertexPositionData[positionIndex++] = -hh + j * dh;
                vertexPositionData[positionIndex++] = outer_pos;
            }
        }
        return vertexPositionData;
    };
    /**
     * 构建法线
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     */
    CubeGeometry.prototype.buildNormal = function buildNormal () {
        var vertexNormalData = [];
        var i, j;
        // Indices
        var normalIndex = 0;
        for (i = 0; i <= this.segmentsW; i++) {
            for (j = 0; j <= this.segmentsH; j++) {
                // front
                vertexNormalData[normalIndex++] = 0;
                vertexNormalData[normalIndex++] = 0;
                vertexNormalData[normalIndex++] = -1;
                // back
                vertexNormalData[normalIndex++] = 0;
                vertexNormalData[normalIndex++] = 0;
                vertexNormalData[normalIndex++] = 1;
            }
        }
        for (i = 0; i <= this.segmentsW; i++) {
            for (j = 0; j <= this.segmentsD; j++) {
                // top
                vertexNormalData[normalIndex++] = 0;
                vertexNormalData[normalIndex++] = 1;
                vertexNormalData[normalIndex++] = 0;
                // bottom
                vertexNormalData[normalIndex++] = 0;
                vertexNormalData[normalIndex++] = -1;
                vertexNormalData[normalIndex++] = 0;
            }
        }
        for (i = 0; i <= this.segmentsD; i++) {
            for (j = 0; j <= this.segmentsH; j++) {
                // left
                vertexNormalData[normalIndex++] = -1;
                vertexNormalData[normalIndex++] = 0;
                vertexNormalData[normalIndex++] = 0;
                // right
                vertexNormalData[normalIndex++] = 1;
                vertexNormalData[normalIndex++] = 0;
                vertexNormalData[normalIndex++] = 0;
            }
        }
        return vertexNormalData;
    };
    /**
     * 构建切线
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     */
    CubeGeometry.prototype.buildTangent = function buildTangent () {
        var vertexTangentData = [];
        var i, j;
        // Indices
        var tangentIndex = 0;
        for (i = 0; i <= this.segmentsW; i++) {
            for (j = 0; j <= this.segmentsH; j++) {
                // front
                vertexTangentData[tangentIndex++] = 1;
                vertexTangentData[tangentIndex++] = 0;
                vertexTangentData[tangentIndex++] = 0;
                // back
                vertexTangentData[tangentIndex++] = -1;
                vertexTangentData[tangentIndex++] = 0;
                vertexTangentData[tangentIndex++] = 0;
            }
        }
        for (i = 0; i <= this.segmentsW; i++) {
            for (j = 0; j <= this.segmentsD; j++) {
                // top
                vertexTangentData[tangentIndex++] = 1;
                vertexTangentData[tangentIndex++] = 0;
                vertexTangentData[tangentIndex++] = 0;
                // bottom
                vertexTangentData[tangentIndex++] = 1;
                vertexTangentData[tangentIndex++] = 0;
                vertexTangentData[tangentIndex++] = 0;
            }
        }
        for (i = 0; i <= this.segmentsD; i++) {
            for (j = 0; j <= this.segmentsH; j++) {
                // left
                vertexTangentData[tangentIndex++] = 0;
                vertexTangentData[tangentIndex++] = 0;
                vertexTangentData[tangentIndex++] = -1;
                // right
                vertexTangentData[tangentIndex++] = 0;
                vertexTangentData[tangentIndex++] = 0;
                vertexTangentData[tangentIndex++] = 1;
            }
        }
        return vertexTangentData;
    };
    /**
     * 构建索引
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     */
    CubeGeometry.prototype.buildIndices = function buildIndices () {
        var indices = [];
        var tl, tr, bl, br;
        var i, j, inc = 0;
        var fidx = 0;
        for (i = 0; i <= this.segmentsW; i++) {
            for (j = 0; j <= this.segmentsH; j++) {
                // front
                // back
                if (i && j) {
                    tl = 2 * ((i - 1) * (this.segmentsH + 1) + (j - 1));
                    tr = 2 * (i * (this.segmentsH + 1) + (j - 1));
                    bl = tl + 2;
                    br = tr + 2;
                    indices[fidx++] = tl;
                    indices[fidx++] = bl;
                    indices[fidx++] = br;
                    indices[fidx++] = tl;
                    indices[fidx++] = br;
                    indices[fidx++] = tr;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = br + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tl + 1;
                }
            }
        }
        inc += 2 * (this.segmentsW + 1) * (this.segmentsH + 1);
        for (i = 0; i <= this.segmentsW; i++) {
            for (j = 0; j <= this.segmentsD; j++) {
                // top
                // bottom
                if (i && j) {
                    tl = inc + 2 * ((i - 1) * (this.segmentsD + 1) + (j - 1));
                    tr = inc + 2 * (i * (this.segmentsD + 1) + (j - 1));
                    bl = tl + 2;
                    br = tr + 2;
                    indices[fidx++] = tl;
                    indices[fidx++] = bl;
                    indices[fidx++] = br;
                    indices[fidx++] = tl;
                    indices[fidx++] = br;
                    indices[fidx++] = tr;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = br + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tl + 1;
                }
            }
        }
        inc += 2 * (this.segmentsW + 1) * (this.segmentsD + 1);
        for (i = 0; i <= this.segmentsD; i++) {
            for (j = 0; j <= this.segmentsH; j++) {
                // left
                // right
                if (i && j) {
                    tl = inc + 2 * ((i - 1) * (this.segmentsH + 1) + (j - 1));
                    tr = inc + 2 * (i * (this.segmentsH + 1) + (j - 1));
                    bl = tl + 2;
                    br = tr + 2;
                    indices[fidx++] = tl;
                    indices[fidx++] = bl;
                    indices[fidx++] = br;
                    indices[fidx++] = tl;
                    indices[fidx++] = br;
                    indices[fidx++] = tr;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = br + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tr + 1;
                    indices[fidx++] = bl + 1;
                    indices[fidx++] = tl + 1;
                }
            }
        }
        return indices;
    };
    /**
     * 构建uv
     * @param   segmentsW       宽度方向分割
     * @param   segmentsH       高度方向分割
     * @param   segmentsD       深度方向分割
     * @param   tile6           是否为6块贴图
     */
    CubeGeometry.prototype.buildUVs = function buildUVs () {
        var i, j, uidx;
        var data = [];
        var u_tile_dim, v_tile_dim;
        var u_tile_step, v_tile_step;
        var tl0u, tl0v;
        var tl1u, tl1v;
        var du, dv;
        if (this.tile6) {
            u_tile_dim = u_tile_step = 1 / 3;
            v_tile_dim = v_tile_step = 1 / 2;
        }
        else {
            u_tile_dim = v_tile_dim = 1;
            u_tile_step = v_tile_step = 0;
        }
        // Create planes two and two, the same way that they were
        // constructed in the this.buildGeometry() function. First calculate
        // the top-left UV coordinate for both planes, and then loop
        // over the points, calculating the UVs from these numbers.
        // When this.tile6 is true, the layout is as follows:
        //       .-----.-----.-----. (1,1)
        //       | Bot |  T  | Bak |
        //       |-----+-----+-----|
        //       |  L  |  F  |  R  |
        // (0,0)'-----'-----'-----'
        uidx = 0;
        // FRONT / BACK
        tl0u = 1 * u_tile_step;
        tl0v = 1 * v_tile_step;
        tl1u = 2 * u_tile_step;
        tl1v = 0 * v_tile_step;
        du = u_tile_dim / this.segmentsW;
        dv = v_tile_dim / this.segmentsH;
        for (i = 0; i <= this.segmentsW; i++) {
            for (j = 0; j <= this.segmentsH; j++) {
                data[uidx++] = tl0u + i * du;
                data[uidx++] = tl0v + (v_tile_dim - j * dv);
                data[uidx++] = tl1u + (u_tile_dim - i * du);
                data[uidx++] = tl1v + (v_tile_dim - j * dv);
            }
        }
        // TOP / BOTTOM
        tl0u = 1 * u_tile_step;
        tl0v = 0 * v_tile_step;
        tl1u = 0 * u_tile_step;
        tl1v = 0 * v_tile_step;
        du = u_tile_dim / this.segmentsW;
        dv = v_tile_dim / this.segmentsD;
        for (i = 0; i <= this.segmentsW; i++) {
            for (j = 0; j <= this.segmentsD; j++) {
                data[uidx++] = tl0u + i * du;
                data[uidx++] = tl0v + (v_tile_dim - j * dv);
                data[uidx++] = tl1u + i * du;
                data[uidx++] = tl1v + j * dv;
            }
        }
        // LEFT / RIGHT
        tl0u = 0 * u_tile_step;
        tl0v = 1 * v_tile_step;
        tl1u = 2 * u_tile_step;
        tl1v = 1 * v_tile_step;
        du = u_tile_dim / this.segmentsD;
        dv = v_tile_dim / this.segmentsH;
        for (i = 0; i <= this.segmentsD; i++) {
            for (j = 0; j <= this.segmentsH; j++) {
                data[uidx++] = tl0u + i * du;
                data[uidx++] = tl0v + (v_tile_dim - j * dv);
                data[uidx++] = tl1u + (u_tile_dim - i * du);
                data[uidx++] = tl1v + (v_tile_dim - j * dv);
            }
        }
        return data;
    };

    return CubeGeometry;
}(Geometry));
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CubeGeometry.prototype, "width", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CubeGeometry.prototype, "height", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CubeGeometry.prototype, "depth", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CubeGeometry.prototype, "segmentsW", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CubeGeometry.prototype, "segmentsH", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CubeGeometry.prototype, "segmentsD", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], CubeGeometry.prototype, "tile6", void 0);
Geometry.setDefault("Cube", new CubeGeometry());
Entity.registerPrimitive("Cube", function (g) {
    g.addComponent(MeshRenderer).geometry = Geometry.getDefault("Cube");
});

var ParametricGeometry = /*@__PURE__*/(function (Geometry) {
    function ParametricGeometry(func, slices, stacks, doubleside) {
        if ( slices === void 0 ) slices = 8;
        if ( stacks === void 0 ) stacks = 8;
        if ( doubleside === void 0 ) doubleside = false;

        Geometry.call(this);
        var positions = [];
        var indices = [];
        var uvs = [];
        var sliceCount = slices + 1;
        for (var i = 0; i <= stacks; i++) {
            var v = i / stacks;
            for (var j = 0; j <= slices; j++) {
                var u = j / slices;
                //
                uvs.push(u, v);
                //
                var p = func(u, v);
                positions.push(p.x, p.y, p.z);
                //
                if (i < stacks && j < slices) {
                    var a = i * sliceCount + j;
                    var b = i * sliceCount + j + 1;
                    var c = (i + 1) * sliceCount + j + 1;
                    var d = (i + 1) * sliceCount + j;
                    indices.push(a, b, d);
                    indices.push(b, c, d);
                }
            }
        }
        // 反面
        if (doubleside) {
            positions = positions.concat(positions);
            uvs = uvs.concat(uvs);
            var start = (stacks + 1) * (slices + 1);
            for (var i$1 = 0, n = indices.length; i$1 < n; i$1 += 3) {
                indices.push(start + indices[i$1], start + indices[i$1 + 2], start + indices[i$1 + 1]);
            }
        }
        this.indices = indices;
        this.positions = positions;
        this.uvs = uvs;
        this.invalidateGeometry();
    }

    if ( Geometry ) ParametricGeometry.__proto__ = Geometry;
    ParametricGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    ParametricGeometry.prototype.constructor = ParametricGeometry;
    /**
     * 构建几何体
     */
    ParametricGeometry.prototype.buildGeometry = function buildGeometry () {
        var positions = this.positions;
        for (var i = 0, half = positions.length / 2; i < half; i++) {
            positions[i + half] = positions[i];
        }
        this.positions = positions;
        this.normals = geometryUtils.createVertexNormals(this.indices, this.positions, true);
        this.tangents = geometryUtils.createVertexTangents(this.indices, this.positions, this.uvs, true);
    };

    return ParametricGeometry;
}(Geometry));

/**
 * 四边形面皮几何体
 */
var QuadGeometry = /*@__PURE__*/(function (Geometry) {
    function QuadGeometry() {
        Geometry.call(this);
        var size = 0.5;
        this.positions = [-size, size, 0, size, size, 0, size, -size, 0, -size, -size, 0];
        this.uvs = [0, 0, 1, 0, 1, 1, 0, 1];
        this.indices = [0, 1, 2, 0, 2, 3];
        this.normals = geometryUtils.createVertexNormals(this.indices, this.positions, true);
        this.tangents = geometryUtils.createVertexTangents(this.indices, this.positions, this.uvs, true);
    }

    if ( Geometry ) QuadGeometry.__proto__ = Geometry;
    QuadGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    QuadGeometry.prototype.constructor = QuadGeometry;

    return QuadGeometry;
}(Geometry));
Geometry.setDefault("Quad", new QuadGeometry());
Entity.registerPrimitive("Quad", function (g) {
    g.addComponent(MeshRenderer).geometry = Geometry.getDefault("Quad");
});

/**
 * 球体几何体
 * @author DawnKing 2016-09-12
 */
var SphereGeometry = /*@__PURE__*/(function (Geometry) {
    function SphereGeometry() {
        Geometry.apply(this, arguments);
        /**
         * 球体半径
         */
        this.radius = 0.5;
        /**
         * 横向分割数
         */
        this.segmentsW = 16;
        /**
         * 纵向分割数
         */
        this.segmentsH = 12;
        /**
         * 是否朝上
         */
        this.yUp = true;
        this._name = "Sphere";
    }

    if ( Geometry ) SphereGeometry.__proto__ = Geometry;
    SphereGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    SphereGeometry.prototype.constructor = SphereGeometry;
    /**
     * 构建几何体数据
     * @param this.radius 球体半径
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    SphereGeometry.prototype.buildGeometry = function buildGeometry () {
        var vertexPositionData = [];
        var vertexNormalData = [];
        var vertexTangentData = [];
        var startIndex;
        var index = 0;
        var comp1, comp2, t1, t2;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            startIndex = index;
            var horangle = Math.PI * yi / this.segmentsH;
            var z = -this.radius * Math.cos(horangle);
            var ringradius = this.radius * Math.sin(horangle);
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                var verangle = 2 * Math.PI * xi / this.segmentsW;
                var x = ringradius * Math.cos(verangle);
                var y = ringradius * Math.sin(verangle);
                var normLen = 1 / Math.sqrt(x * x + y * y + z * z);
                var tanLen = Math.sqrt(y * y + x * x);
                if (this.yUp) {
                    t1 = 0;
                    t2 = tanLen > .007 ? x / tanLen : 0;
                    comp1 = -z;
                    comp2 = y;
                }
                else {
                    t1 = tanLen > .007 ? x / tanLen : 0;
                    t2 = 0;
                    comp1 = y;
                    comp2 = z;
                }
                if (xi == this.segmentsW) {
                    vertexPositionData[index] = vertexPositionData[startIndex];
                    vertexPositionData[index + 1] = vertexPositionData[startIndex + 1];
                    vertexPositionData[index + 2] = vertexPositionData[startIndex + 2];
                    vertexNormalData[index] = vertexNormalData[startIndex] + x * normLen * 0.5;
                    vertexNormalData[index + 1] = vertexNormalData[startIndex + 1] + comp1 * normLen * 0.5;
                    vertexNormalData[index + 2] = vertexNormalData[startIndex + 2] + comp2 * normLen * 0.5;
                    vertexTangentData[index] = tanLen > .007 ? -y / tanLen : 1;
                    vertexTangentData[index + 1] = t1;
                    vertexTangentData[index + 2] = t2;
                }
                else {
                    vertexPositionData[index] = x;
                    vertexPositionData[index + 1] = comp1;
                    vertexPositionData[index + 2] = comp2;
                    vertexNormalData[index] = x * normLen;
                    vertexNormalData[index + 1] = comp1 * normLen;
                    vertexNormalData[index + 2] = comp2 * normLen;
                    vertexTangentData[index] = tanLen > .007 ? -y / tanLen : 1;
                    vertexTangentData[index + 1] = t1;
                    vertexTangentData[index + 2] = t2;
                }
                if (xi > 0 && yi > 0) {
                    if (yi == this.segmentsH) {
                        vertexPositionData[index] = vertexPositionData[startIndex];
                        vertexPositionData[index + 1] = vertexPositionData[startIndex + 1];
                        vertexPositionData[index + 2] = vertexPositionData[startIndex + 2];
                    }
                }
                index += 3;
            }
        }
        this.positions = vertexPositionData;
        this.normals = vertexNormalData;
        this.tangents = vertexTangentData;
        var uvData = this.buildUVs();
        this.uvs = uvData;
        var indices = this.buildIndices();
        this.indices = indices;
    };
    /**
     * 构建顶点索引
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     * @param this.yUp 正面朝向 true:Y+ false:Z+
     */
    SphereGeometry.prototype.buildIndices = function buildIndices () {
        var indices = [];
        var numIndices = 0;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                if (xi > 0 && yi > 0) {
                    var a = (this.segmentsW + 1) * yi + xi;
                    var b = (this.segmentsW + 1) * yi + xi - 1;
                    var c = (this.segmentsW + 1) * (yi - 1) + xi - 1;
                    var d = (this.segmentsW + 1) * (yi - 1) + xi;
                    if (yi == this.segmentsH) {
                        indices[numIndices++] = a;
                        indices[numIndices++] = c;
                        indices[numIndices++] = d;
                    }
                    else if (yi == 1) {
                        indices[numIndices++] = a;
                        indices[numIndices++] = b;
                        indices[numIndices++] = c;
                    }
                    else {
                        indices[numIndices++] = a;
                        indices[numIndices++] = b;
                        indices[numIndices++] = c;
                        indices[numIndices++] = a;
                        indices[numIndices++] = c;
                        indices[numIndices++] = d;
                    }
                }
            }
        }
        return indices;
    };
    /**
     * 构建uv
     * @param this.segmentsW 横向分割数
     * @param this.segmentsH 纵向分割数
     */
    SphereGeometry.prototype.buildUVs = function buildUVs () {
        var data = [];
        var index = 0;
        for (var yi = 0; yi <= this.segmentsH; ++yi) {
            for (var xi = 0; xi <= this.segmentsW; ++xi) {
                data[index++] = xi / this.segmentsW;
                data[index++] = yi / this.segmentsH;
            }
        }
        return data;
    };

    return SphereGeometry;
}(Geometry));
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], SphereGeometry.prototype, "radius", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], SphereGeometry.prototype, "segmentsW", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], SphereGeometry.prototype, "segmentsH", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], SphereGeometry.prototype, "yUp", void 0);
Geometry.setDefault("Sphere", new SphereGeometry());
Entity.registerPrimitive("Sphere", function (g) {
    g.addComponent(MeshRenderer).geometry = Geometry.getDefault("Sphere");
});

/**
 * 圆环几何体
 */
var TorusGeometry = /*@__PURE__*/(function (Geometry) {
    function TorusGeometry() {
        Geometry.apply(this, arguments);
        this.__class__ = "feng3d.TorusGeometry";
        /**
         * 半径
         */
        this.radius = 0.5;
        /**
         * 管道半径
         */
        this.tubeRadius = 0.1;
        /**
         * 半径方向分割数
         */
        this.segmentsR = 16;
        /**
         * 管道方向分割数
         */
        this.segmentsT = 8;
        /**
         * 是否朝上
         */
        this.yUp = true;
        this._name = "Torus";
        this._vertexPositionStride = 3;
        this._vertexNormalStride = 3;
        this._vertexTangentStride = 3;
    }

    if ( Geometry ) TorusGeometry.__proto__ = Geometry;
    TorusGeometry.prototype = Object.create( Geometry && Geometry.prototype );
    TorusGeometry.prototype.constructor = TorusGeometry;
    /**
     * 添加顶点数据
     */
    TorusGeometry.prototype.addVertex = function addVertex (vertexIndex, px, py, pz, nx, ny, nz, tx, ty, tz) {
        this._vertexPositionData[vertexIndex * this._vertexPositionStride] = px;
        this._vertexPositionData[vertexIndex * this._vertexPositionStride + 1] = py;
        this._vertexPositionData[vertexIndex * this._vertexPositionStride + 2] = pz;
        this._vertexNormalData[vertexIndex * this._vertexNormalStride] = nx;
        this._vertexNormalData[vertexIndex * this._vertexNormalStride + 1] = ny;
        this._vertexNormalData[vertexIndex * this._vertexNormalStride + 2] = nz;
        this._vertexTangentData[vertexIndex * this._vertexTangentStride] = tx;
        this._vertexTangentData[vertexIndex * this._vertexTangentStride + 1] = ty;
        this._vertexTangentData[vertexIndex * this._vertexTangentStride + 2] = tz;
    };
    /**
     * 添加三角形索引数据
     * @param currentTriangleIndex		当前三角形索引
     * @param cwVertexIndex0			索引0
     * @param cwVertexIndex1			索引1
     * @param cwVertexIndex2			索引2
     */
    TorusGeometry.prototype.addTriangleClockWise = function addTriangleClockWise (currentTriangleIndex, cwVertexIndex0, cwVertexIndex1, cwVertexIndex2) {
        this._rawIndices[currentTriangleIndex * 3] = cwVertexIndex0;
        this._rawIndices[currentTriangleIndex * 3 + 1] = cwVertexIndex1;
        this._rawIndices[currentTriangleIndex * 3 + 2] = cwVertexIndex2;
    };
    /**
     * @inheritDoc
     */
    TorusGeometry.prototype.buildGeometry = function buildGeometry () {
        var i, j;
        var x, y, z, nx, ny, nz, revolutionAngleR, revolutionAngleT;
        var numTriangles;
        // reset utility variables
        this._numVertices = 0;
        this._vertexIndex = 0;
        this._currentTriangleIndex = 0;
        // evaluate target number of vertices, triangles and indices
        this._numVertices = (this.segmentsT + 1) * (this.segmentsR + 1); // this.segmentsT + 1 because of closure, this.segmentsR + 1 because of closure
        numTriangles = this.segmentsT * this.segmentsR * 2; // each level has segmentsR quads, each of 2 triangles
        this._vertexPositionData = [];
        this._vertexNormalData = [];
        this._vertexTangentData = [];
        this._rawIndices = [];
        this.buildUVs();
        // evaluate revolution steps
        var revolutionAngleDeltaR = 2 * Math.PI / this.segmentsR;
        var revolutionAngleDeltaT = 2 * Math.PI / this.segmentsT;
        var comp1, comp2;
        var t1, t2, n1, n2;
        var startPositionIndex;
        // surface
        var a, b, c, d, length;
        for (j = 0; j <= this.segmentsT; ++j) {
            startPositionIndex = j * (this.segmentsR + 1) * this._vertexPositionStride;
            for (i = 0; i <= this.segmentsR; ++i) {
                this._vertexIndex = j * (this.segmentsR + 1) + i;
                // revolution vertex
                revolutionAngleR = i * revolutionAngleDeltaR;
                revolutionAngleT = j * revolutionAngleDeltaT;
                length = Math.cos(revolutionAngleT);
                nx = length * Math.cos(revolutionAngleR);
                ny = length * Math.sin(revolutionAngleR);
                nz = Math.sin(revolutionAngleT);
                x = this.radius * Math.cos(revolutionAngleR) + this.tubeRadius * nx;
                y = this.radius * Math.sin(revolutionAngleR) + this.tubeRadius * ny;
                z = (j == this.segmentsT) ? 0 : this.tubeRadius * nz;
                if (this.yUp) {
                    n1 = -nz;
                    n2 = ny;
                    t1 = 0;
                    t2 = (length ? nx / length : x / this.radius);
                    comp1 = -z;
                    comp2 = y;
                }
                else {
                    n1 = ny;
                    n2 = nz;
                    t1 = (length ? nx / length : x / this.radius);
                    t2 = 0;
                    comp1 = y;
                    comp2 = z;
                }
                if (i == this.segmentsR) {
                    this.addVertex(this._vertexIndex, x, this._vertexPositionData[startPositionIndex + 1], this._vertexPositionData[startPositionIndex + 2], nx, n1, n2, -(length ? ny / length : y / this.radius), t1, t2);
                }
                else {
                    this.addVertex(this._vertexIndex, x, comp1, comp2, nx, n1, n2, -(length ? ny / length : y / this.radius), t1, t2);
                }
                // close triangle
                if (i > 0 && j > 0) {
                    a = this._vertexIndex; // current
                    b = this._vertexIndex - 1; // previous
                    c = b - this.segmentsR - 1; // previous of last level
                    d = a - this.segmentsR - 1; // current of last level
                    this.addTriangleClockWise(this._currentTriangleIndex++, a, b, c);
                    this.addTriangleClockWise(this._currentTriangleIndex++, a, c, d);
                }
            }
        }
        this.positions = this._vertexPositionData;
        this.normals = this._vertexNormalData;
        this.tangents = this._vertexTangentData;
        this.indices = this._rawIndices;
    };
    /**
     * @inheritDoc
     */
    TorusGeometry.prototype.buildUVs = function buildUVs () {
        var i, j;
        var stride = 2;
        var data = [];
        // evaluate num uvs
        var numUvs = this._numVertices * stride;
        // current uv component index
        var currentUvCompIndex = 0;
        var index = 0;
        // surface
        for (j = 0; j <= this.segmentsT; ++j) {
            for (i = 0; i <= this.segmentsR; ++i) {
                index = j * (this.segmentsR + 1) + i;
                // revolution vertex
                data[index * stride] = i / this.segmentsR;
                data[index * stride + 1] = j / this.segmentsT;
            }
        }
        // build real data from raw data
        this.uvs = data;
    };

    return TorusGeometry;
}(Geometry));
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], TorusGeometry.prototype, "radius", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], TorusGeometry.prototype, "tubeRadius", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], TorusGeometry.prototype, "segmentsR", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], TorusGeometry.prototype, "segmentsT", void 0);
__decorate([
    serialize,
    oav(),
    watch("invalidateGeometry")
], TorusGeometry.prototype, "yUp", void 0);
Geometry.setDefault("Torus", new TorusGeometry());
Entity.registerPrimitive("Torus", function (g) {
    g.addComponent(MeshRenderer).geometry = Geometry.getDefault("Torus");
});

/**
 * 鼠标拾取渲染器
 */
var MouseRenderer = /*@__PURE__*/(function (EventEmitter) {
    function MouseRenderer() {
        EventEmitter.apply(this, arguments);
        this.objects = [];
    }

    if ( EventEmitter ) MouseRenderer.__proto__ = EventEmitter;
    MouseRenderer.prototype = Object.create( EventEmitter && EventEmitter.prototype );
    MouseRenderer.prototype.constructor = MouseRenderer;
    /**
     * 渲染
     */
    MouseRenderer.prototype.draw = function draw (gl, viewRect) {
        var mouseX = windowEventProxy.clientX;
        var mouseY = windowEventProxy.clientY;
        var offsetX = -(mouseX - viewRect.x);
        var offsetY = -(viewRect.height - (mouseY - viewRect.y)); //y轴与window中坐标反向，所以需要 h = (maxHeight - h)
        gl.clearColor(0, 0, 0, 0);
        gl.clearDepth(1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(offsetX, offsetY, viewRect.width, viewRect.height);
        this.objects.length = 1;
        //启动裁剪，只绘制一个像素
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(0, 0, 1, 1);
        // super.draw(renderContext);
        gl.disable(gl.SCISSOR_TEST);
        //读取鼠标拾取索引
        // this.frameBufferObject.readBuffer(gl, "objectID");
        var data = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
        var id = data[0] + data[1] * 255 + data[2] * 255 * 255 + data[3] * 255 * 255 * 255 - data[3]; //最后（- data[3]）表示很奇怪，不过data[3]一般情况下为0
        // log(`选中索引3D对象${id}`, data.toString());
        return this.objects[id];
    };
    MouseRenderer.prototype.drawRenderables = function drawRenderables (gl, renderable) {
        if (renderable.node3d.mouseEnabled) {
            var object = renderable.entity;
            var u_objectID = this.objects.length;
            this.objects[u_objectID] = object;
            var renderAtomic = renderable.renderAtomic;
            renderAtomic.uniforms.u_objectID = u_objectID;
            // super.drawRenderables(renderContext, model);
        }
    };
    /**
     * 绘制3D对象
     */
    MouseRenderer.prototype.drawGameObject = function drawGameObject (gl, renderAtomic) {
        // var shader = new Shader();
        // shader.vertexCode = shaderlib.getShader("mouse").vertex;
        // shader.fragmentCode = shaderlib.getShader("mouse").fragment;
        // super.drawGameObject(gl, renderAtomic, shader);
    };

    return MouseRenderer;
}(EventEmitter));
var mouseRenderer = new MouseRenderer();

/**
 * 用于处理从场景中获取特定数据
 */
var SceneUtil = function SceneUtil () {};

SceneUtil.prototype.getBlenditems = function getBlenditems (scene, camera) {
    // throw new Error("Method not implemented.");
    // scene.getComponentsInChildren()
};
/**
 * 获取需要渲染的对象
 *
 * #### 渲染需求条件
 * 1. visible == true
 * 1. 在摄像机视锥内
 * 1. model.enabled == true
 *
 * @param gameObject
 * @param camera
 */
SceneUtil.prototype.getActiveRenderers = function getActiveRenderers (scene, camera) {
    var renderers = [];
    var frustum = camera.frustum;
    var node3ds = [scene.node3d];
    while (node3ds.length > 0) {
        var node3d = node3ds.pop();
        if (!node3d.visible)
            { continue; }
        var renderer = node3d.getComponent(Renderable);
        if (renderer && renderer.enabled) {
            if (renderer.selfWorldBounds) {
                if (frustum.intersectsBox(renderer.selfWorldBounds))
                    { renderers.push(renderer); }
            }
        }
        node3ds = node3ds.concat(node3d.children);
    }
    return renderers;
};
var sceneUtil = new SceneUtil();

var Setting = function Setting() {
    /**
     * 版本号
     */
    this.version = "0.1.3";
    /**
     * 引擎中使用的坐标系统，默认左手坐标系统。
     *
     * three.js 右手坐标系统。
     * playcanvas 右手坐标系统。
     * unity左手坐标系统。
     */
    this.coordinateSystem = CoordinateSystem.LEFT_HANDED;
    /**
     * 引擎中使用的旋转顺序。
     *
     * unity YXZ
     * playcanvas ZYX
     * three.js XYZ
     */
    this.defaultRotationOrder = RotationOrder.YXZ;
};
var setting = new Setting();

/**
 * 天空盒渲染器
 */
var SkyBoxRenderer$1 = function SkyBoxRenderer () {};

SkyBoxRenderer$1.prototype.init = function init () {
    if (!this.renderAtomic) {
        var renderAtomic = this.renderAtomic = new RenderAtomic();
        //八个顶点，32个number
        var vertexPositionData = [
            -1, 1, -1,
            1, 1, -1,
            1, 1, 1,
            -1, 1, 1,
            -1, -1, -1,
            1, -1, -1,
            1, -1, 1,
            -1, -1, 1 //
        ];
        renderAtomic.attributes.a_position = new Attribute("a_position", vertexPositionData, 3);
        //6个面，12个三角形，36个顶点索引
        var indices = [
            0, 1, 2, 2, 3, 0,
            6, 5, 4, 4, 7, 6,
            2, 6, 7, 7, 3, 2,
            4, 5, 1, 1, 0, 4,
            4, 0, 3, 3, 7, 4,
            2, 1, 5, 5, 6, 2 //
        ];
        renderAtomic.indexBuffer = new Index();
        renderAtomic.indexBuffer.indices = indices;
        //
        var renderParams = renderAtomic.renderParams;
        renderParams.cullFace = CullFace.NONE;
        //
        renderAtomic.shader = new Shader("skybox");
    }
};
/**
 * 绘制场景中天空盒
 * @param gl
 * @param scene 场景
 * @param camera 摄像机
 */
SkyBoxRenderer$1.prototype.draw = function draw (gl, scene, camera) {
    var skybox = scene.activeSkyBoxs[0];
    this.drawSkyBox(gl, skybox, scene, camera);
};
/**
 * 绘制天空盒
 * @param gl
 * @param skybox 天空盒
 * @param camera 摄像机
 */
SkyBoxRenderer$1.prototype.drawSkyBox = function drawSkyBox (gl, skybox, scene, camera) {
    if (!skybox)
        { return; }
    this.init();
    //
    skybox.beforeRender(this.renderAtomic, scene, camera);
    //
    this.renderAtomic.uniforms.u_viewProjection = camera.viewProjection;
    this.renderAtomic.uniforms.u_viewMatrix = camera.node3d.worldToLocalMatrix;
    this.renderAtomic.uniforms.u_cameraMatrix = camera.node3d.localToWorldMatrix;
    this.renderAtomic.uniforms.u_cameraPos = camera.node3d.worldPosition;
    this.renderAtomic.uniforms.u_skyBoxSize = camera.lens.far / Math.sqrt(3);
    gl.render(this.renderAtomic);
};
/**
 * 天空盒渲染器
 */
var skyboxRenderer$1 = new SkyBoxRenderer$1();

var CanvasTexture2D = /*@__PURE__*/(function (Texture2D) {
    function CanvasTexture2D () {
        Texture2D.apply(this, arguments);
    }

    if ( Texture2D ) CanvasTexture2D.__proto__ = Texture2D;
    CanvasTexture2D.prototype = Object.create( Texture2D && Texture2D.prototype );
    CanvasTexture2D.prototype.constructor = CanvasTexture2D;

    CanvasTexture2D.prototype._canvasChanged = function _canvasChanged () {
        this._pixels = this.canvas;
        this.invalidate();
    };

    return CanvasTexture2D;
}(Texture2D));
__decorate([
    watch("_canvasChanged")
], CanvasTexture2D.prototype, "canvas", void 0);

var ImageDataTexture2D = /*@__PURE__*/(function (Texture2D) {
    function ImageDataTexture2D () {
        Texture2D.apply(this, arguments);
    }

    if ( Texture2D ) ImageDataTexture2D.__proto__ = Texture2D;
    ImageDataTexture2D.prototype = Object.create( Texture2D && Texture2D.prototype );
    ImageDataTexture2D.prototype.constructor = ImageDataTexture2D;

    ImageDataTexture2D.prototype._imageDataChanged = function _imageDataChanged () {
        this._pixels = this.imageData;
        this.invalidate();
    };

    return ImageDataTexture2D;
}(Texture2D));
__decorate([
    watch("_imageDataChanged")
], ImageDataTexture2D.prototype, "imageData", void 0);

/**
 * 2D纹理
 */
var ImageTexture2D = /*@__PURE__*/(function (Texture2D) {
    function ImageTexture2D () {
        Texture2D.apply(this, arguments);
    }

    if ( Texture2D ) ImageTexture2D.__proto__ = Texture2D;
    ImageTexture2D.prototype = Object.create( Texture2D && Texture2D.prototype );
    ImageTexture2D.prototype.constructor = ImageTexture2D;

    var prototypeAccessors = { image: { configurable: true } };

    prototypeAccessors.image.get = function () {
        return this._pixels;
    };
    ImageTexture2D.prototype._imageChanged = function _imageChanged () {
        this._pixels = this.image;
        this.invalidate();
    };

    Object.defineProperties( ImageTexture2D.prototype, prototypeAccessors );

    return ImageTexture2D;
}(Texture2D));
__decorate([
    watch("_imageChanged")
], ImageTexture2D.prototype, "image", null);

var VideoTexture2D = /*@__PURE__*/(function (Texture2D) {
    function VideoTexture2D () {
        Texture2D.apply(this, arguments);
    }

    if ( Texture2D ) VideoTexture2D.__proto__ = Texture2D;
    VideoTexture2D.prototype = Object.create( Texture2D && Texture2D.prototype );
    VideoTexture2D.prototype.constructor = VideoTexture2D;

    VideoTexture2D.prototype._videoChanged = function _videoChanged () {
        this._pixels = this.video;
        this.invalidate();
    };

    return VideoTexture2D;
}(Texture2D));
__decorate([
    watch("_videoChanged")
], VideoTexture2D.prototype, "video", void 0);

/**
 * 通用唯一标识符（Universally Unique Identifier）
 *
 * 用于给所有对象分配一个通用唯一标识符
 */
var Uuid = function Uuid() {
    this.objectUuid = new WeakMap();
};
/**
 * 获取数组 通用唯一标识符
 *
 * @param arr 数组
 * @param separator 分割符
 */
Uuid.prototype.getArrayUuid = function getArrayUuid (arr, separator) {
        var this$1 = this;
        if ( separator === void 0 ) separator = "$__uuid__$";

    var uuids = arr.map(function (v) { return this$1.getObjectUuid(v); });
    var groupUuid = uuids.join(separator);
    return groupUuid;
};
/**
 * 获取对象 通用唯一标识符
 *
 * 当参数object非Object对象时强制转换为字符串返回
 *
 * @param object 对象
 */
Uuid.prototype.getObjectUuid = function getObjectUuid (object) {
    if (Object.isBaseType(object)) {
        return String(object);
    }
    if (!object[__uuid__]) {
        Object.defineProperty(object, __uuid__, { value: mathUtil.uuid() });
    }
    return object[__uuid__];
};
var __uuid__ = "__uuid__";
var uuid = new Uuid();

/**
 * 函数经
 *
 * 包装函数，以及对应的拆包
 */
var FunctionWrap = function FunctionWrap() {
    this._wrapFResult = {};
    this._state = {};
};
/**
 * 扩展继承函数
 *
 * 可用于扩展原型中原有API中的实现
 *
 * ```
class A
{
    a = "a";

    f(p: string = "p", p1: string = "")
    {
        return p + p1;
    }

    extendF: (p?: string, p1?: string) => string;
    oldf: (p?: string, p1?: string) => string;
}

var a = new A();
a.oldf = a.f;
a.extendF = function (p: string = "p", p1: string = "")
{
    return ["polyfill", this.a, this.oldf()].join("-")
}
functionwrap.extendFunction(a, "f", function (r)
{
    return ["polyfill", this.a, r].join("-");
});
// 验证 被扩展的a.f方法是否等价于 a.extendF
assert.ok(a.f() == a.extendF()); //true
    
 * ```
 *
 * @param object 被扩展函数所属对象或者原型
 * @param funcName 被扩展函数名称
 * @param extendFunc 在函数执行后执行的扩展函数
 */
FunctionWrap.prototype.extendFunction = function extendFunction (object, funcName, extendFunc) {
    var oldFun = object[funcName];
    object[funcName] = (function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

        var r = oldFun.apply(this, args);
        var args1 = args.concat();
        args1.unshift(r);
        r = extendFunc.apply(this, args1);
        return r;
    });
};
/**
 * 包装函数
 *
 * 一般用于调试
 * 使用场景示例：
 * 1. 在函数执行前后记录时间来计算函数执行时间。
 * 1. 在console.error调用前使用 debugger 进行断点调试。
 *
 * @param object 函数所属对象或者原型
 * @param funcName 函数名称
 * @param beforeFunc 在函数执行前执行的函数
 * @param afterFunc 在函数执行后执行的函数
 */
FunctionWrap.prototype.wrap = function wrap (object, funcName, beforeFunc, afterFunc) {
    if (!beforeFunc && !afterFunc)
        { return; }
    if (!Object.getOwnPropertyDescriptor(object, __functionwrap__)) {
        Object.defineProperty(object, __functionwrap__, { value: {}, configurable: true, enumerable: false, writable: false });
    }
    var functionwraps = object[__functionwrap__];
    var info = functionwraps[funcName];
    if (!info) {
        var oldPropertyDescriptor = Object.getOwnPropertyDescriptor(object, funcName);
        var original = object[funcName];
        functionwraps[funcName] = info = { space: object, funcName: funcName, oldPropertyDescriptor: oldPropertyDescriptor, original: original, funcs: [original] };
        //
        object[funcName] = function () {
                var this$1 = this;

            var args = arguments;
            info.funcs.forEach(function (f) {
                f.apply(this$1, args);
            });
        };
    }
    var funcs = info.funcs;
    if (beforeFunc) {
        Array.delete(funcs, beforeFunc);
        funcs.unshift(beforeFunc);
    }
    if (afterFunc) {
        Array.delete(funcs, afterFunc);
        funcs.push(afterFunc);
    }
};
/**
 * 取消包装函数
 *
 * 与wrap函数对应
 *
 * @param object 函数所属对象或者原型
 * @param funcName 函数名称
 * @param wrapFunc 在函数执行前执行的函数
 * @param before 运行在原函数之前
 */
FunctionWrap.prototype.unwrap = function unwrap (object, funcName, wrapFunc) {
    var functionwraps = object[__functionwrap__];
    var info = functionwraps[funcName];
    if (!info)
        { return; }
    if (wrapFunc == undefined) {
        info.funcs = [info.original];
    }
    else {
        Array.delete(info.funcs, wrapFunc);
    }
    if (info.funcs.length == 1) {
        delete object[funcName];
        if (info.oldPropertyDescriptor)
            { Object.defineProperty(object, funcName, info.oldPropertyDescriptor); }
        delete functionwraps[funcName];
        if (Object.keys(functionwraps).length == 0) {
            delete object[__functionwrap__];
        }
    }
};
/**
 * 包装一个异步函数，使其避免重复执行
 *
 * 使用场景示例：同时加载同一资源时，使其只加载一次，完成后调用所有相关回调函数。
 *
 * @param funcHost 函数所属对象
 * @param func 函数
 * @param params 函数除callback外的参数列表
 * @param callback 完成回调函数
 */
FunctionWrap.prototype.wrapAsyncFunc = function wrapAsyncFunc (funcHost, func, params, callback) {
        var this$1 = this;

    // 获取唯一编号
    var cuuid = uuid.getArrayUuid([func].concat(params));
    // 检查是否执行过
    var result = this._wrapFResult[cuuid];
    if (result) {
        callback.apply(null, result);
        return;
    }
    // 监听执行完成事件
    event.once(this, cuuid, function () {
        // 完成时重新执行函数
        this$1.wrapAsyncFunc(funcHost, func, params, callback);
    });
    // 正在执行时直接返回等待完成事件
    if (this._state[cuuid])
        { return; }
    // 标记正在执行中
    this._state[cuuid] = true;
    // 执行函数
    func.apply(funcHost, params.concat(function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

        // 清理执行标记
        delete this$1._state[cuuid];
        // 保存执行结果
        this$1._wrapFResult[cuuid] = args;
        // 通知执行完成
        event.emit(this$1, cuuid);
    }));
};
var __functionwrap__ = "__functionwrap__";
var functionwrap = new FunctionWrap();

/**
 * 是否开启调试
 */
var debuger = true;
/**
 * 调试工具
 */
var Debug = function Debug() {
    // 断言失败前进入断点调试
    functionwrap.wrap(console, "assert", function (test) { if (!test)
        { debugger; } });
    // 输出错误前进入断点调试
    functionwrap.wrap(console, "error", function () { debugger; });
    functionwrap.wrap(console, "warn", function () { debugger; });
};
/**
 * 测试代码运行时间
 * @param fn 被测试的方法
 * @param labal 标签
 */
Debug.prototype.time = function time (fn, labal) {
    labal = labal || fn["name"] || "Anonymous function " + Math.random();
    console.time(labal);
    fn();
    console.timeEnd(labal);
};
/**
 * 调试工具
 */
var debug = new Debug();

/**
 * 对象池
 *
 * 对象池并不能带来性能的提升，反而会严重影响性能。但是在管理内存时可以考虑使用。
 *
 * js虚拟机会在对象没有被引用时自动释放内存，谨慎使用对象池。
 *
 */
var Pool = function Pool(type) {
    this._objects = [];
    this._type = type;
};
/**
 * 获取对象
 */
Pool.prototype.get = function get () {
    var obj = this._objects.pop();
    if (obj)
        { return obj; }
    return new this._type();
};
/**
 * 释放对象
 *
 * @param args 被释放对象列表
 */
Pool.prototype.release = function release () {
        var this$1 = this;
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

    args.forEach(function (element) {
        this$1._objects.push(element);
    });
};
/**
 * 获取指定数量的对象
 *
 * @param num 数量
 */
Pool.prototype.getArray = function getArray (num) {
    var arr;
    if (this._objects.length <= num) {
        arr = this._objects.concat();
        this._objects.length = 0;
    }
    else {
        arr = this._objects.splice(0, num);
    }
    while (arr.length < num) {
        arr.push(new this._type());
    }
    return arr;
};
/**
 * 释放对象
 *
 * @param objects 被释放对象列表
 */
Pool.prototype.releaseArray = function releaseArray (objects) {
        var this$1 = this;

    objects.forEach(function (element) {
        this$1._objects.push(element);
    });
};

/**
 * 常用正则表示式
 */
var RegExps = function RegExps() {
    /**
     * json文件
     */
    this.json = /(\.json)\b/i;
    /**
     * 图片
     */
    this.image = /(\.jpg|\.png|\.jpeg|\.gif)\b/i;
    /**
     * 声音
     */
    this.audio = /(\.ogg|\.mp3|\.wav)\b/i;
    /**
     * 命名空间
     */
    this.namespace = /namespace\s+([\w$_\d\.]+)/;
    /**
     * 类
     */
    this.classReg = /(export\s+)?(abstract\s+)?class\s+([\w$_\d]+)(\s+extends\s+([\w$_\d\.]+))?/;
};
/**
 * 常用正则表示式
 */
var regExps = new RegExps();

var Stats = function Stats() {
    var this$1 = this;

    var mode = 0;
    if (typeof document == "undefined")
        { return; }
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;';
    container.addEventListener('click', function (event) {
        event.preventDefault();
        showPanel(++mode % container.children.length);
    }, false);
    //
    function addPanel(panel) {
        container.appendChild(panel.dom);
        return panel;
    }
    function showPanel(id) {
        for (var i = 0; i < container.children.length; i++) {
            container.children[i].style.display = i === id ? 'block' : 'none';
        }
        mode = id;
    }
    //
    var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;
    var fpsPanel = addPanel(new StatsPanel('FPS', '#0ff', '#002'));
    var msPanel = addPanel(new StatsPanel('MS', '#0f0', '#020'));
    if (self.performance && self.performance.memory) {
        var memPanel = addPanel(new StatsPanel('MB', '#f08', '#201'));
    }
    showPanel(0);
    this.REVISION = 16;
    this.dom = container;
    this.addPanel = addPanel;
    this.showPanel = showPanel;
    this.begin = function () {
        beginTime = (performance || Date).now();
    };
    this.end = function () {
        frames++;
        var time = (performance || Date).now();
        msPanel.update(time - beginTime, 200);
        if (time > prevTime + 1000) {
            fpsPanel.update((frames * 1000) / (time - prevTime), 100);
            prevTime = time;
            frames = 0;
            if (memPanel) {
                var memory = performance.memory;
                memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
            }
        }
        return time;
    };
    this.update = function () {
        beginTime = this$1.end();
    };
    // Backwards Compatibility
    this.domElement = container;
    this.setMode = showPanel;
};
Stats.init = function init (parent) {
    if (!this.instance) {
        this.instance = new Stats();
        parent = parent || document.body;
        parent.appendChild(this.instance.dom);
    }
    ticker.onframe(this.instance.update, this.instance);
};
var StatsPanel = function StatsPanel(name, fg, bg) {
    var min = Infinity, max = 0, round = Math.round;
    var PR = round(window.devicePixelRatio || 1);
    var WIDTH = 80 * PR, HEIGHT = 48 * PR, TEXT_X = 3 * PR, TEXT_Y = 2 * PR, GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR, GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;
    var canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = 'width:80px;height:48px';
    var context0 = canvas.getContext('2d');
    if (context0 == null) {
        console.log("无法创建 CanvasRenderingContext2D ");
        return;
    }
    var context = context0;
    context.font = 'bold ' + (9 * PR) + 'px Helvetica,Arial,sans-serif';
    context.textBaseline = 'top';
    context.fillStyle = bg;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = fg;
    context.fillText(name, TEXT_X, TEXT_Y);
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
    this.dom = canvas;
    this.update = function (value, maxValue) {
        min = Math.min(min, value);
        max = Math.max(max, value);
        context.fillStyle = bg;
        context.globalAlpha = 1;
        context.fillRect(0, 0, WIDTH, GRAPH_Y);
        context.fillStyle = fg;
        context.fillText(round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')', TEXT_X, TEXT_Y);
        context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);
        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - (value / maxValue)) * GRAPH_HEIGHT));
    };
};

/**
 * The Water component renders the terrain.
 */
var Water = /*@__PURE__*/(function (Renderable) {
    function Water() {
        Renderable.apply(this, arguments);
        this.geometry = Geometry.getDefault("Plane");
        this._material = Material.getDefault("Water-Material");
        /**
         * 帧缓冲对象，用于处理水面反射
         */
        this.frameBufferObject = new FrameBufferObject();
    }

    if ( Renderable ) Water.__proto__ = Renderable;
    Water.prototype = Object.create( Renderable && Renderable.prototype );
    Water.prototype.constructor = Water;
    Water.prototype.beforeRender = function beforeRender (renderAtomic, scene, camera) {
        var uniforms = this.material.uniforms;
        var sun = this.node3d.scene.activeDirectionalLights[0];
        if (sun) {
            uniforms.u_sunColor = sun.color;
            uniforms.u_sunDirection = sun.node3d.localToWorldMatrix.getAxisZ().negate();
        }
        var clipBias = 0;
        uniforms.u_time += 1.0 / 60.0;
        // this.material.uniforms.s_mirrorSampler.url = "Assets/floor_diffuse.jpg";
        Renderable.prototype.beforeRender.call(this, renderAtomic, scene, camera);
        if (1)
            { return; }
        //
        var mirrorWorldPosition = this.node3d.worldPosition;
        var cameraWorldPosition = camera.node3d.worldPosition;
        var rotationMatrix = this.node3d.rotationMatrix;
        var normal = rotationMatrix.getAxisZ();
        var view = mirrorWorldPosition.subTo(cameraWorldPosition);
        if (view.dot(normal) > 0)
            { return; }
        view.reflect(normal).negate();
        view.add(mirrorWorldPosition);
        rotationMatrix = camera.node3d.rotationMatrix;
        var lookAtPosition = new Vector3(0, 0, -1);
        lookAtPosition.applyMatrix4x4(rotationMatrix);
        lookAtPosition.add(cameraWorldPosition);
        var target = mirrorWorldPosition.subTo(lookAtPosition);
        target.reflect(normal).negate();
        target.add(mirrorWorldPosition);
        var mirrorCamera = serialization.setValue(new Entity(), { name: "waterMirrorCamera" }).addComponent(Camera);
        mirrorCamera.node3d.x = view.x;
        mirrorCamera.node3d.y = view.y;
        mirrorCamera.node3d.z = view.z;
        mirrorCamera.node3d.lookAt(target, rotationMatrix.getAxisY());
        mirrorCamera.lens = camera.lens.clone();
        var textureMatrix = new Matrix4x4([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.5, 0.5, 0.5, 1.0
        ]);
        textureMatrix.append(mirrorCamera.viewProjection);
        var mirrorPlane = Plane.fromNormalAndPoint(mirrorCamera.node3d.worldToLocalMatrix.transformVector3(normal), mirrorCamera.node3d.worldToLocalMatrix.transformPoint3(mirrorWorldPosition));
        var clipPlane = new Vector4(mirrorPlane.a, mirrorPlane.b, mirrorPlane.c, mirrorPlane.d);
        var projectionMatrix = mirrorCamera.lens.matrix;
        var q = new Vector4();
        q.x = (clipPlane.x / Math.abs(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
        q.y = (clipPlane.y / Math.abs(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
        q.z = -1.0;
        q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];
        clipPlane.scale(2.0 / clipPlane.dot(q));
        projectionMatrix.elements[2] = clipPlane.x;
        projectionMatrix.elements[6] = clipPlane.y;
        projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias;
        projectionMatrix.elements[14] = clipPlane.w;
        var eye = camera.node3d.worldPosition;
        // 不支持直接操作gl，下面代码暂时注释掉！
        // // 
        // var frameBufferObject = this.frameBufferObject;
        // FrameBufferObject.active(gl, frameBufferObject);
        // //
        // gl.viewport(0, 0, frameBufferObject.OFFSCREEN_WIDTH, frameBufferObject.OFFSCREEN_HEIGHT);
        // gl.clearColor(1.0, 1.0, 1.0, 1.0);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // skyboxRenderer.draw(gl, scene, mirrorCamera);
        // // forwardRenderer.draw(gl, scene, mirrorCamera);
        // // forwardRenderer.draw(gl, scene, camera);
        // frameBufferObject.deactive(gl);
        //
        // this.material.uniforms.s_mirrorSampler = frameBufferObject.texture;
        uniforms.u_textureMatrix = textureMatrix;
    };

    return Water;
}(Renderable));
Water = __decorate([
    AddComponentMenu("Graphics/Water"),
    RegisterComponent()
], Water);
Entity.registerPrimitive("Water", function (g) {
    g.addComponent(Water);
});

var WaterUniforms = function WaterUniforms() {
    this.u_alpha = 1.0;
    /**
     * 水体运动时间，默认自动递增
     */
    // @serialize
    // @oav({ tooltip: "水体运动时间，默认自动递增" })
    this.u_time = 0.0;
    this.u_size = 10.0;
    this.u_distortionScale = 20.0;
    this.u_waterColor = new Color3().fromUnit(0x555555);
    this.s_normalSampler = Texture2D.default;
    /**
     * 镜面反射贴图
     */
    // s_mirrorSampler = new RenderTargetTexture2D();
    this.s_mirrorSampler = Texture2D.default;
    this.u_textureMatrix = new Matrix4x4();
    this.u_sunColor = new Color3().fromUnit(0x7F7F7F);
    this.u_sunDirection = new Vector3(0.70707, 0.70707, 0);
};
__decorate([
    serialize,
    oav({ tooltip: "透明度" })
], WaterUniforms.prototype, "u_alpha", void 0);
__decorate([
    serialize,
    oav({ tooltip: "水体展现的尺寸" })
], WaterUniforms.prototype, "u_size", void 0);
__decorate([
    oav(),
    serialize
], WaterUniforms.prototype, "u_distortionScale", void 0);
__decorate([
    serialize,
    oav({ tooltip: "水体颜色" })
], WaterUniforms.prototype, "u_waterColor", void 0);
__decorate([
    oav(),
    serialize,
    oav({ tooltip: "水体法线图" })
], WaterUniforms.prototype, "s_normalSampler", void 0);
__decorate([
    oav()
], WaterUniforms.prototype, "s_mirrorSampler", void 0);
shaderlib.shaderConfig.shaders["water"].cls = WaterUniforms;
Material.setDefault("Water-Material", { shaderName: "water" });

export { Animation, AnimationClip, AssetData, AssetType, AudioListener, AudioSource, Behaviour, BillboardComponent, BoundingBox, Camera, CanvasTexture2D, CapsuleGeometry, CartoonComponent, ColorUniforms, Component, ConeGeometry, ControllerBase, CubeGeometry, CustomGeometry, CylinderGeometry, Debug, DirectionalLight, DistanceModelType, Entity, FPSController, Feng3dObject, FileAsset, FogMode, FolderAsset, ForwardRenderer, FrameBufferObject, FunctionWrap, Geometry, GeometryUtils, Graphics, HideFlags, HoldSizeComponent, HoverController, ImageDataTexture2D, ImageTexture2D, ImageUtil, LensBase, Light, LightPicker, LightType, LookAtController, Material, MeshRenderer, Mouse3DManager, MouseRenderer, Node3D, OrthographicLens, OutLineComponent, OutlineRenderer, ParametricGeometry, PerspectiveLens, PlaneGeometry, PointGeometry, PointLight, PointUniforms, Pool, Projection, PropertyClip, QuadGeometry, RayCastable, Raycaster, ReadRS, ReadWriteRS, RegExps, RenderTargetTexture2D, Renderable, RunEnvironment, Scene, ScenePickCache, SceneUtil, Script, ScriptComponent, SegmentGeometry, SegmentUniforms, Setting, ShadowRenderer, ShadowType, SkeletonComponent, SkeletonJoint, SkinnedMeshRenderer, SkyBox, SkyBoxRenderer$1 as SkyBoxRenderer, SphereGeometry, SpotLight, StandardUniforms, Stats, Texture2D, TextureCube, TextureInfo, TextureUniforms, Ticker, TorusGeometry, TransformLayout, Uuid, VideoTexture2D, View, Water, WaterUniforms, WireframeComponent, WireframeRenderer, debug, menuConfig, path, sceneUtil, setting, ticker };
//# sourceMappingURL=index.mjs.map
