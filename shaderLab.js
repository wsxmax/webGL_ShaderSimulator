var vertexShaderSourceText = [
	'precision mediump float;',
	'',
	'attribute vec2 vertexPosition;',
	'varying vec2 position;',
	'',
	'void main()',
	'{',
	'  position = vertexPosition;',
	'  gl_Position = vec4(vertexPosition, 1.0,1.0);',
	'}'
].join('\n');
//
//
//
var gl = null;
var mainCanvas = document.getElementById('mainCanvas');
var codeArea = document.getElementById('codeArea');
var textArea = document.getElementById('textArea');
var shaderSourceArea = document.getElementById('shaderSource');
var shaderCode = document.getElementById('shaderSource');
var on_canvas = document.getElementById('on_canvas');
var tryButton = document.getElementById('tryButton');
var vertexShader = null;
var fragmentShader = null;
var program = null;
var startTime = null;
var currentHue = 0;
var currentColor = [0.0,0.0,0.0,0.0];
var scrollPosition = 0;
var winScroll = 0;
var autoScrolling = false;
var scrollingStartTime = 0;
const acceleration = 0.02;
var toScroll = 0;
var initGl = function(){
	resizeCanvas = function(){
		if(document.body.clientWidth/document.body.clientHeight > 1){
			mainCanvas.height = document.body.clientHeight - 70;
			mainCanvas.width = mainCanvas.height;
			codeArea.style.width = document.body.clientWidth - document.body.clientHeight+40;
			codeArea.style.height = document.body.clientHeight - 70;
			shaderSourceArea.style.height = document.body.clientHeight -120;
		}else{
			mainCanvas.width = document.body.clientWidth - 20;
			mainCanvas.height = mainCanvas.width;
			codeArea.style.width = document.body.clientWidth;
			codeArea.style.height = document.body.clientHeight - 10;
			shaderSourceArea.style.height = document.body.clientHeight - 60;
		}
	}
	resizeCanvas();
	window.addEventListener('resize', function() {
		resizeCanvas();
	});
	window.onscroll = function(){
		winScroll = window.pageYOffset || document.documentElement.scrollTop || 
			document.body.scrollTop || 0;
	}
	gl = mainCanvas.getContext("webgl")||mainCanvas.getContext("experimantal-webgl")||mainCanvas.getContext("moz-webgl")||mainCanvas.getContext("webkit-3d");
	if(!gl){
		console.log('contex is not created');
		on_canvas.value = 'your browser seems not supporting webGL';
	}
	gl.clearColor(1,1,1,1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	on_canvas.value = 'your browser seems supporting webGL';
	var compileVertextShader = function(error,vertexShaderSource){
		if(error){
			console.log(error);
			return;
		}
		var vShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vShader,vertexShaderSource);
		gl.compileShader(vShader);
		vertexShader = vShader;
		console.log('here comes the vertexShader');
		console.log(vertexShaderSource, gl.getShaderInfoLog(vShader));
		console.log('vertexShader compiled',vertexShader);
	}
	compileVertextShader(null,vertexShaderSourceText);
}
var loop = function(){
	gl.uniform1f(gl.getUniformLocation(program,'time'),performance.now()-startTime);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES,0,6);
	requestAnimationFrame(loop);
}
var beginloop = function(){
	startTime = performance.now()
	loop();
}
var prepareForRender = function(){
	var vertexArray = [
		-1, -1,
		1, -1,
		-1,  1,
		-1,  1,
		1, -1,
		1,  1,
	];
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertexArray),gl.STATIC_DRAW);
	gl.vertexAttribPointer(
		gl.getAttribLocation(program,'vertexPosition'),
		2,
		gl.FLOAT,
		gl.FALSE,
		2*Float32Array.BYTES_PER_ELEMENT,
		0
	);
	gl.enableVertexAttribArray(gl.getAttribLocation(program,'vertexPosition'));
	gl.useProgram(program);
	beginloop();
}
var autoScroll = function (){
	if(winScroll <= 0){
		scrollSpeed = 0;
		autoScrolling = false;
		console.log('stop scrolling',winScroll);
		toScroll = 0;
		scrollingStartTime = 0;
	}else{
		window.scrollTo(0,acceleration*Math.pow((Math.sqrt(2*toScroll/acceleration)+scrollingStartTime-performance.now()),2)/2);
		console.log('winScroll:',winScroll);
		requestAnimationFrame(autoScroll);
	}
}
function startAutoScroll(){
	autoScrolling = true;
	scrollingStartTime = performance.now();
	toScroll = winScroll;
	requestAnimationFrame(autoScroll);
}
var start = function(){
	startAutoScroll();
	console.log(autoScrolling);
	var shaderText = "precision mediump float;\nvarying vec2 position;\nuniform float time;\n ".concat(shaderSource.value);
	console.log(shaderText);
	if(vertexShader!=null){
		var fShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fShader,shaderText);
		gl.compileShader(fShader);
		if(!gl.getShaderParameter(fShader,gl.COMPILE_STATUS)){
			gl.clearColor(1.0,1.0,1.0,1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			on_canvas.innerHTML = gl.getShaderInfoLog(fShader);
			on_canvas.style.background = "rgba(0,0,0,0.5)";
		}else{
			fragmentShader = fShader;
			mainProgram = gl.createProgram();
			gl.attachShader(mainProgram,vertexShader);
			gl.attachShader(mainProgram,fragmentShader);
			gl.linkProgram(mainProgram);
			program = mainProgram;
			on_canvas.innerHTML = '';
			on_canvas.style.background = "rgba(0,0,0,0)";
			prepareForRender();
		}
	}
}
