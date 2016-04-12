"use strict";

$(document).ready(function() {
	function sendAjax(action, data) {
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: function(result, status, xhr) {
            	if(result.redirect != null){
                	window.location = result.redirect;
                }
            },
            error: function(xhr, status, error) {
                var messageObj = JSON.parse(xhr.responseText);
            	console.log(messageObj.error);
                //handleError(messageObj.error);
            }
        });        
    }

    $("#loginSubmit").on("click", function(e) {
        e.preventDefault();
    
        if($("#user").val() == '' || $("#pass").val() == '') {
        	console.log("Username or password is empty");
            //handleError("RAWR! Username or password is empty");
            return false;
        }
    	
        sendAjax($("#loginForm").attr("action"), $("#loginForm").serialize());

        return false;
    });

    $("#recordSubmit").on("click", function(e) {
        e.preventDefault();
    	
        sendAjax($("#recordForm").attr("action"), $("#recordForm").serialize());

        $("#success").html("success");

        return false;
    });

    $("#signupSubmit").on("click", function(e) {
        e.preventDefault();
    
        if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
        	console.log("All fields are required");
            //handleError("RAWR! All fields are required");
            return false;
        }
        
        if($("#pass").val() !== $("#pass2").val()) {
        	console.log("Passwords do not match");
            //handleError("RAWR! Passwords do not match");
            return false;           
        }

        sendAjax($("#signupForm").attr("action"), $("#signupForm").serialize());
        
        return false;
    });
});