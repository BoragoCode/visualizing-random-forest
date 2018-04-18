$(document).ready(function() {
    var tree = new Tree();
    // The event listener for the file upload
    document.getElementById('txtFileUpload').addEventListener('change', upload, false);
    // document.getElementById('defaultData').addEventListener('change', defaultData, false);
    document.getElementById('submitParams').addEventListener('click', defaultData , false);

    function defaultData() {
        // console.log($("#defaultData").val());
        if($("#defaultData").val()){
            $.ajax({
                type: "POST",
                url: '/defaultdata',
                data: JSON.stringify({}),
                contentType: 'application/json',
                success: function (response) {
                        tree.create(response)
                }
             })//close
        }
    }
    
    // Method that checks that the browser supports the HTML5 File API
    function browserSupportFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            isCompatible = true;
        }
        return isCompatible;
    }

    // Method that reads and processes the selected file
    function upload(evt) {
        if (!browserSupportFileUpload()) {
            alert('The File APIs are not fully supported in this browser!');
        } else {
            // var data = null;
            var file = evt.target.files[0];
            var data = Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    // console.log("Dataframe:", JSON.stringify(results.data));
                    console.log("Column names:", results.meta.fields);
                    console.log("Errors:", results.errors);
                    if (results.data && results.data.length > 0) {
                        alert('Imported -' + results.data.length + '- rows successfully!');
                        $("#defaultData").prop("selectedIndex", 0);
                        // test = [{name:"data", value: "results.data"}];
                        // console.log(test);
                        // console.log(results.data);
                    } else {
                        alert('No data to import!');
                    }
                 $.ajax({
                    type: "POST",
                    url: '/learning',
                    // data: JSON.stringify(results.data),
                   data: JSON.stringify({data: results.data}),
                   //  data: test,
                    contentType: 'application/json',
                    success: function (response) {
                        // alert(response.status);
                        console.log(response);
                        console.log('upload successful!\n');
                        tree.create(response)
                    }
                 })//close
                }
            });
        }
    }
});


// $(document).ready(function() {
//     // The event listener for the file upload
//     document.getElementById('txtFileUpload').addEventListener('change', upload, false);
//
//     // Method that checks that the browser supports the HTML5 File API
//     function browserSupportFileUpload() {
//         var isCompatible = false;
//         if (window.File && window.FileReader && window.FileList && window.Blob) {
//         isCompatible = true;
//         }
//         return isCompatible;
//     }
//
//     // Method that reads and processes the selected file
//     function upload(evt) {
//     if (!browserSupportFileUpload()) {
//         alert('The File APIs are not fully supported in this browser!');
//         } else {
//             var data = null;
//             var file = evt.target.files[0];
//             var reader = new FileReader();
//             reader.readAsText(file);
//             reader.onload = function(event) {
//                 var csvData = event.target.result;
//                 data = $.csv.toArrays(csvData);
//                 if (data && data.length > 0) {
//                   alert('Imported -' + data.length + '- rows successfully!');
//                 } else {
//                     alert('No data to import!');
//                 }
//                 // console.log(data)
//                 $.ajax({
//                     type: "POST",
//                     url: '/learning',
//                     data: JSON.stringify({userInput: data}),
//                     contentType: 'application/json',
//                     success: function (response) {
//                         // alert(response.status);
//                         console.log('upload successful!\n' + response);
//                         $("#results").text(response);
//                     }
//                  })//close ajax call
//             };
//             reader.onerror = function() {
//                 alert('Unable to read ' + file.fileName);
//             };
//         }
//     }
// });


// $(document).ready(function(){
//     $("#submit").on('click',function(event) {
//         // $("#upload-input").on('change',function(event){
//         //     var uInput = $(this).get(0).files;
//         var uInput = $("#upload-input").get(0).files;
//         console.log(uInput);
//         if (uInput.length === 1) {
//             var formData = new FormData();
//             var file = uInput[0];
//
//             // add the files to formData object for the data payload
//             formData.append('uploads[]', file, file.name);
//             $.ajax({
//                 type: "POST",
//                 url: '/learning',
//                 data: JSON.stringify({userInput: formData}),
//                 contentType: 'application/json',
//                 success: function (response) {
//                     // alert(response.status);
//                     console.log('upload successful!\n' + response);
//                     $("#results").text(response);
//                 }
//             })//close ajax call
//         }//close if
//     }) //close on click
// });//close document ready

// data: formData,
                //  processData: false,
                //  contentType: false,
                //  success: function (data) {
                //      console.log('upload successful!\n' + data);