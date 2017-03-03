var App = {
  shaders : [],
  preloadContainer : document.getElementById('preloader-container'),
  canvasContainer : document.getElementById('canvas-container'),
  init : function(){
    // Hide preloader.
    this.preloadContainer.style.display = 'none';
    // setup canvas
    this.createCanvas();
    
 // Add listener for window resize.
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    
    this.animate();
  },
  
  createCanvas : function(){
    var size = this.canvasContainer.getBoundingClientRect();
    //var width = this.canvasContainer.offsetHeight;
    //var height = this.canvasContainer.offsetWidth;
    
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(size.width, size.height);
    this.canvasContainer.appendChild(this.renderer.domElement);
    
    this.camera = new THREE.PerspectiveCamera(70, size.width / size.height, 1, 1000);
    this.camera.position.z = 400;
    
    this.scene = new THREE.Scene();
    
    this.material = new THREE.MeshBasicMaterial();
    
 // Create cube and add to scene.
    var geometry = new THREE.BoxGeometry(200, 200, 200);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
    
 // Create ambient light and add to scene.
    var light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);
    
 // Create directional light and add to scene.
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);
  },
  animate: function(){
    requestAnimationFrame(this.animate.bind(this));
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  },
  render: function(){
    this.renderer.render(this.scene, this.camera);
  },
  onWindowResize: function(){
    var size = this.canvasContainer.getBoundingClientRect();
    this.camera.aspect = size.width / size.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(size.width, size.height);
    this.render();
  }
};
