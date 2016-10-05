(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
( function() {

function EquirectangularToCubemap( renderer ) {

	this.renderer = renderer;
	this.scene = new THREE.Scene();

	var gl = this.renderer.getContext();
	this.maxSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE )

	this.camera = new THREE.CubeCamera( 1, 100000, 1 );

	this.material = new THREE.MeshBasicMaterial( {
		map: null,
		side: THREE.BackSide
	} );

	this.mesh = new THREE.Mesh(
		new THREE.IcosahedronGeometry( 100, 4 ),
		this.material
	);
	this.scene.add( this.mesh );

}

EquirectangularToCubemap.prototype.convert = function( source, size ) {

	var mapSize = Math.min( size, this.maxSize );
	this.camera = new THREE.CubeCamera( 1, 100000, mapSize );
	this.material.map = source;

	this.camera.updateCubeMap( this.renderer, this.scene );

	return this.camera.renderTarget.texture;

}

window.THREE.EquirectangularToCubemap = EquirectangularToCubemap;

} )();

},{}]},{},[1]);
