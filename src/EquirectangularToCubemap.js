import {
	BackSide,
	BoxGeometry,
	CubeCamera,
	LinearFilter,
	Mesh,
	NoBlending,
	ShaderMaterial,
	WebGLCubeRenderTarget
} from 'three';

const vertexShader = /* glsl */`

	varying vec3 vDirection;

	void main() {

		vDirection = position;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}

`;

const fragmentShader = /* glsl */`

	uniform highp sampler2D map;

	varying vec3 vDirection;

	const float PI = 3.141592653589793;

	void main() {

		vec3 direction = normalize( vDirection );

		vec2 uv = vec2(
			atan( direction.z, direction.x ) / ( 2.0 * PI ) + 0.5,
			asin( clamp( direction.y, - 1.0, 1.0 ) ) / PI + 0.5
		);

		// explicit LOD from the angular footprint, implicit derivatives break at the seam and the poles
		float texels = max( length( dFdx( direction ) ), length( dFdy( direction ) ) ) * float( textureSize( map, 0 ).y ) / PI;

		gl_FragColor = textureLod( map, uv, log2( texels ) );

	}

`;

class EquirectangularToCubemap {

	constructor( renderer ) {

		this.renderer = renderer;
		this.maxSize = renderer.capabilities.maxCubemapSize;

		this.material = new ShaderMaterial( {
			uniforms: { map: { value: null } },
			vertexShader,
			fragmentShader,
			side: BackSide,
			blending: NoBlending,
			depthTest: false,
			depthWrite: false,
			toneMapped: false
		} );

		this.mesh = new Mesh( new BoxGeometry( 5, 5, 5 ), this.material );

	}

	convert( source, size, options = {} ) {

		const image = source.image;

		if ( ! image || ( image.videoHeight || image.displayHeight || image.height ) === 0 ) {

			throw new Error( 'EquirectangularToCubemap: the source texture has no image data yet, call convert() once it has loaded' );

		}

		if ( ! ( size >= 1 ) ) {

			throw new RangeError( 'EquirectangularToCubemap: size must be a positive number, got ' + size );

		}

		const renderTarget = new WebGLCubeRenderTarget( Math.min( Math.floor( size ), this.maxSize ), {
			type: source.type,
			colorSpace: source.colorSpace,
			generateMipmaps: source.generateMipmaps,
			// a mipmap filter on a target without mipmaps samples as black
			minFilter: source.generateMipmaps ? source.minFilter : LinearFilter,
			magFilter: source.magFilter,
			depthBuffer: false,
			...options
		} );

		this.material.uniforms.map.value = source;
		new CubeCamera( 1, 10, renderTarget ).update( this.renderer, this.mesh );
		this.material.uniforms.map.value = null;

		// disposing the returned texture releases its render target
		const texture = renderTarget.texture;
		texture.addEventListener( 'dispose', () => renderTarget.dispose() );

		return texture;

	}

	dispose() {

		this.mesh.geometry.dispose();
		this.material.dispose();

	}

}

export { EquirectangularToCubemap };
