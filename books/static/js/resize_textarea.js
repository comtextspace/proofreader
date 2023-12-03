function correct(str) {
    str = str.replace(/(?<!\n)\n(?!($|\n))/g, ' ');
    return str;
}

$(document).ready(function () {
    const initialTextarea = $(".resizeable-textarea"),
		initialTextareaHeight = initialTextarea.height(),
		initialTextareaWidth = initialTextarea.width(),
		fontSize = $("#page_form > div > fieldset:nth-child(2) > div > div > div:nth-child(4) > div > div").text() + "px";

    // Set font size and line height
    initialTextarea.css({
        "font-size": fontSize,
        "line-height": parseFloat(fontSize) * 1.5 + "px",
        "height": initialTextareaHeight + "px", // Set the textarea to its initial height
        "width": initialTextareaWidth + "px" // Set the textarea to its initial width
    });

	$('#correctTextButton').on('click', function() {
		if(initialTextarea.attr('ClassicEditor') == 'yes'){
			editor.setData(correct(editor.getData()));
		}else{
			initialTextarea.val(correct(initialTextarea.val()));
		}
        console.log("Correcting text...");
	});

	ClassicEditor.create(document.querySelector('textarea.resizeable-textarea'), config).then(editor => {
		document.querySelector('.ck.ck-editor').style.width = initialTextareaWidth + "px";
		document.querySelector('textarea.resizeable-textarea').setAttribute('ClassicEditor', 'yes');
		window.editor = editor;
		/*console.log(editor);*/
	}).catch(error => {
		console.error(error);
	});
});
