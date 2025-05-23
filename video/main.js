$(function () { 
    $("#myVideo").attr("src", "video.mp4"); 
    $("#myVideo1").attr("src", "video1.mp4"); 
    $("#playBtn").on("click", function () { 
        if ($("#myVideo")[0].paused) { 
            $("#myVideo")[0].play(); 
            $("#playBtn").text("Pause"); 
        } else { 
            $("#myVideo")[0].pause(); 
            $("#playBtn").text("Play"); 
        } 
    }); 
    $("#fullBtn").on("click", function () { 
        $("#myVideo")[0].webkitEnterFullscreen(); 
    }); 
    $("#playBtn1").on("click", function () { 
        if ($("#myVideo1")[0].paused) { 
            $("#myVideo1")[0].play(); 
            $("#playBtn1").text("Pause"); 
        } else { 
            $("#myVideo1")[0].pause(); 
            $("#playBtn1").text("Play"); 
        } 
    }); 
    $("#fullBtn1").on("click", function () { 
        $("#myVideo1")[0].webkitEnterFullscreen(); 
    }); 
});
