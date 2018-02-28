$(document).ready(function(){
    $("#submit").on('click',function(event) {
        // $("#upload-input").on('change',function(event){
        //     var uInput = $(this).get(0).files;
        var uInput = $("#upload-input").get(0).files;
        console.log(uInput);
        if (uInput.length === 1) {
            var formData = new FormData();
            var file = uInput[0];

            // add the files to formData object for the data payload
            formData.append('uploads[]', file, file.name);
            $.ajax({
                type: "POST",
                url: '/learning',
                data: JSON.stringify({userInput: formData}),
                contentType: 'application/json',
                success: function (response) {
                    // alert(response.status);
                    console.log('upload successful!\n' + response);
                    $("#results").text(response);
                }
            })//close ajax call
        }//close if
    }) //close on click
});//close document ready

// data: formData,
                //  processData: false,
                //  contentType: false,
                //  success: function (data) {
                //      console.log('upload successful!\n' + data);