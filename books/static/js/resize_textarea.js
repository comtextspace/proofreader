function correct(str) {
    str = str.replace(/(?<!\n)\n(?!($|\n))/g, ' ');
    return str;
}

$(document).ready(function () {
    var initialTextareaHeight = $(".resizeable-textarea").height();
    var initialTextareaWidth = $(".resizeable-textarea").width();
    var fontSize = $("#page_form > div > fieldset:nth-child(2) > div > div > div:nth-child(4) > div > div").text() + "px";

    // Set font size and line height
    $(".resizeable-textarea").css({
        "font-size": fontSize,
        "line-height": parseFloat(fontSize) * 1.5 + "px",
        "height": initialTextareaHeight + "px", // Set the textarea to its initial height
        "width": initialTextareaWidth + "px" // Set the textarea to its initial width
    });

    document.getElementById('correctTextButton').addEventListener('click', function () {
        console.log("Correcting text...");
        var textarea = document.querySelector('.resizeable-textarea');
        textarea.value = correct(textarea.value);
    });
});
