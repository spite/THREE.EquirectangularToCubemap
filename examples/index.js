var THREE = require( 'three' );
var OrbitControls = require( 'three-orbit-controls' )( THREE );
var EquirectangularToCubemap = require( 'three.equirectangular-to-cubemap' );

var container;
var camera, scene, renderer;
var mesh, mesh2, sphere;
var controls;

window.addEventListener( 'load', function() {
	init();
	animate();
});

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.rotation.x = Math.PI;
	camera.position.set( 0, 0, 50 );

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild(renderer.domElement);

	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableZoom = false;

	var loader = new THREE.TextureLoader();
	loader.load( 'pano-cru·ci·form-1471040116139.jpg', function( res ) {

		var equiToCube = new EquirectangularToCubemap( renderer );

		mesh = new THREE.Mesh(
			new THREE.TorusKnotGeometry( 10, 3, 100, 32 ),
			new THREE.MeshBasicMaterial( { envMap: equiToCube.convert( res, 8 ) } )
		);
		scene.add( mesh );

		mesh2 = new THREE.Mesh(
			new THREE.IcosahedronGeometry( 10, 3 ),
			new THREE.MeshBasicMaterial( { envMap: equiToCube.convert( res, 2048 ) } )
		);
		scene.add( mesh2 );

		sphere = new THREE.Mesh(
			new THREE.IcosahedronGeometry( 100, 5 ),
			new THREE.MeshBasicMaterial( { map: res, side: THREE.BackSide, depthWrite: false } )
		);
		scene.add( sphere );

	} );

	window.addEventListener( 'resize', onWindowResize, false );
	onWindowResize();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {

	requestAnimationFrame( animate );

	controls.update();
	render();

}

function render() {

	if( sphere ) sphere.position.copy( camera.position );
	renderer.render( scene, camera );

}
