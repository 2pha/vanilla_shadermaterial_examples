var App = {
  shaders : [],
  shapes : [],
  appContainer: document.getElementById('app-container'),
  preloadContainer : document.getElementById('preloader-container'),
  canvasContainer : document.getElementById('canvas-container'),
  toolsContainer : document.getElementById('tools-container'),
  scene: null,
  renderer: null,
  camera: null,
  //material: null,
  mesh: null,
  
  _shaderIndex: 0,
  get shaderIndex() {
    return this._shaderIndex;
  },
  set shaderIndex(value) {
    this._shaderIndex = value;
    this.setShader(this._shaderIndex);
  },
  stats: new Stats(),
  clock: new THREE.Clock(1),
  init : function(){
    // Config router.
    //Router.config({mode:'history', root: window.location.pathname});
    Router.config();
    
    // Add buttons.
    this.addGeoButtons();
    // Add shader select and routes.
    this.addShaderCombobox();
    // setup canvas
    this.createCanvas();
    
    
    // add stats
    document.getElementById('stats-container').appendChild( this.stats.dom );
    
    
    // Add listener for window resize.
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    
    // Hide preloader.
    this.preloadContainer.style.display = 'none';
    
    this.animate();
  },
  
  addGeoButtons : function(){
    var geoButtonContainer = document.createElement("div");
    geoButtonContainer.id = 'geo-button-container';
    this.shapes.forEach(function(shape, index){
      var button = document.createElement("div");
      button.className += 'geobutton';
      button.id += 'goebutton-'+shape.name.toLowerCase();;
      button.title = shape.name;
      button.addEventListener('click', function(){App.setGeometry(index);});
      button.style.backgroundImage = 'url(images/'+shape.buttonImage+')';
      geoButtonContainer.appendChild(button);
      
    });
    this.toolsContainer.appendChild(geoButtonContainer);
  },
  
  addShaderCombobox : function(){
    var shaderSelect = document.createElement("select");
    shaderSelect.id = 'shader-select';
    //var app = this
    App.shaders.forEach(function(shader, index){
      
      var option = document.createElement("option");
      option.value = index;
      option.innerHTML = shader.name;
      shaderSelect.appendChild(option);
      Router.add(shader.path, function(){App.shaderIndex = index});
      
      //if(index == 0){
      //  Router.frontFunc = app.changeShader(index);
      //}
      
    });
    
    shaderSelect.addEventListener('change', function(e){
      Router.navigate(App.shaders[shaderSelect.value].path);
    });
    
    this.toolsContainer.appendChild(shaderSelect);
    Router.check().listen();
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
    
    //this.material = new THREE.MeshBasicMaterial();
    
 // Create cube and add to scene.
    //var geometry = new THREE.BoxGeometry(200, 200, 200);
    this.mesh = new THREE.Mesh(this.shapes[0].geo, this.material);
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
    this.stats.begin();
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.y += 0.01;
    this.render();
    this.stats.end();
    if('material' in this && 'update' in this.shaders[this.shaderIndex]){
      this.shaders[this.shaderIndex].update();
    }
    requestAnimationFrame(this.animate.bind(this));
  },
  
  render: function(){
    this.renderer.render(this.scene, this.camera);
  },
  
  setShader: function(index){
    // Make sure the correct select option is selected.
    var selectElement = document.getElementById('shader-select');
    selectElement.options.selectedIndex = index;
    
    var shaderObject = {
      vertexShader: App.shaders[index].vertexShader,
      fragmentShader: App.shaders[index].fragmentShader,
    }
    if('uniforms' in App.shaders[index]){
      shaderObject.uniforms = App.shaders[index].uniforms;
    }
    
    this.material= new THREE.ShaderMaterial(shaderObject);
    if(this.mesh != null){
      this.mesh.material = this.material;
    }
  },
  
  setGeometry: function(index){
    if(this.mesh.geometry != App.shapes[index].geo){
      this.mesh.geometry = App.shapes[index].geo;
    }
    
  },
  
  onWindowResize: function(){
    var size = this.canvasContainer.getBoundingClientRect();
    this.camera.aspect = size.width / size.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(size.width, size.height);
    this.render();
  }
};
