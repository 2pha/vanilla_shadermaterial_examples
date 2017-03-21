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

  light1 : new THREE.PointLight(0xff0000),
  light2 : new THREE.PointLight(0x00ff00),
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

    // Order the geometry buttons depending on order property/
    App.shapes.sort(function(a, b) {
      return parseFloat(a.order) - parseFloat(b.order);
    });

    // set up toolbar
    this.addTools();
    // setup canvas
    this.createCanvas();
    // Add the cube
    this.addMesh();
    // set initial shader
    if(!this.material){
      this.setShader(0);
    }
    
    //Router.config({mode:'history', root: window.location.pathname});
    Router.config();

    // add stats
    document.getElementById('stats-container').appendChild( this.stats.dom );

    // Add listener for window resize.
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    // Hide preloader.
    this.preloadContainer.style.display = 'none';

    this.animate();
  },

  addTools : function(){
    // add flyout button
    var flyoutbutton = document.createElement('div');
    var flyoutarrow = document.createElement('div');
    flyoutarrow.id = 'flyout-arrow';
    flyoutbutton.appendChild(flyoutarrow);
    flyoutbutton.id ='flyout-button';
    var app = this;
    flyoutbutton.addEventListener('click', function(e){
      app.toolsContainer.classList.toggle('open');
    });
    this.toolsContainer.appendChild(flyoutbutton);
    this.addGeoButtons();
    this.addShaderCombobox();
  },

  addGeoButtons : function(){
    var geoButtonContainer = document.createElement('div');
    geoButtonContainer.id = 'geo-button-container';
    this.shapes.forEach(function(shape, index){
      var button = document.createElement('div');
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
    var shaderSelect = document.createElement('select');
    shaderSelect.id = 'shader-select';
    App.shaders.forEach(function(shader, index){
      var option = document.createElement('option');
      option.value = index;
      option.innerHTML = shader.name;
      shaderSelect.appendChild(option);
      Router.add(shader.path, function(){App.shaderIndex = index;});
    });

    shaderSelect.addEventListener('change', function(e){
      Router.navigate(App.shaders[shaderSelect.value].path);
    });

    this.toolsContainer.appendChild(shaderSelect);
    Router.check().listen();
  },

  createCanvas : function(){
    var size = this.canvasContainer.getBoundingClientRect();

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(size.width, size.height);
    this.canvasContainer.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(70, size.width / size.height, 1, 1000);
    this.camera.position.z = 400;

    this.scene = new THREE.Scene();
    
    // Create ambient light and add to scene.
    var light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);

    // Create directional light and add to scene.
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);

    // Add rotating lights
    this.light1.addSphere();
    this.light1.position.set( 250, 0, 0 );
    this.scene.add(this.light1);

    this.light2.addSphere();
    this.light2.position.set( 0,250, 0 );
    this.scene.add(this.light2);

  },

  addMesh: function() {
    // Create cube and add to scene.
    this.mesh = new THREE.Mesh(this.shapes[0].geo, this.material);
    this.scene.add(this.mesh);
  },

  animate: function(){
    this.stats.begin();
    // roatae lights
    var timer = this.clock.getElapsedTime() * 0.5;
    this.light1.position.x = Math.cos( timer ) * 250;
    this.light1.position.z = Math.sin( timer ) * 250;
    this.light2.position.y = Math.cos( timer * 1.25 ) * 250;
    this.light2.position.z = Math.sin( timer * 1.25 ) * 250;
    // rotate mesh
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.y += 0.01;

    if('material' in this && 'update' in this.shaders[this.shaderIndex]){
      this.shaders[this.shaderIndex].update(this.material.uniforms);
    }
    this.render();
    this.stats.end();
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
      lights: true,
    };

    if('uniforms' in App.shaders[index]){
      // Using UniormUtils will clone the shader files uniforms,
      shaderObject.uniforms = THREE.UniformsUtils.merge([
          THREE.UniformsLib['lights'],
          App.shaders[index].uniforms
      ]);

    };

    this.material = new THREE.ShaderMaterial(shaderObject);
    if(this.mesh != null){
      this.mesh.material = this.material;
    };
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




//Add to PointLight pprototype so we can see where lights are and their color.
THREE.PointLight.prototype.addSphere = function(){
  this.sphere = new THREE.Mesh( new THREE.SphereGeometry( 2, 16, 16 ), new THREE.MeshBasicMaterial({color: this.color}));
  this.add(this.sphere);
};
THREE.PointLight.prototype.changeColor = function(value){
  this.color.setRGB(value[0]/255, value[1]/255, value[2]/255);
  this.sphere.material.color.setRGB(value[0]/255, value[1]/255, value[2]/255);
};
