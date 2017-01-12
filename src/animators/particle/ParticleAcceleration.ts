module feng3d {

    /**
     * 粒子加速度组件
     * @author feng 2017-01-09
     */
    export class ParticleAcceleration extends ParticleComponent {

        /**
		 * 创建粒子属性
         * @param particle                  粒子
         * @param numParticles              粒子数量
		 */
        public generatePropertyOfOneParticle(particle: Particle, numParticles: number) {

            var baseVelocity = 1000;

            var x = (Math.random() - 0.5) * baseVelocity;
            var y = (Math.random() - 0.5) * baseVelocity;
            var z = (Math.random() - 0.5) * baseVelocity;

            particle.velocity = new Vector3D(x, y, z);
        }
    }
}