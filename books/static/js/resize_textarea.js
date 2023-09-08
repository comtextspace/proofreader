// static/js/resize_textarea.js

$(document).ready(function () {
    $("#text-size-input").on("input", function () {
        // Get the current font size from the "Text Size (px)" input field
        var fontSize = $(this).val() + "px";

        // Apply the font size to the textarea with class "resizeable-textarea"
        $(".resizeable-textarea").css("font-size", fontSize);

        // Calculate and set the line-height to maintain the original textarea size
        var lineHeight = parseFloat(fontSize) * 1.5; // You can adjust the multiplier as needed
        $(".resizeable-textarea").css("line-height", lineHeight + "px");
    });
});

