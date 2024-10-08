$(document).ready(function(){
    $("#parametersWindow input").on("focusout", function(){
        var isInputValid = true;
        $("#parametersWindow input").each(function(){
            var input = $(this).val();
            if (input == "" || isNaN(input)){
                isInputValid = false;
            }
        });
        
        console.log(isInputValid);
        if (isInputValid) {
            $("#trajectoryBtn").prop("disabled",false);
        }
        else{
            $("#trajectoryBtn").prop("disabled",true);
        }
    });
});
