$(document).ready(function(){
    var canvas = $('canvas');
    var paint;
    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var context;
    var emptySignature = true;

    context = canvas.get(0).getContext("2d");
    canvas.mousedown(function(e){
        emptySignature = false;
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        paint = true;
        addClick(mouseX, mouseY);
        redraw();
    });
    canvas.mousemove(function(e){
        if (paint) {
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;
            addClick(mouseX, mouseY, true);
            redraw();
        }
    });
    canvas.mouseup(function(){
        paint = false;
    });
    canvas.mouseleave(function(){
        paint = false;
    });

    function addClick(x,y,dragging){
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }
    function redraw(){
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.lineJoin = "round";
        context.lineWidth = 5;
        for (var i=0; i < clickX.length; i++) {
            context.beginPath();
            if (clickDrag[i] && i){
                context.moveTo(clickX[i-1], clickY[i-1]);
            } else {
                context.moveTo(clickX[i]-1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }
    }
    $("#clear").click(function(){
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        emptySignature = true;
    });

    $("#submit").click(function(){
        var firstName = $("#firstname").val();
        var lastName = $("#lastname").val();
        var signature = canvas.get(0).toDataURL();

        if (firstName == '' || lastName == '' || emptySignature) {
            alert("Please fill in all available fields!");
        } else {
            $.ajax({
                url: './',
                method: "POST",
                data: {
                    "firstName": firstName,
                    "lastName": lastName,
                    "signature": signature
                },
                dataType: "json",
                success: function(data){
                    if (typeof data.redirect == "string") {
                        window.location = data.redirect;
                    }
                }
            });
        }
    });
});
