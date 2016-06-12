
(function(window, fabric){

	var canvas, freeDrawingBrush, revisionTmpl = '';

	function ImageEditor(options) {
	    canvas = new fabric.Canvas(options.wrapper, {
	        isDrawingMode: true
	    });

    	fabric.Object.prototype.transparentCorners = false;    	

    	PencilTool();
    	
    	if(options.image) AddImage(options.image);
		
		canvas.on('mouse:down', function (evt){
			console.log(evt);
			createPin(evt.e.clientX, evt.e.clientY);
		});

		canvas.on('mouse:up', function (evt){
			console.log(evt);
		});

		var _canvas = localStorage.getItem('canvas');

    	if(_canvas) {
    		canvas.clear();
    		loadStoredCanvas(_canvas);
    	} else {
    		var name = prompt("Enter your name");

    		storeCanvasState({revision:0, name: name || "Anonymous", timestamp: getTimeStamp()});
    	}

	}

	function getTimeStamp() {
		return Date.parse(new Date());
	}

	function createPin(x, y) {
		console.log(x, y);
		var timestamp = getTimeStamp();

		var pinTmpl = '<ul class="pin" id=pin'+timestamp+'>'
					+ '<li><a class="cross">X</a></li>'
					+ '<li><a class="exclamation">!</a></li>'
					+ '<li><a class="question">?</a></li>'
				+'</ul>';

		$('.pin-container').append(pinTmpl);
		var pin = $('#pin'+timestamp);
		
		pin.css({"margin-left": Number(x)-5, "margin-top": Number(y)+10});

		pin.on('click', 'li a',function (evt){
			var left = pin.css("margin-left");
			var top = pin.css("margin-top");
			left = parseInt(left);
			top = parseInt(top);
			pin.hide();

			var text = $(this).text();

			var name = prompt("Enter your name.");

			if (name) {
				createCircle({left: left, top: top, text: text, timestamp: timestamp});
				
				storeCanvasState({left: left, top: top, text: text, name: name, timestamp: timestamp});
				
			} else {
				pin.show();
			}

			
		});
	}

	function createCircle(option) {
		
		var anchor = '<a class="'+ (option.text === 'X' ? 'cross' : option.text === "!" ? 'exclamation' : 'question') +' edit-marker" target='+option.timestamp+'>'+ option.text +'</a>';

		anchor = $(anchor);

		anchor.css({"margin-left": option.left-5, "margin-top": option.top + 4}).text(option.text);

		$('.pin-container').append(anchor);

		anchor.on("click", showHistory);
	}

	function AddImage(options) {
		fabric.util.loadImage(options.url, function (img){
			var oImg = new fabric.Image(img);

			oImg.scaleToWidth(canvas.getWidth())

			canvas.add(oImg)
		});
	}

	function PencilTool() {
		freeDrawingBrush = new fabric.PencilBrush(canvas);
		if(freeDrawingBrush) {
	        freeDrawingBrush.color = "#ee5294";
	        freeDrawingBrush.width = 7;
	        freeDrawingBrush.shadowBlur = 0;
	    }

	    canvas.freeDrawingBrush = freeDrawingBrush;
	}

	function storeCanvasState(options){
		var _canvas = localStorage.getItem('canvas');

		_canvas = _canvas ? JSON.parse(_canvas) : {};		

		options['canvas'] = canvas.toJSON();

		_canvas[options.timestamp] = options;

		options['revision'] = (options.revision === 0) ? options.revision : _canvas[options.timestamp]['revision'] ? _canvas[options.timestamp]['revision'] + 1 : 1;

		localStorage.setItem('canvas', JSON.stringify(_canvas));
		addRevisionHistory(options.timestamp, options.name, options.revision);
	}

	function loadStoredCanvas(json){	

		var parsedJSON = JSON.parse(json);

		for (var key in parsedJSON) {
			if (parsedJSON[key]) {
				var obj = parsedJSON[key];

				canvas.loadFromJSON(JSON.stringify(obj.canvas), canvas.renderAll.bind(canvas));
				
				if (obj.revision > 0) {
					createCircle(obj);	
				}

				(function (key, name){
					addRevisionHistory(key, name, obj.revision);
				})(key, obj.name);
			}
		}
	}

	function addRevisionHistory(key, name, revision) {
		var modifiedAt = new Date(Number(key));

		modifiedAt = modifiedAt.toString();
		$("#revisionHistory ul").append('<li id="'+key+'">'+(revision > 0 ? 'Modified By' : 'Created By')+': '+ name + ' at '+ modifiedAt +'</li>');
	}

	function showHistory(evt) {
		var target = $(this).attr('target');

		$("#revisionHistory li").hide();

		$("#"+target).show();
	}

	function clearHistory() {
		canvas.clear();

		var name = prompt("Enter your name");

		storeCanvasState({name: name || "Anonymous", timestamp: getTimeStamp()});

		$(".pin-container").empty();
	}

	ImageEditor.prototype = {
	    AddImage: AddImage,
	    Pencil: PencilTool,
	    clearHistory: clearHistory
	}

	window.ImageEditor = ImageEditor;

})(window, fabric);