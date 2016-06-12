
$(document).ready(function(){
	var editor = new ImageEditor({
			wrapper: "editor",
			image: {
				url: "images/audio_recorder3.gif", //TODO; change eraser icon to safety pin icon
			}
		});

	$('#showAll').on('click', function (){
		$("#revisionHistory ul li").show();
	});
});